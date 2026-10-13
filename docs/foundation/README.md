---
id: foundation-index
title: Foundation docs — index
status: active index; every doc below is a draft or placeholder
updated: 2026-10-13
---

# Foundation docs

The eight documents to have before building the site. They are the one home for all Mangrove website planning (consolidated 13 Oct 2026 from the 12 Oct placeholders and the 6 Oct content, sitemap and design-brief drafts; nothing is kept twice).

Work them **content first**, in the order of the table (not the file numbers). Tracked in epoch#667, one sub-issue per doc.

| Order | Doc | Status | Question list |
|---|---|---|---|
| 1 | [00 Content inventory](00-content-inventory.md) | draft, rows unreviewed; Squarespace XML text exports still missing | Which rows to keep, rewrite or cut? What gaps (C-xx marked `gap`) block v1? |
| 2 | [01 Product requirements](01-product-requirements.md) | placeholder, first answers 13 Oct | 7 open questions in the doc (one thing to leave knowing, audience order, next step, naming clients, ...) |
| 3 | [02 App flow](02-app-flow.md) | placeholder, v1 shape decided 6 Oct | 8 open questions plus 4 marked conflicts (page count, section names, doors, services-first order) |
| 4 | [07 Copy](07-copy.md) | stub, no wording | 3 open questions; wording is Rosie's |
| 5 | [05 Content schema](05-content-schema.md) | placeholder, partly seeded | Other content types, where content lives, how internal entries are kept off the site |
| 6 | [04 Technical requirements](04-technical-requirements.md) | placeholder, open decisions | Hosting (incl. a client login gate), generator, content source, contact form, analytics |
| 7 | [03 Design brief](03-design-brief.md) | draft, nothing visual decided | 9 open questions; conflicts: dark vs cream, teal, type |
| 8 | [06 Implementation plan](06-implementation-plan.md) | placeholder, written last | Build order, smallest live version |

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

## Related files

- `docs/technical-briefing.html`: briefing for a graph/database conversation.
- `design-system/`: tokens and components, once the design brief is settled.
