# Supabase Integration Status

Status: audited read-only. No database query, migration, storage upload, policy change, or row mutation was performed.

## Existing legacy Blueprint

- Confirmed endpoint: `POST /api/blueprint-submit`
- Confirmed legacy table contract: `public.blueprint_submissions`
- Existing data must remain untouched.
- Exact live row count: unavailable from this environment. No authorized Supabase URL/service-role credential or project reference is present in the worktree. A truthful count requires a founder-authorized service-role/admin read using `COUNT(*)` or REST `Prefer: count=exact`, reported as a number only without retrieving personal data.
- No second Blueprint table, storage bucket, or live submission record can be verified without that authorized read-only connection.

## V1.1 isolated First Look design

Migration file: `supabase/migrations/20261012_first_look_funnel.sql`

- `public.first_look_leads`: normalized lead identity, first name, work email, current consent state.
- `public.first_look_consent_events`: append-only marketing consent history.
- `public.first_look_guide_requests`: append-only guide request/delivery history, idempotency UUID, request-IP hash, delivery status and bounded attempt count.
- `public.first_look_lead_request_report`: founder reporting view.
- `aaryx-private-guides`: private PDF-only storage bucket with 10 MiB object limit.
- Four required object paths are server-derived only. The browser cannot supply a filename or storage URL.

## Delivery and abuse controls implemented in code

- `POST /api/first-look-submit` accepts only approved problem key to guide mappings.
- Supabase service role, Resend key, rate-limit salt, and source address are server-side variables only.
- Records are created before delivery. A request UUID prevents accepted-delivery resends.
- Failure path retries are bounded to three attempts.
- Honeypot, body-size, origin, and rate-limit checks are included in endpoint tests.
- Marketing consent is optional and unchecked by default. Transactional guide delivery does not imply promotional consent.
- GTM/GA4 event payloads use guide and problem identifiers only. No name or email is placed in browser analytics events.

## Required pre-preview configuration

1. Founder-authorized, read-only Supabase audit of `public.blueprint_submissions` and related Blueprint storage/tables.
2. Explicit approval to apply the First Look migration in the existing AARYX project.
3. Upload the four reviewed PDFs to the private bucket at the exact documented paths.
4. Verify Resend and the `aaryxaiteam@gmail.com` sender/domain.
5. Configure `.env.first-look.example` values only in the Vercel Preview environment.
6. Run controlled test submissions using a founder-owned test inbox. Verify reporting, private-object delivery, acceptance ID, duplicate UUID handling, forced delivery failure, and consent history.

No destructive SQL is proposed. Legacy Blueprint functionality remains separate and intact.
