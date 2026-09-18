import { test } from "node:test";
import assert from "node:assert/strict";
import {
  diagnosticSchema,
  diagnosticSummary,
  initialDraft,
  submitDiagnostic,
  validateStep,
  type DiagnosticDraft,
} from "../src/lib/diagnostic.ts";

const valid: DiagnosticDraft = {
  name: "Test Owner",
  email: "owner@example.com",
  company: "Example Business",
  role: "Owner",
  stage: "Managing growth",
  teamSize: "2–10 people",
  priorities: ["Finance", "Execution"],
  challenge: "We need a clearer view of cash flow.",
  goal: "Build a practical operating plan.",
  timeline: "In the next 1–3 months",
  consent: true,
};

test("each step validates its own required fields", () => {
  assert.deepEqual(Object.keys(validateStep(initialDraft, 0)), [
    "name",
    "email",
    "company",
  ]);
  assert.deepEqual(Object.keys(validateStep(initialDraft, 1)), [
    "stage",
    "teamSize",
    "priorities",
  ]);
  assert.deepEqual(Object.keys(validateStep(initialDraft, 2)), [
    "challenge",
    "goal",
    "timeline",
  ]);
  assert.deepEqual(Object.keys(validateStep(initialDraft, 3)), ["consent"]);
  for (let i = 0; i < 4; i++) assert.deepEqual(validateStep(valid, i), {});
});
test("rejects malformed email, whitespace-only answers, excessive lengths and unknown options", () => {
  for (const change of [
    { email: "not-an-email" },
    { company: "   " },
    { challenge: "short" },
    { goal: "x".repeat(401) },
    { stage: "unrecognized" },
    { consent: false },
    { priorities: ["Unknown"] },
  ]) {
    assert.equal(
      diagnosticSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
  }
});
test("trims text and strips unexpected payload keys", () => {
  const parsed = diagnosticSchema.parse({
    ...valid,
    name: " Test Owner ",
    secret: "unexpected",
  });
  assert.equal(parsed.name, "Test Owner");
  assert.equal("secret" in parsed, false);
});
test("default transport makes no request and never claims delivery", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("Unexpected network request");
  };
  try {
    assert.deepEqual(
      await submitDiagnostic(diagnosticSchema.parse(valid), "test-id"),
      { status: "prepared" },
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("email summary includes all context and can round-trip through URL encoding", () => {
  const summary = diagnosticSummary({
    ...valid,
    company: "A & B #1",
    role: "",
  });
  assert.match(summary, /A & B #1/);
  assert.match(summary, /Not provided/);
  assert.match(summary, /Finance, Execution/);
  assert.match(summary, /RSG may contact me/);
  assert.equal(decodeURIComponent(encodeURIComponent(summary)), summary);
});
