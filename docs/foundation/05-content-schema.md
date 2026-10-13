---
id: foundation-05-content-schema
title: Content schema (backend schema)
status: draft, Q&A round 1 answered 13 Oct 2026
updated: 2026-10-13
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
