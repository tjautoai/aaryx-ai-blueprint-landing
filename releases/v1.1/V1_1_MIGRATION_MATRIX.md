# V1.1 Page Migration Matrix

All V1 public URLs are retained. No content is removed or redirected except the legacy `/blueprint.html` alias, which is prepared for a permanent redirect to `/blueprint/` in `vercel.json`.

| URL | V1.1 treatment | SEO / dependency | QA status |
|---|---|---|---|
| `/` | Approved Direction 3.6 homepage and First Look funnel | Canonical root, Organization schema, GTM events, booking CTA | Local browser and automated funnel tests passed. Preview pending. |
| `/blueprint/` | Retained diagnostic mini-app with V1.1 shell and static explanatory H1 | Canonical, Blueprint API, GTM added, Blueprint submission contract unchanged | Blueprint automated tests passed. Preview pending. |
| `/blueprint.html` | Permanent redirect prepared to `/blueprint/` | Legacy alias excluded from sitemap | Local routing config written. Vercel preview verification pending. |
| `/about.html` | Retained / restyled Direction 3.6 shell | Founder entity schema, OG image corrected to new founder JPG | Local image reference checked. Preview pending. |
| `/how-aaryx-works.html` | Retained / restyled | Commercial explanatory intent | Static QA pending preview. |
| `/proof.html` | Retained / restyled | Trust and proof intent | Static QA pending preview. |
| `/resources.html` | Retained / restyled | Internal-link resource hub. GTM added | Static QA pending preview. |
| `/privacy.html` | Retained / restyled. First Look privacy disclosure preserved | Legal meaning retained, First Look data/consent references accurate | Copy reviewed locally. Legal approval still required. |
| `/terms.html` | Retained / restyled | Legal route and footer dependency | Copy preserved. Legal approval still required. |
| `/ai-consulting-services.html` | Retained / restyled | Service intent, canonical and valid schema retained | JSON-LD validation pending final batch QA. |
| `/ai-automation-services.html` | Retained / restyled | Service intent, canonical and valid schema retained | JSON-LD validation pending final batch QA. |
| `/workflow-automation-services.html` | Retained / restyled | Service intent, canonical and valid schema retained | JSON-LD validation pending final batch QA. |
| `/ai-implementation-services.html` | Retained / restyled | Service intent, canonical and valid schema retained | JSON-LD validation pending final batch QA. |
| `/ai-agent-development-services.html` | Retained / restyled | Service intent, canonical and valid schema retained | JSON-LD validation pending final batch QA. |
| `/pittsburgh-ai-consultant.html` | Retained / restyled | Pittsburgh local-query intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/pittsburgh-ai-automation-services.html` | Retained / restyled | Pittsburgh local-query intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/pittsburgh-workflow-automation-company.html` | Retained / restyled | Pittsburgh local-query intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/pittsburgh-ai-implementation-services.html` | Retained / restyled | Pittsburgh local-query intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/ai-automation-for-mortgage-brokers.html` | Retained / restyled | Industry intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/ai-automation-for-insurance-agencies.html` | Retained / restyled | Industry intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/ai-automation-for-recruiters.html` | Retained / restyled | Industry intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/ai-automation-for-consultants.html` | Retained / restyled | Industry intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/ai-automation-for-accountants.html` | Retained / restyled | Industry intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |
| `/ai-automation-for-law-firms.html` | Retained / restyled | Industry intent. Four malformed schema blocks repaired | JSON-LD validation pending final batch QA. |

Common V1.1 treatment for retained root pages: shared Direction 3.6 navigation, footer, typography shell, color tokens, responsive mobile behavior, direct Trackt separation link, Blueprint CTA, and preserved canonical URL/content intent.
