---
id: foundation-index
title: Foundation docs — index
status: placeholder
updated: 2026-10-12
---

# Foundation docs

The six documents to have before building the site. Each one answers a question that otherwise gets guessed at halfway through a build.

| # | Doc | Answers | Common name elsewhere | Status |
|---|---|---|---|---|
| 1 | [Product requirements](01-product-requirements.md) | What is the site for, who is it for, what must it do? | PRD | placeholder, partly seeded |
| 2 | [App flow](02-app-flow.md) | What pages exist and how does a visitor move between them? | Sitemap + user flows | placeholder, partly seeded |
| 3 | [Design brief](03-design-brief.md) | What should it look and feel like, and what is off-limits? | Design brief / design system | placeholder, partly seeded |
| 4 | [Technical requirements](04-technical-requirements.md) | What is it built with and hosted on? | Tech spec + ADRs | placeholder, open decisions |
| 5 | [Content schema](05-content-schema.md) | What shape is each piece of content, and who can see it? | Data model / content model | placeholder, partly seeded |
| 6 | [Implementation plan](06-implementation-plan.md) | In what order do we build it? | Build plan / roadmap | placeholder |

## How to work these

- Order matters: each doc leans on the ones above it. Work them 1 → 6.
- First job of each doc is to **gather what's already decided** (from chats, `CLAUDE.md`, `design-system/`, `docs/`) — not to start from zero.
- Anything not yet decided stays as `TBD`. Don't invent answers to fill a gap.
- Keep them short. This is a studio/portfolio site, not an app.
- Tracked in epoch as an epic with one sub-issue per doc.

## Where the six-doc set comes from

A widely shared "before you vibe-code" checklist. Each item is a standard document type in product and software teams, listed in the table above, so we're borrowing the set rather than inventing one.
