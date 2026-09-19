# Career Strategy and client feedback extension

Base: main at ec8627b65f4424068b351ce8222498e48c07efa6 (includes PR #7).

Inspection: Next.js App Router static export, shared PageIntro/ButtonLink/Eyebrow/TeamProfile, responsive editorial grids, client-side four-step Business Diagnostic, shared Zod validation, Pages Function + Resend, fixed GA4 metadata events, static sitemap, and unit/Playwright checks. There is no datastore, upload service, admin authentication, Wrangler configuration, or review system. Business submission remains controlled by its existing build flag.

1. Add careers landing and a separate accessible Career Diagnostic, using existing components and styles. Add contextual header CTA and lightweight practice footer links. Preserve business pages and questionnaire.
2. Add a Pages Function for Career submissions using the existing Resend provider/secret conventions, bounded JSON parsing, server validation, provider idempotency, and confirmed receipts. No file uploads, published prices, or invented evidence.
3. Add a D1 migration and authenticated command-line operations for review invitations and moderation. Store only token hashes; use a private /review/#token link so tokens never enter HTTP URLs or referrers. Reviews start pending; consent and approval are both required for publication. No analytics on review pages.
4. Add reusable filtered Client Experiences rendering using a same-origin API, with no placeholder or empty testimonial section. Integrate careers and contractor pages.
5. Add career-only GA4 events, SEO, privacy disclosures, detailed setup/operations documentation, and security/regression/browser tests. Run the full suite and open a PR. Infrastructure creation, secrets, email verification, and production smoke tests remain explicit operator steps.

D1 is the smallest fit because the project already uses Cloudflare Pages Functions and reviews need atomic one-use invitations, relational moderation state, and filtered publication. No external CMS or new production package is needed. A visual admin dashboard is deferred; authenticated scripts cover all V1 operations.

