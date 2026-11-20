#!/usr/bin/env python3
"""Generate the Software section (index, alternative index, nine full product pages) from the copy register.

Usage:  python -X utf8 build_software.py <copy-register.d dir> <next-dir>

Reads every *.yaml in the register directory (home websites/foundation/copy-register.d, one file per product plus
index.yaml). Every text block is written with data-block-id equal to its register block_id and its text unchanged,
so the page can later be generated from the database rows (ADR-0096, epoch#2182). The register is a DRAFT; nothing
here is approved copy. Words on the page that are not in the register are listed in LABELS so they can be reviewed
as copy. No status words and no status key anywhere (Rosie, 20 Nov 2026).
Design record: home design/records/2026-11-20-software-product-pages.md
"""
import glob
import html
import pathlib
import re
import sys

import yaml

reg, nxt = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
blocks = {}
for f in sorted(glob.glob(str(reg / "*.yaml"))):
    for b in yaml.safe_load(pathlib.Path(f).read_text(encoding="utf8"))["blocks"]:
        blocks[b["block_id"]] = b["text"].strip()

# page slug -> register key. The slug of Would You Rather stays as on the live preview so existing links keep working.
SLUG = {"sketchin": "sketchin", "breathing-room": "breathing-room", "mindsweeper": "mindsweeper", "org-graph": "org-graph",
        "choreotope": "choreotope", "would-you-rather-design": "would-you-rather", "epoch": "epoch",
        "healthstory": "healthstory", "bodyscan": "bodyscan"}
MAIN = ["sketchin", "breathing-room", "mindsweeper", "org-graph", "choreotope", "would-you-rather-design", "epoch"]
HL = ["healthstory", "bodyscan"]
PRODUCTS = MAIN + HL

ART_CACHE = nxt / "_build" / "art.cache.html"  # the seven earlier pictures, kept so the build can be rerun
OLD_SLUGS = ["epoch", "mindsweeper", "sketchin", "breathing-room", "org-graph", "choreotope", "would-you-rather-design"]
old = dict(zip(OLD_SLUGS, ART_CACHE.read_text(encoding="utf8").split("\n<!--split-->\n")))

# Words that are page furniture, not register copy. Listed so Rosie can review them as copy.
LABELS = {"toc": "On this page", "problem": "The problem", "who": "Who it is for", "how": "How it works",
          "today": "What exists today", "examples": "Examples", "next": "What comes next",
          "all": "All software", "ph": "Placeholder", "ph_do": "Picture to come.",
          "ph_perm": "Picture to come. Needs Rosie's permission before any of her sketches appear.",
          "health": "Health"}
RECORD = "home:design/records/2026-11-20-software-product-pages.md"
ATMOS = ('<button class="atmos" type="button" id="atmos" role="switch" aria-checked="true" aria-label="Dark mode">'
         '<svg class="i-moon" viewBox="0 0 18 18" aria-hidden="true"><path d="M14.6 11.3A6.4 6.4 0 0 1 6.7 3.4a6.4 6.4 0 1 0 7.9 7.9z" fill="currentColor"/></svg>'
         '<svg class="i-sun" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="3.4" fill="currentColor"/>'
         '<path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></button>')
NAV = [("work-with-us.html", "Work with us"), ("advisors.html", "Advisors"), ("work.html", "Work"),
       ("software.html", "Software"), ("research/index.html", "Research"), ("research/tangential-thinking.html", "Book")]


def esc(s):
    return html.escape(s, quote=False)


def B(p, slot):
    return blocks[f"software.{SLUG[p]}.{slot}"]


def bid(p, slot):
    return f"software.{SLUG[p]}.{slot}"


def paras(text):
    return [re.sub(r"\s+", " ", t).strip() for t in text.split("\n") if t.strip()]


def lead(text, cap):
    m = re.search(r"[.:](?=\s)", text)
    if m and m.end() <= cap:
        return f"<strong>{esc(text[:m.end()])}</strong>{esc(text[m.end():])}"
    return esc(text)


def steps(text):
    """Split a how-it-works block into numbered steps plus any lines before or after them. Numbers are found in
    sequence ('1. ', '2. ' ...), so figures such as '4 in and 6 out' are not mistaken for steps."""
    pre, items, post = [], [], []
    for line in paras(text):
        n = len(items) + 1
        pos = []
        m = re.search(rf"(?:^|(?<=\s)){n}\. (?=\S)", line)
        while m:
            pos.append((m.start(), m.end()))
            n += 1
            m = re.compile(rf"(?<=\s){n}\. (?=\S)").search(line, m.end())
        if pos:
            if pos[0][0] > 0:
                pre.append(line[:pos[0][0]].strip())
            for i, (s, e) in enumerate(pos):
                items.append(line[e:(pos[i + 1][0] if i + 1 < len(pos) else len(line))].strip())
        elif items:
            post.append(line)
        else:
            pre.append(line)
    return pre, items, post


def art(p, imgdir=""):
    if p in old:
        return old[p]
    if p == "healthstory":  # the engraving already on the site (PR #30), kept; its three sample marks are drawn over it
        return (f'<img src="{imgdir}img/healthstory-gray-hand-1877.jpg" width="720" height="969" alt="" loading="lazy">'
                '<svg class="art" viewBox="0 0 720 969" preserveAspectRatio="xMidYMid slice" aria-hidden="true" fill="none" stroke="var(--falcon)" stroke-width="6">'
                '<circle cx="355" cy="470" r="52" fill="color-mix(in srgb,var(--falcon) 25%,transparent)"/><circle cx="470" cy="190" r="40" stroke-dasharray="14 10"/>'
                '<circle cx="215" cy="790" r="34" stroke-dasharray="2 12" stroke-linecap="round"/></svg>')
    hw = [3, 6, 8, 5, 12, 26, 30, 28, 24, 20, 17, 17, 20, 23, 14, 11, 10, 9, 9, 8, 8, 10, 14]  # 23 regions, head to toe
    s = '<svg class="art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path class="s" d="M160 14V166"/>'
    for i, w in enumerate(hw):
        y = 18 + i * (144 / 22)
        s += f'<path class="{"a" if i == 11 else "s"}" d="M{160 - w:.1f} {y:.1f}H{160 + w:.1f}"/>'
    return s + f'<circle class="fl" cx="160" cy="{18 + 11 * 144 / 22:.1f}" r="3.5"/></svg>'


def head(title_, desc, up, desc_id):
    return f'''<!doctype html>
<html lang="en-GB" data-theme="dark" data-lib-a11y-themes="light dark" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{esc(title_)}</title>
<meta name="description" content="{html.escape(desc)}" data-block-id="{desc_id}">
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


def title_html(p):
    t = B(p, "title")
    m = re.match(r"^(.*?)\s*\((name open)\)$", t)
    if m:
        return f'{esc(m.group(1))} <span class="open">({esc(m.group(2))})</span>'
    return esc(t)


def name_only(p):  # the title without the "(name open)" note, for a link label
    return re.sub(r"\s*\(name open\)$", "", B(p, "title"))


def index_a():
    def row(i, p):
        return (f'<li style="--i:{i}"><a class="row" href="software/{p}.html">'
                f'<span class="rf" aria-hidden="true"><span class="frame">{art(p, "software/")}</span></span>'
                f'<h3 class="rn" data-block-id="{bid(p, "title")}">{title_html(p)}</h3>'
                f'<p class="rs" data-block-id="{bid(p, "card-summary")}">{esc(B(p, "card-summary"))}</p>'
                f'<svg class="go" viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6h15M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
                f'</a></li>')

    body = f'''<div class="room wrap sx sx-a"><header class="room-head"><h1>Software</h1><p class="claim" data-block-id="software.index.intro">{esc(blocks["software.index.intro"])}</p></header>
<ol class="idx" id="idx-main">{"".join(row(i, p) for i, p in enumerate(MAIN))}</ol>
<section class="grp" id="grp-health" aria-labelledby="h-health"><h2 id="h-health" data-block-id="software.health.group-heading">{LABELS["health"]}</h2>
<ol class="idx" id="idx-health">{"".join(row(len(MAIN) + i, p) for i, p in enumerate(HL))}</ol></section></div>'''
    return head("Software · Mangrove", blocks["software.index.intro"], "", "software.index.intro") + shell(body, "")


def index_b():
    def plate(i, p, lead_=False):
        return (f'<li class="plate{" plate-lead" if lead_ else ""}" style="--i:{i}"><a href="software/{p}.html">'
                f'<div class="frame">{art(p, "software/")}</div><div class="pt">'
                f'<h3 class="pn" data-block-id="{bid(p, "title")}">{title_html(p)}</h3>'
                f'<p class="ps" data-block-id="{bid(p, "card-summary")}">{esc(B(p, "card-summary"))}</p></div></a></li>')

    body = f'''<div class="room wrap sx sx-b"><header class="room-head"><h1>Software</h1><p class="claim" data-block-id="software.index.intro">{esc(blocks["software.index.intro"])}</p></header>
<ol class="plates">{plate(0, MAIN[0], True)}{"".join(plate(i + 1, p) for i, p in enumerate(MAIN[1:]))}</ol>
<section class="grp" aria-labelledby="h-health"><h2 id="h-health" data-block-id="software.health.group-heading">{LABELS["health"]}</h2><ol class="plates">{"".join(plate(i, p) for i, p in enumerate(HL))}</ol></section></div>'''
    return head("Software (catalogue direction) · Mangrove", blocks["software.index.intro"], "", "software.index.intro") + shell(body, "")


def prose(p, slot, cls=""):
    ps = paras(B(p, slot))
    return f'<div class="prose {cls}" data-block-id="{bid(p, slot)}">' + "".join(f"<p>{esc(t)}</p>" for t in ps) + "</div>"


def flow(p):
    pre, items, post = steps(B(p, "how-it-works"))
    lis = "".join(f"<li>{lead(t, 34)}</li>" for t in items)
    return (f'<div class="flowwrap" data-block-id="{bid(p, "how-it-works")}">'
            + "".join(f'<p class="fnote">{esc(t)}</p>' for t in pre)
            + f'<ol class="flow">{lis}</ol>'
            + "".join(f'<p class="fnote">{esc(t)}</p>' for t in post) + "</div>")


def examples(p):
    ps = paras(B(p, "examples"))
    n = 3 if len(ps) >= 3 else 2
    perm = p == "sketchin"
    msg = LABELS["ph_perm"] if perm else LABELS["ph_do"]
    tiles = "".join(
        f'<div class="ph"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/>'
        f'<path d="M3.5 16l5-5 4 4 3-3 5 5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="16.5" cy="9.5" r="1.3" fill="currentColor"/></svg>'
        f'<span class="ph-t"><b>{LABELS["ph"]}.</b> {msg}</span></div>' for _ in range(n))
    return f'<div class="phs" style="--c:{n}">{tiles}</div>' + prose(p, "examples")


SECTIONS = [("problem", lambda p: prose(p, "problem", "big")),
            ("who", lambda p: prose(p, "who-for", "ruled")),
            ("how", flow),
            ("today", lambda p: prose(p, "today", "ruled")),
            ("examples", examples),
            ("next", lambda p: prose(p, "next", "ruled"))]


def detail(p, idx):
    pn = PRODUCTS[idx + 1] if idx + 1 < len(PRODUCTS) else None
    toc = "".join(f'<li><a href="#s-{k}">{LABELS[k]}</a></li>' for k, _ in SECTIONS)
    secs = "".join(f'<section class="ps-sec" id="s-{k}" aria-labelledby="h-{k}"><h2 id="h-{k}">{LABELS[k]}</h2><div class="ps-body">{fn(p)}</div></section>'
                   for k, fn in SECTIONS)
    pager = f'<a href="../software.html"><span aria-hidden="true">←</span> {LABELS["all"]}</a>'
    if pn:
        pager += f'<a class="nx" href="{pn}.html">{esc(name_only(pn))} <span aria-hidden="true">→</span></a>'
    body = f'''<div class="room wrap sx sx-d"><p class="crumb"><a href="../software.html"><span aria-hidden="true">←</span> Software</a></p>
<div class="hero-p"><header class="room-head"><h1 data-block-id="{bid(p, "title")}">{title_html(p)}</h1><p class="claim" data-block-id="{bid(p, "summary")}">{esc(B(p, "summary"))}</p></header>
<div class="frame" id="art">{art(p)}{PAUSE if p == "breathing-room" else ""}</div></div>
{CREDIT if p == "healthstory" else ""}
<div class="pp"><nav class="toc" aria-label="{LABELS["toc"]}"><h2>{LABELS["toc"]}</h2><ol>{toc}</ol></nav><div class="pp-main">{secs}</div></div>
<nav class="pager" aria-label="More">{pager}</nav></div>'''
    return head(f"{name_only(p)} · Software · Mangrove", B(p, "summary"), "../", bid(p, "summary")) + shell(body, "../")


if __name__ == "__main__":
    (nxt / "software.html").write_text(index_a(), encoding="utf8")
    (nxt / "software-b.html").write_text(index_b(), encoding="utf8")
    for i, p in enumerate(PRODUCTS):
        (nxt / "software" / f"{p}.html").write_text(detail(p, i), encoding="utf8")
    print("built", len(PRODUCTS) + 2, "pages")
