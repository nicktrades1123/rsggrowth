# Verification and implementation handoff

## Delivered

- Next.js App Router, TypeScript, Tailwind CSS, and Zod; statically exported for Cloudflare Pages.
- Home, What We Do, Who We Serve, About RSG, Business Diagnostic, Contact, Privacy Policy, Terms, and custom 404.
- Reusable navigation, footer, introductory sections, capability content, and diagnostic CTA components.
- Original owner-supplied transparent logo in the header/footer. The PNG is byte-for-byte identical to the supplied file; its intrinsic size is 1774 × 887. No cropping, recoloring, or reconstruction was performed.
- Navy/cream/gold editorial design; responsive layouts, skip link, semantic landmarks, focus indicators, reduced-motion support, and a mobile navigation disclosure.
- Four-step diagnostic with shared validation, progress, linked error summaries, back navigation, review/consent, email preparation, downloadable answers, and confirmation that does not claim unsent inquiries were delivered.
- Per-page titles/descriptions/canonical URLs, Open Graph metadata, robots.txt, and sitemap.xml.
- Cloudflare security headers, pinned dependency lockfile, CI workflow, browser tests, and deployment/submission documentation.

## Checks completed

| Check | Result |
| --- | --- |
| ESLint with zero-warning policy | Passed |
| Next.js route type generation and TypeScript noEmit | Passed |
| Production static build | Passed; all pages prerendered |
| Validation and submission-contract tests | 7 passed |
| Desktop/mobile browser suite | 8 passed |
| Additional 320px layout regression check | 2 passed (desktop/mobile projects) |
| Axe WCAG A/AA scans on all eight pages and diagnostic review | No violations detected in tested states |
| Logo SHA-256 comparison | Exact match |

The browser suite checks page status, metadata, horizontal overflow, errors, keyboard skip/menu behavior, custom 404 recovery, diagnostic validation, focus, back navigation, consent, email link, download, no unexpected POST, and no local/session storage. Mobile tests use Chromium with an iPhone-sized viewport; they are not physical-device Safari testing. Accessibility automation does not replace a full assistive-technology audit.

Visual screenshots were inspected at desktop and mobile sizes. A validation focus issue and a 320px framework overflow were fixed during verification. The test selector was scoped to the form to avoid confusing Next.js’s separate route-announcer alert with the diagnostic alert.

## Commands

Normal project commands:

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm preview
```

On the supplied Windows runtime, checks were invoked directly with the bundled Node executable because Node/Git were not on PATH:

```sh
node node_modules/eslint/bin/eslint.js . --max-warnings=0
node node_modules/next/dist/bin/next typegen
node node_modules/typescript/bin/tsc --noEmit
node --experimental-strip-types --test tests/diagnostic.test.ts tests/transport.test.ts
node node_modules/next/dist/bin/next build
node node_modules/@playwright/test/cli.js install chromium
node node_modules/@playwright/test/cli.js test
node node_modules/@playwright/test/cli.js test --grep "narrow 320px"
node node_modules/prettier/bin/prettier.cjs --write src tests docs
```

Node 24.19.0 and pnpm 11.19.0 were used. Playwright browsers were installed into the task workspace with `PLAYWRIGHT_BROWSERS_PATH`, avoiding writes to the user's global browser cache. The original tsx test launcher encountered a restricted Windows user-info lookup; it was removed in favor of Node's native TypeScript stripping. Tests now require Node 22.18+.

## Key files

- `src/app/page.tsx`: home page.
- `src/app/{what-we-do,who-we-serve,about,business-diagnostic,contact,privacy,terms}/page.tsx`: requested pages.
- `src/app/{layout.tsx,globals.css,not-found.tsx,robots.ts,sitemap.ts}`: site shell, design system, recovery, SEO.
- `src/components/{header,footer,ui}.tsx`: reusable site components.
- `src/components/diagnostic-form.tsx`: client form flow and accessible interactions.
- `src/lib/diagnostic.ts`: Zod validation, summary generation, opt-in server transport contract.
- `src/lib/site.ts`: public business identity, capability content, navigation, metadata helper.
- `public/brand/rsg-logo.png`: unchanged supplied asset.
- `public/_headers`: Cloudflare response security headers.
- `tests/diagnostic.test.ts`, `tests/transport.test.ts`, `tests/browser/site.spec.ts`: regression checks.
- `.github/workflows/ci.yml`: checks for pull requests and main pushes.
- `docs/CLOUDFLARE.md`, `docs/SUBMISSIONS.md`: deployment and server integration instructions.

## Remaining configuration

1. GitHub write access has been restored. The implementation is prepared for the codex/rsg-website review branch. Review and merge the pull request before connecting the production branch to Cloudflare. The source ZIP includes the implementation and unchanged logo, excluding generated dependencies/build output.
2. Set up Cloudflare Pages Git integration with the repository, Node 22.18+ or 24, pnpm 11.19.0, repository root, build command `pnpm install --frozen-lockfile && pnpm build`, and output directory `out`. Use the static Next.js export preset, not an SSR adapter.
3. Keep `NEXT_PUBLIC_DIAGNOSTIC_SUBMISSION_ENABLED=false` for the working email-preparation flow. Direct submission requires a real, secured same-origin handler and a verified delivery provider. See SUBMISSIONS.md; no backend or email credentials were invented.
4. Confirm the public inbox is monitored and review service descriptions and legal copy against the actual business identity, jurisdiction, providers, and retention practices. Optional approved favicon/social artwork can be added later.
5. Verify Cloudflare preview response headers, unknown-URL HTTP 404 behavior, and any configured delivery path before production launch.

No production deployment, DNS changes, or production-domain configuration changes were made.

## Architectural hero update

Replaced the homepage framework panel with a full-width architectural photograph taken from the owner-supplied Spanish flyer. Desktop and mobile use separate wide/portrait WebP assets (about 49 KB combined), with navy overlays, cream type, gold accents, and decorative empty alt text. The four capabilities remain in the hero baseline and detailed section below. Logo, contact details, and diagnostic behavior are unchanged. Production build and lint passed; homepage accessibility scans and overflow checks passed at 1440px, 390px, and 320px. Source and provenance are documented in public/images/README.md.
