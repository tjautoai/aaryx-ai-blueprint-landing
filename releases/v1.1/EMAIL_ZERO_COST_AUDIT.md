# AARYX AI V1.1 Email / Zero-Cost Audit

Date: 2026-10-12
Status: no provider, DNS, mailbox, trial, purchase, renewal, or email was created or changed.

## Verified read-only facts

- The existing production Vercel project has only the two legacy Blueprint Supabase environment variables. No First Look Supabase, Resend, sender, or rate-limit variables are configured in Preview or Production.
- Public DNS currently exposes no MX record for `aaryxai.com`, no root SPF TXT record, no visible Resend DKIM record at `resend._domainkey.aaryxai.com`, and no Microsoft 365 selector records at the common selector names checked.
- DMARC exists with `p=quarantine` and aggregate reports directed to `dmarc_rua@onsecureserver.net`.
- The GoDaddy Account and SSO pages returned Access Denied in the authorized browser environment. This prevents a truthful entitlement inspection for existing GoDaddy mailbox, Microsoft 365, forwarding, aliases, and included email options.
- No Resend API key or authenticated Resend account context is available in the worktree or current Vercel environment.

## Consequence

No currently verified configuration can honestly claim to send from or receive replies at `aaryxaiteam@gmail.com` or any `@aaryxai.com` address. Do not configure a sender that implies replies are monitored until a real monitored inbox or forwarding destination is verified.

## Current safe state

- First Look deliberately returns an unconfigured delivery error until all server-only variables are configured.
- No MX records have been changed. Existing delivery cannot have been disrupted by this release work.
- No paid email product, trial, or auto-renewing subscription has been started.

## Conditional Resend fallback

Resend’s current official pricing shows a free-forever tier at $0 per month with 3,000 transactional emails per month, a 100-email daily limit, up to three verified domains, and email authentication features. Its terms state that billing information is not required for the Free Tier. This makes Resend a plausible zero-additional-cost sending option only after an existing or newly authorized account is inspected, a domain or dedicated sending subdomain is verified, pay-as-you-go is left disabled, and replies are routed to a real monitored inbox. The exact account state and sender eligibility are unverified today.

## Required decision gate

Before any account creation, provider setup, DNS mutation, or Vercel environment write:

1. Complete GoDaddy entitlement inspection in an authenticated browser session.
2. If a truly included mailbox/forwarding route exists, document the monitored receiving inbox and test it without changing existing MX.
3. If no included solution exists, inspect an existing Resend account's free-tier eligibility and domain-verification requirements.
4. Present the exact sender identity, DNS records, reply route, Vercel Preview variables, and cost confirmation for founder approval.

The planned smallest technical option remains a verified `aaryxai.com` transactional sender on a free tier, only if it has a real reply route and requires no paid mailbox. This remains an evaluation only, not an approved configuration.
