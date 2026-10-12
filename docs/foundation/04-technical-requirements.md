---
id: foundation-04-technical-requirements
title: Technical requirements
status: placeholder
updated: 2026-10-12
---

# 4 · Technical requirements

**Answers:** what the site is built with and where it runs, so nobody is guessing at tools halfway through.

Each real decision here should become a short ADR (architecture decision record) so the reasoning is kept.

## Current state
- Plain HTML/CSS/JS, no build step, no framework.
- Repo: `MangroveFutures/mangrove-site`.
- Registered in epoch as a projection surface (read model): it shows epoch content, never writes back.
- Domain `mangrove.org.uk` registered with IONOS, not yet pointed anywhere.

## Decisions needed
| Decision | Options on the table | Notes |
|---|---|---|
| Hosting | GitHub Pages / Vercel / Cloudflare Pages | Free Vercel can't deploy from an org repo. Cloudflare has been mentioned as the next thing to try. |
| Stay hand-written HTML or adopt a static site generator | stay plain / Astro / Eleventy | Matters once there are many project pages built from one template. Check existing tools before hand-rolling a templating script. |
| Where content lives | files in this repo / pulled from epoch | Ties to the content schema doc |
| Contact form handling | none / form service / email link | |
| Analytics | none / privacy-friendly option | |

## Constraints
- Changes should be possible by asking an agent — no desktop-only setup or manual dashboard clicking.
- TBD: performance and accessibility targets.

## Stale info to fix
- `CLAUDE.md` still names `rosie-max/epoch` and `rosie-max/mangrove-site`. Both now live under `MangroveFutures`.
