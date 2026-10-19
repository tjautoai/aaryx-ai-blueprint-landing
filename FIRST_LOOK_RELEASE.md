# AARYX First Look Funnel. Release Configuration and Rollback

Status: staged implementation only. Do not deploy or merge without human review.

## Architecture

- Browser: approved Direction 3.6 homepage and First Look. The browser never receives Supabase service-role, Resend, storage, or private PDF credentials.
- API: `POST /api/first-look-submit` validates only the four approved problem keys and guide IDs.
- Storage: PDFs belong only in the private Supabase Storage bucket `aaryx-private-guides` at the exact paths in `api/_lib/first-look.js`.
- Database: migration `supabase/migrations/20261012_first_look_funnel.sql` creates isolated First Look tables and reporting view. Blueprint tables/routes are untouched.
- Delivery: server downloads the selected PDF from private storage and sends it as a Resend attachment from `AARYX AI <guides@aaryxai.com>` after Resend domain verification. Replies route to the existing monitored inbox `aaryxaiteam@gmail.com` through the explicit server-side Reply-To field.

## Required configuration before preview or production testing

1. Review and apply `supabase/migrations/20261012_first_look_funnel.sql` to the authorized AARYX Supabase project.
2. Upload exactly these verified final PDFs to the private bucket. Do not make the bucket public.
   - `first-fix/01-the-handoff-fix-guide.pdf`
   - `first-fix/02-the-stalled-work-recovery-guide.pdf`
   - `first-fix/03-the-founder-bottleneck-fix-guide.pdf`
   - `first-fix/04-the-disconnected-tools-fix-guide.pdf`
3. Verify the `aaryxai.com` Resend domain and sender `AARYX AI <guides@aaryxai.com>`. Configure `FIRST_FIX_EMAIL_REPLY_TO=aaryxaiteam@gmail.com`. Gmail/Composio is intentionally not used by the serverless site because it is an interactive integration, not a durable unattended transactional-email runtime.
4. Set every server-side environment variable from `.env.first-look.example` in the isolated Vercel preview environment only.
5. Confirm the `FIRST_FIX_ALLOWED_ORIGINS` list contains the actual preview URL. Do not add arbitrary origins.
6. Review the proposed First Look privacy disclosure in `privacy.html` before release.

## Delivery behavior

- The lead record and immutable guide-request history are written before delivery.
- The same request UUID is idempotent. Accepted delivery is never resent for that request UUID.
- A failed request can retry at most three times with the same UUID. A fresh browser request uses a new UUID.
- The browser sees success only after Resend returns an acceptance ID. Provider acceptance is not the same as inbox placement or open tracking.
- Marketing consent is optional, unchecked by default, and separately recorded. A guide request without consent receives transactional delivery only.

## Reporting

Use a service-role/admin connection only:

```sql
select * from public.first_look_lead_request_report order by requested_at desc;
```

The view includes every request, so repeated guide requests from the same email remain visible.

## Analytics events

No names or emails are sent to GTM/GA4. The implementation emits only:

- `aaryx_first_look_started`
- `aaryx_first_look_problem_selected` with `problem_key`, `guide_id`
- `aaryx_first_fix_guide_offer_viewed` with `problem_key`, `guide_id`
- `aaryx_first_fix_guide_request_accepted` with `problem_key`, `guide_id`
- `aaryx_first_fix_guide_request_failed` with `problem_key`, `guide_id`
- `aaryx_first_fix_booking_cta` with `problem_key`, `guide_id`

## QA before release approval

- Run `npm run test:blueprint-all` and `npm run test:first-look`.
- Use a controlled test email after Resend is configured. Verify its attached PDF name, title, content, and the Cal.com link.
- Verify one of each problem key in Supabase reporting.
- Test accepted delivery, forced provider failure, retry, duplicate UUID, unchecked consent, checked consent, and honeypot rejection.
- Visually inspect 1440x900, 1366x768, and 390x844 browser renders. Confirm First Look typography remains intact.
- Confirm no `AARYX_FIRST_LOOK_*`, `RESEND_*`, or `FIRST_FIX_*` value appears in browser source, network responses, or committed files.

## Rollback

1. Revert only the First Look branch/deployment. Blueprint routes and tables remain unaffected.
2. Remove First Look Vercel environment variables from the preview/production scope if delivery must stop immediately.
3. Keep database records for audit. Do not delete delivery history as a rollback mechanism.
4. Keep the private storage bucket private. Revoking public-site access does not require deleting guide files.
