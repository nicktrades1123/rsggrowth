# Cloudflare deployment

Career Strategy/review extension: keep the existing build command and `out` directory. Root `functions/` supplies the existing business endpoint plus career and review APIs. Reviews require D1 binding `RSG_REVIEWS_DB`, migration `migrations/0001_reviews.sql`, and encrypted `RSG_REVIEWS_ADMIN_TOKEN`. Career intake requires `CAREER_SUBMISSIONS_ENABLED=true` and existing Resend credentials. Full exact environment/binding, preview, and operational instructions are in [CAREER_STRATEGY.md](CAREER_STRATEGY.md) and [REVIEWS.md](REVIEWS.md). No dashboard, DNS, or deployment settings are changed automatically.

This site is a Next.js **static export**, deployed through **Cloudflare Pages** Git integration. It needs no SSR adapter or runtime Worker for the current email-preparation flow.

## Pages project settings

- Connect `nicktrades1123/rsggrowth` after reviewing and merging the implementation branch.
- Root directory: repository root.
- Node.js: 22 or 24 (the project was checked with Node 24).
- Package manager: `pnpm@11.19.0`, as pinned in package.json. Enable/install this version through Corepack or the build environment. Commit and use `pnpm-lock.yaml`.
- Build command: `pnpm install --frozen-lockfile && pnpm build`.
- Build output directory: `out`.
- Keep `NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=false` unless the real service in SUBMISSIONS.md is implemented and tested.
- The `_headers` file is copied into `out` and applied by Pages. The policy permits inline Next.js hydration scripts and existing GA4 hosts; this is a static-export compatibility tradeoff, not a nonce-based CSP. No remote fonts are loaded. `/review/` additionally uses no-store, no-referrer and noindex headers; API Functions return their own security headers.
- Custom 404: Next.js exports `out/404.html`; verify an unknown URL returns that page with HTTP 404 in the Pages preview.

Use the branch preview to check navigation, trailing-slash URLs, mobile layouts, the diagnostic email draft/download, and metadata. Canonical URLs and sitemap target https://rsggrowth.com. If the approved canonical host differs, update `src/lib/site.ts` first. Protect or noindex preview deployments using Cloudflare controls as appropriate.

## Launch checklist

1. Verify the supplied original logo on the preview. Add approved social/favicons if available.
2. Review service descriptions, company identity details, Privacy Policy, and Terms. Legal pages are starter copy based on current functionality, not jurisdiction-specific legal approval.
3. Confirm grow@rsggrowth.com is a functioning, monitored inbox. No response-time promises are made.
4. Verify email preparation mode or complete the server submission integration; never activate the flag on its own.
5. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.
6. Verify deployment-specific headers, response codes, and inbox delivery on the Pages preview.

No Cloudflare project, production deployment, DNS records, redirects for production domains, or domain bindings were changed by implementation.

Official references:

- https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://nextjs.org/docs/app/guides/static-exports

