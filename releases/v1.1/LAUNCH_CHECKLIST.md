# V1.1 Launch Checklist

## Completed locally

- V1 production deployment and baseline commit identified and documented.
- Local V1 archival tag and branch created.
- V1.1 remains isolated on `feat/first-fix-lead-funnel`. The branch and annotated tag `v1.1.0-rc.2` were pushed previously under explicit founder authorization.
- Existing production Vercel project linkage is canonical locally. The resulting Vercel Preview deployment is `dpl_49WEV5mQdE8acituoxoJH8t8RU4X`, Ready, created October 12, 2026 at 20:10:35 EDT. No production alias or deployment was changed.
- New founder photo confirmed as progressive JPEG, 1536 x 1023, and referenced by the V1.1 homepage and About metadata.
- First Look and Blueprint automated test suites passed after final corrections.
- Founder-reported Supabase migration execution completed successfully in project `xiwxprgohdwphgrkyusl`. Founder reports the post-migration security gate passed 9/9, the three First Look tables and reporting view exist, `aaryx-private-guides` remains private/PDF-only/10 MiB, and exactly four approved PDFs were uploaded under `first-fix/`. The supplied visible legacy result remains `blueprint_submissions_count = 0`. Direct Supabase read access is still unavailable in this runtime, so uploaded object names, metadata, object count, and hashes remain pending independent verification through `supabase/UPLOADED_GUIDES_READ_ONLY_VERIFICATION.sql` plus authorized downloads.
- Full retained-page local QA completed: 24/24 matrix routes passed desktop/mobile automated validation. Evidence: `qa/retained-page-audit.md` and `LOCAL_QA_REPORT.md`.
- Privacy/Terms readability, duplicate mobile Start Here control, mobile header label mismatch, service-page First Look conversion routing, legacy Blueprint retirement, Recruiters internal link, and First-Fix Review booking CTA were corrected locally.
- Legacy Blueprint assessment retirement: public navigation, CTAs, internal links, public marketing copy, and sitemap no longer expose Blueprint. `/blueprint/` and `/blueprint.html` are configured as permanent redirects to `https://www.aaryxai.com/`. Historical code/table/rollback assets remain preserved. Evidence: `BLUEPRINT_RETIREMENT.md`.

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

- Founder reports the 9/9 post-migration security gate passed and four approved PDFs were uploaded to `aaryx-private-guides/first-fix/`.
- Run `supabase/UPLOADED_GUIDES_READ_ONLY_VERIFICATION.sql` to independently verify exact object names, count, storage metadata, and private-bucket settings. Verify SHA-256 only after authorized object download; object names or dashboard screenshots alone are insufficient.
- Verify Resend sender/domain and preview-only environment variables.
- Use controlled internal test address for accepted delivery. Validate correct attachment, request report, idempotent duplicate, retry, provider-failure message, consent state, and booking CTA.

## Production gate

Production remains blocked until Tejas explicitly approves the Supabase migration/storage setup, transactional sender configuration, protected-Preview evidence, four founder-owned inbox tests, and final deployment. Do not merge or deploy from this branch without that approval.
