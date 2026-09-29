---
id: doc-claude
title: CLAUDE.md — mangrove-site working agreement
status: active
updated: 2026-09-29
---

# CLAUDE.md — mangrove-site

Working agreement for any session (Claude Chat, Claude Code, or another agent) picking up this repo.

## What this repo is

Public website for **Mangrove Research** (mangrove.org.uk). A static site (plain HTML/CSS/JS) hosted on GitHub Pages. No build step, no framework — `index.html` in root is what GitHub serves.

This repo is a **projection surface** (read model) of the epoch monorepo (`rosie-max/epoch`), registered there via ADR. It does not write back to epoch. Content is manually maintained until an automated pipeline is built.

## Repo structure

```
/
├── index.html    Landing page (live — Boids hero + 4 section stubs)
├── CLAUDE.md     This file
└── README.md     GitHub default
```

## The hero — do not change without discussion

The landing page hero runs a **Boids flocking simulation** (Craig Reynolds, 1987). This is the primary visual identity of the site. Do not replace with an image or video; do not simplify the JS.

The particle system produces emergent murmuration behaviour — this is a deliberate conceptual metaphor for Mangrove's core themes (stigmergy, emergent coordination, collective intelligence, the human-AI dyad). The metaphor and the implementation are the same thing.

Parameters in `index.html`:
- `N = 130` boids
- `~7%` warm gold particles (`rgba(239,172,55)`)
- Trail via semi-transparent `fillRect` each frame (alpha 0.16)
- Wrap-around edges for continuous flow

## Four sections — stubs pending Claude Design

The four content sections below the hero are intentional stubs. Visual design is being developed in a separate Claude Design session. **Do not design the work section independently** — the brief and context are in that session.

| Section    | Content scope |
|------------|---------------|
| `/lab`     | Mangrove Research as a lab, Kronoscope, papers, second-order cybernetics, the human-AI dyad |
| `/work`    | Epoch, Choreotope, WingMan, Mindsweeper, Islands of Doc Tomorrow, data art |
| `/writing` | *In Defence of Tangential Thinking* (book), essays |
| `/services`| Workshops, 1:1 work, how consulting funds the research |

## Design standard

Studio quality. References: Superflux, Dunne & Raby, Ink & Switch. Not: startup templates, symmetric card grids, corporate palettes.

- Display typeface: Cormorant Garamond weight 300 (loaded from Google Fonts)
- Body pairing: TBD from Claude Design session
- Accent: `#0F6E56` (teal-600, light mode) / `#5DCAA5` (teal-400, dark mode)
- Background: `#050c09`

## GitHub Pages

Settings → Pages → Source: branch `main`, folder `/` (root). The site is served directly from `index.html`.

To enable: go to `github.com/rosie-max/mangrove-site` → Settings → Pages and set the source.

## Provenance

Visual direction explored in Claude Chat, 2026-09-29. Boids hero chosen as primary design language. Work-section design deferred to Claude Design. Full context in `/areas/mangrove-site.md` in epoch memory.
