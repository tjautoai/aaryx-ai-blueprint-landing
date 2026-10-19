# V1.1 Page Migration Matrix

All V1 public URLs are retained. No content is removed or redirected except the legacy `/blueprint.html` alias, which is configured for a permanent redirect to `/blueprint/` in `vercel.json`.

Local QA evidence: `releases/v1.1/qa/retained-page-audit.md` and `LOCAL_QA_REPORT.md`. Every route below passed local automated desktop/mobile checks for HTTP response, title, meta description, canonical, one H1, GTM presence, JSON-LD parsing, internal links, image loading, page errors, and horizontal overflow. Preview and production checks remain intentionally pending.

| URL | V1.1 treatment | SEO / dependency | QA status |
|---|---|---|---|
| `/` | Approved Direction 3.6 homepage and First Look funnel | Canonical root, Organization schema, GTM events, booking CTA | Local PASS. Preview pending. |
| `/blueprint/` | Retained diagnostic mini-app with V1.1 shell and static explanatory H1 | Canonical, Blueprint API, GTM, Blueprint contract unchanged | Local PASS. Preview pending. |
| `/blueprint.html` | Permanent redirect to `/blueprint/` configured | Legacy alias excluded from sitemap | Local redirect behavior PASS. Vercel 308 verification pending. |
| `/about.html` | Retained / restyled Direction 3.6 shell | Founder entity schema, OG image points to new founder JPG | Local PASS. Preview pending. |
| `/how-aaryx-works.html` | Retained / restyled | Commercial explanatory intent | Local PASS. Preview pending. |
| `/proof.html` | Retained / restyled | Trust and proof intent | Local PASS. Preview pending. |
| `/resources.html` | Retained / restyled | Internal-link resource hub, GTM | Local PASS. Preview pending. |
| `/privacy.html` | Retained / restyled with corrected reading contrast | Legal meaning retained, First Look disclosure | Local PASS. Legal review pending. |
| `/terms.html` | Retained / restyled with corrected reading contrast | Legal route and footer dependency | Local PASS. Legal review pending. |
| `/ai-consulting-services.html` | Retained / First Look conversion path | Service intent, canonical, valid schema | Local PASS. Preview pending. |
| `/ai-automation-services.html` | Retained / First Look conversion path | Service intent, canonical, valid schema | Local PASS. Preview pending. |
| `/workflow-automation-services.html` | Retained / First Look conversion path | Service intent, canonical, valid schema | Local PASS. Preview pending. |
| `/ai-implementation-services.html` | Retained / First Look conversion path | Service intent, canonical, valid schema | Local PASS. Preview pending. |
| `/ai-agent-development-services.html` | Retained / First Look conversion path | Service intent, canonical, valid schema | Local PASS. Preview pending. |
| `/pittsburgh-ai-consultant.html` | Retained / First Look conversion path | Pittsburgh local-query intent, schema | Local PASS. Preview pending. |
| `/pittsburgh-ai-automation-services.html` | Retained / First Look conversion path | Pittsburgh local-query intent, schema | Local PASS. Preview pending. |
| `/pittsburgh-workflow-automation-company.html` | Retained / First Look conversion path | Pittsburgh local-query intent, schema | Local PASS. Preview pending. |
| `/pittsburgh-ai-implementation-services.html` | Retained / First Look conversion path | Pittsburgh local-query intent, schema | Local PASS. Preview pending. |
| `/ai-automation-for-mortgage-brokers.html` | Retained / First Look conversion path | Industry intent, schema | Local PASS. Preview pending. |
| `/ai-automation-for-insurance-agencies.html` | Retained / First Look conversion path | Industry intent, schema | Local PASS. Preview pending. |
| `/ai-automation-for-recruiters.html` | Retained / First Look conversion path | Industry intent, schema | Local PASS. Preview pending. |
| `/ai-automation-for-consultants.html` | Retained / First Look conversion path | Industry intent, schema | Local PASS. Preview pending. |
| `/ai-automation-for-accountants.html` | Retained / First Look conversion path | Industry intent, schema | Local PASS. Preview pending. |
| `/ai-automation-for-law-firms.html` | Retained / First Look conversion path | Industry intent, schema | Local PASS. Preview pending. |

Common V1.1 treatment for retained root pages: shared Direction 3.6 shell, readable legal presentation, responsive navigation, First Look as the primary service conversion path, Blueprint preserved as the deeper diagnostic, preserved canonical URL/content intent, direct Trackt separation, and retained footer/legal links.
