# Private feedback and Client Experiences

## Architecture

Private invitation → static `/review/#token` page → `POST /api/reviews/verify` → short feedback form → `POST /api/reviews/submit` → D1 pending review → authenticated operator moderation → `/api/reviews/public` → ClientExperiences component.

No reviews, ratings, or sample names are seeded in production. An empty/unconfigured public feed renders no testimonial section. Career pages request career reviews; the contractor page requests business / contractor_growth reviews. Every public query checks approval, affirmative consent, and a non-revoked invitation. No rebuild or developer edit is needed after moderation; subsequent page loads fetch current data without caching. Already-open pages retain their current view until reloaded.

## Why D1

The site already uses Cloudflare Pages Functions. D1 adds persistent relational storage, constraints, parameterized SQL, and atomic invitation consumption without a separate CMS or server. Source-controlled SQL defines structure only. No review payload belongs in GitHub, public assets, or localStorage.

The migration is `migrations/0001_reviews.sql`:

- `review_invitations`: UUID ID, SHA-256 token hash, practice/service, creation/expiry, used and revoked timestamps.
- `reviews`: unique invitation relation, rating, original response 1/2, optional outcome, public identity preference and derived name, optional public title/industry, consent and consent-text version, pending/approved/rejected/archived status, created/submitted/approved timestamps.

An INSERT…SELECT checks token, expiration, and unused/non-revoked status at write time. A trigger consumes the invitation within the same SQLite statement; a unique invitation relation prevents competing submissions. The database itself also forbids approved rows without consent. Original text and rating are never editable by the admin API. There is no display-text rewriting feature.

## Token and privacy design

Tokens contain 32 cryptographically random bytes (64 hex characters). Only a SHA-256 hash is retained. The raw token is returned once to the authenticated operator. Links contain no names, emails, or sequential database IDs. The fragment approach fits static export without inventing a dynamic Next route and keeps the token out of server URLs, access logs and HTTP referrers. The form removes the fragment after opening and retains it only in memory. Refreshing requires reopening the original invitation. Do not enable request-body logging or third-party scripts on this flow.

Invitations expire in 1–90 days (default 30), can be revoked, and allow one review. No client account or password is required. Anyone with the link can use it: privately deliver only to the intended client, and revoke/reissue if disclosed. Invitation issuance is an RSG operation, not independent verification of a client's identity or outcome.

Review pages have no Google tag, no custom analytics, no sitemap entry, noindex/noarchive metadata, no-referrer, no-store, and robots exclusions. Public APIs expose only approved presentation fields, never tokens/hashes/invitation IDs or private operational metadata. Optional outcomes are labeled client-reported and never rewritten as RSG-caused results.

Rating starts unset. Publication consent starts unchecked and is optional. Anonymous is the default public identity. The form requests only first name and last initial when chosen; never a full last name, email, phone, or employer. Optional title/industry/outcome are explicitly described as public if consented. Clients can leave private feedback without consent. Original written text may itself contain personal details, so the operator must review it before approval; archive or request a fresh submission if removal is needed.

## Production setup (not performed automatically)

1. Create a Cloudflare D1 database named `rsg-reviews` (and a separate preview database). No DNS, domain, or Email Routing changes are required.
2. Apply `migrations/0001_reviews.sql` to each database using the D1 SQL console, or authenticated Wrangler: `pnpm dlx wrangler d1 execute rsg-reviews --remote --file=migrations/0001_reviews.sql`. Inspect the database before rerunning: the migration is a one-time schema creation, not a destructive reset.
3. In the existing Pages project's Settings → Bindings, add D1 binding **`RSG_REVIEWS_DB`** and select the corresponding database. Configure Preview separately from Production. Do not point tests at the production database.
4. Generate a random admin secret on a trusted machine: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Add it as encrypted server secret **`RSG_REVIEWS_ADMIN_TOKEN`** in Pages. Store securely; never commit it or set `NEXT_PUBLIC_` values. Minimum accepted length is 32 characters. Rotate by replacing the secret, redeploying, and updating the operator shell.
5. Set **`RSG_ALLOWED_ORIGIN`** only when an exact preview origin is needed. Unset defaults allow apex and www production hosts; a preview value restricts the new public POST endpoints to that exact preview origin. Either production host setting permits both production hosts. Generated links use the configured origin, or apex by default. This variable also exists in the original business backend; coordinate preview settings accordingly.
6. Redeploy Pages so the root Functions and binding take effect. Static build command/output remain unchanged. Verify `/review/` headers and that all four API Functions route correctly. No Cloudflare dashboard or resources were changed by this implementation.

Official references: [Pages D1 bindings](https://developers.cloudflare.com/pages/functions/bindings/#d1-databases), [D1 SQL API](https://developers.cloudflare.com/d1/worker-api/d1-database/).

## Secure V1 administration

V1 uses `scripts/reviews-admin.mjs` on the operator's trusted machine. There is no public admin UI. Every operation calls a POST endpoint authenticated with a bearer secret. A constant-work comparison of SHA-256 digests checks the secret. Authentication is enforced before data access. No session cookie or obscurity-only URL is used. No CORS allowance is exposed.

Set `RSG_REVIEWS_ADMIN_TOKEN` in the current shell using your password manager, not a checked-in file. Optionally set **`RSG_ADMIN_ORIGIN`** to the preview origin (CLI-only; default `https://rsggrowth.com`). Never paste the token into a command argument, browser, source file, shared log or screenshot. Clear the shell variable after use. The CLI outputs private operational data; do not run it in public CI or redirect output into public files.

```sh
# Create a link (returned once) and record the invitation ID for revocation.
node scripts/reviews-admin.mjs create career career_positioning 30
node scripts/reviews-admin.mjs create business contractor_growth 30
# Review pending feedback. Pages contain up to 50 rows; pass nextOffset to continue.
node scripts/reviews-admin.mjs list pending
node scripts/reviews-admin.mjs list pending 50
node scripts/reviews-admin.mjs approve REVIEW_UUID
node scripts/reviews-admin.mjs reject REVIEW_UUID
node scripts/reviews-admin.mjs archive REVIEW_UUID
node scripts/reviews-admin.mjs revoke INVITATION_UUID
```

Career services: career_positioning, linkedin, interview_prep, career_search, other. Business services: business_strategy, growth, finance, operations, contractor_growth, other. The API enforces practice/service compatibility. Share the returned private link with the client using your normal private communication; the application sends no invitation email automatically.

Approve only an authentic, accurately classified submission with affirmative consent and suitable public content. Approval cannot change ratings, outcomes, or words. Neutral/negative feedback is not altered. Rejection/archive removes feedback from future public responses. Revocation invalidates an unused link and also hides any associated approved review. Expiry prevents new submissions; it does not withdraw an already submitted review. Consent withdrawal: archive immediately, confirm public removal, then handle the requested deletion. Use D1's authenticated console for deletion of the review followed by its invitation; identify by UUID, never export records into the repo. Set an internal retention schedule before launch and review D1/provider recovery retention.

## Testing and limits

Unit tests execute the actual migration/SQL/trigger against Node SQLite and test lifecycle, publication, classification, consent, authentication, malformed/oversized bodies, and token failure states. Browser tests exercise the actual form using mocked same-origin API responses and blocked external analytics; these do not verify a live Cloudflare binding. Full Pages/D1 preview smoke testing remains mandatory.

Real invitation test: create in preview → open link on phone → select any rating and write fictional feedback → confirm unchecked consent behavior → submit → verify pending list and absence from feed → approve a consenting review → reload matching public page → verify original text, chosen identity and rating → archive → reload and confirm disappearance. Test expiry, revocation, attempted duplicate submission, and unauthorized admin access. Do not use real private client information for QA. Public production pages never receive test fixtures unless the operator explicitly creates/approves them; delete preview test data before using a database for real clients.

Bounded 16 KiB submission parsing, same-origin checks, schema validation, single-use random invitations and bounded per-isolate rate windows provide V1 controls. Per-isolate limits are not a distributed abuse limit; evaluate Cloudflare edge rate limiting/Turnstile if abuse warrants it. No credentials are invented. No email/phone is stored with feedback. Failed/ambiguous submissions retain answers; after a committed write with a lost response, the link is consumed and the operator must check before reissuing. Database availability is required; failures never create fake success. The public feed is limited to 12 most recently approved matching reviews, not sorted by rating. Private moderation lists paginate.

Phase 2: visual admin UI with individual authentication/audit history, invitation search, expanded reporting, featured stories and richer media. V1 supplies all required operator actions securely through the script. No admin UI, uploads, video, CMS, or automatic invitation delivery is included. Production readiness requires a real D1 binding/migration, secret, preview smoke test, access/retention operations and reviewed privacy copy.

