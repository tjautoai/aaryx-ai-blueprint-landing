# V1.1 Controlled Resend Delivery Test Plan

Status: prepared only. No external email may be sent until Tejas explicitly approves the controlled test run.

## Preconditions

1. Post-migration read-only verification returns the required First Look relations, RLS enabled, no effective `anon` or `authenticated` access, service-role-only reporting access, and private PDF-only bucket metadata.
2. The four objects match `FIRST_LOOK_GUIDE_UPLOAD_MANIFEST.md` by exact bucket path and SHA-256.
3. Resend is confirmed on the Free plan with no paid subscription or transactional overage billing enabled.
4. A domain-restricted Resend `sending_access` API key is created and stored only in Vercel Preview.
5. All eight First Look Preview variables are present. `FIRST_FIX_ALLOWED_ORIGINS` contains only the Ready Preview origin and expressly approved local origins.
6. A Tejas-controlled test inbox is named before sending. Production remains untouched.

## Four acceptance tests

Use a new UUID per row. Send to the same approved internal inbox. Use `sourcePath` `/` and unchecked marketing consent unless the consent-specific test below is running.

| Test | `problemKey` / `guideId` | Expected bucket object | Expected attachment filename | Required evidence |
| --- | --- | --- | --- | --- |
| 1 | `handoff` / `01-handoff` | `first-fix/01-the-handoff-fix-guide.pdf` | `the-handoff-fix-guide.pdf` | HTTP 201; Resend acceptance ID recorded; correct attachment and booking link in inbox; Reply-To is `aaryxaiteam@gmail.com`; report row shows `accepted`. |
| 2 | `waiting` / `02-stalled-work-recovery` | `first-fix/02-the-stalled-work-recovery-guide.pdf` | `the-stalled-work-recovery-guide.pdf` | Same acceptance evidence. |
| 3 | `founder` / `03-founder-bottleneck` | `first-fix/03-the-founder-bottleneck-fix-guide.pdf` | `the-founder-bottleneck-fix-guide.pdf` | Same acceptance evidence. |
| 4 | `tools` / `04-disconnected-tools` | `first-fix/04-the-disconnected-tools-fix-guide.pdf` | `the-disconnected-tools-fix-guide.pdf` | Same acceptance evidence. |

## Mandatory non-delivery controls after the four accepted sends

- Repeat one accepted request with the identical UUID. Expect HTTP 200 with `duplicate: true`; no second Resend acceptance ID or email.
- Submit one request with `marketingConsent: true` and a new UUID. Verify the consent event is recorded separately. This is transactional delivery only, not a marketing send.
- Temporarily remove `RESEND_API_KEY` from Preview or use a Preview-only forced provider failure mechanism approved by Tejas. Expect HTTP 502, no success UI, `failed` request status, one incremented attempt, and no inbox email. Restore the original Preview configuration immediately after the test.
- Retry the same failed UUID no more than twice. Confirm the third failed attempt ends at the bounded retry limit and a further retry returns HTTP 409.
- Submit a populated honeypot field. Expect HTTP 400 and no database request/delivery record.

## Final production readiness gates

1. Protected Preview content QA completed through Vercel’s authentication-aware route.
2. All four acceptance tests and all controls above are evidenced.
3. No First Look secret appears in client source, network responses, commits, or Preview logs exposed to browser users.
4. Tejas explicitly approves production promotion. Until then: no merge, no Production variables, no production deployment, no DNS changes.
