---
id: foundation-05-content-schema
title: Content schema (backend schema)
status: placeholder
updated: 2026-10-12
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

## Other content types (TBD)
- Writing piece
- Paper / research entry
- Service
- Testimonial
- Advisor

## Where it lives
- TBD: files in this repo (e.g. one Markdown/JSON file per entry) or exported from epoch.

## Who sees what
- `visibility: Internal` entries never publish. TBD how that is enforced (build step or check).
