---
id: foundation-05-content-schema
title: Content schema (backend schema)
status: draft; Q&A answered 13 Oct 2026; options and vocabulary conflicts added 25 Oct 2026
updated: 2026-10-25
---

# 5 · Content schema

**Answers:** what shape each piece of content takes, where it lives, and who can see it.

For a static site this is a content model rather than a database. If client data ever lives on the site (e.g. enquiries), add it here with who can see it.

## Project entry (already agreed — meant to evolve, don't over-engineer)
| Field | Type | Notes |
|---|---|---|
| title | text | |
| type | one of | Platform, Research, Tool, App, Product, Creative, Writing |
| status | one of | Depends on type — products: On sale / Pre-order / Register interest; tools: Beta / Research interviews open; all: In development / Ongoing |
| visibility | one of | Internal, External |
| hero | media | image, video, embed or audio |
| media | list of media | additional images/video/audio |
| description | text | templated, house style |
| links | list of {label, url} | |
| tools_used | list | |
| process_note | text, optional | case study |
| year | number | |
| tags | list | |

Projects to show first: Epoch, Kronoscope, Choreotope, WingMan, Mindsweeper, Islands of Doc Tomorrow.

Existing content for each project is in [00-content-inventory.md](00-content-inventory.md) (C-30 to C-37, and inventory 3b for projects not yet written up).

## Other content types

### Service (Rosie, 13 Oct 2026)
| Field | Type | Notes |
|---|---|---|
| title | text | |
| who_for | text | the audience line (see 07) |
| first_step | one of | call, diagnostic, quote (07: depends on the service) |
| proof | list of links | a testimonial, project or case study that backs it up |
| description | text | |

No price field for now (prices come after the 14 Oct session; add a field then if they are shown).

### Book (Rosie, 13 Oct 2026)
| Field | Type | Notes |
|---|---|---|
| title | text | |
| cover | media | |
| line | text | one sentence |
| status | one of | Pre-order / In development |
| link | url | pre-order or more |
| sample | text or link, optional | a short readable extract or the essay (e.g. the 12,000 Years essay) |

### Still TBD
- Writing piece (essay; may link to Substack)
- Paper / research entry
- Testimonial (quote, person, role, organisation, link to the service or project it backs)
- Advisor (name, role, photo, quote)

## Where it lives
**Files now, Supabase later (Rosie, 13 Oct 2026):** v1 keeps one small file per entry in this repo. Once epoch's write path exists, entries move to Supabase and the site reads them from there.

## Who sees what
- `visibility: Internal` entries never publish. **Enforced by an automatic check (Rosie, 13 Oct 2026):** the build fails if an internal entry would be published.

## Options: a product card (Cooper, 16 Oct 2026)

Source: home design records dated 16 Oct 2026 ("product card format" and "product inventory"), written for the Studio and the product repos; status "waiting for Rosie". Offered as an alternative way to describe a project entry, for the Studio's list of about 20 products ([02](02-app-flow.md), "Options: how the Studio shows its work").

A card is: (1) a hero motion generated in code from the product's own subject, never stock; (2) name; (3) status, one word; (4) a collapsed "More" holding one sentence and the links. An unfilled product is a dashed frame with only its name and never carries invented content. Per product repo, a set of docs in a fixed order: `README.md` (the card's sentence, the hero, the links), `docs/spec/prd.md`, `design/records/`, `design/brand/` once a brand exists, and `docs/design/01..08` filled when used.

Cooper's inventory counted fifteen products: eight with real material and a generated motion, seven name-only frames.

A second description of the same thing is the product catalogue Cooper was handed on 13 Oct 2026 (home `design/research/product-portfolio-catalogue.yaml`), which proposes the card fields `name, one_line, who_for, problem, status, hero_asset, cta, long_form_link, brand`. Its evidence references are corpus turn ids and Drive file ids; its market notes are marked unverified.

## Conflict: three vocabularies for the same fields

Marked on 25 Oct 2026, not resolved. Vocabularies are meant to be closed, so one has to win.

| Field | Project entry above (agreed earlier) | Cooper's card (16 Oct) | Product catalogue (13 Oct) |
|---|---|---|---|
| Status | Depends on type: products "On sale / Pre-order / Register interest"; tools "Beta / Research interviews open"; all "In development / Ongoing" | One word: sketch, prototype, in build, in use | idea, prototype, live (the home slate also uses sketched and parked) |
| Visibility | Internal or External | Not on the card. Her Studio notebook sketches a four-step control (public, internal, confidential, restricted), described there as a design idea from a draft ADR, not built | Not a field; a `sensitivity` note per product |
| Fields | title, type, status, visibility, hero, media, description, links, tools_used, process_note, year, tags | name, hero motion, status, "More" (one sentence, links) | adds one_line, who_for, problem, cta, brand; has no tools_used, process_note, year, tags or visibility |

A reading, not a decision: the public site needs the smallest set (name, one line, status, hero, links), and the richer fields live in the product repo's own docs.

## Working notes: assets and who sees what

The home repo holds an asset inventory of Rosie's claude.ai artifacts that could feed the site (branch `claude/2026-10-16-website-asset-manifests`, 16 Oct 2026, three Sonnet extraction runs; draft, nothing public). It flags items "DO NOT USE PUBLICLY" where an artifact names clients, embeds internal issue titles or corpus counts, or holds internal data. Rule that follows from `visibility: Internal` above: nothing from an artifact marked that way enters the site's content without Rosie's check, and the build check described under "Who sees what" is the intended backstop. That check does not exist yet. See also [00](00-content-inventory.md), "Working notes: assets".
