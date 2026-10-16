# AARYX AI First Look Data-Rights Runbook

Status: Proposed operating procedure. Founder approval required before use.

## Scope and ownership

- Intake mailbox: `aaryxaiteam@gmail.com`.
- Owner and decision-maker: Tejas Desai.
- This runbook covers active First Look records only: `first_look_leads`, `first_look_guide_requests`, and `first_look_consent_events`.
- Historical Blueprint infrastructure and records are preserved legacy infrastructure. Do not alter them under this runbook unless the founder makes a separate, documented decision.
- Hermes may prepare lookup instructions and response drafts. It must not delete records, change consent, revoke consent, or make legal decisions without explicit founder authorization for the identified request.

## Intake and minimal request log

1. Receive the request at `aaryxaiteam@gmail.com`.
2. Record only: request ID, received timestamp, request type, requester email, verification status, owner, status, response date, and any approved exception. Do not copy unnecessary email content or database records into the log.
3. Acknowledge receipt without promising a legal outcome or deletion date. State that AARYX will verify identity and review the request.

## Reasonable identity verification

- For access, correction, deletion, or marketing-consent requests, reply to the work email associated with the First Look request and ask the requester to confirm the request from that mailbox.
- If the requester cannot access that mailbox, pause and escalate to the founder. Request only the minimum additional information needed to match a record. Do not request government ID, passwords, payment information, or unrelated personal data by default.
- Do not disclose whether a record exists until verification is adequate.

## Request procedures

### Access

1. Founder approves the lookup after identity verification.
2. Use a least-access, privileged connection. Locate the lead by normalized work email.
3. Prepare only the requester’s active First Look data: first name, work email, marketing-consent status/history, requested pattern and guide, request/source/timestamps, and delivery status. Do not include secrets, IP-derived hash values, other users’ records, or internal security details.
4. Founder reviews the response before it is sent.

### Correction

1. Verify identity and collect the exact correction requested.
2. Founder decides whether the correction is appropriate and authorizes the specific fields.
3. Update only the approved lead field(s). Preserve guide-request history. Record the operational change in the minimal request log.
4. Do not rewrite consent history. If consent changes, use the consent-withdrawal procedure.

### Marketing-consent withdrawal

1. Verify identity. An unsubscribe request from the associated email is normally sufficient.
2. Founder authorizes the change.
3. Set the current lead-level `marketing_consent` value to `false` and append a new `first_look_consent_events` record with `marketing_consent=false`, source context `privacy-request`, and the current timestamp.
4. Confirm the withdrawal. Transactional messages required for a separately requested guide remain distinct from promotional marketing.

### Deletion

1. Verify identity, identify the scope, and obtain explicit founder authorization before any database action.
2. Use a privileged database session with a transaction. Locate the exact `first_look_leads` record by normalized work email. Review dependent `first_look_guide_requests` and `first_look_consent_events` records first.
3. Because guide requests use `ON DELETE RESTRICT`, deletion must not be attempted as a single parent-row delete. Delete the approved dependent guide-request records first, then the lead record. Consent-history records cascade from the lead deletion; verify the resulting absence before commit.
4. Never delete legacy Blueprint records, private guide files, unrelated leads, or audit evidence as part of this request without separate founder approval.
5. Record completion in the minimal request log. The founder decides whether an exception, legal hold, or retained business record prevents full deletion.

## Safe privileged handling

- Use a service-role/admin connection only when the founder has authorized the exact request.
- Query the narrowest fields and exact normalized email. Do not export tables, run broad reports, paste PII into tickets, or use production secrets in notes.
- Prefer a transaction for corrections, consent changes, and deletion. Read back the exact target after any approved change.
- Do not change database permissions, RLS policies, schema, storage policies, or private-object access while handling a request.

## Proposed response targets

These are proposed service targets, not approved commitments:

- Acknowledge intake: within 3 business days.
- Complete a verified routine access, correction, consent-withdrawal, or deletion request: within 30 calendar days.
- If more time, verification, or a legal decision is needed: send a status update within the initial 30-day window and escalate to the founder.

## Proposed retention schedule

These periods require founder approval before adoption or publication:

| Data category | Proposed retention | Proposed disposition |
| --- | --- | --- |
| First Look lead identity and current marketing-consent status | 24 months after last guide request or meaningful interaction | Delete after approved review, unless a documented exception applies. |
| Guide-request history, selected pattern/guide, source path, timestamps, and delivery status | 24 months after request | Delete with the approved lead deletion workflow. |
| Consent-history events | 24 months after consent withdrawal or last interaction | Delete with the approved lead deletion workflow, unless retained for a documented legal/business reason. |
| IP-derived abuse-prevention hash and rate-limit records | 90 days after request | Delete with the related guide-request record or earlier through an approved retention process. |
| Transactional delivery-provider metadata and errors | 90 days after final delivery outcome | Delete with the related guide-request record or earlier through an approved retention process. |
| Security, legal-hold, or dispute records | Duration required for the documented purpose | Founder/legal decision required before deletion. |
| Preserved legacy Blueprint records | No new schedule in this runbook | Founder decision required separately. |

## Founder decisions still required

1. Approve, revise, or reject the response targets and retention schedule.
2. Decide whether legal review is required before publishing or relying on these procedures.
3. Approve the exact minimal request-log location and access controls.
4. Decide who, if anyone beyond the founder, may execute approved privileged database actions.
5. Define any legal-hold, tax, contract, or dispute-retention exceptions.