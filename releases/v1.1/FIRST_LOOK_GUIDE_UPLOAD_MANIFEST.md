# V1.1 First Look Guide Upload Manifest

Status: founder-reported upload complete. Four PDFs were manually uploaded after the 9/9 security gate passed. Exact object metadata and hashes remain independently unverified in this runtime. Use `supabase/UPLOADED_GUIDES_READ_ONLY_VERIFICATION.sql` for names/count/metadata; verify hashes only after authorized download.

Target bucket: `aaryx-private-guides`
Target content type for every upload: `application/pdf`
Maximum permitted object size: 10 MiB / 10,485,760 bytes

| Problem key | Canonical local source PDF | Required bucket object path | Bytes | SHA-256 | File checks |
| --- | --- | --- | ---: | --- | --- |
| `handoff` | `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_01_The_Handoff_Fix_Guide.pdf` | `first-fix/01-the-handoff-fix-guide.pdf` | 273,935 | `39c87c90b185873eff29e601b2ecc3c6fe370cbca89cf83fa82687381da3a229` | PDF header. 7 page markers. Booking URL and AARYX AI author marker present. |
| `waiting` | `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_02_The_Stalled_Work_Recovery_Guide.pdf` | `first-fix/02-the-stalled-work-recovery-guide.pdf` | 272,914 | `cb52766203d5089cba31c4bbd84aabc7144012f8e435c03608584fc0b6b43477` | PDF header. 7 page markers. Booking URL and AARYX AI author marker present. |
| `founder` | `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_03_The_Founder_Bottleneck_Fix_Guide.pdf` | `first-fix/03-the-founder-bottleneck-fix-guide.pdf` | 279,336 | `7fae7d3b330293e41bc602bf315730d65549168c1cbc699fdc0aa6312d057d39` | PDF header. 7 page markers. Booking URL and AARYX AI author marker present. |
| `tools` | `/home/leiat/AARYX/workspace/aaryx_first_fix_guides_2026_10_12/final/AARYX_First-Fix_Guide_04_The_Disconnected_Tools_Fix_Guide.pdf` | `first-fix/04-the-disconnected-tools-fix-guide.pdf` | 284,207 | `49516925fae15ce310c0b9a3b01b4970a78033e94f03d93212f7615e7af66995` | PDF header. 7 page markers. Booking URL and AARYX AI author marker present. |

All four files are below the bucket limit. The source filenames are archival source names only. Upload each file under the exact required bucket object path above, not under its local filename.
