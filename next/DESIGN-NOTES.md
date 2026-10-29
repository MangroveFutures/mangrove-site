---
title: Design record, next site preview (one direction)
status: proposal for Rosie
owner: rosie
created: 2026-10-29
updated: 2026-10-29
---

# Next site preview: design record

Cooper (agent, for Rosie), 29 Oct 2026. An unlinked preview at `next/index.html` for the 30 Oct 2026
meetings. One direction, built, by the coordinator's brief (time short). Live `index.html`, `flock.js`,
`vendor/` and `fonts/` are untouched. `noindex`; nothing links here.

## Brief (from the coordinator, relaying Rosie)

One scrolling page, calm sticky nav, the same shape for every section: big picture, one-line claim,
detail behind "more". Sections: hero (her flock), work with us, advisers, work, software, research, book,
footer. Keep the live site's look (dusk ground, Newsreader and Bricolage, falcon accent), not the Epoch
app's black and orange. Rosie's correction mid-build: no caveats, "to confirm" tags or disclaimers on the
page; the research animation is generative artwork, titled plainly; missing facts are clean slots, listed
below.

## Process

- **Mangrove's own material first.** Tokens, fonts, time-axis nav, wordmark, theme switch, grain and the
  accessibility kit are copied from the live `index.html`. The hero is the live flock: `next/sky.html`
  loads `../flock.js` unchanged and gives it the hooks it looks for; the preview frames it. The parent
  page mirrors theme and motion settings into the frame and sets motion to "reduce" when the hero is off
  screen, so the flock rests (an attribute flock.js already watches; no edit).
- **Metaphor from the thing:** action research is a figure of eight (client work and research crossing
  at Epoch); software status is a track from idea to in progress, with status drawn as an empty, half or
  full circle (never colour alone); the research is loops that persist.
- **Skills used:** `impeccable` craft floor and `detect`; `accessibility` static check and browser pass
  (0 fail at 390 and 1280 px); render and look at 390 and 1280 px, dark and light.
- **Critique:** DEGRADED, single-context (no separate critic in this run). Ask Feynman for the design
  review before the pick.

## Borrowed, and where the borrow stops

- **Persistent homology** (the barcode as the picture of how long a loop lasts): the artwork borrows the
  picture only. Points, rings and bars are seeded, not computed from the record; no homology is computed.
  A later version could draw from real data.
- **WAI-ARIA tabs pattern** for the three research pictures; **click-to-load video facade** (the usual
  "lite embed" pattern) for Vimeo, with `dnt=1`. Nothing reaches Vimeo until play is pressed.
- **The live site's time axis** as the nav, extended from four stops to six; on a phone it scrolls
  sideways.

## Rejected

- A grid of identical cards for advisers (portraits in a strip instead; a sideways strip on a phone).
- Re-implementing the flock or editing `flock.js` to fit a long page (it drives a whole-page dive and
  needs specific elements; framing it keeps Rosie's maths untouched).
- Decorative stripe hatching on portraits (flagged by `impeccable detect`; removed).
- A "Live" column on the software track: no tool is marked live in the draft, and an empty column read
  as an apology.
- Showing the two client testimonials: the inventory says both need the person's agreement first.

## Missing, for Rosie (kept off the page)

1. Vimeo ids for the two films: replace `data-vimeo-id="REPLACE"` (two places in `next/index.html`).
2. Adviser photos (all six), bios for Kam Chana, Christina Liciaga, Ed Greig; spelling of Liciaga.
3. Adviser quotes: Clive, Larry and Oli's come from a ChatGPT relay of the old Jimdo page (corpus turn
   `chatgpt:d0b491ec-d953-408f-b344-721bdb409295`); check the wording. Larry's full quote talks about
   Rosie personally, so only one sentence is shown. Bios for the three are short versions of that relay.
4. Films: titles, dates, one line each; Daphne Selfe's spelling (the record has "Selfe"); Valentino's full
   name and role.
5. Testimonials (Rafa; Becky): permission to republish. A slot is marked in an HTML comment.
6. Draft copy to approve: the studio line, every section claim, the Epoch line ("AI- and systems-native,
   for every kind of mind"), coaching and commissions lines, the research questions.
7. Software: which tool is public first; Mindsweeper's public name and Pro offer; SketchIn licensing;
   Choreotope's public name; whether WYRD and the org graph are shown; one line and links for
   HealthStory AI and BodyScan AI.
8. Papers (three titles from Drive) and the Substack link.
9. Book: "Defence" or "Defense", and the author line on the cover.

## Render and look

`next/shots/preview-1280.jpg`, `next/shots/preview-390.jpg` (full page, dark). Light theme and the
research artwork checked at both widths. Fixed after looking: tab panels showed all at once (`hidden`
overridden by `display:grid`), the Pause button wrapped, the loop diagram's small labels were 8 px on a
phone (hidden there), the kit's Display pill made small as on the live page.

## Change log

- 2026-10-29: first version (Cooper, for Rosie).
