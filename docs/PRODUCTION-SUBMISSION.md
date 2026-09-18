# Production Business Diagnostic submission

## Architecture

```text
Browser validation
  → Cloudflare Pages Function POST /api/diagnostic
  → shared Zod validation, size/origin/honeypot/rate checks
  → Resend API (server-side secret)
  → grow@rsggrowth.com
  → { status: "submitted", receiptId }
  → confirmation UI
  → GA4 diagnostic_submit
```

The site remains a static Next export. Cloudflare Pages Functions add the same-origin server endpoint without moving hosting. The client keeps answers in memory, sends only the existing questionnaire fields, and retains answers when the endpoint fails. The client fires `diagnostic_submit` only after the existing transport receives a valid submitted response. No receipt ID, email content, or answers reach GA4.

## Provider choice

Resend is used as the delivery adapter because it exposes a server-side HTTPS API compatible with Cloudflare Workers/Pages Functions and provides a low-volume free tier. Cloudflare Email Routing is inbound forwarding and is not used for outbound delivery. V1 does not add a database: the endpoint is intentionally simple, and a failed provider response does not claim success. If RSG needs recovery of accepted-but-undelivered leads, add a durable queue/storage layer after defining retention.

The implementation does not claim production readiness until the Resend account, sender domain, secrets, and a real end-to-end receipt are configured and tested.

## Required Cloudflare Pages configuration

In the `rsggrowth` Pages project, add these as encrypted production environment variables (Settings → Environment variables):

- `NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=true` — public build flag; this is not a secret. Set it only in the same deployment that includes the Function.
- `RESEND_API_KEY` — Resend API key; secret, never commit it and never use `NEXT_PUBLIC_`.
- `RESEND_FROM_EMAIL` — verified sender, for example `RSG <notifications@rsggrowth.com>`; use a mailbox/domain RSG controls and has verified in Resend.
- `RSG_ALLOWED_ORIGIN` — optional; defaults to `https://rsggrowth.com`. Set it to the canonical production origin if that changes. `www.rsggrowth.com` is also accepted for the current domain setup.

Resend account setup:

1. Create/sign in to a Resend account and create an API key with only the permissions needed to send email.
2. Add and verify `rsggrowth.com` (or a dedicated sending subdomain) in Resend. Resend will show DNS records for sender authentication. Those records are separate from Cloudflare Email Routing; do not remove or alter the existing MX/SPF/DKIM records without reviewing the provider’s instructions and RSG’s email setup.
3. Use the exact verified sender in `RESEND_FROM_EMAIL`.
4. Add the encrypted variables to the Production environment. Preview remains disabled unless deliberately configured with separate test credentials.
5. Redeploy the Pages project. No DNS, Cloudflare Email Routing, or domain configuration is changed by this code.

## Abuse protection and limitations

The Function requires POST, checks same-origin `Origin`, rejects non-JSON, limits the body to 16 KB, validates the full schema server-side, rejects a `website` honeypot value, and applies a small per-isolate IP window (5 requests/15 minutes). Cloudflare edge protections and rate limiting should be added before promotion if abuse volume warrants it; the in-memory limit is not a durable global limiter across isolates. Turnstile is not enabled because no site/secret keys were supplied. For a high-publicity campaign, configure Turnstile and pass/verify its token server-side before enabling broad promotion.

The email uses a fixed recipient and fixed header structure. User values are plain text, and the user email is used only as `Reply-To` after Zod validation; user input cannot control `To`, `From`, or other headers. The Function does not log payloads or return stack traces. Resend/provider failures return a generic error and the user can retry or email grow@rsggrowth.com. There is no persistent submission record in V1, so a provider outage means no confirmed lead is recorded.

## End-to-end test

1. Deploy the Function with the four variables configured. Use a fictional submission such as `Test Roofing Co.` and `owner@example.com`; do not use a real client’s private information.
2. Complete all four steps and click **Submit Business Diagnostic**. Confirm the user sees the confirmed receipt state without a mail application opening.
3. Confirm the message arrived at `grow@rsggrowth.com`, with the expected subject and plain-text sections. Do not forward real submissions to test systems.
4. In GA4 DebugView, confirm one `diagnostic_submit` event with only `source_page`. Confirm no name, email, business, free text, or receipt ID appears. Mark `diagnostic_submit` as a Key Event in GA4 only after this confirmed test.
5. Test a malformed request, oversized body, missing field, repeated request, and provider failure in a controlled environment. Confirm generic errors, no success state, no `diagnostic_submit`, and preserved form answers.

## Recovery

If Resend returns an error or times out, the endpoint returns a failure response, the UI keeps the answers and offers retry plus the grow@rsggrowth.com fallback, and analytics does not fire `diagnostic_submit`. Inspect Resend delivery logs and Cloudflare Pages Function logs without logging request bodies. Rotate `RESEND_API_KEY` in Resend and Cloudflare if exposed, then redeploy. Do not manually replay a lead unless RSG confirms it was not delivered; V1 has no durable idempotency record.
