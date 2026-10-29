---
title: Design record, next site preview (one direction, now several pages)
status: proposal for Rosie
owner: rosie
created: 2026-10-29
updated: 2026-10-29
---

# Next site preview: design record

Cooper (agent, for Rosie), 29 Oct 2026. An unlinked preview at `next/` for the 30 Oct 2026 meetings. `noindex`; nothing
links here. The live `index.html`, `flock.js`, `vendor/` and `fonts/` are untouched. Everything is self-hosted: no
outside request until a film is played.

## What changed (second round)

Rosie's feedback on the first preview: the long scroll "always feels a bit cheap"; she wants click-through to separate
pages; the word is "Advisors"; the project and research deserve a deeper dive with the papers. So `next/` is now a small
multi-page site in the same visual language (dusk ground, Newsreader and Bricolage, falcon accent, the time-axis nav).

- **Home** (`index.html`): her flock, the studio line and six doors. One screen, no scroll.
- **Every page has the same shape:** the same header, a name and one-line claim, a big picture, detail collapsed under "More".
- **Pages:** `work-with-us`, `advisors`, `work` plus one page each for the four pieces (`work/`), `software` plus one page
  each for the seven tools (`software/`), `research/` (hero artwork and six doors) with `dyad`, `second-order-cybernetics`,
  `hgi`, `instruments`, `papers` and `tangential-thinking` (essay and book).
- **Nav fix:** the top bar is a solid, blurred ground, so section text no longer shows behind it. It is also a `header`
  landmark now, and the chosen light or dark theme is kept across pages.
- **Shared files:** `site.css` and `site.js` (the accessibility kit and the page behaviour). Pages are plain HTML, 3 to 9 KB
  each; no page needs the build step used to write them.
- **"Advisors"** everywhere; **"Defence"** (British) everywhere.
- **Research artwork** ("Loops that persist"): now already populated when the page loads (it opens near the end of its
  two-year timeline, then keeps evolving and fades into a new run); the apology caption is gone.
- **Instruments** (`research/instruments.html`, tabs): a torus with a line winding five times round and three times through;
  a sheet that rolls and unrolls with a walker's neighbourhood lit; a Queneau-style poem (six lines, eight versions each,
  262,144 poems, written for the page). All three are calm, pausable and still when motion is reduced.
- **The flock's tagline box** moved to the top of the home screen so the flock's own "Mangrove" word forms in the open
  sky above the doors. `sky.html` (the frame host) was edited for that; `flock.js` was not.

## Process

- **Mangrove's own material first.** Tokens, fonts, the time-axis nav, wordmark, theme switch, grain, the action-research
  loop, the persistence artwork, the Vimeo click-to-load facade and the accessibility kit all come from the first preview
  and the live `index.html`. Copy for software and research comes from home
  `websites/drafts/software-and-research-sections-2026-10-30.md`; HGI wording from the old-site manifesto, leaving out the
  personal and health passages.
- **Metaphors from the thing:** doors for the home (each with its own glyph); a track from idea to in progress for
  software; a figure of eight for client work and research; loops that persist for the research; strips of a poem for Oulipo.
- **Skills used:** `accessibility` static check (0 fail, 0 warn on all 23 pages, run on copies with the kit and CSS
  inlined, because the checker reads one file) and browser pass (0 fail on home, advisors, research and instruments at 390
  and 1280 px); `impeccable` craft floor (no stripe or gradient decoration, no card grid of look-alikes).
- **Critique:** DEGRADED, single-context. Ask Feynman for the design review before a pick.
- **Does it look like Claude's default?** No cream ground, italic serif, round pills or purple gradient. The nearest risk is
  the six door tiles on the home page (a grid of six); they differ by glyph and are ruled, not boxed, but a distinct shape per
  door would go further.

## Borrowed, and where the borrow stops

- **Persistent homology** (the barcode as the picture of how long a loop lasts): the artwork borrows the picture only.
  Points, rings and bars are seeded, not computed from the record; no homology is computed.
- **Torus and manifold:** drawn meshes, not computed from data. The torus line is a (5, 3) winding; the sheet is a Swiss roll.
- **Queneau, "Cent mille milliards de poèmes" (1961)** and the Oulipo: the method (interchangeable lines) only; the lines are new.
- **Second-order cybernetics** (von Foerster) and **Ashby's law of requisite variety:** named in the research pages; the page
  does not claim Mangrove has tested either.
- **WAI-ARIA tabs pattern** (instruments); **click-to-load video facade** for Vimeo with `dnt=1`.

## Rejected

- One long scrolling page (Rosie, 29 Oct 2026: "always feels a bit cheap").
- Editing `flock.js`, or re-implementing the flock.
- Decorative stripe hatching on portraits (flagged by `impeccable detect`).
- Showing the two client testimonials: each needs the person's agreement first (slot marked in an HTML comment).
- Any visible "to confirm", draft, preview or illustration label. Gaps are clean empty slots and live here instead.

## Empty slots, and what Rosie must supply (kept off the pages)

1. **Vimeo ids** for Daphne Selfe and Bolero (and, if wanted, Murmurations and Reclaim): fill `data-vimeo-id=""` in
   `next/work/*.html`; the play button appears by itself once an id is there. Until then each page shows its drawing.
2. **Film details:** dates for all four pieces, Valentino's full name and role, Daphne Selfe's spelling ("Selfe" in the record),
   Rosie's role on Reclaim, who else to name as key people.
3. **Advisors:** photos for all six (an `img` goes in each `.portrait`), bios for Kam Chana, Christina Liciaga and Ed Greig,
   quotes for the same three, the spelling of "Liciaga". Clive, Larry and Oli's quotes come from a ChatGPT relay of the old
   Jimdo page (corpus turn `chatgpt:d0b491ec-d953-408f-b344-721bdb409295`); check the wording. Larry's card shows one sentence
   because his full quote talks about Rosie personally. Larry's role names CHADD (kept as the existing card text; it points
   at ADHD, so say if it should go). Clive's and Oli's cards both open a full quote.
4. **Papers:** three titles, years and links for `research/papers.html` (the three cards are empty on purpose); the Substack link.
5. **The essay:** the full text of "In Defence of Tangential Thinking" for `research/tangential-thinking.html`; today the
   page holds a two-paragraph statement of the argument taken from the HGI manifesto. The book cover has the author line
   "Rosie Collins"; confirm it.
6. **Copy to approve:** the studio line, every claim line, the Epoch line ("AI- and systems-native, for every kind of mind"),
   the research pages (written from the draft sections and the manifesto), the three research questions, and the poem lines.
7. **Software:** which tool is public first; Mindsweeper's public name and Pro offer; SketchIn licensing (left out of its page);
   Choreotope's public name; whether WYRD and the org graph are shown; one line and a link for HealthStory AI and BodyScan AI.
8. **Testimonials** (Rafa; Becky): permission to republish.
9. **The "Book" nav stop** points to the tangential-thinking page, which also sits under Research. Say if it should be its own top-level page.

## Render and look

`next/shots/`: one 1280 px shot each of home, work with us, advisors, work, software, research and instruments (dark; JPEG).
Every page was also rendered at 390 and 1280 px, dark and light for the main ones; no sideways scroll on any. Fixed after
looking: the manifold's camera sat inside the sheet (units too large), the research caption bar was narrower than its
picture, the Epoch labels sat on the loop, the torus caption claimed the line "never crosses itself" (it crosses in
projection; now "never meets itself on the surface"). The flock needs about 14 seconds in the headless browser to form its
word (software rendering); that is the browser, not the page.

## Change log

- 2026-10-29: first version, one scrolling page (Cooper, for Rosie).
- 2026-10-29: second round, multi-page site, "Advisors", research deep dive and instruments, nav fix (Cooper, for Rosie).
