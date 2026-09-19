# RSG Career Strategy

## Positioning and routes

One RSG brand, two practices: Business Advisory for organizations and Career Strategy for professionals. No prices, employment guarantees, placement claims, or invented evidence are published. The homepage and existing business positioning are preserved.

- `/careers/`: editorial hero, practical credibility, recognizable problems, Listen / Understand / Align / Deliver, four service categories, audiences, existing founder portrait and verified background, optional approved Client Experiences, practice cross-link and final CTA.
- `/careers/diagnostic/`: separate Career Diagnostic. No business questions or generic funnel selector.
- Public pages have canonical, Open Graph, inherited brand social image, and sitemap entries. Private reviews have no sitemap entry.

Shared PageIntro, ButtonLink, Eyebrow, TeamProfile and existing CSS patterns are reused. The header adds Career Strategy and selects a Career Diagnostic CTA within `/careers/`. Business pages retain their business CTA. The footer supplies lightweight practice links. `IntakeField`, `IntakeChoices`, and `IntakeErrors` support the new forms without rewriting the existing Business Diagnostic.

## Diagnostic

Eight steps: Contact; Current position; Goals; Challenges; Prior efforts; Success; Timing; Context & review. Phone, city/state, and additional context are optional. All requested multi-select choices are centralized in `src/lib/career.ts`. No uploads or sensitive demographic questions. A contact-consent checkbox accompanies a full answer review.

Answers stay in React memory, survive Back and failed submissions, and clear on leaving/refreshing. Error summaries focus and link to controls. Progress is announced. A synchronous submit lock plus disabled controls prevents concurrent clicks. The request UUID is preserved on retry and reset when answers change. Confirmation appears only after a validated server receipt.

## Server and notification

`POST /api/career-diagnostic` is a Cloudflare Pages Function. It reuses the existing Resend API and secret names, fixed recipient `grow@rsggrowth.com`, and validated Reply-To. The Business Diagnostic endpoint and behavior are unchanged.

Server controls: POST only, Origin check, JSON content type, streaming 16 KiB body cap, Zod validation, UUID request key, optional honeypot rejection, bounded per-isolate rate window (5 requests/15 minutes), generic failures, no-store responses, and no payload logging. Missing credentials or disabled server gate return 503; no fake success or silent email-draft conversion.

The plain-text notification includes Contact, Current Position, Career Goals, Job Search Challenges, What They Have Tried, 3–6 Month Goal, Timing, Additional Context, and Submission Information. Subject: `New RSG Career Diagnostic — [Candidate Name]`. The Resend `Idempotency-Key` uses `career/<request UUID>`; request contents are deterministic for retry. Provider acceptance must return a nonempty message ID before success. Acceptance is not a guarantee of inbox delivery.

Resend retains idempotency keys for 24 hours; this is provider deduplication, not a permanent local lead ledger. No candidate data is stored in D1. Avoid manually retrying an uncertain old submission without checking delivery. A durable intake ledger, uploads, scheduling, pricing, and additional career services are deferred.

## Exact setup

Keep the existing Pages static export build and `out` directory. The root `functions/` directory is deployed by Pages Git integration. No Next.js SSR adapter is needed.

Server variables/secrets in the Pages environment:

| Name                         | Value / purpose                                                                                                                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CAREER_SUBMISSIONS_ENABLED` | `true` only after preview validation; missing/false fails closed                                                                                                                                         |
| `RESEND_API_KEY`             | Encrypted, sending-only Resend API key; existing provider may be reused                                                                                                                                  |
| `RESEND_FROM_EMAIL`          | Exact sender already verified in Resend                                                                                                                                                                  |
| `RSG_ALLOWED_ORIGIN`         | Optional exact allowed origin for an isolated preview. When unset, both `https://rsggrowth.com` and `https://www.rsggrowth.com` are allowed. When set to a preview URL, only that preview origin is allowed. Either production host setting allows both apex and www. |

No `NEXT_PUBLIC_*` credential or new career build flag is used. The existing business build flag stays unchanged. Both production hosts are accepted when the origin setting is unset or set to either production host. Do not alter domain redirects for this feature.

Email Routing is inbound and is not used to send notifications. Verify a sender in Resend, use its exact address, set the encrypted key, and redeploy. Sender verification may require separately reviewed DNS records; this implementation makes no DNS changes. Production email configuration was not inspected or modified.

## Analytics

Existing measurement ID `G-R5MV45MJJD` and business events are preserved. Career events:

- `career_cta_click`: fixed source_page, cta_location, `/careers/diagnostic/` destination.
- `career_diagnostic_start`: once per mounted form, on first change.
- `career_diagnostic_step`: once per validated destination step (2–8), fixed step name/number.
- `career_diagnostic_submit`: once after confirmed successful response.
- `career_contact_click`: public email link click on a career page, fixed location.

No answers, names, emails, phone numbers, titles, errors or receipt IDs enter event parameters. Review pages load no tag and emit no review events. Localhost, Pages previews, and automated browsers remain suppressed by default.

## Verification and production readiness

Run repository lint, typecheck, unit/server tests, build, and Playwright tests. Tests use fictional fixtures and intercept email/Google destinations. See the consolidated implementation report for actual run results.

Landing page can deploy with the static site. The diagnostic requires the variables above and a real delivery test; code alone does not establish production readiness. To test: deploy a preview with test sender configuration and its exact allowed Origin; enter fictional candidate data, complete eight steps, submit once, confirm receipt state and inbox delivery. Test provider failure and confirm answers survive and no submit event fires. Only after that enable production. In production Tag Assistant, verify one career_diagnostic_submit with no personal data, then optionally mark that exact event as a GA4 key event. Do not change the business conversion definition.

