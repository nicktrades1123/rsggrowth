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
  | { name: "diagnostic_cta_click"; cta_location: CtaLocation }
  | { name: "contact_email_click"; cta_location: CtaLocation }
  | { name: "diagnostic_start" }
  | { name: "diagnostic_step"; step_number: number; step_name: string }
  | { name: "diagnostic_submit" };

// Only explicitly selected metadata reaches GA. Never pass form values, errors,
// receipt IDs, link text, or full mailto URLs to this function.
export function trackEvent(event: AnalyticsEvent): void {
  try {
    if (typeof window === "undefined" || !window.rsgAnalyticsInitialized)
      return;
    const params: Record<string, string | number> = {
      source_page: sourcePage(),
    };
    if (
      event.name === "diagnostic_cta_click" ||
      event.name === "contact_email_click"
    ) {
      params.cta_location = event.cta_location;
    }
    if (event.name === "diagnostic_cta_click")
      params.destination = "/business-diagnostic/";
    if (event.name === "diagnostic_step") {
      params.step_number = event.step_number;
      params.step_name = event.step_name;
    }
    window.gtag?.("event", event.name, params);
  } catch {
    // Analytics must never interrupt the visitor's task.
  }
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
