---
status: pending
updated: 2026-09-30
---

# Squarespace migration — status and to-do

The old mangrove.org.uk site was on Squarespace. The subscription expired (payment
failed May 2026). We are deciding what content to carry forward to the new site.

## What exists in Drive

Folder: `squarespace_backup` in the Mangrove programme folder.

- `image_urls.txt` — 70 CDN image URLs captured June 2026, with a download script
- `README.md` — full status log of what was and wasn't captured
- `scrape_site.py` — script that fetched page text before expiry

## What is NOT yet recovered

The critical gap: two WordPress-format XML exports were generated on 2026-06-09
but the download failed and the files were never saved. These XMLs contain all
the page text — manifesto, consulting descriptions, testimonials, press, everything.

**To recover:** log into squarespace.com/config → Website → Export → export each
collection as WordPress XML. Even with an expired subscription this is often still
possible for a short window.

Collections to export:
- **12000 Year Almanac** — main content (Manifesto, Motorway Method, Consulting,
  ADHD, HealthStory AI, Workshops & Courses, Soho Theatre, Young Vic, VSO proposals)
- **Press** — press mentions and media

## Pages the old site had

From the scraper URL list:
`/home`, `/about`, `/about-1`, `/terms-of-engagement`, `/canary-diagnostics`,
`/consulting-read-more`, `/hyperthick`, `/clothesline`, `/white-papers`

Some of these map to things we want on the new site. Others may not survive.

## What we probably want to migrate

- Bio / who we are text
- Testimonials from clients
- Advisor quotes
- Consulting / services descriptions (Motorway Method, Canary Diagnostics, etc.)
- Press mentions
- Selected project descriptions (Hyperthick, Clothesline, etc. — need to assess)

## What the DSAR export contains (not Squarespace)

Drive also has `dsar_export_rosie_2026-07-16.zip` — this is a **Claude/Anthropic**
Data Subject Access Request export, not a Squarespace one. Contains: Claude profile,
140 Claude memories, billing, and support history. Not useful for site content.

## Next action

Log into Squarespace and export XMLs before the admin panel closes entirely.
Once we have the XMLs, run a session to review and decide what to bring forward.
