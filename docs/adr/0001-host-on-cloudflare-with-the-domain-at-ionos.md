---
id: adr-0001
type: adr
title: "ADR-0001: Host the site on Cloudflare; keep the domain registered at IONOS"
status: "amended 23 Oct 2026: GitHub Pages for now (Rosie); Cloudflare Pages remains the target for the later client login; nameservers stay at IONOS"
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
1. Cloudflare, Workers with static assets (not chosen: custom domains on an external-DNS apex were not confirmed).
2. **Cloudflare Pages** (chosen).
3. GitHub Pages (static only, no client login).
4. Vercel (blocked for organisation repos on the free plan, per `epoch/docs/ops/stack-and-subscriptions.md`).

## Decision outcome
Cloudflare (accepted, 13 Oct 2026), using **Cloudflare Pages**, with **the nameservers staying at IONOS** (Rosie, 23 Oct 2026: "I don't want to move NS to Cloudflare, just ensure the domain points to our actual site for now").

Why Pages and not Workers with static assets: Cloudflare's own Pages documentation (read 23 Oct 2026, https://developers.cloudflare.com/pages/configuration/custom-domains/) says a **subdomain** can use a Pages project without being a Cloudflare zone, through a CNAME record at the external DNS provider, but an **apex** domain needs the site added as a Cloudflare zone with Cloudflare nameservers. Whether Workers custom domains have the same rule was not checked; Pages is the documented route that fits the constraint.

## The domain and email (accepted route, steps are Rosie's)
- The registrar and the nameservers stay at IONOS. Mail records (MX, SPF, DKIM) are not touched, so `info@mangrove.org.uk` keeps working.
- Make a Pages project, add the custom domain `www.mangrove.org.uk` in the Pages dashboard first (adding the CNAME before that gives an error 522), then at IONOS add `www` CNAME pointing to `<project>.pages.dev`.
- The bare `mangrove.org.uk` cannot point at Pages without Cloudflare nameservers. Set an IONOS redirect from `mangrove.org.uk` to `https://www.mangrove.org.uk`. **Not verified in this session:** whether IONOS's redirect serves HTTPS on the bare domain; if it does not, visitors who type the bare name over HTTPS see a certificate warning until the nameservers move.
- Cost of this route: the bare domain is a redirect, not the site itself, and a future client login on the apex (Cloudflare Access) will need the nameservers to move.
- Before the Pages project exists, the first look is the free `*.pages.dev` address.

## Consequences
- One place (Cloudflare) answers for hosting, DNS and later sign-in.
- Rosie's IONOS and Cloudflare logins both matter; record where each is held in `home/handbook/reference/credentials.yaml`, never the passwords.
- The agent Cloudflare token expires on 30 Oct 2026 (ORG-0009 trial); deploys after that need a new decision.

## Where this is recorded
Stack and costs: `epoch/docs/ops/stack-and-subscriptions.md`. Plan: `docs/foundation/06-implementation-plan.md`.

## Amendment, 23 Oct 2026 (Rosie's decision; draft by Claude for her to correct)
Rosie chose **GitHub Pages for now**, to see how it looks next to Cloudflare. Why it fits today: the apex works with four A records at IONOS and a `www` CNAME, so nameservers stay put (the Cloudflare route needed them moved for the bare domain, which Rosie does not want), and merging to `main` already publishes the repo. What it cannot do: a clients-only login (epoch#707, #710). When that is wanted, move to Cloudflare Pages; the switch is a DNS change, so this is reversible. The IONOS steps are in a calendar reminder for 24 Oct 2026. Email records (MX, TXT) stay untouched. The `CNAME` file for the custom domain is added only after the DNS change, because adding it earlier would redirect the preview address to the old site.
