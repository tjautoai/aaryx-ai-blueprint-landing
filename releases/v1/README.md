# AARYX AI V1 Archive

Release designation: V1
Archive state: local-only. No production deployment, DNS, Vercel configuration, Git remote, or database state was changed while preparing this record.

## Verified production baseline

- Production domain: https://www.aaryxai.com
- Vercel project: `aaryx-ai-blueprint-landing` / `prj_PhQZUCYSLiV3rw7PfMywdIisbOVN`
- Vercel production deployment: `dpl_9XG6pzRND7jk6y4xDEfSZQoeF8oE`
- Deployment URL: `https://aaryx-ai-blueprint-landing-iofjv0f99-tjautoais-projects.vercel.app`
- Created: August 17, 2026 at 16:11:27 EDT
- Production aliases: `https://www.aaryxai.com`, `https://aaryxai.com`
- Git baseline: `ba2b72d3373cd84fe89291fe169f900ada60767f` (`main`, August 17, 2026)
- Verification date: October 12, 2026

The production deployment aliases the `git-main` deployment. Vercel CLI metadata does not expose an immutable source SHA in the inspected response, so Git/Vercel equivalence is recorded as deployment provenance plus the main-branch baseline, not overstated as a cryptographic deployment-to-commit proof.

## Local preservation refs

- Annotated tag: `v1.0.0-production-2026-08-17`
- Archive branch: `archive/v1-production-2026-08-17`

These refs are deliberately local until a separate approval authorizes pushing archival refs to GitHub.

## Rollback procedure

1. Stop the V1.1 release process. Do not delete First Look records or private guide objects.
2. In Vercel, promote the verified V1 deployment `dpl_9XG6pzRND7jk6y4xDEfSZQoeF8oE` or redeploy the preserved baseline ref after human approval.
3. Confirm `www.aaryxai.com` and `aaryxai.com` resolve to the restored deployment.
4. Verify homepage, `/blueprint/`, Privacy, Terms, and the existing Blueprint submission route.
5. Keep V1.1-only Vercel environment variables disabled or remove them from the affected environment to stop First Look delivery. Do not delete audit history.
6. Record the rollback time, deployment ID, reason, and verification result in the release record.

## V1 scope retained

V1 assets, route inventory, legal routes, Blueprint table/endpoint contract, GTM container `GTM-5SFGV55W`, and production project/domain configuration remain preserved. V1.1 must not overwrite or retire them without explicit approval.
