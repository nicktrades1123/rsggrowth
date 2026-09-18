import { test } from "node:test";
import assert from "node:assert/strict";
import { createDiagnosticTracking, trackEvent } from "../src/lib/analytics.ts";

test("funnel events are deduplicated and completion requires confirmed submission", () => {
  const calls: unknown[][] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      rsgAnalyticsInitialized: true,
      location: { pathname: "/business-diagnostic/" },
      gtag: (...args: unknown[]) => calls.push(args),
    },
  });
  try {
    const tracker = createDiagnosticTracking();
    assert.equal(calls.length, 0);
    tracker.start();
    tracker.start();
    tracker.advance(2);
    tracker.advance(2);
    tracker.advance(3);
    tracker.advance(4);
    tracker.complete({ status: "prepared" });
    assert.deepEqual(
      calls.map((c) => c[1]),
      [
        "diagnostic_start",
        "diagnostic_step",
        "diagnostic_step",
        "diagnostic_step",
      ],
    );
    tracker.complete({ status: "submitted" });
    tracker.complete({ status: "submitted" });
    assert.equal(calls.filter((c) => c[1] === "diagnostic_submit").length, 1);
    assert.deepEqual(calls[1][2], {
      source_page: "/business-diagnostic/",
      step_number: 2,
      step_name: "Your priorities",
    });
    assert.deepEqual(calls[4][2], { source_page: "/business-diagnostic/" });
    createDiagnosticTracking().start();
    assert.equal(calls.filter((c) => c[1] === "diagnostic_start").length, 2);
    window.gtag = () => {
      throw Error("blocked");
    };
    assert.doesNotThrow(() => trackEvent({ name: "diagnostic_start" }));
    window.gtag = undefined;
    assert.doesNotThrow(() => trackEvent({ name: "diagnostic_submit" }));
  } finally {
    Reflect.deleteProperty(globalThis, "window");
  }
});

test("event metadata excludes unknown fields and arbitrary URL paths", () => {
  const calls: unknown[][] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      rsgAnalyticsInitialized: true,
      location: { pathname: "/private-person@example.com" },
      gtag: (...args: unknown[]) => calls.push(args),
    },
  });
  try {
    const event = {
      name: "contact_email_click" as const,
      cta_location: "footer" as const,
      email: "private-person@example.com",
      body: "private answers",
    };
    trackEvent(event);
    assert.deepEqual(calls[0][2], {
      source_page: "/404/",
      cta_location: "footer",
    });
    window.rsgAnalyticsInitialized = false;
    trackEvent({ name: "diagnostic_start" });
    assert.equal(calls.length, 1);
  } finally {
    Reflect.deleteProperty(globalThis, "window");
  }
});
