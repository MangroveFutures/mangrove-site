---
id: foundation-index
title: Foundation docs — index
status: active index; every doc below is a draft or placeholder
updated: 2026-10-25
---

# Foundation docs

The eight documents to have before building the site. They are the one home for all Mangrove website planning (consolidated 13 Oct 2026 from the 12 Oct placeholders and the 6 Oct content, sitemap and design-brief drafts; brought up to date on 25 Oct 2026 with the Q&A answers, the 23 to 24 Oct design and build work, and the options and sketches found on unmerged branches; nothing is kept twice).

Work them **content first**, in the order of the table (not the file numbers). Tracked in epoch#667, one sub-issue per doc.

| Order | Doc | Status (25 Oct 2026) | Question list |
|---|---|---|---|
| 1 | [00 Content inventory](00-content-inventory.md) | draft, rows unreviewed; Squarespace XML text exports still missing; old-site text recovered; working notes on assets added | Which rows to keep, rewrite or cut? What gaps (C-xx marked `gap`) block v1? |
| 2 | [01 Product requirements](01-product-requirements.md) | draft; 13 and 25 Oct answers recorded; 16 Oct wish list and the versions question added as working notes | 2 open questions (versions, designer-only site); wish list to reconcile with the five-page v1 |
| 3 | [02 App flow](02-app-flow.md) | draft; v1 shape decided 13 Oct (five pages); the live page is one scrolling page, marked as a conflict; Studio options added | 4 open questions plus the live-page conflicts |
| 4 | [07 Copy](07-copy.md) | stub; method and services menu answered 13 Oct; live draft wording logged as working notes | open questions in the doc; wording is Rosie's |
| 5 | [05 Content schema](05-content-schema.md) | draft; project, service and book types seeded; product-card option and vocabulary conflicts added | Other content types, status and visibility vocabularies |
| 6 | [04 Technical requirements](04-technical-requirements.md) | draft; hosting amended 23 Oct (GitHub Pages for now); what is actually deployed recorded | Generator, designer-only site, client login host, analytics |
| 7 | [03 Design brief](03-design-brief.md) | draft; six directions of 23 Oct, direction D2 live since 24 Oct, Rosie's 24 Oct steers; nothing confirmed as final | open questions in the doc; conflicts with the 6 and 12 Oct notes |
| 8 | [06 Implementation plan](06-implementation-plan.md) | draft; Phase 0 happened differently from the plan (D2 went live instead of the interim page); versions kept as options | Versions, build order for the full site |

| Doc | Answers | Common name elsewhere |
|---|---|---|
| 00 | What content exists and what is missing? | Content inventory / audit |
| 01 | What is the site for, who is it for, what must it do? | PRD |
| 02 | What pages exist and how does a visitor move between them? | Sitemap, page tables, user flows |
| 03 | What should it look and feel like, and what is off-limits? | Design brief / design system |
| 04 | What is it built with and hosted on? | Tech spec + ADRs |
| 05 | What shape is each piece of content, and who can see it? | Data model / content model |
| 06 | In what order do we build it? | Build plan / roadmap |
| 07 | What do the words say? | Copy deck |

## How to work these

- Each doc leans on the ones before it in the order above.
- First job of each doc is to **gather what's already decided** (chats, `CLAUDE.md`, `design-system/`, `docs/`), not to start from zero.
- Anything not yet decided stays as `TBD`. Don't invent answers to fill a gap. Where two sources disagree, mark the conflict; don't resolve it.
- Design, colour and copy choices are Rosie's. Agents gather, structure and flag.
- Keep them short. This is a studio/portfolio site, not an app.

## Where the set comes from

A widely shared "before you vibe-code" checklist gave six documents (product requirements, app flow, design brief, technical requirements, content schema, implementation plan). Each is a standard document type in product and software teams. The content inventory and page tables come from content strategy practice (Kristina Halvorson, Brain Traffic); the copy doc follows from them. We are borrowing the set rather than inventing one. Limit of the borrow: the checklist is written for software apps, so the parts about backends and user accounts apply only if the client area (epoch#707) is built.

## One version of each doc, options kept open as options

Rosie, 25 Oct 2026: keep progressive elaboration, notes, options and sketches inside this one planning set, not in loose files or on side branches. The convention:

- **One version of each doc** on `main`. A branch or a PR only ever carries a change to these docs, and merges quickly. Nothing is kept in a second copy.
- **Decided** things sit in the doc's decision tables, with date and who decided. Only Rosie moves a row to decided.
- **Options** sit under an `Options` heading in the doc they belong to, each with what it claims and what it is bad at. An option stays an option until Rosie picks.
- **Working notes** (sketches, links, half-formed ideas, what an agent found) sit under a `Working notes` heading at the end of the relevant doc, dated, with their source.
- **Conflicts** are marked `Conflict:` where two sources disagree, and are not resolved here. Design, colour and copy are Rosie's.
- **Links to private work** (issues, design records, sketchbooks in other MangroveFutures repos) are written as plain references such as `home#372`, not copied. This repo is public: nothing about clients beyond what [01](01-product-requirements.md) already names, and no health, money or login detail.

Where each doc's options and working notes live:

| Topic | Doc and heading |
|---|---|
| Versions of the site (v0, v1, later) | [01](01-product-requirements.md), "Options: versions of the site" |
| Designer-only site | [01](01-product-requirements.md), "Options: a design-only site" |
| What Rosie wants on the site (16 Oct wish list) | [01](01-product-requirements.md), "Working notes: the 16 Oct wish list" |
| Studio presentation (about 20 products) | [02](02-app-flow.md), "Options: how the Studio shows its work" |
| The live page against the decided shape | [02](02-app-flow.md), "Conflict: the live page" |
| Six directions (A to F), D2 and the 24 Oct steers | [03](03-design-brief.md), "Options" and "Working notes" |
| Hosting, domain, what is deployed | [04](04-technical-requirements.md), "What is deployed" |
| Product cards, vocabularies | [05](05-content-schema.md), "Options" |
| Assets that could feed the site | [00](00-content-inventory.md), "Working notes: assets" |
| What happened to the build plan | [06](06-implementation-plan.md), "What actually happened" |

## Related files

- `docs/technical-briefing.html`: briefing for a graph/database conversation. The repo is public and GitHub Pages serves every file in it, so this briefing is publicly readable; a claude.ai copy of the same briefing is marked "not a public document" (home asset inventory, 16 Oct 2026). Whether it should stay is flagged for Rosie in [04](04-technical-requirements.md).
- `docs/adr/0001-host-on-cloudflare-with-the-domain-at-ionos.md`: hosting decision, amended 23 Oct 2026.
- `drafts/2026-10-23-direction-d2/`: Cooper's direction D2 as drafted, with its provenance file. The same page is now the front page at the repo root; the old front page is in `archive/2026-10-old-site/`.
- `design-system/`: tokens and components, once the design brief is settled.
