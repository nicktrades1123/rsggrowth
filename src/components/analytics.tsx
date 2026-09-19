"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { measurementId, trackEvent, type CtaLocation } from "@/lib/analytics";

function locationFor(link: HTMLAnchorElement): CtaLocation {
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  if (link.closest(".confirmation")) return "diagnostic_confirmation";
  if (link.closest(".diagnostic-layout")) return "diagnostic";
  if (link.closest(".home-hero")) return "hero";
  if (link.closest(".page-intro")) return "page_intro";
  if (link.closest(".cta-band")) return "cta_band";
  if (link.closest(".contact-grid")) return "contact";
  if (link.closest("section")?.querySelector("#owner-situations"))
    return "owner_problems";
  return "content";
}

const subscribe = () => () => {};
const isProductionBrowser = () =>
  ["rsggrowth.com", "www.rsggrowth.com"].includes(window.location.hostname) &&
  !/^\/review(?:\/|$)/.test(window.location.pathname) &&
  !navigator.webdriver;
export function Analytics() {
  const path = usePathname();
  const production = useSyncExternalStore(
    subscribe,
    isProductionBrowser,
    () => false,
  );
  const enabled = production && !/^\/review(?:\/|$)/.test(path);
  useEffect(() => {
    // Production domains only. Localhost, Pages previews, and automated browsers
    // never load the tag or send production hits by default.
    if (!enabled) return;
    try {
      if (!window.rsgAnalyticsInitialized) {
        window.dataLayer ||= [];
        window.gtag ||= function () {
          // Keep Google's documented gtag queue format (an Arguments object).
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer?.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", measurementId, {
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        });
        window.rsgAnalyticsInitialized = true;
      }
    } catch {
      return;
    }
    const onClick = (event: MouseEvent) => {
      try {
        if (event.type === "auxclick" && event.button !== 1) return;
        const target = event.target instanceof Element ? event.target : null;
        const link = target?.closest<HTMLAnchorElement>("a[href]");
        if (!link) return;
        const url = new URL(link.href, window.location.href);
        const cta_location = locationFor(link);
        if (
          url.origin === window.location.origin &&
          url.pathname.replace(/\/$/, "") === "/business-diagnostic"
        ) {
          trackEvent({ name: "diagnostic_cta_click", cta_location });
        } else if (url.origin === window.location.origin && url.pathname.replace(/\/$/, "") === "/careers/diagnostic") {
          trackEvent({ name: "career_cta_click", cta_location });
        } else if (
          url.protocol === "mailto:" &&
          url.pathname.toLowerCase() === "grow@rsggrowth.com"
        ) {
          trackEvent({ name: window.location.pathname.startsWith("/careers/") ? "career_contact_click" : "contact_email_click", cta_location });
        }
      } catch {
        /* Invalid URLs or blocked analytics cannot affect navigation. */
      }
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, [enabled]);
  return enabled ? (
    <Script
      id="rsg-ga4"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  ) : null;
}

