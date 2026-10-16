# V1.1 Manual Private-Guide Upload Runbook

Status: founder-reported upload complete. Retained as the immutable source/path/hash record. Do not re-upload, replace, or delete objects without a separate approval. Use `supabase/UPLOADED_GUIDES_READ_ONLY_VERIFICATION.sql` to independently confirm metadata and count.

## Scope lock

- Project: `xiwxprgohdwphgrkyusl`
- Existing bucket only: `aaryx-private-guides`
- Do not create a bucket, alter policies, change bucket settings, rerun the migration, modify Vercel, deploy, or send an email.
- Keep the bucket private. Do not create a public URL or browser object-read policy.

## Dashboard steps

1. In Supabase Dashboard, confirm project `xiwxprgohdwphgrkyusl` is selected.
2. Open Storage, then open the existing `aaryx-private-guides` bucket.
3. Create the folder `first-fix` only if it is absent. Do not change bucket configuration.
4. Upload the four files below into `first-fix`, renaming each object to the exact target filename shown. The completed object paths must match exactly.
5. Preserve `application/pdf` as the content type for every object.
6. After upload, verify exactly four objects under `first-fix/`, with no duplicate source-name uploads and no public links.

| Canonical local file | Exact object path in `aaryx-private-guides` | SHA-256 |
| --- | --- | --- |
| `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_01_The_Handoff_Fix_Guide.pdf` | `first-fix/01-the-handoff-fix-guide.pdf` | `39c87c90b185873eff29e601b2ecc3c6fe370cbca89cf83fa82687381da3a229` |
| `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_02_The_Stalled_Work_Recovery_Guide.pdf` | `first-fix/02-the-stalled-work-recovery-guide.pdf` | `cb52766203d5089cba31c4bbd84aabc7144012f8e435c03608584fc0b6b43477` |
| `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_03_The_Founder_Bottleneck_Fix_Guide.pdf` | `first-fix/03-the-founder-bottleneck-fix-guide.pdf` | `7fae7d3b330293e41bc602bf315730d65549168c1cbc699fdc0aa6312d057d39` |
| `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_04_The_Disconnected_Tools_Fix_Guide.pdf` | `first-fix/04-the-disconnected-tools-fix-guide.pdf` | `49516925fae15ce310c0b9a3b01b4970a78033e94f03d93212f7615e7af66995` |

## Evidence to return

Return a screenshot or copied object list showing the four exact object paths and their sizes. Do not share credentials or a public URL.
