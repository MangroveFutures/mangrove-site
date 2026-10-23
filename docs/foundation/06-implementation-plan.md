---
id: foundation-06-implementation-plan
title: Implementation plan (build order)
status: placeholder
updated: 2026-10-13
---

# 6 · Implementation plan

**Answers:** in what order we build it. Written last, once the other docs have their gaps filled.

The live plan is tracked as GitHub issues in epoch; this doc is the readable summary and links to them.

## Already done
- Repo, `CLAUDE.md`, Boids hero, four sections with placeholder content (Sept 2026).
- Docs link check in CI.

## Build order (written 23 Oct 2026, a draft for Rosie)

Two phases. Rosie's rule for this: a lovely, simple page now is better than nothing; the full site follows the foundation docs in their order (see [README](README.md)).

### Phase 0: the interim page, live over the weekend of 24 and 25 Oct 2026
| Step | What | Who | Status |
|---|---|---|---|
| 1 | Build `interim/index.html`: the flocking hero where the visitor's mouse or finger is a falcon, a short "studio, research, services" explanation, and `info@mangrove.org.uk`. | Claude | Done 23 Oct 2026; checked at 390 px and 1440 px, no sideways scroll, no script errors |
| 2 | Rosie reads it and edits the words (the copy is a draft, hers to change). | Rosie | Open |
| 3 | Deploy to a free `pages.dev` address and look at it there. Going public needs Rosie's yes. | Claude | Waiting on step 2 |
| 4 | Point `mangrove.org.uk` at it: copy IONOS DNS records (mail first), leave the nameservers at IONOS, add `www.mangrove.org.uk` as a Pages custom domain, add the `www` CNAME at IONOS, set an IONOS redirect from the bare domain to `www`, send a test email to `info@`. See [ADR-0001](../adr/0001-host-on-cloudflare-with-the-domain-at-ionos.md). | Rosie (IONOS login) with Claude | Open |
| 5 | Check the finished site on a phone, and that the animation stops for visitors who ask for reduced motion. | Claude | Open |

### Phase 1: the full site
Follow the foundation docs in the order in the README table (content first). Design work runs through Cooper and the `design-job` skill: Figma explorations, a design record in `epoch/design/records/`, tokens into `design-system/`. Shape the build order here once docs 00 to 03 have their gaps filled.

## How this is documented (the set we keep)
| Question | Where it is answered |
|---|---|
| What is the site for and who for? | `01-product-requirements.md` (a PRD) |
| What pages, how do people move? | `02-app-flow.md` (sitemap and flows) |
| What does it look like? | `03-design-brief.md`, `design-system/`, Cooper's design records and Figma files |
| What is it built on and where does it run? | `04-technical-requirements.md` and ADRs in `docs/adr/` (MADR) |
| What is each piece of content? | `05-content-schema.md` |
| In what order do we build it? | this file |
| What does it say? | `07-copy.md` (Rosie's words) |
| Host, domain, costs? | `epoch/docs/ops/stack-and-subscriptions.md` (the one record of stack and costs) and the credentials register for where logins are held |

## Smallest version worth putting live
The interim page above.
