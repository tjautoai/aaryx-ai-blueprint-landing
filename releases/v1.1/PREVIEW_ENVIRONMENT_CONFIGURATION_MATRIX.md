# V1.1 Preview Environment Configuration Matrix

Status: prepared only. Read-only Vercel audit on 2026-10-13 found only the two legacy Blueprint Supabase variables. None of the eight First Look variables below exists in Preview or Production. Do not write any Production variable.

Canonical Vercel project: `aaryx-ai-blueprint-landing` / `prj_PhQZUCYSLiV3rw7PfMywdIisbOVN`
Preview branch alias to use for controlled tests: `https://aaryx-ai-blueprint-landing-git-feat-f-8c211e-tjautoais-projects.vercel.app`

| Variable | Preview status | Exact expected value / secure source | Scope | Security dependency |
| --- | --- | --- | --- | --- |
| `AARYX_FIRST_LOOK_SUPABASE_URL` | Missing | `https://xiwxprgohdwphgrkyusl.supabase.co` | Preview only | Nonsecret project URL. Do not use a different Supabase project. |
| `AARYX_FIRST_LOOK_SUPABASE_SERVICE_ROLE_KEY` | Missing | Obtain directly from the target Supabase project’s API-key settings. Do not pull or copy the masked Production Vercel value. | Preview only | Secret. Server-side only. Never use a browser-prefixed name. |
| `FIRST_FIX_GUIDES_BUCKET` | Missing | `aaryx-private-guides` | Preview only | Nonsecret. Must remain the existing private bucket. |
| `RESEND_API_KEY` | Missing | New Resend key named `AARYX Vercel Preview First Look`, permission `sending_access`, restricted to `aaryxai.com`. | Preview only | Secret. Separate from the existing full-access Composio key. Enter only in Vercel’s encrypted value field. |
| `FIRST_FIX_EMAIL_FROM` | Missing | `AARYX AI <guides@aaryxai.com>` | Preview only | Nonsecret sender identity. Resend domain is independently verified through its active Composio connection. |
| `FIRST_FIX_EMAIL_REPLY_TO` | Missing | `aaryxaiteam@gmail.com` | Preview only | Nonsecret. Replies must route to this monitored inbox. |
| `FIRST_FIX_RATE_LIMIT_SALT` | Missing | Generate a new high-entropy random value locally and paste it directly into Vercel. Do not put it in chat, a file, or a commit. | Preview only | Secret. Required for request-IP HMAC rate limiting. |
| `FIRST_FIX_ALLOWED_ORIGINS` | Missing | `https://aaryx-ai-blueprint-landing-git-feat-f-8c211e-tjautoais-projects.vercel.app` | Preview only | No wildcard, no Production domain, and no arbitrary deployment URL. Conduct controlled browser tests through this branch alias. |

## Founder dashboard sequence after approval to write Preview configuration

1. In Vercel, open the existing project `aaryx-ai-blueprint-landing`.
2. Open Settings > Environment Variables.
3. Add each variable above with Environment set to Preview only. Leave Production unchecked.
4. Confirm each secret is masked after saving. Do not screenshot or export secret values.
5. Do not deploy yet. A new Preview deployment is separately required after the approved local change set is committed and pushed.
