---
id: foundation-03-design-brief
title: Design brief
status: placeholder
updated: 2026-10-12
---

# 3 · Design brief

**Answers:** what the site should look and feel like on every screen, and what is off-limits.

Detailed tokens and components belong in `design-system/`. This doc is the short brief that points there.

## Already decided
- Governing metaphor: murmurations and stigmergy. The Boids hero is the identity, not decoration.
- Ground: cream `#EDE9E3`. Ink: dark navy `#1e2235`. Accent: teal `#0F6E56`.
- Boids with connection lines between nearest neighbours (the tensile mesh look), cursor repulsion.
- Display type: Cormorant Garamond, weight 300.
- Bar: studio quality. References named: Superflux, Dunne & Raby, Ink & Switch.
- Rejected: plain editorial/broadsheet ("too dry"), dark per-project cards, symmetric card grids, corporate palettes.

## Conflicts to resolve
- `CLAUDE.md` still lists a dark background (`#050c09`) and gold particles. Later decisions moved to cream/navy. Which is canonical? Update `CLAUDE.md` once settled.
- `design-system/README.md` refers to `design-system/index.html`, which is not in the repo. Where is it (Claude artifact? another branch)?

## Still open
- Body typeface (Inter has been used in the briefing doc — confirm).
- Work section layout — being designed in Claude Design.
- Motion, imagery and photography rules.
- Mobile behaviour of the hero.
- Accessibility baseline (contrast, reduced motion).
