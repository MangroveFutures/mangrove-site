#!/usr/bin/env python3
"""Generate the Software section (index, alternative index, nine detail pages) from the copy register.

Usage:  python -X utf8 build_software.py <copy-register.yaml> <next-dir>

Every text block is written with data-block-id equal to its register block_id and its text unchanged, so the page can
later be generated from the database rows (ADR-0096, epoch#2182). The register is a DRAFT (home PR 1574); nothing here
is approved copy. UI labels that are not in the register are listed in LABELS below so they can be reviewed as copy.
Design record: home design/records/2026-11-20-software-index.md
"""
import html
import pathlib
import re
import sys

import yaml

reg, nxt = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
blocks = {b["block_id"]: b["text"].strip() for b in yaml.safe_load(reg.read_text(encoding="utf8"))["blocks"]}
OLD_SLUGS = ["epoch", "mindsweeper", "sketchin", "breathing-room", "org-graph", "choreotope", "would-you-rather-design"]
ART_CACHE = nxt / "_build" / "art.cache.html"  # the seven existing pictures, kept so the build can be rerun
if ART_CACHE.exists():
    old = dict(zip(OLD_SLUGS, ART_CACHE.read_text(encoding="utf8").split("\n<!--split-->\n")))
else:
    old = {p: (nxt / "software" / f"{p}.html").read_text(encoding="utf8") for p in OLD_SLUGS}
    old = {p: re.search(r'<svg class="art".*?</svg>', s, re.S).group(0) for p, s in old.items()}
    ART_CACHE.write_text("\n<!--split-->\n".join(old[p] for p in OLD_SLUGS), encoding="utf8")

PRODUCTS = ["epoch", "mindsweeper", "sketchin", "breathing-room", "org-graph", "choreotope",
            "would-you-rather-design", "healthstory", "bodyscan"]  # register order
HEALTH = {"healthstory", "bodyscan"}
STATUS = {"In use internally": "use", "In development": "dev", "In design": "design", "Research prototype": "proto"}
LABELS = {"who": "Who it is for", "detail": "In detail", "all": "All software", "clear": "Show all", "open_q": "Open question",
          "oq_text": "The old card said: photograph a sketch and get text. The repository is a design-catalogue pipeline. "
                     "Which one is the product is Rosie's call. Review note, not page copy."}
RECORD = "home:design/records/2026-11-20-software-index.md"
ATMOS = ('<button class="atmos" type="button" id="atmos" role="switch" aria-checked="true" aria-label="Dark mode">'
         '<svg class="i-moon" viewBox="0 0 18 18" aria-hidden="true"><path d="M14.6 11.3A6.4 6.4 0 0 1 6.7 3.4a6.4 6.4 0 1 0 7.9 7.9z" fill="currentColor"/></svg>'
         '<svg class="i-sun" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="3.4" fill="currentColor"/>'
         '<path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></button>')
NAV = [("work-with-us.html", "Work with us"), ("advisors.html", "Advisors"), ("work.html", "Work"),
       ("software.html", "Software"), ("research/index.html", "Research"), ("research/tangential-thinking.html", "Book")]


def esc(s):
    return html.escape(s, quote=False)


def blk(bid, tag, cls="", inner=None, extra=""):
    c = f' class="{cls}"' if cls else ""
    return f'<{tag}{c} data-block-id="{bid}"{extra}>{inner if inner is not None else esc(blocks[bid])}</{tag}>'


def lead(text):
    m = re.search(r"[.:](?=\s)", text)
    if m and m.end() <= 72:
        return f"<strong>{esc(text[:m.end()])}</strong>{esc(text[m.end():])}"
    return esc(text)


def glyph(k, big=False):
    return f'<svg class="st{" lg" if big else ""}" viewBox="0 0 14 14" aria-hidden="true"><use href="#g-{k}"/></svg>'


SYMBOLS = (
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>'
    '<symbol id="g-use" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="currentColor" stroke="currentColor" stroke-width="1.5"/></symbol>'
    '<symbol id="g-dev" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 1.5a5.5 5.5 0 0 1 0 11z" fill="currentColor"/></symbol>'
    '<symbol id="g-design" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2.2 2.1"/></symbol>'
    '<symbol id="g-proto" viewBox="0 0 14 14"><path d="M7 1.3L12.7 7 7 12.7 1.3 7z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></symbol>'
    '</defs></svg>')


def status_of(p):
    return STATUS[blocks[f"software.{p}.card-status"]]


def title(p):
    return blocks[f"software.{p}.card-title"]


def art(p, imgdir=""):
    if p in old:
        return old[p]
    if p == "healthstory":  # the engraving already on the site (PR #30), kept; its three sample marks are drawn over it
        return (f'<img src="{imgdir}img/healthstory-gray-hand-1877.jpg" width="720" height="969" alt="Engraved plate of the bones of the back of the hand, '
                'with three sample marks drawn on it: a solid ring, a dashed ring and a dotted ring.">'
                '<svg class="art" viewBox="0 0 720 969" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="var(--falcon)" stroke-width="6">'
                '<circle cx="355" cy="470" r="52" fill="color-mix(in srgb,var(--falcon) 25%,transparent)"/><circle cx="470" cy="190" r="40" stroke-dasharray="14 10"/>'
                '<circle cx="215" cy="790" r="34" stroke-dasharray="2 12" stroke-linecap="round"/></svg>')
    hw = [3, 6, 8, 5, 12, 26, 30, 28, 24, 20, 17, 17, 20, 23, 14, 11, 10, 9, 9, 8, 8, 10, 14]  # 23 regions, head to toe
    s = '<svg class="art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="s" d="M160 14V166"/>'
    for i, w in enumerate(hw):
        y = 18 + i * (144 / 22)
        s += f'<path class="{"a" if i == 11 else "s"}" d="M{160 - w:.1f} {y:.1f}H{160 + w:.1f}"/>'
    return s + f'<circle class="fl" cx="160" cy="{18 + 11 * 144 / 22:.1f}" r="3.5"/></svg>'


def head(title_, desc, up, bid):
    return f'''<!doctype html>
<html lang="en-GB" data-theme="dark" data-lib-a11y-themes="light dark" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{esc(title_)}</title>
<meta name="description" content="{html.escape(desc)}" data-block-id="{bid}">
<meta name="design-record" content="{RECORD}">
<meta name="color-scheme" content="dark light">
<link rel="preload" href="{up}../fonts/newsreader-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{up}../fonts/bricolage-grotesque-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{up}site.css">
<link rel="stylesheet" href="{up}software-index.css">
<script src="{up}site.js"></script>
<script src="{up}software-index.js" defer></script>
</head>
'''


def shell(body, up):
    nav = "".join(f'<li><a href="{up}{h}"{" aria-current=" + chr(34) + "true" + chr(34) if h == "software.html" else ""}>{t}</a></li>' for h, t in NAV)
    return f'''<body>
<a class="skip" href="#main">Skip to the content</a>
<div class="grain" aria-hidden="true"></div>
{SYMBOLS}
<div class="page">
<header class="axis"><nav aria-label="Main" class="wrap"><a class="mark" href="{up}index.html">Mangrove</a><ol>{nav}</ol>{ATMOS}</nav></header>
<main id="main">
{body}
</main>
<footer class="foot wrap" aria-labelledby="h-write"><h2 class="lead" id="h-write">Write to us</h2><a class="email" href="mailto:info@mangrove.org.uk">info@mangrove.org.uk</a><div class="foot-row"><span>Mangrove · a speculative design studio and research lab</span><a href="{up}work-with-us.html">Work with us</a></div></footer>
</div>
</body>
</html>
'''


CREDIT = ('<p class="credit">Engraving: a hand from Henry Gray, <i>Anatomy, Descriptive and Surgical</i> (1877), public domain, via the Internet Archive and '
          'Wikimedia Commons. The three marks are an invented example. Carried over from the earlier HealthStory page; not register copy.</p>')
PAUSE = '<button class="pausebtn" type="button" data-pause="#art" aria-pressed="false">Pause</button>'


def oq(p):
    if p != "sketchin":
        return ""
    return f'<span class="oq" data-review-only="open-question"><b>{LABELS["open_q"]}.</b> {esc(LABELS["oq_text"])}</span>'


def key_items():
    t = blocks["software.status-key"]
    pos = sorted((t.index(x + ": "), x) for x in STATUS)
    out = []
    for i, (a, term) in enumerate(pos):
        b = pos[i + 1][0] if i + 1 < len(pos) else len(t)
        out.append((term, t[a + len(term) + 2:b].strip()))
    return out


MAIN = [p for p in PRODUCTS if p not in HEALTH]
HL = [p for p in PRODUCTS if p in HEALTH]


def index_a():
    ki = "".join(
        f'<button type="button" class="kitem" data-f="{STATUS[term]}" aria-pressed="false"><span class="kh">{glyph(STATUS[term], True)}</span>'
        f'<span class="kt">{esc(term)}</span><span class="kd">{esc(d)}</span></button>' for term, d in key_items())

    def row(i, p):
        s = status_of(p)
        return (f'<li data-status="{s}" style="--i:{i}"><a class="row" href="software/{p}.html">'
                f'{blk(f"software.{p}.card-title", "h3", "rn")}{blk(f"software.{p}.card-summary", "p", "rs")}'
                f'<span class="rst">{glyph(s)}{blk(f"software.{p}.card-status", "span", "rw")}</span>'
                f'<svg class="go" viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6h15M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
                f'{oq(p)}</a></li>')

    body = f'''<div class="room wrap sx sx-a"><header class="room-head"><h1>Software</h1>{blk("software.index.intro", "p", "claim")}</header>
<div class="key" role="group" aria-label="Filter the list by status" data-block-id="software.status-key">{ki}</div>
<p class="sr" role="status" aria-live="polite" id="sx-live"></p>
<ol class="idx" id="idx-main">{"".join(row(i, p) for i, p in enumerate(MAIN))}</ol>
<section class="grp" id="grp-health" aria-labelledby="h-health">{blk("software.health.group-heading", "h2", "", extra=' id="h-health"')}
<ol class="idx" id="idx-health">{"".join(row(len(MAIN) + i, p) for i, p in enumerate(HL))}</ol></section>
<p class="clear" hidden><button type="button" id="sx-clear">{LABELS["clear"]}</button></p></div>'''
    return head("Software · Mangrove", blocks["software.index.meta-description"], "", "software.index.meta-description") + shell(body, "")


def index_b():
    def plate(i, p, lead_=False):
        s = status_of(p)
        return (f'<li class="plate{" plate-lead" if lead_ else ""}" style="--i:{i}"><a href="software/{p}.html">'
                f'<div class="frame">{art(p, "software/")}</div><div class="pt">'
                f'{blk(f"software.{p}.card-title", "h3", "pn")}'
                f'<span class="rst">{glyph(s)}{blk(f"software.{p}.card-status", "span", "rw")}</span>'
                f'{blk(f"software.{p}.card-summary", "p", "ps")}{oq(p)}</div></a></li>')

    kd = "".join(f'<div>{glyph(STATUS[t])}<dt>{esc(t)}</dt><dd>{esc(d)}</dd></div>' for t, d in key_items())
    body = f'''<div class="room wrap sx sx-b"><header class="room-head"><h1>Software</h1>{blk("software.index.intro", "p", "claim")}</header>
<ol class="plates">{plate(0, MAIN[0], True)}{"".join(plate(i + 1, p) for i, p in enumerate(MAIN[1:]))}</ol>
<section class="grp" aria-labelledby="h-health">{blk("software.health.group-heading", "h2", "", extra=' id="h-health"')}<ol class="plates">{"".join(plate(i, p) for i, p in enumerate(HL))}</ol></section>
<dl class="keyfoot" data-block-id="software.status-key">{kd}</dl></div>'''
    return head("Software (catalogue direction) · Mangrove", blocks["software.index.meta-description"], "", "software.index.meta-description") + shell(body, "")


def detail(p, idx):
    s = status_of(p)
    t = title(p)
    caps = sorted((k for k in blocks if k.startswith(f"software.{p}.capability-")), key=lambda k: int(k.rsplit("-", 1)[1]))
    still = f"software.{p}.in-design"
    pn = PRODUCTS[idx + 1] if idx + 1 < len(PRODUCTS) else None
    sid, who = f"software.{p}.status", f"software.{p}.who-for"
    side = (f'<aside class="dl-side"><div class="stat">{glyph(s, True)}{blk(sid, "p", "stw", inner=lead(blocks[sid]))}</div>'
            + (f'<div class="who"><h2>{LABELS["who"]}</h2>{blk(who, "p")}</div>' if who in blocks else "") + oq(p) + "</aside>")
    main = blk(f"software.{p}.detail-intro", "p", "lede")
    if caps:
        main += (f'<h2 class="dh">{LABELS["detail"]}</h2><ol class="caps">'
                 + "".join(f"<li>{blk(k, 'p', inner=lead(blocks[k]))}</li>" for k in caps) + "</ol>")
    if still in blocks:
        main += blk(still, "p", "still", inner=lead(blocks[still]))
    pager = f'<a href="../software.html"><span aria-hidden="true">←</span> {LABELS["all"]}</a>'
    if pn:
        pager += f'<a class="nx" href="{pn}.html">{esc(title(pn))} <span aria-hidden="true">→</span></a>'
    body = f'''<div class="room wrap sx sx-d"><p class="crumb"><a href="../software.html"><span aria-hidden="true">←</span> Software</a></p><header class="room-head">{blk(f"software.{p}.card-title", "h1")}{blk(f"software.{p}.card-summary", "p", "claim")}</header>
<div class="frame" id="art">{art(p)}{PAUSE if p == "breathing-room" else ""}</div>
<div class="dl">{side}<div class="dl-main">{main}</div></div>
{CREDIT if p == "healthstory" else ""}<nav class="pager" aria-label="More">{pager}</nav></div>'''
    return head(f"{t} · Software · Mangrove", blocks[f"software.{p}.card-summary"], "../", f"software.{p}.card-summary") + shell(body, "../")


(nxt / "software.html").write_text(index_a(), encoding="utf8")
(nxt / "software-b.html").write_text(index_b(), encoding="utf8")
for i, p in enumerate(PRODUCTS):
    (nxt / "software" / f"{p}.html").write_text(detail(p, i), encoding="utf8")
print("built", len(PRODUCTS) + 2, "pages")
