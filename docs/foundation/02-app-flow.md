---
id: foundation-02-app-flow
title: App flow (sitemap, page tables, user flows)
status: placeholder, partly seeded (merges the 12 Oct placeholder and the 6 Oct sitemap draft)
updated: 2026-10-13
method: Sitemap / information architecture, plus page tables (content-first design; Kristina Halvorson / Brain Traffic page tables, also known as content templates)
depends_on: 00-content-inventory.md (C-xx IDs), 01-product-requirements.md
---

# 2 · App flow

**Answers:** what pages exist, and how a visitor moves between them, page by page.

A page table lists, for one page: its purpose, its audience, the content slots in order, and the action we want the reader to take. Slots point at rows in [00-content-inventory.md](00-content-inventory.md) (C-xx), so content is chosen from what exists rather than written fresh.

## Decisions so far

| Date | Decision | By |
|---|---|---|
| 6 Oct 2026 | v1 is a **single scrolling page**: hero, three doors, selected work, services, contact (option B of A/B/C). | Rosie |

Nothing else here is decided.

## Conflicts (marked, not resolved)

1. **Page count.** The 12 Oct placeholder sitemap has seven kinds of page (home, lab, work, project pages, writing, services, contact). The 6 Oct decision is one scrolling page for v1, with separate pages "later". Read the 12 Oct tree as the *later* shape, not v1, until Rosie says otherwise.
2. **Section names.** Two sets exist and neither is chosen.
   - IDX (`index.html`, 12 Oct tree): Lab, Work, Writing, Services.
   - D1/D2 (Drive docs, 6 Oct tree): Research, Studio, Services, About (with Products as a layer).
   The two later trees below differ for the same reason: `/lab` vs `/research`, `/work` vs `/studio`, and Writing and Contact present in one but not the other.
3. **Number of doors.** The 6 Oct decision says "three doors". The IDX page has four sections. Which three (or four) is open (question 1).
4. **"Services first, portfolio as proof"** (Rosie, 13 Oct, see [01](01-product-requirements.md)) may change the order of the v1 slots below. Not yet applied.

## Open questions

1. Section names, and how many doors (conflicts 2 and 3).
2. **Artist / tech split** (D1): one site, two strands within one site, or separate sites on the extra domains (human-general-intelligence.com, hybrid-general-intelligence.com, hyperthick.com)? Linked to the audience question in [01](01-product-requirements.md): does each audience need its own front door?
3. Which 3 or 4 projects go in v1 selected work? Candidates are C-30 to C-37, plus any from inventory 3b that have a visual ready.
4. Which hero line: C-02, C-03, C-04, C-05, or something new?
5. Which clients, if any, are named publicly (C-80)? Permission is not confirmed.
6. Contact route (C-72, C-95): email only, booking link, or form? (12 Oct list also asks: page, form, or email link.)
7. Do writing pieces live on the site or link out (`/writing/<piece>`, 12 Oct)?
8. Client-only pages: a gated area has been asked for in epoch#707 and epoch#710 (Collision Unknown first). Where does it sit in the map, and does it share the public pages' navigation? Depends on hosting ([04](04-technical-requirements.md)).

## Sitemap

### v1 (decided 6 Oct)
```
/  (one scrolling page)
├── Hero
├── Three doors
├── Selected work
├── Services
├── About (short)
└── Contact
```

### Later, draft A (6 Oct, "next 1-2 weeks, to be confirmed")
```
/
├── /research (or /lab)      papers, programme, interactive papers
├── /studio (or /work)       index of projects → one page per project (project schema)
├── /writing                 books, essays
├── /services                menu, who for, testimonials, call booking
└── /about                   Rosie, the agent team, how the site was made
```

### Later, draft B (12 Oct placeholder, "confirm or change")
```
/                 Home: hero + entry to the four sections
/lab              Research, papers
/work             Portfolio index
/work/<project>   One page per project (from the shared template)
/writing          Essays, the book
/writing/<piece>  TBD, on-site or links out?
/services         Workshops, 1:1, testimonials
/contact          TBD, page, form, or just an email link?
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
| Audience | to confirm. 6 Oct: event contacts, prospective clients, collaborators. 13 Oct first audiences are in [01](01-product-requirements.md) |
| Primary action | to confirm: email or book a call |
| Status | draft |

| # | Slot | Candidate content (inventory IDs) | Notes / gaps |
|---|---|---|---|
| 1 | Hero | C-01; one of C-02 / C-03 / C-04 / C-05 | Question 4 |
| 2 | Three doors | names per question 1; one line each from C-10/C-12 (research), C-06/C-31 (studio), C-61/C-63 (services) | |
| 3 | Selected work | 3 or 4 of C-30 to C-37 | Question 3; needs one image per project |
| 4 | Services | C-61, C-63, then a short menu from C-64 to C-69 | C-60 intro is a gap |
| 5 | Proof | C-80 and/or C-81 | Permission and quotes are gaps; may skip in v1 |
| 6 | About | C-90, C-92 | Short |
| 7 | Contact | C-95 / C-72 | Question 6 |

## Page by page (later pages)

| Page | What's on it | Leads to | Main action |
|---|---|---|---|
| Lab | TBD | | |
| Work | TBD | | |
| Project page | TBD | | |
| Writing | TBD | | |
| Services | TBD | | |

## Key journeys

Pick two or three and trace them click by click.
- TBD: a prospective client looking for a workshop or 1:1 work
- TBD: a friend in sales passing the link to someone who might hire Rosie (new, from 13 Oct audiences)
- TBD: a collaborator checking out the research
- TBD: someone arriving from a link to one project

## Change log

- 6 Oct 2026: sitemap and page tables created from a claude.ai planning session; v1 shape recorded.
- 12 Oct 2026: placeholder app-flow doc seeded.
- 13 Oct 2026: the two merged into this file; conflicts marked, none resolved; question 8 added from epoch#707 and epoch#710.
