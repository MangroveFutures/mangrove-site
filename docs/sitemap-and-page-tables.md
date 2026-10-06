---
id: doc-sitemap-page-tables
title: Sitemap and page tables — mangrove.org.uk
status: draft — to be reviewed with Rosie
updated: 2026-10-06
method: Sitemap / information architecture, plus page tables (content-first design; Kristina Halvorson / Brain Traffic page tables; also known as content templates)
depends_on: docs/content-inventory.md (C-xx IDs)
---

# Sitemap and page tables

A page table lists, for one page: its purpose, its audience, the content slots in order, and the action we want the reader to take. Slots point at rows in the content inventory (C-xx), so content is chosen from what exists rather than written fresh.

## Decisions so far

| Date | Decision | By |
|---|---|---|
| 2026-10-06 | v1 is a **single scrolling page**: hero, three doors, selected work, services, contact (option B of A/B/C) | Rosie |

## Open questions (to settle before or during build)

1. **Section names.** Two sets exist:
   - IDX: Lab · Work · Writing · Services
   - D1/D2: Research · Studio · Services · About (+ Products as a layer)
2. **Artist / tech split** (D1): one site, two strands within the site, or separate sites using the extra domains (human-general-intelligence.com, hybrid-general-intelligence.com, hyperthick.com)?
3. **Which 3–4 projects** go in v1 selected work? Candidates are C-30 to C-37 plus any from 3b that have a visual ready.
4. **Which hero line**: C-02, C-04, C-05, or something new?
5. **Clients named publicly** (C-80): which, if any, have agreed?
6. **Contact route** (C-72, C-95): email only, booking link, or form?

## Sitemap

### v1 (now)
```
/  (one scrolling page)
├── Hero
├── Three doors
├── Selected work
├── Services
├── About (short)
└── Contact
```

### Later (next 1–2 weeks, to be confirmed)
```
/
├── /research (or /lab)      papers, programme, interactive papers
├── /studio (or /work)       index of projects → one page per project (project schema)
├── /writing                 books, essays
├── /services                menu, who for, testimonials, call booking
└── /about                   Rosie, the agent team, how the site was made
```

## Page table template

| Field | Content |
|---|---|
| Page | |
| Purpose | what this page must do |
| Audience | who reads it (e.g. person met at an event, prospective client, researcher) |
| Primary action | the one thing we want them to do |
| Slots | ordered blocks, each pointing to inventory IDs |
| Gaps | content that doesn't exist yet |
| Status | draft / reviewed / approved |

## Page table: v1 home (one scrolling page)

| Field | Content |
|---|---|
| Page | / |
| Purpose | Let someone met at an event understand what Mangrove is, see that the work is real, and get in touch |
| Audience | to confirm — event contacts, prospective clients, collaborators |
| Primary action | to confirm — email or book a call |
| Status | draft |

| # | Slot | Candidate content (inventory IDs) | Notes / gaps |
|---|---|---|---|
| 1 | Hero | C-01; one of C-02 / C-03 / C-04 / C-05 | Open question 4 |
| 2 | Three doors | names per open question 1; one line each from C-10/C-12 (research), C-06/C-31 (studio), C-61/C-63 (services) | |
| 3 | Selected work | 3–4 of C-30 to C-37 | Open question 3; needs one image per project |
| 4 | Services | C-61, C-63, then a short menu from C-64 to C-69 | C-60 intro is a gap |
| 5 | Proof | C-80 and/or C-81 | Permission and quotes are gaps; may skip in v1 |
| 6 | About | C-90, C-92 | Short |
| 7 | Contact | C-95 / C-72 | Open question 6 |

## Change log

- 2026-10-06 — created from claude.ai planning session; v1 shape recorded.
