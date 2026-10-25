---
id: foundation-06-implementation-plan
title: Implementation plan (build order)
status: draft; Phase 0 happened differently from the plan, recorded below; Phase 1 order kept as options
updated: 2026-10-25
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

### What actually happened to Phase 0 (recorded 25 Oct 2026)

Plan against fact, with the PRs. Nothing here is a judgement; Rosie decides whether the change of route was right.

| Date | What happened | PR |
|---|---|---|
| 23 Oct | Cooper ran a Figma design night (six directions A to F) for the interim page; the interim page itself was built as a placeholder. Rosie chose D, with E's lettering and B's text, and asked for more depth and texture. Cooper built direction D2 in three.js as a draft with provenance. | #9, #10 |
| 24 Oct | The `CNAME` for `mangrove.org.uk` was added (GitHub Pages custom domain). The old front page was archived and the interim placeholder removed. D2 became the front page. | #11, #12, #13 |
| 24 Oct | Rosie's steers on the flock, toggle, headings and links (calmer, larger, flowing; light and dark toggle; no Sources link), then a rebuild of the flock on Choreotope's own engine and a second round. Detail in [03](03-design-brief.md), "Working notes". | #14 to #20 |
| 25 Oct | Rosie's answers on purpose, a design-only site, the other domains and versions recorded. | #21 |
| 25 Oct | These docs brought up to date and the unmerged branches folded in. | this change |

Against the Phase 0 steps above: step 1 produced a page that was never deployed; step 2 became Rosie reacting to six designs, then to the built D2; step 3 went to GitHub Pages directly, not a `pages.dev` preview; step 4 is partly done (the `CNAME` and the register's A record; the `www` record, the redirect and the test email to `info@` are not recorded anywhere); step 5 was done by Cooper in Chromium at 390, 768 and 1440 px and for reduced motion and no JavaScript, but PR #19 says nobody has felt it on an iPad.

**Conflict:** the plan said hosting would be Cloudflare Pages; ADR-0001 was amended on 23 Oct to GitHub Pages for now, so the plan text above is out of date on that point. The plan also did not foresee two things now live: a 3D flock built on the Choreotope engine (a heavier page than the 2D placeholder) and a public `drafts/` folder.

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
The interim page above. **Update 25 Oct 2026:** that smallest version is now the one-page D2 on `main` ([01](01-product-requirements.md), "Options: versions of the site").

## Options: what to build after the one-page front page

Not decided; Rosie wants to talk through versions first ([01](01-product-requirements.md)). The order below is only the order the foundation docs imply.

1. **Fill the gaps in the content first** (the README order): reconcile the inventory ([00](00-content-inventory.md)), the shape ([02](02-app-flow.md)) and the copy ([07](07-copy.md)) with what is live, then add pages. Services first, with the portfolio as proof (13 Oct).
2. **Add the Services page first** as one more page beside the front page, since services come first this month (13 Oct) and the copy method (interview) is decided. Prices come from the strategy session recorded in [07](07-copy.md).
3. **Design the Studio room first** (about 20 products), since it is the open design question and Cooper's sketches exist ([02](02-app-flow.md)).
4. **Do hosting for the client area first** if the clients-only page is the next thing that earns ([04](04-technical-requirements.md), "Options").

Reverting is cheap: PR #19 notes the flock change reverts in one click, and the old front page stays in `archive/2026-10-old-site/`.
