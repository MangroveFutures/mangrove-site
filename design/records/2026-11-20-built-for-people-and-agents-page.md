---
id: design-record-2026-11-20-built-for-people-and-agents-page
title: Design record, "Built for people and for agents" page
status: draft for Rosie
date: 2026-11-20
agent: cooper
---

# "Built for people and for agents" page (draft for Rosie)

Size of job: inside a settled world. A new research page in the approved `next/` look. Copy, colour and placement are Rosie's to decide; this is a draft. Phase: alpha.

## Brief
Rosie, 20 Nov 2026: a public page explaining how and why the site is built in two layers (an adaptive human layer; an agent layer with no buttons), designed to be quoted and summarised as well as visited, with a Markdown text twin, a card on Research, a line on the book page, and `next/llms.txt`. Public rules: no client names, no fees, no links to private repos. Facts allowed: Pew (browsing in March 2025) 8% vs 15%; Ahrefs (May 2026) 97% of llms.txt files never requested. Audience: visitors curious about the approach, and agents summarising Mangrove.

## Information architecture
- Title, claim (the whole idea in two sentences, so a summary that takes only the top is still right).
- Picture: one body of writing forking into the human layer (visited) and the agent layer (quoted, summarised), with the first user of each marked.
- Depth tabs: Top line, Short (default), Long, Sources. The page is the first working example of the depth control it describes.
- Visible link to the text twin, the date, the pager.
- Not on the public page, from the private source: the lab paper number and link, client-work notes, the screen-reader teacher (client context), the Google, NLWeb and Cloudflare references (not in the allowed facts list).

## Process
- Started from Mangrove's own material: `next/research/second-order-cybernetics.html` (crumb, claim, diagram figure and its SVG classes), `next/research/instruments.html` (the site's WAI-ARIA tabs, reused unchanged through `site.js`), `next/site.css`. A small page-local style block only for the diagram labels and two notes.
- Options (two layouts of the settled world): A, depth tabs under the diagram (built); B, the sibling pattern of diagram plus one collapsed "Go deeper" section (not built). A chosen because the depth control is the page's subject, so showing it beats describing it; B stays one edit away.
- Skills: `accessibility` (static check and Playwright pass), `impeccable` principles applied by hand (restraint, no cards, no pills, no italics). `DEGRADED: single-context` critique; no separate critic was available in this run.
- Agent layer on the page itself: `<link rel="alternate" type="text/markdown">`, schema.org `Article` JSON-LD with the Markdown encoding, the `.md` twin, `next/llms.txt`.
- `_config.yml`: `markdown_ext` drops `md`, so GitHub Pages' always-on jekyll-optional-front-matter serves the twin as plain text instead of rendering it into an HTML page that would clash with the real one. Not tested with Jekyll here (gem install was blocked); undo is deleting the line.
- Defaults check: no cream ground, italic serif, pills or card grid added. Honest answer: the page is the site's own look; the diagram and the live tabs are its only new parts.

## Checks
Rendered at 390, 768 and 1280 px, dark and light, plus the Long and Sources tabs at 390; viewed. No sideways scroll. Fixed after looking: diagram labels clipped on the right (viewBox widened); the fourth tab cut off at 390 px (labels shortened to Top line, Short, Long, Sources). Browser accessibility pass: 0 fails. Static check reports the kit as missing and no "more contrast" mapping: the same result as every sibling page, because `site.js` injects the kit and `site.css` holds the contrast rule. Hand checks left: a real screen reader and voice control.

## Questions for Rosie
1. Default depth: Short (built) or Top line? Recommendation: Short.
2. Is naming you as "the first person the site is fitted to" right for a public page?
3. Wording throughout is a draft; the diagram labels too.
