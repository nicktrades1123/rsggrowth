import { test } from "node:test";
import assert from "node:assert/strict";
process.env.NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED = "true";
const { submitDiagnostic, diagnosticSchema } =
  await import("../src/lib/diagnostic.ts");
const payload = diagnosticSchema.parse({
  name: "Test Owner",
  email: "owner@example.com",
  company: "Example Business",
  role: "",
  stage: "Managing growth",
  teamSize: "2–10 people",
  priorities: ["Finance"],
  challenge: "We need a clearer cash flow plan.",
  goal: "Build a practical operating plan.",
  timeline: "Just exploring",
  consent: true,
});

test("configured transport requires a confirmed receipt and sends validated JSON to a fixed same-origin endpoint", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "/api/diagnostic");
    assert.equal(init?.method, "POST");
    assert.equal(init?.redirect, "error");
    assert.equal(
      (init?.headers as Record<string, string>)["Idempotency-Key"],
      "stable-request-id",
    );
    assert.deepEqual(JSON.parse(init?.body as string), payload);
    return Response.json({ status: "submitted", receiptId: "receipt-123" });
  };
  try {
    assert.deepEqual(await submitDiagnostic(payload, "stable-request-id"), {
      status: "submitted",
      receiptId: "receipt-123",
    });
  } finally {
    globalThis.fetch = original;
  }
});
test("failed, malformed, and missing-receipt responses never produce a success state", async () => {
  const original = globalThis.fetch;
  try {
    for (const response of [
      new Response("Unavailable", { status: 503 }),
      Response.json({ success: true }),
      Response.json({ status: "submitted", receiptId: "" }),
      new Response("not json"),
    ]) {
      globalThis.fetch = async () => response;
      await assert.rejects(submitDiagnostic(payload, "stable-request-id"));
    }
    globalThis.fetch = async () => {
      throw new DOMException("Timed out", "TimeoutError");
    };
    await assert.rejects(submitDiagnostic(payload, "stable-request-id"));
  } finally {
    globalThis.fetch = original;
  }
});
