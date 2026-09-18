# Leadership and contractor page extension

## Inspection and plan

The existing static Next.js App Router site uses Georgia headings, Arial body text, navy/cream/gold tokens, shared PageIntro/ButtonLink/DiagnosticCTA components, ruled lists, and responsive split layouts. Header/footer navigation and the four-step diagnostic already meet the requested architecture. The previous content refinement is merged into main. Reuse these components and layouts, update only the homepage audience preview, add founder credibility to About, and add the contractor route with contextual discovery and SEO.

## Scope

- About adds a reusable server-rendered TeamProfile with Dominick Reed's supplied background and portrait. The biography is approximately 125 words, excluding the independence note. No employer logos or endorsement claims.
- The supplied portrait is resized proportionally to 480×720 JPEG (approximately 40 KB), with metadata stripped. No generated or altered likeness.
- Homepage audience descriptions now match the four existing segments.
- New route: /industries/contractors-home-services/ (the site's trailing-slash convention).
- Metadata uses the existing helper for title, description, canonical, and OpenGraph. Service JSON-LD describes only the actual advisory offering; no review, result, location, or rating claims. Existing index/follow policy applies; route added to sitemap.
- Primary navigation and footer stay unchanged. A future Industries dropdown could group multiple industry pages once that makes navigation easier; it is unnecessary for a single page.
- No dependencies, client components, analytics, DNS, email, secrets, or diagnostic submission changes.

## Files

Modified: src/app/about/page.tsx; src/app/page.tsx; src/app/who-we-serve/page.tsx; src/app/sitemap.ts; src/app/globals.css; tests/browser/site.spec.ts.

Created: src/components/team-profile.tsx; src/app/industries/contractors-home-services/page.tsx; public/images/dominick-reed.jpg; tests/browser/industry.spec.ts; docs/INDUSTRY-EXTENSION.md.

## Verification

Run lint, Next route type generation and TypeScript, existing unit tests, production build, and Playwright desktop/mobile suites. Added checks cover industry discovery, internal links, metadata, structured data, sitemap inclusion, and 320px/768px overflow and accessibility. Production field Core Web Vitals require real traffic and are not measured by these checks.

No new configuration is required. Merge the review pull request to deploy through the existing Cloudflare Pages connection. The Business Diagnostic retains its existing email-draft handoff.
