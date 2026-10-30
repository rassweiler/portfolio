# Handoff — update pi-networked-counter post from current repo README

## Goal
Mirror the current `README.md` on `rassweiler/pi-networked-counter` (branch `IR_Sensors`)
into the portfolio post, refresh photos from the repo's `Docs/`, add the house-style
`## Source` link, and record the update via `lastmod`.

## DONE (2026-10-30) — verified, ready to commit
- `index.md` rewritten to mirror the current README section-for-section (structural diff
  vs upstream: zero unexplained hunks; only intended deviations remain — see "Deviations").
- 8 new photos copied from repo `Docs/` into `images/` under repo names:
  `Assembly_001..005.png`, `SensorAssembly_01..03.png` (front gallery = 001-005 + 003;
  sensor trio after "Prepare Sensors"). Old `Assembly_01/02.png` deleted.
  `Connector_Pinout.png` / `Assembly.png` were already byte-identical to the repo — left as-is.
- Frontmatter: `hero: images/Assembly_001.png` (fixes previously broken lowercase `assembly_02.png`
  path), `lastmod: 2026-10-30T10:47:00-04:00` added, original `date` kept.
- `## Source` → `[Github](https://github.com/rassweiler/pi-networked-counter)` added after intro
  (house style, matches krello et al.). `data/en/sections/projects.yaml` already had the repo URL.
- Print Parts: 3 dead `.3mf` links replaced with a single
  `Models/` folder link (upstream `Models/Exports/` deleted; only `.FCStd` remains).
- Verified: `hugo --minify --cleanDestinationDir` passes (253 pages); rendered
  `public/.../index.html` references exactly the 10 existing images, 0 refs to the
  2 deleted ones (strict `(?<!Sensor)Assembly_0[12]\.png` grep = 0).

## Deviations from verbatim README (all decided with user or harmless)
- Code-fence languages added (```bash / ```toml) — post style, renders identical.
- Part-list item `.../Cable-20CM/dp/B07JFRLLQF)` gains a trailing `/` inside the URL (harmless typo fix in source too).
- Two trailing spaces inside code blocks dropped (CUPS purge, sharepoint endpoint).
- Print Parts links replaced (Q4) + one clarifying line with the `Models/` link.
- README's missing `Assembly_006/007/008.png` swapped for real `SensorAssembly_01/02/03.png`
  with intended captions (Q3).
- Headings under `## Device Setup (Pi5+):` stay `-1` level vs the flat README; `Dev Setup`
  moved to the README's position (after intro gallery, before Device Setup) and the
  heading keeps the post's existing `:` style.
- `Insert:` kept upstream casing; long ssh-audit one-liner is byte-identical to upstream.

## Known upstream issues (out of scope, filed-or-not TBD)
- README references `Docs/Assembly_006/007/008.png` which don't exist (the real files are
  `SensorAssembly_01..03.png`).
- README's own relative `./Models/Exports/*.3mf` and `./Docs/...` links: Exports/ is gone
  (404); image links work on GitHub.

## Next exact command (if committing from a fresh session)
```
cd /home/kylerassweiler/Projects/portfolio
git add content/posts/Software/Python/pi-networked-counter issue-pi-networked-counter-handoff.md
git commit -m "Update pi-networked-counter post from current upstream README"
```
