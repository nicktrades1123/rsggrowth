# Diagnostic submission contract

## Separate Career Diagnostic

The Business Diagnostic implementation below is unchanged. Career Strategy uses a separate `POST /api/career-diagnostic` Pages Function and questionnaire, sharing the Resend provider conventions. It is gated server-side by `CAREER_SUBMISSIONS_ENABLED=true`, requires the existing Resend secrets, and returns success only after a validated provider receipt. Missing configuration produces an honest unavailable response; the form retains answers. Provider idempotency reduces accidental retry duplicates. See [CAREER_STRATEGY.md](CAREER_STRATEGY.md) for exact fields, setup, and limitations. Review submissions use D1 rather than email; see [REVIEWS.md](REVIEWS.md).

## Current behavior: backend prepared, production delivery disabled by default

`NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=false` remains the safe default until the required Cloudflare and Resend configuration is completed. With it disabled, no request is made and no answer is persisted. The four-step form validates, reviews, and prepares an email draft. Confirmation explicitly says **not sent**. Visitors can download a text summary and email it to grow@rsggrowth.com. Email-client limits vary; the download is the fallback if a mailto draft is truncated.

The production endpoint is now prepared at `functions/api/diagnostic.ts`. It is not claimed operational until Resend sender verification, encrypted secrets, the enabled build flag, and an end-to-end delivery test are complete. See [docs/PRODUCTION-SUBMISSION.md](PRODUCTION-SUBMISSION.md).

There are no email credentials, API tokens, databases, fake responses, or undocumented submission endpoints in the repository. Diagnostic answers are not stored in client-side storage or sent to analytics. The production website measures only funnel metadata through GA4; see [analytics behavior](ANALYTICS.md).

## Before enabling direct submission

The same-origin `POST /api/diagnostic` handler is a Cloudflare Pages Function at `functions/api/diagnostic.ts`, integrated with Resend. A static Next.js export cannot run Next.js API routes or Server Actions.

1. Validate the full JSON body on the server with `diagnosticSchema` from `src/lib/diagnostic.ts`. Client validation is only a usability feature. Impose a request body size limit (e.g. 16 KB), enforce JSON content type, POST only, and a same-origin Origin policy. Do not accept arbitrary destinations or client-supplied email headers.
2. Add rate limiting and appropriate spam protection. If Turnstile is chosen, validate its token server-side and update the CSP for the official widget origins. Do not log diagnostic payloads or include personal data in URLs.
3. Keep provider credentials in Cloudflare secrets. No secrets belong in `NEXT_PUBLIC_*`, GitHub source, or static output. Send from a verified sender to the fixed grow@rsggrowth.com destination. Use the validated email only as Reply-To and properly escape/encode all user content.
4. Accept the `Idempotency-Key` UUID header. Atomically deduplicate retries and only return success after durable acceptance by the delivery provider or queue. Retain the same receipt on duplicate requests. Define storage/retention controls with RSG.
5. Return non-2xx for failure and JSON `{ "status": "submitted", "receiptId": "opaque-reference" }` for success. No receipt should contain personal information. Set `Cache-Control: no-store` and appropriate API security headers.
6. Test server validation, rate limits, origin rejection, provider failures, timeout-after-acceptance/retry deduplication, and actual inbox delivery in a preview environment. The client times out after 15 seconds, preserves answers on failure, and will not claim success for an invalid response or a redirect.
7. Review the Privacy Policy against the real service providers, retention practice, company jurisdiction, and operational processes before launch.
8. Only then set `NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=true` in the build environment and rebuild. This public flag is not a credential or security boundary.

Keep direct submission disabled until the entire path is verified and the required production variables are configured. The email preparation mode remains usable without backend configuration.

