---
id: foundation-01-prd
title: Product requirements (PRD)
status: draft; Q&A answered 13 and 25 Oct 2026; options and working notes added 25 Oct 2026
updated: 2026-10-25
---

# 1 · Product requirements

**Answers:** what is the site for, who is it for, and what must it do — feature by feature.

## Purpose
- Public website for Mangrove Research at mangrove.org.uk.
- Doubles as proof of method: what's on the site was made with Mangrove's own tools and partners.
- **Main job this month (Rosie, 13 Oct 2026, in session): both.** Services come first, with the portfolio as proof that the work is real.
- **The one thing a visitor leaves knowing (Rosie, 13 Oct 2026): all three of these, as a starting point, one per space:**
  - Lab: "an independent research lab: client work funds the research, and everyone benefits from what we learn".
  - Studio: "a speculative and applied R&D studio" (Rosie's line, interim website doc, 27 Aug 2026).
  - Services: "we help organisations and people get their systems working, with AI as part of that".
  Wording is a first draft; it is refined in [07 copy](07-copy.md).

## Audiences

**First audiences (Rosie, 13 Oct 2026, in session):**
1. Small businesses.
2. Organisations: charities, arts, corporate.
3. Individuals: coaches, consultants, ADHD folk.
4. Friends in sales who will introduce her. They pass the link on, so the site has to make sense to someone who has never spoken to Rosie.

**No lead audience on the front page (Rosie, 13 Oct 2026):** the front page is three doors, one per space, and each space speaks to its own people.

**One site, mangrove.org.uk (Rosie, 13 Oct 2026),** perhaps with a different look, feel or layout for each space. The other domains are not separate front doors for now. The 12 Oct framing in epoch#668 asks for the question to be answered four ways first: by relationship to Mangrove (hire, fund, collaborate, read, buy), by job to be done (Christensen / Ulwick), by persona (Cooper) built from real people, and by arrival route (a talk, a referral, a link to one project, a search). Working-out goes in epoch#668; answers land here.

## Sections

**The three spaces (Rosie, 13 Oct 2026): Lab · Studio · Services.** This settles the naming conflict noted in [02](02-app-flow.md): "Work" becomes Studio. Writing and About get a page each, alongside the three spaces (Rosie, 13 Oct 2026).

The 12 Oct table, for reference:
| Section | Scope |
|---|---|
| Lab | Research and theory, papers, funding note |
| Work | Portfolio of tools and apps with honest status labels |
| Writing | Essays and the book |
| Services | Workshops and 1:1 work; testimonials |

Also mentioned: a "who we are" area with advisors and quotes. TBD whether it is a fifth section or part of Lab/Services.

## Features (feature by feature)
| Feature | Must / should / later | Notes |
|---|---|---|
| Boids murmuration hero with cursor interaction | must | Placeholder until Choreotope content is shareable |
| Work entries from one shared template | must | See content schema |
| Full-screen swipeable hero per key project | TBD | |
| Project detail pages | TBD | |
| Testimonials | must | Source material in chat logs; see C-80 to C-83 |
| Advisors with quotes | must | Rosie, 13 Oct 2026: the list is in the logs and Google files; an agent is finding it |
| Contact / enquiry route | must | Email (Rosie, 13 Oct 2026) |
| Choreotope preset player | later | |

## Who may be named (Rosie, 13 Oct 2026)

Clients and people who are fine being listed: Space Intelligence, TDC PR, Rebecca Edelman, and Wychwood Tree Surgery (Dean Tucker). Advisors are listed too, because they show value (Rosie, 13 Oct 2026): **Clive Grinyer, Kam Chana, Christina Liciaga, Ed Greig, Larry Jones and Oli Pocknell.** Rosie says images and quotes exist for all six; where they live is being found. Bios are written fresh for Rosie to check, not reused from old AI drafts, several of which were wrong.

## Answered on 13 Oct 2026
- One thing to leave knowing: see Purpose.
- Lead audience: none; three doors.
- One site or several: one site.
- Next step for a visitor: email.
- Naming clients: yes, the four above; advisors too.
- What introducers send: just the link, so the front page must work cold for someone who has never met Rosie.
- Writing and "who we are": a Writing page and an About page each, alongside the three spaces.
- Clients-only area (epoch#707, epoch#710): same site, built after v1.
- Success a month from now: enquiry emails, introductions made, and paid work started from the site. Not counted formally: judged by feel for the first month (Rosie, 13 Oct 2026).
- Sign-off of listings and quotes: not needed again. The people named agreed when they were on the old Squarespace site, which held the details; the quotes are likely also in Google Docs (Rosie, 13 Oct 2026). The Squarespace text is not yet recovered (see [00](00-content-inventory.md) section 9), so the quotes have to come from that export or the Google Docs.

## Answered on 25 Oct 2026 (pop-up Q&A, recorded by the coordinating session)
- What mangrove.org.uk is for first: mostly the studio front door (research and services), still being worked out through these foundation docs.
- A design-only site for Rosie as a designer: not decided. Options logged: its own domain; a section of this site (Studio); a subdomain microsite from this repo.
- The human- and hybrid-general-intelligence domains: no purpose yet. Agents propose uses as they find them in the logs and the work. The domain list and renewal dates live in epoch `docs/ops/stack-and-subscriptions.md` (Domains section).
- Versions of the site: Rosie wants to talk this through rather than pick an option. Open.

## Open questions for Rosie

- Versions of the site (v0 interim page, v1 five pages, later): how Rosie pictures them. Raised 25 Oct 2026. Options below; she wants to talk it through, not pick from a list.
- Designer-only site: separate or part of this one. Raised 25 Oct 2026. Options below.
- The 16 Oct wish list against the five-page v1: which items are v1, which are later, which belong in Lab, Studio or Services. See "Working notes: the 16 Oct wish list" below.
- **Conflict (wording, for Rosie to confirm):** 13 Oct says the main job this month is services first, with the portfolio as proof. 25 Oct says the site is "mostly the studio front door (research and services)". They may be the same thing said two ways; not resolved here.

## Options: versions of the site

Rosie, 25 Oct 2026: she wants to talk this through. What the record holds, so the talk starts from facts. No option is chosen.

| Version | What it is | State on 25 Oct 2026 |
|---|---|---|
| v0 | A simple, lovely interim page so the domain shows something real. Rosie, 23 Oct: a simple page now beats nothing. | Planned as `interim/index.html`; never deployed. It was removed on 24 Oct (PR #12) and Cooper's direction D2 became the front page instead (PR #13). See [06](06-implementation-plan.md), "What actually happened". |
| v0.5 (what is on `main`) | One scrolling page: wordmark, tagline, Research, Studio, Services, Write to us (the email). Flock hero, light and dark toggle. | On `main` since 24 Oct 2026, with refinements to 24 Oct (PRs #14 to #20). The domain's DNS points at GitHub Pages (epoch domains register, 25 Oct 2026); not checked from this session that it resolves. |
| v1 | Five pages: Lab, Studio, Services, Writing, About, with a front page of three doors. | Decided 13 Oct 2026 ([02](02-app-flow.md)). Not built. Copy and content gaps in [00](00-content-inventory.md) and [07](07-copy.md). |
| Later | Clients-only area on the same site; the private wiki section; per-project pages; the rest of the 16 Oct wish list. | Not started. |

Ways the versions could relate (options, not a plan):

1. **Grow the one page.** The front page keeps being one scrolling page; Lab, Studio and Services become sections, then pages when each has enough content. Cheapest; the live look carries on.
2. **Switch at v1.** Keep v0.5 as it is until the five pages are ready, then replace in one move, with v0.5 kept viewable in `archive/`.
3. **Several versions viewable at once.** Keep every version reachable (the old page already sits in `archive/2026-10-old-site/`, the drafts in `drafts/`), so Rosie can open any version and compare. Cooper's Epoch app work proposes a "Versions sheet" for this; see [03](03-design-brief.md), "Working notes".

## Options: a design-only site for Rosie as a designer

Rosie, 25 Oct 2026: not decided. The three logged options, with what each implies:

1. **Its own domain.** Cleanest separation from Mangrove. A new domain is a new standing item to hold and renew (the epoch domains register, a draft of 25 Oct 2026, lists "a design-only site" among ideas being weighed, none bought).
2. **A section of this site (Studio).** No new hosting. Risk: it blurs the Studio's job as the studio front door and may dilute both.
3. **A subdomain microsite from this repo** (for example a `design.` subdomain). One repo and one design system; needs a DNS record at the registrar and a Pages custom domain. Risk: GitHub Pages serves one custom domain per repo, so a second name would mean a second repo or a different host. Check before choosing.

## Working notes: the 16 Oct wish list

Source: Rosie, 16 Oct 2026, relayed in home#372 (public website and design projects: discovery, inventory and an asset library). Captured in her words, tidied; not groomed. Kept here so it sits next to the v1 decisions it has to be reconciled with.

What she wants on the public website: the torus; the choreotope; a stronger Benesh; a design portfolio; a software catalogue focused on Mangrove and Epoch; early-access contact for Epoch; services pages (training, action research, productised work such as latent intelligence and failure-demand mapping, one-to-one coaching, C-suite packages, founder and entrepreneur packages for systems and AI, workshops on Google and Claude); research with key papers and the book pre-order; podcasts and the way they are made; a Substack link; testimonials and adviser quotes; the design studio as an entry point; 3D interface demos with client details anonymised; a client portal as a separate login.

Also from her: a full-screen "wow" home page animation (options named: the choreotope murmurations with networks, a torus visual, a new generative network piece; interactive in places, not everywhere), and an asset store that grows over time. On 16 Oct she also asked for her working wiki, now on her old laptop, to come back as a login-protected private section of the site.

Where it meets the decisions already made:

- **Conflict: contact.** 13 Oct says contact is email, no form. The wish list adds an early-access contact for Epoch. Same email, or a separate route?
- **Conflict: client area.** 13 Oct puts the clients-only area on the same site after v1. The wish list adds a second login-protected area (the wiki). One gate or two? Depends on hosting ([04](04-technical-requirements.md)).
- **To place:** the torus, the choreotope and Benesh (Lab, Studio, or both?), the podcasts, the Substack link (the reading room links to it, per [07](07-copy.md)), and the software catalogue (Studio's "about 20 products", [02](02-app-flow.md)).
- **Already answered in practice:** the "wow" home page became Cooper's direction D2, a Choreotope-style flock ([03](03-design-brief.md)).
- Method note from the same issue: the standard names are discovery, content audit and inventory, information architecture, creative brief, moodboard, asset library and design tokens. The foundation docs cover discovery, the inventory, the structure and the brief; the asset library is the open piece ([00](00-content-inventory.md), "Working notes: assets").


## Out of scope for v1
- The clients-only area (after v1).
- Separate sites on the other domains.

## How we'll know it's working
Signs to look for in the first month, judged by feel, not counted (Rosie, 13 Oct 2026):
- Enquiry emails that arrived through the site.
- Introductions friends made by sending the link.
- Paid work that started from a site visit.
