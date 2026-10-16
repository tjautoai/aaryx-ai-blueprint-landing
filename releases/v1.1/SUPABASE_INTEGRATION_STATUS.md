# Supabase Integration Status

Status: mixed verification evidence. The First Look migration was manually executed by Tejas; no AARYX database, storage, policy, or row mutation was performed in this release session.

## Verified founder-reported evidence

- Target project: `xiwxprgohdwphgrkyusl`.
- Post-migration security gate: 9/9 PASS.
- Three First Look tables, the reporting view, and the existing `aaryx-private-guides` bucket exist.
- Bucket configuration is private, PDF-only, with a 10 MiB object limit.
- Exactly four approved PDF objects were manually uploaded beneath `first-fix/`.
- `blueprint_submissions_count = 0` was the supplied visible final result from the read-only verification.

## Results not yet provided as release evidence

- Individual RLS-state rows.
- Effective `anon`, `authenticated`, and `service_role` privilege rows.
- Reporting-view `security_invoker` result.
- First Look and `storage.objects` policy rows / predicates.

Run `supabase/POST_MIGRATION_SECURITY_GATE.sql` for one consolidated PASS/FAIL result set before PDF upload. Successful execution alone is not proof of PASS.

## V1.1 isolated First Look design

Migration file: `supabase/migrations/20261012_first_look_funnel.sql`

- `supabase/READ_ONLY_PREFLIGHT.sql` is the required no-PII preflight for the exact Blueprint count, First Look name collisions, existing target bucket configuration/object count, Blueprint-related bucket inventory, and trigger collisions.
- The migration now leaves an existing `aaryx-private-guides` bucket untouched. A preflight must prove an existing bucket is already private, PDF-only, and owned by this release before any upload.

- `public.first_look_leads`: normalized lead identity, first name, work email, current consent state.
- `public.first_look_consent_events`: append-only marketing consent history.
- `public.first_look_guide_requests`: append-only guide request/delivery history, idempotency UUID, request-IP hash, delivery status and bounded attempt count.
- `public.first_look_lead_request_report`: founder reporting view.
- `aaryx-private-guides`: private PDF-only storage bucket with 10 MiB object limit.
- Four required object paths are server-derived only. The browser cannot supply a filename or storage URL.

## Delivery and abuse controls implemented in code

- `POST /api/first-look-submit` accepts only approved problem key to guide mappings.
- Supabase service role, Resend key, rate-limit salt, source address, and Reply-To address are server-side variables only. The intended sender is `AARYX AI <guides@aaryxai.com>` and Reply-To is the existing inbox `aaryxaiteam@gmail.com`.
- Records are created before delivery. A request UUID prevents accepted-delivery resends.
- Failure path retries are bounded to three attempts.
- Honeypot, body-size, origin, and rate-limit checks are included in endpoint tests.
- Marketing consent is optional and unchecked by default. Transactional guide delivery does not imply promotional consent.
- GTM/GA4 event payloads use guide and problem identifiers only. No name or email is placed in browser analytics events.

## Required pre-preview configuration

1. Run `supabase/POST_MIGRATION_SECURITY_GATE.sql` and retain the PASS/FAIL result set.
2. Upload the four reviewed PDFs to the existing private bucket at the exact documented paths only after every security gate passes.
3. Verify Resend and the `aaryxaiteam@gmail.com` sender/domain.
4. Configure `.env.first-look.example` values only in the Vercel Preview environment.
5. Run controlled test submissions using a founder-owned test inbox. Verify reporting, private-object delivery, acceptance ID, duplicate UUID handling, forced delivery failure, and consent history.

No destructive SQL is proposed. Legacy Blueprint functionality remains separate and intact.
