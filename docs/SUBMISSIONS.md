# Diagnostic submission contract

## Current behavior: no production backend

`NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=false` is the default. No request is made and no answer is persisted. The four-step form validates, reviews, and prepares an email draft. Confirmation explicitly says **not sent**. Visitors can download a text summary and email it to grow@rsggrowth.com. Email-client limits vary; the download is the fallback if a mailto draft is truncated.

There are no email credentials, API tokens, databases, fake responses, or undocumented third-party endpoints in this implementation. No analytics or client-side storage is used.

## Before enabling direct submission

Deploy an actual same-origin `POST /api/diagnostic` handler, for example a Cloudflare Pages Function at `functions/api/diagnostic.ts` integrated with an approved email/CRM provider. It is intentionally NOT implemented until provider, storage, access, and retention requirements are known. A static Next.js export cannot run Next.js API routes or Server Actions.

1. Validate the full JSON body on the server with `diagnosticSchema` from `src/lib/diagnostic.ts`. Client validation is only a usability feature. Impose a request body size limit (e.g. 16 KB), enforce JSON content type, POST only, and a same-origin Origin policy. Do not accept arbitrary destinations or client-supplied email headers.
2. Add rate limiting and appropriate spam protection. If Turnstile is chosen, validate its token server-side and update the CSP for the official widget origins. Do not log diagnostic payloads or include personal data in URLs.
3. Keep provider credentials in Cloudflare secrets. No secrets belong in `NEXT_PUBLIC_*`, GitHub source, or static output. Send from a verified sender to the fixed grow@rsggrowth.com destination. Use the validated email only as Reply-To and properly escape/encode all user content.
4. Accept the `Idempotency-Key` UUID header. Atomically deduplicate retries and only return success after durable acceptance by the delivery provider or queue. Retain the same receipt on duplicate requests. Define storage/retention controls with RSG.
5. Return non-2xx for failure and JSON `{ "status": "submitted", "receiptId": "opaque-reference" }` for success. No receipt should contain personal information. Set `Cache-Control: no-store` and appropriate API security headers.
6. Test server validation, rate limits, origin rejection, provider failures, timeout-after-acceptance/retry deduplication, and actual inbox delivery in a preview environment. The client times out after 15 seconds, preserves answers on failure, and will not claim success for an invalid response or a redirect.
7. Review the Privacy Policy against the real service providers, retention practice, company jurisdiction, and operational processes before launch.
8. Only then set `NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=true` in the build environment and rebuild. This public flag is not a credential or security boundary.

Keep direct submission disabled until the entire path is verified. The email preparation mode remains usable without backend configuration.
