---
id: foundation-03-design-brief
title: Design brief
status: draft; Rosie chose direction D2 on 23 Oct 2026 ("I think") and steered it on 24 Oct; no row below is confirmed final (merges the 12 Oct placeholder, the 6 Oct design brief, and Cooper's 23 to 24 Oct work)
updated: 2026-10-25
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

## Conflict: the live site against the table above

Marked on 25 Oct 2026, not resolved. Cooper's direction D2 has been the front page on `main` since 24 Oct 2026 (PR #13), and the table above (written 13 Oct) predates it. Where they disagree:

| Table row | Live page (`index.html`, `flock.js`) |
|---|---|
| Hero: Boids with connection lines, cursor repulsion; protected by this repo's `CLAUDE.md` ("don't change the Boids hero without discussion") | A 3D flock built on Rosie's own Choreotope `Flock3D` (vendored, unchanged), each bird joined to its seven nearest neighbours, two flocks (one on a phone), a falcon (the pointer or a tap), and the word "mangrove" forming once on arrival. The change was discussed and asked for by Rosie (23 and 24 Oct), so the `CLAUDE.md` line is probably stale; left for Rosie. |
| Colour: cream `#EDE9E3` with navy ink, an idea to test | Neither. Two atmospheres with a light and dark toggle: dark night sky (ink `#ece6da`) and a pale grey-green day sky (ink `#15191c`), both with an orange glow and falcon colour. Cream and navy are only in `archive/2026-10-old-site/`. |
| Display type: Cormorant Garamond 300; body Inter | Newsreader for the wordmark and tagline, Bricolage Grotesque for the rest; both self-hosted (SIL OFL), no Google Fonts. Rosie, 24 Oct: headings "cleaner and less playful". |
| Teal: none | None in the live page. |
| Dark ground `#050c09` with gold particles | Replaced; the old gold particles are gone from the front page. |

None of these is logged as decided by Rosie. The decision log below records only what she said.

## Options: six directions for the interim page (Cooper, 23 Oct 2026)

Source: Cooper's Figma design night, kept in the epoch design record dated 23 Oct 2026 ("mangrove-site-figma-design-night") and in home `handbook/explanation/cooper-figma-design-night-2026-10-23.md`; the Figma file is in Rosie's account. All copy on the designs was draft. Six directions, each a real Boids run computed inside Figma with the pointer as a falcon. Cooper's recommendation was B, with E's falcon behaviour. **Rosie chose D** ("Go with option D, I think"), liking E's wonky lettering and B's section text; see Working notes. The other five stay on record as options for the full site.

| | Direction | Claims | Bad at (Cooper's notes) |
|---|---|---|---|
| A | Night murmuration (dark) | The sky at dusk is the page; the headline sits under the flock like a caption. | Safest and nearest to a familiar "dark studio site"; the flock reads as scattered marks more than a dense mass. |
| B | Specimen plate (light) | The flock as a natural-history plate with the four Boids rules drawn as small multiples, the fourth being the falcon. | Libre Caslon italic sets old long-s ligatures; could read as nostalgic rather than speculative. |
| C | Signal (light, Swiss poster) | A huge MANGROVE wordmark with a vermilion flock through it on a visible grid. | Vermilion on white fails contrast for small text; loud; may say "agency" more than "lab". |
| D | Long exposure (dark) | Each bird drawn as its path (chronophotography); the visitor's path is a red line; the page is a time axis. | Trails look like hair in places; the time axis promises a history the page did not yet have. |
| E | The words are the flock | The headline's words are birds; the sentence breaks apart where the falcon is and re-forms when you hold still. | Legibility is the price; hardest to make accessible. |
| F | Canopy and prop roots (dark) | The flock as a tensile net the falcon tears; the content hangs from it on roots to a waterline. | Roots cross the text; the best idea with the weakest execution. |

How each could grow into the full site (Cooper's growth sketches): A, five sub-flocks, one per space; B, a monograph of plates; C, an index grid; D, one time axis since 2024; E, section names as word-birds; F, roots down to five pools.

Cooper's questions of 23 Oct, with her recommendations, and what has happened since:

| Question | Recommendation | Since |
|---|---|---|
| Which direction? | B, with E's falcon | Rosie: D, with E's lettering and B's text. Built as D2. |
| Hero from the page or from Choreotope? | Page's own Boids now, Choreotope for the full site | Choreotope's `Flock3D` is in the live page (24 Oct). |
| "Research" or "Lab"? | "Lab" | No answer recorded; live page says "Research". See [02](02-app-flow.md). |
| Should the falcon leave a trail? | Yes, a short fading one | Not recorded. |
| Is Figma worth a paid seat? | Not yet; use it as a sketchbook for a month | Not recorded. A paid seat would need an ADR in epoch. |

Challenge Cooper raised to the brief: the old `index.html` was the cream plus italic Cormorant bundle Rosie rejected on 13 Oct 2026; none of the six repeats it.

## Options: how a design reaches the repo (Figma)

Cooper tested Figma on 23 Oct 2026. On the Starter plan it could create files, draw computed pictures (a real Boids run), make variables and components, and render screenshots; it could not hold more than one mode per variable collection (so no light and dark switch in Figma), could not use Code Connect, and stopped at about 35 calls. Her honest limit: Figma holds the look, not the motion. The path she proposed: Rosie picks in Figma; an agent reads the frame and its variables; the tokens go to `design-system/tokens.json` (W3C Design Tokens format); the page is built in plain HTML, CSS and JavaScript against them. Not adopted; `design-system/tokens.json` does not exist yet, and the live page holds its colours as CSS custom properties in `index.html`.

## Other conflicts

- ~~`index.html` hero still uses gold particles from the earlier dark version. Keep or drop?~~ Overtaken on 24 Oct 2026: the front page is now D2 and the gold-particle page is in `archive/2026-10-old-site/` (kept as history).
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
9. Work section layout (Studio): Cooper's 16 Oct sketches are listed as options in [02](02-app-flow.md), "Options: how the Studio shows its work". Pick, combine or drop.
10. Does each space (Lab, Studio, Services) get its own look, and how far apart? (From [02](02-app-flow.md) question 2.)
11. Keep, change or drop the `CLAUDE.md` rule about the Boids hero, now that the hero is the Choreotope flock.
12. Independent design review of the live page: Cooper's provenance file records a design review on 23 Oct (findings fixed in PR #10) but none of the 24 Oct changes (PRs #14 to #20), and PR #19 notes nobody has felt the flock on an iPad.

## Process

1. Gather references (including Cooper's) into a moodboard.
2. Make 2 or 3 style tiles as parallel directions.
3. Rosie chooses or combines.
4. Record choices in the decision log; then build tokens and components in `design-system/`.

## Working notes

Dated, sourced, not decided.

- **23 Oct 2026, Rosie on the six directions** (relayed by the coordinating session; Cooper's provenance file `drafts/2026-10-23-direction-d2/provenance.yaml`): go with D, "I think"; likes the wonky lettering (E); likes the simplicity of the tagline on the front page, and B's text under each heading, "nice and clear and simple", so keep that for now. Wants more than white on black: texture, depth, a little softness, 3D coming forwards and back, parallax, some light effects, "a little more like a real designer has touched it", some wow moments. "Clean and natural." On the flock: the interim page's 2D Boids is "a messier version"; the one she likes is the Choreotope murmurations, a three.js flock with a web to each creature's seven nearest neighbours. The visitor's mouse or finger is a falcon, and a finger must still scroll.
- **23 Oct, D2 built** by Cooper (D's time axis, B's sentences, E's lettering) in three.js: shader sky, grain, parallax, scroll dive, the flock writing "mangrove". Self-hosted fonts and three.js r170 (no CDN on load; but the Display control fetches Google Fonts if a visitor picks one of two typefaces, see the conflict in [04](04-technical-requirements.md)). Accessibility kit v1 ("Display" control). Rejected on record: flat white on black; Google Fonts and CDN tags; a coloured CSS glow; flock over body text (the shader dims the flock behind text instead). A review the same day found a typed "15 million words" figure (now computed) and a toggle that never told a screen reader its state.
- **24 Oct, Rosie's steers, in order** (from the commit messages of PRs #14 to #20, which quote her): slow the flocks; one or two larger flocks instead of seven small ones; soften and calm; a normal light and dark toggle instead of the "Silt" switch; a far smaller accessibility control. Then: still slower, larger, swooping with expansion and contraction, "long flowing stuff rather than balls", able to go on and off the edges. Then: the flock was better before the ribbon and slowing changes, so back to Cooper's original maths; headings cleaner and less playful; search indexing allowed. Then: a live public site should not point at internal notes, so the Sources link was removed. Then: "still just balling, not flowing around the page, doesn't feel like murmurations ... the mangrove shape is cool in theory, not quite reading as mangrove yet. Work out how to run this flocking properly; I want to stop asking." Cooper rebuilt it on `Flock3D` (PR #19), and a second round (PR #20) made the word form once, one large flock on every screen, a scroll cue in place of the falcon instruction, and touch drag scrolls while a tap sends the falcon in.
- **Known limits of the live flock** (PR #19): the word reads on a laptop with effort and on a phone "not really" (about 157 birds for eight letters); on a laptop about a quarter of birds are off-screen at any moment; a flock sometimes strings into a chain. No independent review of the 24 Oct changes.
- **What Rosie has praised, rejected and named** is kept by Cooper in `agents/cooper/reference-library.md` in the home repo (29 entries in v0, each with her words, source, date and confidence) and in `design/allow-and-deny.md`. Rejected with high confidence: the generic Claude-default look, teal, "vibe coded", round pills, everything on screen at once, card grids and count tiles, job-title stacks. Praised: restraint, one accent, a serif display used with care; the clothesline sketchbook as the bar; McCandless and Muriel Cooper; Bret Victor's scrubber. The gap list there says what was not yet mined (laptop files, DuckDB preference nodes, the Replit and Lovable era).
- **Rules from the 16 Oct Studio sketches** (Cooper, after Rosie's reactions; home design notebook): one thing on screen at a time (counted by items, not only words); nothing ever disappears, every item stays reachable; no counts or dates on everything; sound starts only on a tap; in the first five seconds only drift moves; light airy grounds, not heavy black; radius zero and hairlines instead of pills; the old token files not reused by default.
- **Epoch app "Versions sheet"** (Cooper's memory, 23 Oct 2026): a place in the Epoch app v2 that opens every version of a design on Rosie's iPad and sends a pick back as a pre-filled issue, because designs were built and never seen. Relevant to how Rosie picks between site options; not part of this repo.

## Decision log

| Date | Decision | By |
|---|---|---|
| 23 Oct 2026 | Direction D (long exposure) as the base for the site's look, with E's lettering and B's section text; "I think", so tentative. Built as D2. | Rosie, relayed by the coordinating session |
| 24 Oct 2026 | D2 becomes the front page; the old cream page is archived. | Rosie, relayed (PRs #12 and #13) |
| 24 Oct 2026 | Calmer, larger, flowing flocks; Choreotope's own `Flock3D` as the engine; light and dark toggle; cleaner headings; search indexing allowed; no Sources link on the public site. | Rosie, relayed (PRs #14 to #20) |
| | Nothing else in this file is logged as decided by Rosie. Colour, type and the hero's final form are still open to her. | n/a |
