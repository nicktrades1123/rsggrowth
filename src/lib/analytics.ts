export const measurementId = "G-R5MV45MJJD";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    rsgAnalyticsInitialized?: boolean;
  }
}

const pages = new Set([
  "/",
  "/about/",
  "/what-we-do/",
  "/who-we-serve/",
  "/contact/",
  "/business-diagnostic/",
  "/careers/",
  "/careers/diagnostic/",
  "/privacy/",
  "/terms/",
  "/industries/contractors-home-services/",
]);
export function sourcePage(): string {
  if (typeof window === "undefined") return "/";
  const path = window.location.pathname.replace(/\/$/, "") + "/";
  return pages.has(path) ? path : "/404/";
}
export type CtaLocation =
  | "header"
  | "footer"
  | "hero"
  | "page_intro"
  | "cta_band"
  | "owner_problems"
  | "contact"
  | "diagnostic"
  | "diagnostic_confirmation"
  | "content";
type AnalyticsEvent =
  | { name: "career_cta_click" | "career_contact_click"; cta_location: CtaLocation }
  | { name: "career_diagnostic_start" | "career_diagnostic_submit" }
  | { name: "career_diagnostic_step"; step_number: number; step_name: string }
  | { name: "diagnostic_cta_click"; cta_location: CtaLocation }
  | { name: "contact_email_click"; cta_location: CtaLocation }
  | { name: "diagnostic_start" }
  | { name: "diagnostic_step"; step_number: number; step_name: string }
  | { name: "diagnostic_submit" };

// Only explicitly selected metadata reaches GA. Never pass form values, errors,
// receipt IDs, link text, or full mailto URLs to this function.
export function trackEvent(event: AnalyticsEvent): void {
  try {
    if (typeof window === "undefined" || !window.rsgAnalyticsInitialized || /^\/review(?:\/|$)/.test(window.location.pathname))
      return;
    const params: Record<string, string | number> = {
      source_page: sourcePage(),
    };
    if (
      event.name === "diagnostic_cta_click" ||
      event.name === "career_cta_click" || event.name === "career_contact_click" ||
      event.name === "contact_email_click"
    ) {
      params.cta_location = event.cta_location;
    }
    if (event.name === "diagnostic_cta_click")
      params.destination = "/business-diagnostic/";
    if (event.name === "career_cta_click") params.destination = "/careers/diagnostic/";
    if (event.name === "diagnostic_step" || event.name === "career_diagnostic_step") {
      params.step_number = event.step_number;
      params.step_name = event.step_name;
    }
    window.gtag?.("event", event.name, params);
  } catch {
    // Analytics must never interrupt the visitor's task.
  }
}

export function createCareerTracking() {
  let started = false, submitted = false;
  const reached = new Set<number>();
  const names = ["Contact", "Current position", "Goals", "Challenges", "Prior efforts", "Success", "Timing", "Context & review"];
  return {
    start() { if (started) return; started = true; trackEvent({ name: "career_diagnostic_start" }); },
    advance(step: number) { if (!Number.isInteger(step) || step < 2 || step > 8 || reached.has(step)) return; reached.add(step); trackEvent({ name: "career_diagnostic_step", step_number: step, step_name: names[step - 1] }); },
    complete(result: { status: string }) { if (submitted || result.status !== "submitted") return; submitted = true; trackEvent({ name: "career_diagnostic_submit" }); },
  };
}

export function createDiagnosticTracking() {
  let started = false;
  let submitted = false;
  const reached = new Set<number>();
  return {
    start() {
      if (started) return;
      started = true;
      trackEvent({ name: "diagnostic_start" });
    },
    advance(step: number) {
      const names = [
        "Your business",
        "Your priorities",
        "Your goals",
        "Review",
      ];
      if (step < 2 || step > 4 || reached.has(step)) return;
      reached.add(step);
      trackEvent({
        name: "diagnostic_step",
        step_number: step,
        step_name: names[step - 1],
      });
    },
    complete(result: { status: "prepared" | "submitted" }) {
      if (result.status !== "submitted" || submitted) return;
      submitted = true;
      trackEvent({ name: "diagnostic_submit" });
    },
  };
}

