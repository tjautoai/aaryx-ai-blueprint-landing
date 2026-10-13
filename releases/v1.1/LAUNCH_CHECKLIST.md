# V1.1 Launch Checklist

## Completed locally

- V1 production deployment and baseline commit identified and documented.
- Local V1 archival tag and branch created.
- V1.1 remains isolated on `feat/first-fix-lead-funnel`.
- Existing production Vercel project linkage restored locally. No deployment was made.
- New founder photo confirmed as progressive JPEG, 1536 x 1023, and referenced by the V1.1 homepage and About metadata.
- First Look and Blueprint automated test suites passed after final corrections.
- Full retained-page local QA completed: 24/24 matrix routes passed desktop/mobile automated validation. Evidence: `qa/retained-page-audit.md` and `LOCAL_QA_REPORT.md`.
- Privacy/Terms readability, duplicate mobile Start Here control, mobile header label mismatch, service-page First Look conversion routing, Blueprint hierarchy, Recruiters internal link, and First-Fix Review booking CTA were corrected locally.

## Required preview QA

- `git diff --check` passes.
- All JSON-LD blocks parse as valid JSON.
- All retained pages load with a 200 status, correct canonical, shared shell, logo, and no console errors.
- Desktop screenshots: homepage, service page, About/founder section, Blueprint, Privacy.
- Mobile screenshots: homepage, founder section, Blueprint, service page.
- Accessibility: keyboard header/footer navigation, skip links, First Look modal focus and Escape behavior, visible focus states, no horizontal overflow.
- Analytics: GTM `GTM-5SFGV55W`, GA4 page views, First Look non-PII events, Blueprint event coverage.
- SEO: sitemap and robots reachable, `/blueprint.html` returns permanent redirect, valid JSON-LD, OG image loads.

## Required gated integration QA

- Exact legacy Blueprint count and related-data audit using authorized read-only Supabase credentials.
- Apply First Look migration only after founder approval.
- Create and verify private guide bucket, upload four PDFs, and verify object paths.
- Verify Resend sender/domain and preview-only environment variables.
- Use controlled internal test address for accepted delivery. Validate correct attachment, request report, idempotent duplicate, retry, provider-failure message, consent state, and booking CTA.

## Production gate

Production remains blocked until Tejas explicitly approves the Git push, Vercel preview, Supabase migration/storage setup, transactional sender configuration, preview evidence, and final deployment. Do not merge or deploy from this branch without that approval.
