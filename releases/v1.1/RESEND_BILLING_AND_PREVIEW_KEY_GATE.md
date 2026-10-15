# V1.1 Resend Billing and Preview-Key Gate

Status: prepared only. No paid plan, overage billing, API key, Vercel variable, email, or Production setting has been created or changed by this release work.

## Confirm billing before key creation

In the Resend Dashboard, open the Billing / Usage area and confirm all of the following:

1. Active transactional plan is Free / $0 per month.
2. No paid subscription is active.
3. Transactional Overages is OFF.
4. No payment method or pending paid invoice is associated with transactional sending.

Return a screenshot showing plan name, price, and the Transactional Overages state. Do not include account credentials.

## Create the separate Preview-only runtime key only after billing is confirmed

1. In Resend Dashboard, use the API Keys sidebar item.
2. Select Create API Key.
3. Name: `AARYX Vercel Preview First Look`.
4. Permission: `Sending access`.
5. Domain restriction: select `aaryxai.com` if the dashboard presents the domain selector.
6. Create the key. Copy it once only.
7. Immediately open Vercel > `aaryx-ai-blueprint-landing` > Settings > Environment Variables.
8. Add it as `RESEND_API_KEY`, scope Preview only. Leave Production unchecked.
9. Confirm the saved value is masked. Do not paste the raw key in chat, a file, terminal output, commit, or screenshot.

The existing full-access Composio key is operational-only and must never be reused for Vercel runtime delivery.
