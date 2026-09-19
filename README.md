# RSG website

RSG now includes separate Business Advisory and Career Strategy practices. See [Career Strategy](docs/CAREER_STRATEGY.md) for `/careers/`, the Career Diagnostic, provider setup, and event definitions. See [private client reviews](docs/REVIEWS.md) for the D1 migration, secure invitations, operator commands, and consent/moderation-controlled Client Experiences. New server functionality fails closed until configured; no credentials or fake testimonials are included. Existing business behavior remains intact.

Boutique business strategy and advisory website built with Next.js App Router, TypeScript, Tailwind CSS, and Zod. Static pages are exported for Cloudflare Pages. Navigation, the diagnostic, and production-only GA4 measurement use client JavaScript. No remote fonts, stock imagery, or invented proof are included. See [analytics setup and verification](docs/ANALYTICS.md).

## Development

Node 22.18+ and pnpm 11.19.0 are required.

```sh
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

## Verification

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

`pnpm preview` serves `out` at localhost:3000. Run build first. Browser tests automatically start the static server; the test suite uses desktop and mobile Chromium. `pnpm-workspace.yaml` explicitly allows the esbuild and unrs-resolver dependency build scripts.

## Structure

- `src/app/`: Home, What We Do, Who We Serve, About RSG, Business Diagnostic, Contact, Privacy, Terms, custom 404, metadata, robots, sitemap, global design tokens and responsive styles.
- `src/components/`: reusable header/footer, page introductions, calls to action, and the diagnostic state machine.
- `src/lib/site.ts`: public identity, navigation, capabilities, and metadata helper.
- `src/lib/diagnostic.ts`: shared schema, step validation, email summary, optional same-origin transport contract.
- `public/_headers`: Cloudflare security headers.
- `public/brand/`: the original transparent RSG logo supplied by the owner.
- `tests/`: validation, submission contract, browser flow, responsive and accessibility checks.
- `.github/workflows/ci.yml`: reproducible lint/typecheck/test/build and browser checks.

The four diagnostic steps collect contact/business context, stage/priorities, goals, and consent/review. Validation errors have linked summaries and field-level associations. Progress and transitions are announced; keyboard focus moves to the step heading or error summary. Answers stay in component memory only.

## Configuration still required

The original repository contained only a README. The owner subsequently supplied the transparent RSG logo; it is used unmodified in the header and footer. No backend was supplied. Review business/legal copy before launch.

The default diagnostic prepares an email; it does **not** claim delivery. A Cloudflare Pages Function and Resend adapter are prepared for direct submission, but delivery remains disabled until the encrypted production variables and sender verification described in [docs/PRODUCTION-SUBMISSION.md](docs/PRODUCTION-SUBMISSION.md) are completed. Never put provider secrets in browser code.

See [the implementation plan](docs/IMPLEMENTATION-PLAN.md) and [Cloudflare deployment requirements](docs/CLOUDFLARE.md). DNS and production-domain configuration are outside this implementation.

