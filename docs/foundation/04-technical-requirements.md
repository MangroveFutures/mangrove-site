---
id: foundation-04-technical-requirements
title: Technical requirements
status: draft, Q&A round 1 answered 13 Oct 2026
updated: 2026-10-13
---

# 4 · Technical requirements

**Answers:** what the site is built with and where it runs, so nobody is guessing at tools halfway through.

Each real decision here should become a short ADR (architecture decision record) so the reasoning is kept.

## Current state
- Plain HTML/CSS/JS, no build step, no framework.
- Repo: `MangroveFutures/mangrove-site`.
- Registered in epoch as a projection surface (read model): it shows epoch content, never writes back.
- Domain `mangrove.org.uk` registered with IONOS, not yet pointed anywhere.
- Related asks that touch hosting: a clients-only login gate (epoch#707, epoch#710; GitHub Pages is static only, so it needs other hosting) and epoch#688 (proposes Cloudflare Workers with Cloudflare Access). Align with these rather than choosing separately.

## Decided on 13 Oct 2026 (Rosie, in session)
| Decision | Answer | Notes |
|---|---|---|
| Hosting | **Cloudflare** | Fits the later client login (Cloudflare Access), as epoch#688 proposes. Gets a short ADR. |
| Where content lives | **Files in this repo now, Supabase later** | See [05](05-content-schema.md). |
| Contact | **Email: info@mangrove.org.uk** (exists, per Rosie) | No form. |
| Analytics | **Privacy-friendly only:** Cloudflare's cookie-free page counts | No cookie banner needed. |
| Word-count figure on the site | **Use the live corpus figure** | Counted 13 Oct 2026 in Supabase: about **19.1 million words** of human-AI dialogue in about 2,455 conversations, Dec 2022 to Oct 2026 (user and assistant turns only). The corpus is partial, so the honest phrasing is "over 19 million words". This replaces the old site's "10 million" and "15 million" (C-104). |

## Decisions still open
| Decision | Options on the table | Notes |
|---|---|---|
| Stay hand-written HTML or adopt a static site generator | stay plain / Astro / Eleventy | Matters once there are many project pages built from one template. Check existing tools before hand-rolling a templating script. |

## Constraints
- Changes should be possible by asking an agent — no desktop-only setup or manual dashboard clicking.
- TBD: performance and accessibility targets.

