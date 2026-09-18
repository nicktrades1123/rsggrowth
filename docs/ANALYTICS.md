# GA4 measurement and diagnostic funnel

Measurement ID: `G-R5MV45MJJD` (public identifier, not a secret).

## Architecture and pre-change findings

The static Next.js App Router website had no GA, GTM, or other analytics code. The diagnostic is a four-step client form using in-memory state and Zod validation. Its production flag is false: completion prepares a draft/download, not a submission. The optional same-origin transport returns `submitted` only after a valid server receipt. This implementation does not enable, replace, or modify that transport or its destination.

One root client component initializes the Google tag once and loads gtag.js after hydration with Next Script. It runs only on `rsggrowth.com` and `www.rsggrowth.com`, and skips automated browsers. Localhost and Pages preview domains remain silent. No GTM container, credentials, dependency, UTM database, or separate analytics backend was added. Google owns initial and history-based pageviews; the application does not emit an additional manual page_view. Ensure the web stream's Enhanced Measurement has page loads and page changes based on browser history enabled.

The tag preserves the actual landing URL, referral, and campaign parameters, including utm_source, utm_medium, utm_campaign, and utm_content. No campaign values, source/medium, user ID, or referrer overrides are set. Use only non-personal campaign labels in public URLs. Advertising personalization and Google signals are disabled by the website tag.

The application CSP in `public/_headers` permits only the additional Google script/collection hosts needed for GA4. This is a repository header change; no Cloudflare dashboard, domain, DNS, email, or secret settings were changed. The Privacy Policy now accurately discloses analytics.

## Events

| Event                | Trigger                                              | Parameters                             |
| -------------------- | ---------------------------------------------------- | -------------------------------------- |
| diagnostic_cta_click | Click or middle-click on a link to the diagnostic    | source_page, cta_location, destination |
| diagnostic_start     | First field change in the current questionnaire      | source_page                            |
| diagnostic_step      | First validated advance into each step               | source_page, step_number, step_name    |
| diagnostic_submit    | Confirmed `submitted` result from existing transport | source_page                            |
| contact_email_click  | Click on a grow@rsggrowth.com mailto link            | source_page, cta_location              |

Step numbers describe the destination: 2 = Your priorities, 3 = Your goals, 4 = Review. Back navigation and revisiting an already reached step do not duplicate step events. A session means the mounted questionnaire; refresh, re-entry, or Clear and start again begins a new one. No persistent identity or session token is sent. Editing a prepared draft continues the same session.

CTA coverage: shared header/footer, homepage hero and owner-problem section, shared CTA bands, What We Do approach, Contact, and contractor hero/final CTA. Email links include footer, Contact, diagnostic sidebar/confirmation, Privacy, and Terms. Delegated capture listeners cover client navigation without replacing link navigation. Locations use a fixed vocabulary; source_page is an allowlisted pathname with no query or fragment.

Only fixed metadata is passed to GA: no answer objects, names, emails, business names, free text, field values, errors, receipt IDs, or full mailto URLs. The email-draft link exposes only the public destination in its href; its click handler constructs the original subject/body at activation, so enhanced outbound measurement cannot read private answers from the link. The draft still opens in the user's email app and is not sent automatically. Tracking errors are swallowed, and missing/blocked gtag cannot stop the form or navigation.

## Important conversion limitation

**The email-preparation flow does not fire diagnostic_submit.** The browser cannot verify email delivery. Neither preparing/downloading answers nor opening the email client counts as a primary conversion. The hook is placed after confirmed transport success; once the Cloudflare Function and Resend configuration are completed, a confirmed delivery response will fire it. Server/API failures and invalid receipts never reach it. Do not mark GA's automatically collected form_submit event as the lead conversion.

## After deployment: verify in GA4

1. Open Google Analytics and select the property containing G-R5MV45MJJD. In Admin → Data streams → the RSG web stream, verify Enhanced Measurement → Page views includes page loads and history-based page changes. Do not install a second Google tag. Turn off automatic Form interactions if you want only the custom funnel; review automatic outbound clicks and user-provided data collection settings and keep user-provided data collection disabled. These are owner-side Admin checks, not changes made by this application.
2. Open [Google Tag Assistant](https://tagassistant.google.com/) and connect to `https://rsggrowth.com/`. Then open GA4 Admin → Data display → DebugView and select your test device. Alternatively use Reports → Realtime for basic event arrival. DebugView requires debug mode; Tag Assistant enables it for your device.
3. Visit the homepage, About, and contractor page. Verify one page_view per page/navigation and check location/referrer. Duplicate pageviews usually mean another tag or manual pageview implementation is also running. For a campaign check, start a new visit at `https://rsggrowth.com/?utm_source=nextdoor&utm_medium=social&utm_campaign=contractors&utm_content=test`. Acquisition reports provide fuller attribution than DebugView/Realtime.
4. Click Start a Business Diagnostic from a hero and then another location. Verify diagnostic_cta_click and its source_page, cta_location, destination. Loading the diagnostic alone must not emit diagnostic_start.
5. Edit a field using clearly fictional test data: diagnostic_start should appear once. Try Continue with incomplete fields: no diagnostic_step. Complete valid fields: steps 2, 3, 4 should appear once each. Go Back and forward: no repeat for the same step.
6. Prepare the diagnostic. Expect **no diagnostic_submit**. Open the email draft: contact_email_click should appear with diagnostic_confirmation, without subject/body or answers. Other public email links should report their own fixed location.
7. After the Cloudflare Function and Resend configuration is completed, test its successful receipt in a controlled environment: diagnostic_submit must follow confirmed success, not a click. Keep primary conversion tests out of production reporting where possible. Mark only diagnostic_submit as a Key Event in GA4 Admin → Events; if it has not arrived yet, use the key-event creation control for that exact name. This implementation does not change GA4 Admin settings.
8. Optional: create event-scoped custom dimensions for source_page, cta_location, destination, step_number, and step_name to use them in reports/explorations. A funnel can use diagnostic_start → diagnostic_step 2 → diagnostic_step 3 → diagnostic_step 4 → diagnostic_submit. Its last stage will remain empty under email preparation.

Google references: [SPA pageviews](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [Enhanced Measurement](https://support.google.com/analytics/answer/9216061), [DebugView](https://support.google.com/analytics/answer/7201382), [Key events](https://support.google.com/analytics/answer/9267568).

## Verification and files

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`. Tests stub the Google script, block all external destinations, and serve a simulated production hostname from the local build. They do not send production hits. Unit tests cover deduplication, prepared vs. submitted, metadata filtering, and missing/throwing gtag. Browser tests cover navigation, UTM preservation, validation, step progression/backtracking, email preparation, privacy, and localhost suppression. These checks establish application behavior; live receipt and GA property settings must be verified after deployment.

Created: src/lib/analytics.ts; src/components/analytics.tsx; tests/analytics.test.ts; tests/browser/analytics.spec.ts; docs/ANALYTICS.md; functions/api/diagnostic.ts; docs/PRODUCTION-SUBMISSION.md; tests/server.test.ts.

Modified: src/app/layout.tsx; src/components/diagnostic-form.tsx; src/app/privacy/page.tsx; public/_headers; package.json; tests/browser/site.spec.ts; tests/browser/industry.spec.ts (time allowance for eight accessibility scans); README.md; docs/SUBMISSIONS.md; .env.example.
