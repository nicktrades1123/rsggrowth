import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/api/diagnostic.ts";

const payload = {
  name: "Test Owner",
  email: "owner@example.com",
  company: "Example Roofing",
  role: "Owner",
  stage: "Managing growth",
  teamSize: "2–10 people",
  priorities: ["Growth"],
  challenge: "We need a repeatable sales process.",
  goal: "Build a practical growth plan.",
  timeline: "In the next 1–3 months",
  consent: true,
};
const env = {
  RESEND_API_KEY: "test-key",
  RESEND_FROM_EMAIL: "RSG <test@example.com>",
};
function request(
  body: unknown,
  ip = Math.random().toString(),
  headers: Record<string, string> = {},
) {
  return new Request("https://rsggrowth.com/api/diagnostic", {
    method: "POST",
    headers: {
      Origin: "https://rsggrowth.com",
      "Content-Type": "application/json",
      "CF-Connecting-IP": ip,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

test("valid server submission sends only validated text to the fixed recipient and returns a receipt", async () => {
  const original = globalThis.fetch;
  let sent: Record<string, unknown> | undefined;
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(String(init?.body));
    return Response.json({ id: "provider-id" });
  };
  try {
    const response = await onRequest({ request: request(payload), env });
    assert.equal(response.status, 200);
    const result = (await response.json()) as {
      status: string;
      receiptId: string;
    };
    assert.equal(result.status, "submitted");
    assert.match(result.receiptId, /^[0-9a-f-]{36}$/);
    assert.equal(sent?.to instanceof Array && sent.to[0], "grow@rsggrowth.com");
    assert.equal(sent?.reply_to, payload.email);
    assert.match(String(sent?.subject), /Example Roofing/);
    assert.match(String(sent?.text), /CURRENT CHALLENGE/);
    assert.doesNotMatch(JSON.stringify(sent), /<script|Content-Type|Bcc|X-/i);
  } finally {
    globalThis.fetch = original;
  }
});

test("malformed, oversized, honeypot, wrong origin, wrong method, and provider failures fail closed", async () => {
  const malformed = await onRequest({ request: request({ name: "x" }), env });
  assert.equal(malformed.status, 400);
  const honeypot = await onRequest({
    request: request({ ...payload, website: "bot" }),
    env,
  });
  assert.equal(honeypot.status, 400);
  const wrongOrigin = await onRequest({
    request: request(payload, Math.random().toString(), {
      Origin: "https://evil.example",
    }),
    env,
  });
  assert.equal(wrongOrigin.status, 403);
  const wrongMethod = await onRequest({
    request: new Request("https://rsggrowth.com/api/diagnostic", {
      method: "GET",
      headers: { Origin: "https://rsggrowth.com" },
    }),
    env,
  });
  assert.equal(wrongMethod.status, 405);
  const oversized = await onRequest({
    request: request({ data: "x".repeat(17000) }),
    env,
  });
  assert.equal(oversized.status, 413);
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response("provider unavailable", { status: 500 });
  try {
    const failed = await onRequest({ request: request(payload), env });
    assert.equal(failed.status, 502);
    assert.deepEqual(await failed.json(), {
      error:
        "Submission is temporarily unavailable. Please email grow@rsggrowth.com.",
    });
  } finally {
    globalThis.fetch = original;
  }
});

test("rate limiting rejects the sixth request in a window", async () => {
  const ip = `rate-${Math.random()}`;
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ id: "provider-id" });
  try {
    const statuses = [];
    for (let i = 0; i < 6; i++)
      statuses.push(
        (await onRequest({ request: request(payload, ip), env })).status,
      );
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  } finally {
    globalThis.fetch = original;
  }
});
