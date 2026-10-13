---
id: foundation-03-design-brief
title: Design brief
status: draft, nothing visual is decided (merges the 12 Oct placeholder and the 6 Oct design brief)
updated: 2026-10-13
method: Design brief → moodboard → style tiles (Samantha Warren) → design system (Atomic Design, Brad Frost)
---

# 3 · Design brief

**Answers:** what the site should look and feel like on every screen, and what is off-limits.

Detailed tokens and components belong in `design-system/`. This doc is the short brief that points there. It collects references and open questions; choices are made with Rosie, option by option, and recorded in the decision log only once she makes them.

## What the design has to do

To be agreed. Inputs so far:
- Show the work is real and serious, while staying accessible (D2: "a stance others can glance at to see we are serious and producing serious work but also accessible").
- Work for someone looking on a phone after meeting Rosie at an event (6 Oct v1 audience).
- Act as a demonstration of what Mangrove's tools can make (inventory C-08, C-09).
- Support "services first, portfolio as proof" (Rosie, 13 Oct, see [01](01-product-requirements.md)).

## What has been recorded, and how firm it is

Two earlier notes disagree about how settled things are. The 12 Oct placeholder listed items under "Already decided"; the 6 Oct brief said "no design choice is settled" and its decision log is empty. This table keeps both and marks the conflict. Only Rosie can move a row to decided.

| Item | 12 Oct placeholder | 6 Oct brief and the code | Status now |
|---|---|---|---|
| Governing metaphor: murmurations and stigmergy | Boids hero is the identity, not decoration | Recorded as the governing metaphor | Consistent in both notes. Rosie to confirm, as no decision-log entry exists. |
| Hero: boids simulation | Boids with connection lines between nearest neighbours (tensile mesh look), cursor repulsion | Boids with connection lines in code; "unsettled" | Conflict on firmness only. Hero is protected in `CLAUDE.md`: don't change without discussion. |
| Colour: cream ground `#EDE9E3` with dark navy ink `#1e2235` | Listed as decided | "Cream background, navy ink, teal accent" in code; "unsettled" | **Open idea to test, not decided.** Rosie has not approved it (epoch#710, 13 Oct). Cream is not ruled out or ruled in. |
| Dark ground `#050c09` with gold particles | Not mentioned; `index.html` still has gold particles | The earlier dark version (main `CLAUDE.md` before 12 Oct) | **Conflict: dark vs cream** (epoch#670 title). Unresolved. |
| Teal accent | "No teal, anywhere. Rosie hates it." | Teal accent in code on 6 Oct; `#0F6E56` / `#5DCAA5` in the old `CLAUDE.md` | Recorded 12 Oct as Rosie's statement; teal removed from the site that day. Conflicts with the 6 Oct code and old `CLAUDE.md`, which predate it. |
| Accent colour | Undecided; falls back to navy ink for now | Open question | Open |
| Display type: Cormorant Garamond weight 300 | Listed as decided | "A display serif plus system sans"; typography is open question 1 | Conflict on firmness. Cormorant is also named in the old `CLAUDE.md`. |
| Body type | Inter used in the technical briefing; confirm | System sans in code | Open |
| Quality bar and references: Superflux, Dunne & Raby, Ink & Switch | Named | In the old `CLAUDE.md`; "not confirmed by Rosie" on 6 Oct | Named, not confirmed |
| Rejected: plain editorial / broadsheet ("too dry"), dark per-project cards, symmetric card grids, corporate palettes | Recorded | Dark cards and broadsheet recorded "as history, to be confirmed" | Recorded as rejected; 6 Oct asks for confirmation |
| Layout: single column sections, two-column project grid | Not mentioned | In code | Placeholder |

## References named so far

| Reference | Where it was named | Notes |
|---|---|---|
| Murmurations and stigmergy | earlier site sessions; `CLAUDE.md` | Governing metaphor |
| Choreotope boids screenshot | earlier site sessions | Visual reference for the hero |
| Superflux, Dunne & Raby, Ink & Switch | old `CLAUDE.md` | Studio references |
| Felix Rieseberg's parallel-directions method | earlier site sessions | Process reference: keep several directions open, don't collapse early |
| Canva brand-book templates | D2 | A model for what a brand book usually contains |

**Not yet gathered:** Cooper's research on artists, designers and data-vis references, the sketchbook, and comments from the commenting tool (D1 asks for all of these to be compiled). This is the main gap before style tiles.

## Other conflicts

- `index.html` hero still uses gold particles from the earlier dark version. Keep or drop?
- `design-system/README.md` refers to `design-system/index.html`, which is not in the repo. Where is it (Claude artifact? another branch)? `docs/technical-briefing.html` refers to it too.

## Open questions

1. Colour: test cream `#EDE9E3` with navy against at least one alternative (the dark version is the obvious one) as parallel style tiles. Which accent, if any?
2. Typography: display and body. Confirm or change Cormorant Garamond 300 and Inter.
3. How work items are presented (cards, list, full-screen swipeable hero per project, other).
4. One visual system for everything, or a shared base with per-project variation (D1: "design systems for each individual project too eg Murmurations").
5. How much motion and interaction; mobile behaviour of the hero.
6. Imagery and photography rules.
7. Accessibility baseline (contrast, reduced motion).
8. Logo / wordmark.
9. Work section layout: being designed in a separate Claude Design session; don't design it independently.

## Process

1. Gather references (including Cooper's) into a moodboard.
2. Make 2 or 3 style tiles as parallel directions.
3. Rosie chooses or combines.
4. Record choices in the decision log; then build tokens and components in `design-system/`.

## Decision log

| Date | Decision | By |
|---|---|---|
| none yet | Nothing in this file has been logged as decided by Rosie. | n/a |
