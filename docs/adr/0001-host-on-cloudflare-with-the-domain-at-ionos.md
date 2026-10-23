---
id: adr-0001
type: adr
title: "ADR-0001: Host the site on Cloudflare; keep the domain registered at IONOS"
status: "accepted for Cloudflare (Rosie, 13 Oct 2026) and for using mangrove.org.uk now (Rosie, 23 Oct 2026); Workers-versus-Pages and the DNS route are proposed, not yet checked"
created: 2026-10-23
owner: rosie
drafted_by: Claude (draft for Rosie to correct)
review_by: 2026-10-30
tracked_in: "MangroveFutures/epoch#667"
---

# ADR-0001: Host the site on Cloudflare; keep the domain registered at IONOS

Format: MADR (Markdown Architectural Decision Records, https://adr.github.io/madr/). Limit of the borrow: MADR says how to write a decision down; it does not say the decision is right.

## Context and problem statement
The site is plain HTML with no build step (`docs/foundation/04-technical-requirements.md`). Rosie wants something live on `mangrove.org.uk` over the weekend of 24 and 25 Oct 2026, simple and lovely, then a fuller site later. The domain is registered at IONOS and is not yet pointed anywhere. A mailbox `info@mangrove.org.uk` exists at IONOS (Rosie, 13 Oct 2026). A clients-only login is wanted later (epoch#707, #710), which GitHub Pages cannot do.

## Decision drivers
- Live this weekend, with nothing to maintain by hand.
- Agents can deploy it without Rosie clicking through dashboards (`CLAUDE.md` of this repo, and home ORG-0009 for the Cloudflare trial).
- Fits the later client login (Cloudflare Access, epoch#688).
- Cookie-free page counts only (decided 13 Oct 2026).
- Email at the domain must keep working.

## Considered options
1. **Cloudflare, Workers with static assets** (proposed).
2. Cloudflare Pages.
3. GitHub Pages (static only, no client login).
4. Vercel (blocked for organisation repos on the free plan, per `epoch/docs/ops/stack-and-subscriptions.md`).

## Decision outcome
Cloudflare (accepted, 13 Oct 2026). Between Workers with static assets and Pages: Workers with static assets, because third-party sources of Oct 2026 say Cloudflare steers new projects there and Pages stays supported; **not yet checked against Cloudflare's own documentation, check before building**. The first deploy goes to a free `workers.dev` address so the page can be looked at before the domain moves.

## The domain and email (proposed, check before acting)
- The registrar stays IONOS. Only where the domain's DNS is answered changes.
- A Cloudflare custom domain, as far as the author knows, needs the domain's DNS to be served by Cloudflare, so the nameservers at IONOS would point at Cloudflare. **Not verified in this session.**
- **Risk, in order to avoid losing email:** before changing nameservers, copy every IONOS DNS record (especially MX, SPF/TXT and DKIM for `info@mangrove.org.uk`) into Cloudflare DNS, and send a test email afterwards. Moving nameservers without the mail records stops mail arriving.
- The step is Rosie's: it needs her IONOS login.

## Consequences
- One place (Cloudflare) answers for hosting, DNS and later sign-in.
- Rosie's IONOS and Cloudflare logins both matter; record where each is held in `home/handbook/reference/credentials.yaml`, never the passwords.
- The agent Cloudflare token expires on 30 Oct 2026 (ORG-0009 trial); deploys after that need a new decision.

## Where this is recorded
Stack and costs: `epoch/docs/ops/stack-and-subscriptions.md`. Plan: `docs/foundation/06-implementation-plan.md`.
