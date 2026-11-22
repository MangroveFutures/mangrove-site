---
id: doc-claude
title: CLAUDE.md — mangrove-site
status: active
updated: 2026-11-22
---

# CLAUDE.md — mangrove-site

Public website for Mangrove Research (mangrove.org.uk). Part of the **MangroveFutures** GitHub org.

This file holds pointers only. Decisions live in the files below — read them, don't copy them here.

## Where things are
- Plans and work tracking: `MangroveFutures/epoch` issues — site epic is epoch#667
- What the site is, who it's for, how it's built: private, in `MangroveFutures/home` `websites/foundation/` (moved 29 Oct 2026)
- Design: `home` `websites/foundation/03-design-brief.md` and `design-system/` here
- Site itself: `index.html`. Internal drafts and notes are not kept here (the whole repository is public); they live in `home` `websites/mangrove-site/internal/`.

## Working rules
- Don't change the Boids hero without discussion with Rosie.
- Never edit `vendor/ripple/` by hand. It is a copy of a tagged version of the pond in the private studio repo (`packages/ripple`), made by `scripts/sync-ripple.mjs <tag>` (22 Nov 2026, studio#45). To change the pond: edit it in studio, tag it, re-run the script. `node scripts/sync-ripple.mjs --check` fails if the copy differs from `vendor/ripple/MANIFEST.json`; add `--studio ../studio` to compare with the tag itself. Tests: `node --test scripts/`.
- Design, colour and copy choices are Rosie's. Agents gather, structure and flag; they don't decide.
