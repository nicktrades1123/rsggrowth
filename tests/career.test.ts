import { test } from "node:test";
import assert from "node:assert/strict";
import {
  careerSchema,
  initialCareer,
  validateCareerStep,
  submitCareer,
} from "../src/lib/career.ts";
import { createCareerTracking, trackEvent } from "../src/lib/analytics.ts";
import { onRequest } from "../functions/api/career-diagnostic.ts";
import { originAllowed, readJson } from "../src/server/http.ts";
export const career = {
  ...initialCareer,
  firstName: "Test",
  lastName: "Candidate",
  email: "candidate@example.com",
  title: "Analyst",
  industry: "Services",
  experience: "2–5 years",
  goals: ["Find a new job"],
  challenges: ["I am not getting interviews"],
  efforts: ["Nothing yet"],
  success: "Find a role aligned with my experience.",
  timeline: "Within 30 days",
  consent: true,
};
const env = {
  CAREER_SUBMISSIONS_ENABLED: "true",
  RESEND_API_KEY: "test-key",
  RESEND_FROM_EMAIL: "test@example.com",
};
function request(body: unknown, extra: Record<string, string> = {}) {
  return new Request("https://rsggrowth.com/api/career-diagnostic", {
    method: "POST",
    headers: {
      Origin: "https://rsggrowth.com",
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
      "CF-Connecting-IP": crypto.randomUUID(),
      ...extra,
    },
    body: JSON.stringify(body),
  });
}
test("career schema validates each step, bounds fields, strips unknowns, and leaves optional fields optional", () => {
  assert.equal(careerSchema.safeParse(career).success, true);
  const withoutOptional = {
    ...career,
    phone: undefined,
    location: undefined,
    context: undefined,
  };
  assert.equal(careerSchema.safeParse(withoutOptional).success, true);
  for (let step = 0; step < 8; step++)
    assert.ok(Object.keys(validateCareerStep(initialCareer, step)).length);
  for (const change of [
    { goals: [] },
    { experience: "unknown" },
    { email: "bad" },
    { success: "x".repeat(1001) },
    { consent: false },
    { firstName: " " },
  ])
    assert.equal(
      careerSchema.safeParse({ ...career, ...change }).success,
      false,
    );
  assert.equal(
    "secret" in careerSchema.parse({ ...career, secret: "extra" }),
    false,
  );
});
test("career endpoint fails closed and sends a classified, idempotent notification only after validation", async () => {
  const original = globalThis.fetch;
  const sent: RequestInit[] = [];
  globalThis.fetch = async (_url, init) => {
    sent.push(init!);
    return Response.json({ id: "provider-reference" });
  };
  try {
    const req = request(career);
    const key = req.headers.get("Idempotency-Key");
    const response = await onRequest({ request: req, env });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "submitted",
      receiptId: "provider-reference",
    });
    const payload = JSON.parse(sent[0].body as string);
    assert.deepEqual(payload.to, ["grow@rsggrowth.com"]);
    assert.equal(payload.reply_to, career.email);
    assert.match(payload.subject, /^New RSG Career Diagnostic/);
    assert.match(payload.text, /Practice: Career Strategy/);
    assert.equal(
      (sent[0].headers as Record<string, string>)["Idempotency-Key"],
      `career/${key}`,
    );
    for (const bad of [
      {},
      { ...career, website: "spam" },
      { ...career, success: "x".repeat(20000) },
    ])
      assert.equal(
        (await onRequest({ request: request(bad), env })).status,
        400,
      );
    assert.equal(
      (
        await onRequest({
          request: request(career, { Origin: "https://attacker.example" }),
          env,
        })
      ).status,
      403,
    );
    assert.equal(
      (await onRequest({ request: request(career), env: {} })).status,
      503,
    );
    assert.equal(
      (
        await onRequest({
          request: new Request("https://rsggrowth.com/api/career-diagnostic"),
          env,
        })
      ).status,
      405,
    );
    assert.equal(
      (
        await onRequest({
          request: request(career, { "Idempotency-Key": "bad" }),
          env,
        })
      ).status,
      400,
    );
    const malformed = request(career);
    const broken = new Request(malformed.url, {
      method: "POST",
      headers: malformed.headers,
      body: "{",
    });
    assert.equal((await onRequest({ request: broken, env })).status, 400);
    globalThis.fetch = async () =>
      Response.json({ error: "private provider detail" }, { status: 500 });
    const failure = await onRequest({ request: request(career), env });
    assert.equal(failure.status, 502);
    assert.doesNotMatch(await failure.text(), /private provider/);
    globalThis.fetch = async () => Response.json({});
    assert.equal(
      (await onRequest({ request: request(career), env })).status,
      502,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("career transport accepts only a confirmed receipt", async () => {
  const original = globalThis.fetch;
  try {
    for (const reply of [
      Response.json({}, { status: 500 }),
      Response.json({ status: "submitted" }),
      Response.json({ status: "prepared", receiptId: "x" }),
    ]) {
      globalThis.fetch = async () => reply;
      await assert.rejects(
        submitCareer(careerSchema.parse(career), crypto.randomUUID()),
      );
    }
    globalThis.fetch = async () =>
      Response.json({ status: "submitted", receiptId: "x" });
    assert.equal(
      (await submitCareer(careerSchema.parse(career), crypto.randomUUID()))
        .status,
      "submitted",
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("career analytics deduplicate steps and submit; reviews suppress all custom events", () => {
  const calls: unknown[][] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      rsgAnalyticsInitialized: true,
      location: { pathname: "/careers/diagnostic/" },
      gtag: (...args: unknown[]) => calls.push(args),
    },
  });
  try {
    const tracker = createCareerTracking();
    tracker.start();
    tracker.start();
    for (let i = 2; i <= 8; i++) {
      tracker.advance(i);
      tracker.advance(i);
    }
    tracker.complete({ status: "prepared" });
    assert.equal(calls.length, 8);
    tracker.complete({ status: "submitted" });
    tracker.complete({ status: "submitted" });
    assert.equal(calls.length, 9);
    assert.equal(calls[8][1], "career_diagnostic_submit");
    assert.deepEqual(calls[8][2], { source_page: "/careers/diagnostic/" });
    const event = {
      name: "career_contact_click" as const,
      cta_location: "footer" as const,
      email: "private@example.com",
    };
    trackEvent(event);
    assert.doesNotMatch(JSON.stringify(calls), /private@example/);
    window.location.pathname = "/review/";
    trackEvent({ name: "career_diagnostic_submit" });
    assert.equal(calls.length, 10);
  } finally {
    Reflect.deleteProperty(globalThis, "window");
  }
});

test("career rate limit and bounded streaming parser reject abuse without delivery", async () => {
  const original = globalThis.fetch;
  let deliveries = 0;
  globalThis.fetch = async () => { deliveries++; return Response.json({ id: "test-only" }); };
  try {
    const ip = crypto.randomUUID();
    for (let n = 0; n < 5; n++) assert.equal((await onRequest({ request: request(career, { "CF-Connecting-IP": ip }), env })).status, 200);
    assert.equal((await onRequest({ request: request(career, { "CF-Connecting-IP": ip }), env })).status, 429);
    assert.equal(deliveries, 5);
    await assert.rejects(readJson(new Request("https://rsggrowth.com", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "x".repeat(17000) }) })));
    const www = request(career, { Origin: "https://www.rsggrowth.com" });
    assert.equal(originAllowed(www, { RSG_ALLOWED_ORIGIN: "https://rsggrowth.com" }), true);
    assert.equal(originAllowed(www, { RSG_ALLOWED_ORIGIN: "https://preview.pages.dev" }), false);
  } finally { globalThis.fetch = original; }
});
