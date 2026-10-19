# AARYX AI V1.1 Release Record

Status: staged local implementation. Not pushed, merged, deployed, or production-approved.

## Release branch and baseline

- Branch: `feat/first-fix-lead-funnel`
- V1.1 implementation commit: `57ca916f6e457ff28d0c5557f0607deb1291a6c1`
- V1 baseline: `ba2b72d3373cd84fe89291fe169f900ada60767f`
- Deployment target when approved: existing Vercel project `aaryx-ai-blueprint-landing`, through a GitHub feature branch preview only.

## Included staged work

- Approved Direction 3.6 homepage and First Look funnel.
- Four mapped First-Fix Guides with server-side guide mapping.
- Separate First Look storage, request history, consent history, reporting view, and server delivery implementation.
- Founder replacement image at `assets/tejas-headshot1.jpg`.
- Retained-page V1.1 visual shell, unified navigation/footer, JSON-LD repairs, Blueprint crawlability improvement, and release routing configuration.

## Explicitly not included

- Production deployment or domain changes.
- Supabase migrations, storage uploads, row changes, or data deletion.
- Transactional email configuration or sending to a real recipient.
- Trackt website changes.
- Any V1 URL retirement.

## Required approvals before preview execution

1. Permission to push this feature branch and the local V1 archive refs to GitHub.
2. Permission to apply the approved First Look migration and create the private guide bucket in the existing Supabase project.
3. Resend sender/domain verification and permission to configure preview-only Vercel secrets.
4. Permission to create the V1.1 preview deployment in the existing Vercel project.

See `V1_1_MIGRATION_MATRIX.md`, `SUPABASE_INTEGRATION_STATUS.md`, and `LAUNCH_CHECKLIST.md` in this folder.
