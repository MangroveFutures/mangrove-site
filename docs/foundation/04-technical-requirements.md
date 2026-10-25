---
id: foundation-04-technical-requirements
title: Technical requirements
status: draft; decisions of 13 and 23 Oct 2026 recorded; deployed state and options added 25 Oct 2026
updated: 2026-10-25
---

# 4 · Technical requirements

**Answers:** what the site is built with and where it runs, so nobody is guessing at tools halfway through.

Each real decision here should become a short ADR (architecture decision record) so the reasoning is kept.

## Current state
- Plain HTML/CSS/JS, no build step, no framework.
- Repo: `MangroveFutures/mangrove-site`.
- Registered in epoch as a projection surface (read model): it shows epoch content, never writes back.
- Domain `mangrove.org.uk` registered with IONOS. **Out of date as written on 13 Oct:** see "What is deployed" below.
- Related asks that touch hosting: a clients-only login gate (epoch#707, epoch#710; GitHub Pages is static only, so it needs other hosting) and epoch#688 (proposes Cloudflare Workers with Cloudflare Access). Align with these rather than choosing separately.

## Decided on 13 Oct 2026 (Rosie, in session)
| Decision | Answer | Notes |
|---|---|---|
| Hosting | **Cloudflare** | Fits the later client login (Cloudflare Access), as epoch#688 proposes. Gets a short ADR. |
| Where content lives | **Files in this repo now, Supabase later** | See [05](05-content-schema.md). |
| Contact | **Email: info@mangrove.org.uk** (exists, per Rosie) | No form. |
| Analytics | **Privacy-friendly only:** Cloudflare's cookie-free page counts | No cookie banner needed. |
| Word-count figure on the site | **Use the live corpus figure** | Counted 13 Oct 2026 in Supabase: about **19.1 million words** of human-AI dialogue in about 2,455 conversations, Dec 2022 to Oct 2026 (user and assistant turns only). The corpus is partial, so the honest phrasing is "over 19 million words". This replaces the old site's "10 million" and "15 million" (C-104). |

## Decided on 23 Oct 2026 (Rosie, in session)
| Decision | Answer | Notes |
|---|---|---|
| Domain | **Use `mangrove.org.uk`, registered at IONOS, for now** | See [ADR-0001](../adr/0001-host-on-cloudflare-with-the-domain-at-ionos.md). Moving DNS needs the mail records copied first, so `info@mangrove.org.uk` keeps working. |
| First version live | **A simple interim page this weekend** | `interim/index.html`; plan in [06](06-implementation-plan.md). **Overtaken 24 Oct 2026:** the interim page was never deployed; it was removed (PR #12) and Cooper's D2 went live as the front page instead (PR #13). |
| Contact | **`info@mangrove.org.uk`** | The older full draft (`index.html`) says `hello@`; the interim page uses `info@` as Rosie said. |
| Hero | **The flocking animation; the mouse or finger acts as a falcon** | Touch listeners are passive so the page still scrolls. Reduced-motion visitors get a still frame. |

## What is deployed (25 Oct 2026)

Compiled from the repo and the epoch domains register (a draft of 25 Oct 2026); not checked from this session against the live domain or the IONOS account.

| Thing | State | Source |
|---|---|---|
| Hosting | **GitHub Pages**, serving `main`. [ADR-0001](../adr/0001-host-on-cloudflare-with-the-domain-at-ionos.md) was amended on 23 Oct 2026 by Rosie: GitHub Pages for now; Cloudflare Pages stays the target for the later client login. So this is not a conflict with the 13 Oct "Cloudflare" row above, which the ADR now qualifies. | ADR-0001; PR #10 |
| Domain | `CNAME` file for `mangrove.org.uk` added 24 Oct (PR #11). The registrar is IONOS and the register records an A record pointing at a GitHub Pages address. The nameservers stay at IONOS (Rosie, 23 Oct). | PR #11; epoch domains register |
| Mail | `info@mangrove.org.uk` is the contact on the live page. Mail records were not to be touched when pointing the domain. | Live `index.html`; ADR-0001 |
| Front page | Cooper's D2: `index.html`, `flock.js`, `fonts/`, `vendor/three/` (three.js r170, MIT) and `vendor/choreotope/` (Rosie's own `Flock3D` code from a private repo, already shipped to every browser as JavaScript). No build step. | PRs #13, #19 |
| Third parties | None on load: fonts and three.js are self-hosted, and there is no analytics script. **Conflict:** the Display (accessibility) control loads Google Fonts stylesheets only if a visitor picks Atkinson Hyperlegible or Lexend, which sends that visitor's IP address to Google. D2's provenance file lists "Google Fonts and CDN script tags" as rejected for that reason, so the two disagree. Not changed here (site code is not part of this docs change); for Rosie and Cooper. | `index.html` (accessibility block) |
| Old page | `archive/2026-10-old-site/index.html`, viewable. | PR #12 |
| Drafts | `drafts/2026-10-23-direction-d2/`, with screenshots and a provenance file. | PR #10 |
| Required checks | Docs link check and secret scan run on pull requests. Whether either is a *required* check for merging to `main` is not recorded in this repo. | `.github/workflows/` |

**Conflict (stale docs elsewhere, flagged not fixed here):** the epoch stack record (`docs/ops/stack-and-subscriptions.md` on `main`) still says the domain is "live, not yet pointed at a site" and "hosted on Cloudflare". The domains register on a branch says otherwise. And `CLAUDE.md` in this repo still carries the "don't change the Boids hero" line ([03](03-design-brief.md), open question 11).

**Public by default.** GitHub Pages serves every file in a public repo, including `docs/`, `drafts/`, `archive/` and `docs/technical-briefing.html`. Anything that must not be public does not belong in this repo. For Rosie: `docs/technical-briefing.html` is a briefing for a graph and database conversation, and a claude.ai copy of it is marked "not a public document"; keep or remove?

## Options: hosting for the later client area and a private wiki

Both need a login gate, which GitHub Pages cannot give (static only). Rosie's 13 Oct and 16 Oct asks: a clients-only area, and a private wiki section ([01](01-product-requirements.md)). Use an existing access product, not custom auth (epoch#710).

1. **Cloudflare Pages with Cloudflare Access in front.** The current target in ADR-0001; fits epoch#688. The apex domain needs the site added to Cloudflare as a zone with Cloudflare nameservers, while Rosie wants the nameservers to stay at IONOS; a subdomain such as `www` can use a CNAME. ADR-0001 records this trade.
2. **Password protection at another host** (for example Vercel). ADR-0001 notes Vercel is blocked for organisation repos on the free plan.
3. **Supabase Auth magic link** in front of private pages. Fits "Supabase later" for content ([05](05-content-schema.md)); more to build.
4. **A separate host and subdomain for the private areas only,** leaving the public site on GitHub Pages. Keeps the public site simple; two places to look after.

No choice is made here.

## Decisions still open
| Decision | Options on the table | Notes |
|---|---|---|
| Stay hand-written HTML or adopt a static site generator | stay plain / Astro / Eleventy | Matters once there are many project pages built from one template. Check existing tools before hand-rolling a templating script. The live page is now plain HTML, one self-contained `index.html` of about 50 KB plus the flock script, with no build step. |
| A design-only site: where it would be hosted | own domain / section of this site / subdomain microsite | See [01](01-product-requirements.md). |
| Performance and accessibility targets | TBD | D2 ships an accessibility control and a reduced-motion still frame; no numeric targets are set. The flock is the heaviest part (3D, software rendering was used in Cooper's checks). |

## Constraints
- Changes should be possible by asking an agent — no desktop-only setup or manual dashboard clicking.
- TBD: performance and accessibility targets.

