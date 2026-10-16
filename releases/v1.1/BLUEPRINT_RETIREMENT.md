# V1.1 Blueprint Retirement

## Decision

The legacy AARYX Blueprint assessment is retired from the public website. First Look at `/#start` is the single public assessment entry point.

## Public-route behavior

- `/blueprint/` and all nested Blueprint route variants permanently redirect to `https://www.aaryxai.com/`.
- `/blueprint.html` permanently redirects to `https://www.aaryxai.com/`.
- The retired route is removed from `sitemap.xml`.
- Public navigation, footer navigation, CTAs, public marketing copy, and internal links no longer direct visitors to Blueprint.

## Preserved for rollback and historical continuity

- `blueprint/` source code remains in the repository.
- `api/blueprint-submit.js` and its supporting submission logic remain in the repository.
- The existing `blueprint_submissions` Supabase table and historical records are not changed.
- Existing V1 rollback tag, archive branch, and Production deployment remain unchanged.

## Verification

- `npm run test:blueprint-retirement` validates redirect configuration, sitemap exclusion, absence of public Blueprint links/copy, First Look homepage entry, and preservation of historical source files.
- `qa-retained-pages.mjs` excludes retired Blueprint URLs from normal retained-page rendering and fails if any active page exposes an internal link to `/blueprint/` or `/blueprint.html`.
- Local regression on October 15, 2026: all 22 active public routes passed desktop/mobile rendering, metadata, asset, link, overflow, page-error, and retired-link checks. Evidence: `/home/leiat/AARYX/workspace/aaryx_v1_1_blueprint_retirement_2026_10_15/qa/retained-page-audit.md`.
- A pushed branch Preview must confirm both permanent redirects before merge consideration.

## Explicitly excluded

- No Production deployment or merge.
- No DNS, Supabase schema/data, storage, or secret changes.
- No First Look functionality, approved D3.6 design, or Trackt change.
