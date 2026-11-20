# Built for people and for agents

The Mangrove site is being built in two layers: one for people, which adapts to how each person reads, and one for AI agents, which has no buttons. Both layers draw on the same writing.

- Published by: Mangrove (mangrove.org.uk)
- Written: 20 November 2026
- Status: draft; it changes as the site is built
- Web page: https://mangrove.org.uk/next/research/built-for-people-and-agents.html
- This file is the text twin of that page: the same content, written to be quoted.

## Why two layers

A website now has two kinds of reader. People visit, browse and follow what interests them. AI agents fetch pages, quote them and summarise them, often for someone who never visits.

The shift is measurable. In a Pew Research Center study of browsing in March 2025 (published 22 July 2025), people clicked a search result in 8% of searches that showed an AI summary, and in 15% of searches without one. Source: https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/

Mangrove therefore designs its site to be quoted and summarised as well as visited. A person wants a page that is clear to read at the depth they have time for. An agent wants text it can lift accurately, with the date, the source and the terms of use attached. One page usually serves both badly, so the site has two layers built from one body of writing, kept in step.

This follows the rest of Mangrove's work: build systems that adapt to the person, instead of asking the person to adapt to the system.

## The human layer adapts to the reader

The same writing is offered at more than one depth: a top line, a short read, a long read, and the source. The web page for this text is the first to offer that choice.

A reader can start from pictures or from words, and can turn motion off. An accessibility kit is on every page by default. It changes text size, spacing, contrast, colour theme and font, reduces motion, and reads the page aloud.

Every page has to work fully with a screen reader: real headings and landmarks, labelled controls, image descriptions that carry the meaning of the picture, and nothing that depends on colour or position alone. Mangrove tests with a screen reader and learns from people who use one every day.

The first person the site is fitted to is Rosie Collins, who founded Mangrove. Her taste sets the first version. The depth, form and access controls are how the site then widens to other people.

## The agent layer has no buttons

An agent does not need a menu or a theme switch. It needs clean content and a clear statement of what it may do with it. The agent layer has four parts:

1. A text twin of every page, at the same address ending in `.md`. Each twin puts its main claim first, keeps paragraphs short and self-contained, and carries its date and sources in the text. This file is one.
2. Structured data: semantic HTML, and schema.org descriptions that say whether a page is an organisation, a person, an article or a paper.
3. Later, an MCP endpoint (Model Context Protocol, a standard way for agents to ask a service questions) over the public writing, so an agent can ask the site a question instead of crawling it.
4. A stated licence and terms for agents: who may quote the writing, who may train on it, and on what terms. Not yet published.

Mangrove also publishes an llms.txt file listing the text twins: https://mangrove.org.uk/next/llms.txt. It is a courtesy, not a strategy. Ahrefs reported in May 2026 that 97% of llms.txt files are never requested. It costs almost nothing, so Mangrove adds it without relying on it.

## Agents help design the agent layer

Mangrove's own AI agents are the first agent users of the site. Before the agent layer is built in full, Mangrove runs a small user study with them, asking each agent: when you need to know what Mangrove is, what it has written or what it offers, what would you want to find, in what form, and what slows you down today? Their answers become the agent layer's requirements, in the same way that interviews with people become the requirements for the human layer.

## How the build is recorded

Each page has a design record that says what was decided and why. This text and its web page are the public account of the approach. The site is also the working example for an essay in progress (November 2026), In Defence of Tangential Thinking, which argues for systems that fit the way a mind actually moves.

The order of work, as of 20 November 2026:

1. This page and its text twin.
2. A text twin for every page on the new site, generated from the page.
3. llms.txt and schema.org across the new site.
4. The user study with Mangrove's own agents.
5. The depth control, tested with a screen reader, on more pages.
6. Then the MCP endpoint, the licence page and more depths.
