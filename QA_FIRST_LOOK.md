# AARYX First Look Funnel. Functional and Visual QA

Date: 2026-10-12
Environment: local Vercel development server only. No production deploy, live database write, or live prospect email was performed.

## Automated functional evidence

- Existing Blueprint flow: `npm run test:blueprint-all` passed.
- Existing Blueprint server submission behavior: passed.
- First Look validation and email-template tests: passed.
- First Look endpoint safety tests: passed.
- `git diff --check`: passed.
- Browser automation confirmed all mappings:
  - `handoff` → The Handoff Fix Guide
  - `waiting` → The Stalled Work Recovery Guide
  - `founder` → The Founder Bottleneck Fix Guide
  - `tools` → The Disconnected Tools Fix Guide
- Native required/name/email validation was verified.
- Unconfigured delivery request returned `503` with `Guide delivery is not configured yet. Please try again later.` The success state was not displayed.
- Cal.com button resolves to `https://cal.com/tejasdesai/business-discovery`.
- Browser page-error capture: none.

## Responsive / accessibility evidence

- 1440×900: homepage, immediate First Look result, guide offer, and failure state rendered.
- 1366×768: guide panel is explicitly scrollable. Playwright focused `#guide-submit`; the control was visible and keyboard-reachable.
- 390×844: guide panel is explicitly scrollable. Playwright focused `#guide-submit`; the control was visible and keyboard-reachable. No horizontal overflow was detected.
- Escape closes open overlays. Modal close control receives focus when an overlay opens.

## Independent Creative Critic

Initial independent review found one conversion-critical issue: at constrained viewport heights, the guide modal could leave form controls below the visible viewport without a proven reachability path.

Correction applied:

- `.panel` now has a bounded dynamic viewport height, internal vertical scrolling, and overscroll containment.
- The close control remains available while the panel scrolls.
- Automated post-fix browser verification confirms both desktop and mobile submit controls are reachable by keyboard and visible after focus.
- Visual inspection of the corrected 1366×768 and 390×844 renders found no clipping, overlap, or horizontal-overflow defect.

## Screenshots

Stored in `qa-renders/`:

- `01-home-1440x900.png`
- `02-immediate-result-1440x900.png`
- `03-guide-offer-handoff-1440x900.png`
- `04-delivery-unconfigured-1440x900.png`
- `05-guide-form-reachable-founder-1366x768.png`
- `06-guide-form-reachable-tools-390x844.png`

Older pre-fix comparison renders remain in the folder and are not release evidence.

## Remaining verification blockers

End-to-end database persistence, private-PDF retrieval, transactional-provider acceptance, and actual inbox receipt cannot be truthfully marked complete until the authorized Supabase migration/storage and a verified transactional sender are configured in an isolated preview environment. The local API accurately refuses delivery while that configuration is absent.
