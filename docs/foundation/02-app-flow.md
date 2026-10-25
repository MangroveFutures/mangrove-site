---
id: foundation-02-app-flow
title: App flow (sitemap, page tables, user flows)
status: draft; v1 shape decided 13 Oct 2026; options and a conflict with the live page added 25 Oct 2026
updated: 2026-10-25
method: Sitemap / information architecture, plus page tables (content-first design; Kristina Halvorson / Brain Traffic page tables, also known as content templates)
depends_on: 00-content-inventory.md (C-xx IDs), 01-product-requirements.md
---

# 2 · App flow

**Answers:** what pages exist, and how a visitor moves between them, page by page.

A page table lists, for one page: its purpose, its audience, the content slots in order, and the action we want the reader to take. Slots point at rows in [00-content-inventory.md](00-content-inventory.md) (C-xx), so content is chosen from what exists rather than written fresh.

## Decisions so far

| Date | Decision | By |
|---|---|---|
| 6 Oct 2026 | v1 is a single scrolling page. **Replaced on 13 Oct (below).** | Rosie |
| 13 Oct 2026 | **v1 is five pages: Lab, Studio, Services, Writing and About**, with a front page of three doors (Lab, Studio, Services). No lead audience; each space speaks to its own people. | Rosie, in session |
| 13 Oct 2026 | **One site, mangrove.org.uk**, perhaps with a different look, feel or layout per space. The other domains are not separate doors for now. | Rosie |
| 13 Oct 2026 | **Hero line:** "Independent research lab & studio: human, AI, and the space between." (C-03) | Rosie |
| 13 Oct 2026 | **Studio selected work:** Choreotope (the murmuration and movement engine, Benesh and murmuration visuals), Epoch, data art and sculpture, and the design and software portfolio Cooper is building (about 20 apps and products, including WingMan, Mindsweeper, Sketchin and Would You Rather). | Rosie |
| 13 Oct 2026 | **Writing becomes a reading room:** a selection of papers and essays (essays may link to Substack) and the books in development. | Rosie |
| 13 Oct 2026 | **Contact is email.** Clients and advisors may be named (list in [01](01-product-requirements.md)). The clients-only area is on the same site, after v1. | Rosie |

## Conflicts

All four conflicts recorded on 13 Oct are now settled by the decisions above: page count (five pages), section names (Lab, Studio, Services, plus Writing and About), doors (three), and order (services first, with the portfolio as proof, per 01).

## Open questions

1. How the Studio shows about 20 products without becoming a wall. **Rosie, 13 Oct 2026: Cooper proposes two or three directions** (her portfolio work, home PR #220, feeds this).
2. Does each space get its own look, feel or layout, and how far apart? (Goes to the design brief, [03](03-design-brief.md), and Cooper.)
3. Which papers and essays go in the reading room for v1, and which books are shown, and how (cover, status, a sample)?
4. Where the clients-only area sits in the map after v1, and whether it shares the public navigation (depends on [04](04-technical-requirements.md)).

## Conflict: the live page against the decided shape

Marked on 25 Oct 2026, not resolved. The front page on `main` (Cooper's direction D2, from 24 Oct) is not the shape decided on 13 Oct.

| Point | Decided 13 Oct 2026 | Live page on `main` |
|---|---|---|
| Page count | Five pages plus a front page of three doors | One scrolling page |
| Sections | Lab, Studio, Services, plus Writing and About | Research, Studio, Services, then "Write to us" (the email). No Writing or About. |
| First section name | Lab | "Research" (Cooper's interim page used it because the Lab page did not exist; her 23 Oct question 3 asked Rosie "Research or Lab?" and no answer is recorded) |
| Hero line | "Independent research lab & studio: human, AI, and the space between." (C-03) | "A speculative design studio and research lab." |
| Navigation | A front page of doors | In-page anchors only |

Two readings, for Rosie: the live page is v0.5 on the way to the decided v1 (see [01](01-product-requirements.md), "Options: versions of the site"), or the one-page shape is worth keeping. Not decided.

## Options: how the Studio shows its work

Open question 1 below: about 20 products without a wall. Rosie, 13 Oct: Cooper proposes two or three directions. Cooper's sketches of 16 Oct 2026 are the nearest thing so far; they are in the home repo on the unmerged branch `cooper/2026-10-16-studio-section-notebook` (design records dated 16 Oct, sketches under `design/sketchbook/2026-10-16-studio-section/`), written mainly for the private Studio room in the Epoch app, with two pages for the public site. All status "waiting for Rosie". Nothing is chosen.

| Option | What it claims | Limits (Cooper's notes where she states them; "reading" marks the compiler's own) |
|---|---|---|
| **Door plus lights** (sketch 08) | The murmuration is the page; named lights open a short list (the five newest pieces, then "all"); a piece opens an inspect sheet. | Reading: the round-1 sibling (a flock of lights) showed names only on hover or focus, so on a phone you tap to find out. |
| **Carousel of product cards** (sketches 06 and 07) | One card in focus at a time; each card is a generated motion from the product's own subject, a name, one-word status and a collapsed "More". Unfilled products are a dashed frame with only a name, never invented content. | Reading: a carousel hides all but one card; fifteen to twenty means a lot of swiping. Cooper's notes list the cards as 8 with real material and 7 name-only frames. |
| **Spaces behind one door** (proposal) | Two or three spaces, each a different view of the same catalogue: Cinema (films), Greenhouse (living pieces such as the flock), Drawing office (versions, notation, sketchbooks). Cooper's recommendation was Cinema first. | Cooper: the risk is three half-built spaces; build one fully, with the door and switcher, before a second. |
| **Version tree** (round 1, sketch 02) | Murmuration versions laid out as a family tree, so versions show how they relate without opening anything. | Cooper: wide and tall, so on a phone you scroll both ways; the lineage was read from file names, not checked in the code. |

Rosie's reactions on 16 Oct 2026 to the first round: closer on the first option, but "this all feels super vibe code again", the serif "is everywhere", no round pills, and the Studio page should be calm with the murmuration as the background (home#383). Later rounds dropped the serif and the pills. Her ask for the room itself: it "should be art, not a monday.com page". Those rules (one thing on screen at a time, nothing ever disappears, no counts or dates on everything) are in [03](03-design-brief.md), "Working notes".

The card fields and the product list are in [05](05-content-schema.md), "Options: a product card".

## Sitemap

### v1 (decided 13 Oct 2026)
```
/            Front page: hero line + three doors
├── /lab       research, programme, papers
├── /studio    selected work; the portfolio of about 20 products
├── /services  the menu, who it is for, testimonials, email
├── /writing   the reading room: papers, essays (some on Substack), books in development
└── /about     who we are, advisors, how the site was made
```
The 6 Oct single scrolling page is replaced.

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

## Working notes: what is live, as a one-page sitemap (24 Oct 2026)

For reference, the page on `main` as built (`index.html`): `/` with anchors `#research`, `#studio`, `#services`, `#write`; the email link; a skip link to the email; a light and dark toggle; and, for visitors who ask for reduced motion, a still frame. The old front page is at `/archive/2026-10-old-site/`. Cooper's draft with its provenance is at `/drafts/2026-10-23-direction-d2/`. GitHub Pages serves all of these, including the draft folder, so they are public.

## Key journeys

Pick two or three and trace them click by click.
Rosie chose three to trace first (13 Oct 2026):
1. **A prospective client** looking for a workshop, a setup or 1:1 work, who ends by sending an email. TBD, click by click.
2. **A friend's link:** a stranger opens a link a friend sent and must understand Mangrove in about ten seconds. TBD.
3. **One-project arrival:** someone lands on one project page from a shared link. TBD.

Later: a collaborator checking out the Lab.

## Change log

- 13 Oct 2026: Q&A round 1 answered by Rosie; v1 becomes five pages; conflicts settled; new open questions.

- 6 Oct 2026: sitemap and page tables created from a claude.ai planning session; v1 shape recorded.
- 12 Oct 2026: placeholder app-flow doc seeded.
- 13 Oct 2026: the two merged into this file; conflicts marked, none resolved; question 8 added from epoch#707 and epoch#710.
- 25 Oct 2026: the live page recorded as a conflict with the decided shape; Studio options from Cooper's 16 Oct sketches added; no decision changed.
