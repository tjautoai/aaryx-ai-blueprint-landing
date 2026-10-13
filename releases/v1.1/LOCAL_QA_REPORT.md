# AARYX AI V1.1 Local QA Report

Date: 2026-10-12
Scope: local release candidate only. No GitHub push, Vercel deployment, production alias, database, storage, provider, DNS, or email action occurred.

## Result

PASS for local code and retained-page validation.

- 24 of 24 URLs in `V1_1_MIGRATION_MATRIX.md` passed automated local desktop and mobile QA.
- The complete machine-readable matrix is `qa/retained-page-audit.json`.
- The rendered matrix is `qa/retained-page-audit.md`.
- The audit checked response, title, description, canonical, one H1, GTM presence, JSON-LD parsing, internal links, images, page errors, desktop overflow, and mobile overflow.

## Corrections verified

- Privacy and Terms now use dark readable body text on the retained warm-paper legal cards.
- The homepage has one mobile Start Here control. A keyboard-focusable skip link now targets the main content.
- Retained page headers use an explicit, real First Look label at mobile. CSS no longer hides the accessible label and replaces it with pseudo-content.
- Primary service, local, and industry conversion paths route to the free First Look. Blueprint remains available as the deeper diagnostic.
- Blueprint now explains the First Look versus Blueprint hierarchy and exposes one H1.
- The First-Fix Review CTA now opens the approved Cal.com business-discovery destination and states that the conversation is not purchase of the paid review.
- A malformed internal Recruiters-page link was repaired.
- The Blueprint submission client now handles a non-JSON persistence response as a controlled error rather than exposing a raw JSON parsing failure.

## Test evidence

```text
npm run test:blueprint-all                         PASS
npm run test:first-look                            PASS
node qa-first-look.mjs                             PASS
node qa-retained-pages.mjs                         PASS, 24/24
EXPECT_SUCCESS=false node blueprint/tests/run-blueprint-browser-qa.mjs  PASS
```

First Look local browser verification confirmed all four mappings, mobile guide-form reachability, no page errors, no mobile horizontal overflow, and the business-discovery URL.

## Remaining release blockers

1. Authenticated, read-only Supabase preflight and recoverable backup evidence.
2. Founder-approved First Look migration and private-PDF upload in the existing AARYX project.
3. A verified zero-additional-cost transactional email solution, sender authentication, reply handling, and founder-controlled inbox-receipt tests.
4. Approved V1.1 branch/tag push and Vercel Preview deployment.
5. Preview-only environment configuration, all four internal delivery tests, analytics/SEO/OG/redirect verification on Vercel, and founder approval before production.

## Explicitly out of scope for this local pass

- Legal review of Privacy and Terms copy.
- Live GA4 event receipt.
- Vercel 308 confirmation for `/blueprint.html`.
- Inbox placement, email acceptance, attachment retrieval, database persistence, rate-limit, retry, and duplicate-request behavior against real configured services.
