# AARYX AI V1.1 Resend and Preview Configuration

Status: prepared locally on 2026-10-13. No Resend domain, DNS record, API key, Vercel variable, email, production deployment, or paid subscription has been created or changed by this release work.

## Chosen connection model

- Use one standard Composio `resend` connection for AARYX operational read/configuration work.
- Do not add the duplicate `resend_mcp` connection. The site itself does not use Composio or MCP at runtime.
- The Vercel serverless function calls Resend's HTTPS Email API directly with a server-side `RESEND_API_KEY`.

## Intended email identities

- From: `AARYX AI <guides@aaryxai.com>`
- Reply-To: `aaryxaiteam@gmail.com`
- Sender domain: `aaryxai.com`

The Reply-To destination is intentionally a Gmail inbox. No paid mailbox, MX change, GoDaddy email product, or new Gmail account is required for the transactional sending path.

## Required Vercel Preview variables only

Add these only to the existing `aaryx-ai-blueprint-landing` Vercel project and only to Preview after the approved Supabase and Resend actions are complete. Do not add any of them to Production during this phase.

| Variable | Value / source |
| --- | --- |
| `AARYX_FIRST_LOOK_SUPABASE_URL` | Existing authorized AARYX Supabase project URL |
| `AARYX_FIRST_LOOK_SUPABASE_SERVICE_ROLE_KEY` | Existing authorized AARYX Supabase server-side secret |
| `FIRST_FIX_GUIDES_BUCKET` | `aaryx-private-guides` |
| `RESEND_API_KEY` | New Resend sending-only key, restricted to the verified AARYX sending domain |
| `FIRST_FIX_EMAIL_FROM` | `AARYX AI <guides@aaryxai.com>` |
| `FIRST_FIX_EMAIL_REPLY_TO` | `aaryxaiteam@gmail.com` |
| `FIRST_FIX_RATE_LIMIT_SALT` | New high-entropy server-side random secret |
| `FIRST_FIX_ALLOWED_ORIGINS` | The exact Preview URL plus approved local origins. Do not use a wildcard. |

Never prefix these values with `VITE_`, `NEXT_PUBLIC_`, or expose them in browser code.

## DNS preparation and safety boundary

Public DNS presently shows GoDaddy nameservers, a root Google Search Console TXT record, and an existing DMARC record. No MX, root SPF, or Resend DKIM record was observed in the read-only inspection.

Do not replace the existing Google verification TXT or DMARC record. Do not add an MX record for this sending-only configuration. Resend must supply the final hostnames and values after `aaryxai.com` is created in the authenticated Resend account. Those records are the only authoritative source for the final SPF and DKIM values.

No GoDaddy Composio connection is presently available. Do not mutate DNS without explicit founder approval.

## Exact Resend DNS records prepared on 2026-10-13

Resend domain ID: `61df7c39-066d-431c-b881-0bbbac3d9b69` / region `us-east-1` / status `verified` as of 2026-10-13. Sending is enabled and receiving remains disabled. All four provider records were independently resolved through Google and Cloudflare recursive DNS and then marked `verified` by Resend.

Add only these four records in the `aaryxai.com` GoDaddy DNS zone. Leave the existing Google verification TXT and DMARC TXT records untouched.

| Type | Host / Name in GoDaddy | Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwtc2SMFjZLWsAuZHu1Txin4c+0fUJXiCc2oB4QGU8lNt2blA1HnmJuxwcckOgl83wpfUFMSVg7BA20fxgYgCRgUiNci4NCT+vzFLpT+ojmhJ2lzAzrgCI2KEME1KZg0yGQoidYVm3hBFS3TSn0ZERPm+OGm8V6qFdICUVKLG+pQIDAQAB` | — | Auto / default |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` | `10` | Auto / default |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | — | Auto / default |
| CNAME | `rsend` | `send.forge.rmta.net` | — | Auto / default |

Read-only conflict check immediately before this record set was prepared found none of these four hosts already present. Resend reports sending enabled and receiving disabled. The `send` MX is provider-required feedback routing for the sending subdomain, not a request to replace the root domain's inbound email routing.

## Key handling and test order

1. Confirm the Resend account is on the Free plan and that a paid subscription and transactional-overage billing are not enabled.
2. Create `aaryxai.com` in Resend, retrieve the exact DNS records, and inspect them against the existing DNS zone.
3. Apply only the founder-approved DNS records.
4. Verify the domain in Resend.
5. Create a domain-restricted `sending_access` API key. Do not copy, print, commit, or place it in chat.
6. Add the variables above to Preview only.
7. Run controlled internal tests for all four guides. Verify the provider acceptance ID, the correct attachment, Reply-To behavior, Supabase audit rows, idempotent retry behavior, failure behavior, consent state, and booking CTA.
8. Hold production deployment until Tejas explicitly approves it.
