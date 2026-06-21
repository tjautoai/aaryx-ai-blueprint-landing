# AARYX AI Blueprint Landing Page

Conversion-focused static landing page for **one audience**, **one offer**, and **one CTA**.

- Audience: Small business owners and service professionals drowning in manual work
- Offer: Free AI Blueprint Audit
- CTA: Get My AI Blueprint
- Goal: Capture email through a Tally form

## Files

- `index.html`
- `styles.css`
- `assets/aaryxai_logo.jpg`
- `assets/aaryxai_cover.jpg`
- `assets/tejas-headshot.png`

## Design Direction Applied

This redesign follows the real AARYX AI assets, not the older generic navy SaaS look.

- Dominant style family: editorial-tech / boutique operator
- Palette: ink black, white, warm off-white, graphite neutrals, electric blue accent
- Hero posture: dark, high-contrast, premium, restrained
- Body posture: bright, spacious, trust-heavy
- Typography: clean sans, strong hierarchy, generous spacing
- Logo: real image in the header
- Cover image: real hero visual
- Founder image: wired to the provided file in the founder section

## Local Preview

From this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Placeholder Replacements Required Before Launch

1. Replace the final CTA URL in `index.html`:
   - Current placeholder: `https://tally.so/r/REPLACE-ME`
2. Add an approved Open Graph image if you want a custom social preview beyond the current cover asset.
3. Add real case study and testimonial proof when available.
4. Swap the temporary Vercel alias for `https://aaryxai.com/` once the custom domain is connected and live.
5. Replace `assets/tejas-headshot.png` with the final founder headshot export if needed. The current provided source file is a fully transparent PNG payload, so it is wired into the page but does not render visible photo content.

## Notes on Assets

- `aaryxai_logo.jpg` is the actual header logo used on-page.
- `aaryxai_cover.jpg` is the actual hero visual used on-page.
- `tejas-headshot.png` came from the provided `~/AARYX/assets/tejas-headshot.jpg` source file. The source file is actually PNG data and currently fully transparent.

## Suggested Tally Intake Questions

1. What type of business do you run?
2. How many people are on your team?
3. What tasks eat the most time each week?
4. Which tools do you rely on today?
5. How are leads or client follow-ups handled now?
6. What is the biggest operational headache in the business right now?
7. What monthly revenue range best describes the business?

Capture email at the end.
