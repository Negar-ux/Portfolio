---
name: portfolio-design
description: Design system for negardeilami.com case studies — type scale, colour tokens, panel/card treatment, spacing rhythm, and the specificity traps in case-study.css. Use when adding or editing any case-study markup or CSS.
---

# Portfolio design system

Rules for `fitness-app.html`, `surgical-dashboard.html`, `hospital-discharge.html`,
`design-workshops.html` and the shared `case-study.css`.

**The single most important rule: never hardcode a font size in a component rule.**
`case-study.css` scales type across breakpoints with `!important`. A component that
sets one fixed size looks correct on your screen and wrong on every other one. This
has been the cause of most visual bugs on this site.

## Type scale

`case-study.css` sets these with `!important` at four breakpoints. Component CSS
must follow the same scale or it will drift.

| Element | ≤768px | base (769–1199) | ≥1200px | ≥1400px |
|---|---|---|---|---|
| `h1` | 28px | 36px | 42px | 48px |
| `h2` | 24px | 28px | 32px | 36px |
| `h3` | 20px | 22px | 26px | 28px |
| `h4` | 18px | 18px | 20px | 22px |
| `p` / `ul li` | 16px | 16px | 18px | 20px |

Body line-height is **1.7**. Match it on anything that sits in the main text column.

**Two tiers of body text:**
- **Main column** (paragraphs, `.measure-list`, `.finding-list`, `.review-list`) —
  full body scale, 16/18/20, line-height 1.7.
- **Inside narrow cards** (`.flow__step p`, `.focus-cards__card p`,
  `.target-groups__barriers li`) — flat **16px**. These columns are ~290px wide at
  desktop; body size gives about twelve characters a line.

If a list must match the body, write all three breakpoints:

```css
.case-study-section .my-list li { font-size: 16px !important; line-height: 1.7 !important; }
@media (min-width: 1200px) { .case-study-section .my-list li { font-size: 18px !important; } }
@media (min-width: 1400px) { .case-study-section .my-list li { font-size: 20px !important; } }
```

## Colour

Tokens live in `styles.css` (`:root` and `[data-theme="dark"]`). Always use the
token with a fallback: `var(--text-secondary, #565656)`.

| Token | Light | Dark |
|---|---|---|
| `--text-primary` | `#000000` | `#e8e8e8` |
| `--text-secondary` | `#565656` | `#b8b8b8` |
| `--text-muted` | `#666` | `#999` |
| `--bg-secondary` | `#f8f9fa` | `#242424` |
| `--border-color` | `#e0e4e7` | `#3a3a3a` |

**Per-case-study accent.** Each page sets a body class; `--cs-accent` follows from it.
Never hardcode an accent — use `var(--cs-accent, #1b212e)`.

| Body class | Page | Light | Dark |
|---|---|---|---|
| `cs-sekond-skin` | fitness-app | `#1b212e` | `#798bb0` |
| `cs-surgical` | surgical-dashboard | `#63397d` | `#a679c2` |
| `cs-hospital` | hospital-discharge | `#c2410c` | `#f15718` |
| `cs-workshops` | design-workshops | `#a33468` | `#cf6a99` |

Body text is `--text-secondary`, not black. Headings are `--text-primary`.

## Panels and cards — one treatment

Every content panel looks the same. Do not invent a variant.

```css
border: 1px solid var(--border-color, #e0e4e7);
border-radius: 10px;
background: var(--bg-secondary, #f8f9fa);
```

Applies to `.flow__step`, `.focus-cards__card`, `.type-chart`, `.stat-card`,
`.target-groups > li`. A new panel takes these three lines exactly.

**Padding is the one thing not yet unified** — the existing values are:

| Component | Padding |
|---|---|
| `.flow__step`, `.focus-cards__card` | `1.15rem 1.25rem` |
| `.stat-card` | `1.35rem 1.4rem` |
| `.type-chart`, `.target-groups > li` | `1.5rem` (`1.25rem` below 768px) |

Match the nearest existing component rather than inventing a fourth value. If asked
to tidy this, `1.25rem` for the small cards and `1.5rem` for the large panels is the
natural split.

**The one deliberate exception** is `.verdict`, the pull quote: `border-left: 4px
solid var(--cs-accent)`, no other border, no radius. It is a quote, not a panel.
Keep it different.

Accent bars on top of cards were removed — the accent lives in bullet dots, chart
bars and `.flow__kicker`, not in card chrome.

## Spacing rhythm

- Paragraph bottom margin **2rem** (32px). Everything in the main column sits on
  this rhythm — gaps above *and* below a list or figure should read as 32px.
- `.case-study-section > .case-study-image` — `margin: 2.5rem 0`
- Figure captions — 14px, `#888`, `margin-top: 0.75rem`. Separation from the next
  block comes from the figure's bottom margin, never from the caption.
- `.figure-desc` (long-description disclosure) — 15px, 8px radius.
- Card grids stack to one column at **820px** (`.target-groups`, `.flow__row`,
  `.focus-cards__grid`).

## Components

Defined inline in `fitness-app.html`'s `<style>`, except `.stat-card`/`.stat-grid`
and `.verdict`, which are in `case-study.css`.

| Component | Use |
|---|---|
| `.stat-grid` / `.stat-card` | headline figures with a source line |
| `.type-chart` | semantic `<table>` styled as bars; `.type-chart__track` wraps `.type-chart__bar` |
| `.target-groups` | `<ul>` card grid; `.target-groups__barriers` is a nested list |
| `.flow` / `.flow__step` | a sequence of steps; arrows between them |
| `.flow--parallel` | same cards, no arrows — for channels that are not a sequence |
| `.focus-cards` | three peer cards, no order implied |
| `.measure-list` / `.finding-list` | bullets with accent dots, main column |
| `.review-list` | bullets with an accent left border |
| `.verdict` | pull quote |

Bar charts must stay real `<table>` markup so a data view exists by construction.

## Traps in this codebase

These have each caused real bugs. Check them before assuming your CSS is wrong.

1. **`.case-study-section ul` overrides component lists.** It sets `padding-left:
   1.5rem !important` and `margin: 1rem 0 !important` at ≤768px, plus `ul li`
   font-size, margin and line-height. Specificity `(0,1,1)`. A component rule
   written `.my-list` `(0,1,0)` loses. Scope component list rules as
   `.case-study-section .my-list` and use `!important` on padding and margin.
   This rule alone caused four separate bugs in `.target-groups`.

2. **Never write `.component li` when the component contains nested lists.**
   `.target-groups li` matched both the cards and the bullets inside them, and
   stripped the cards' padding. Always `> li` for direct children.

3. **Do not raise the base rule's specificity to win a fight.** Changing
   `.target-groups` to `.case-study-section .target-groups` fixed an indent and
   silently broke the `max-width: 820px` rule that stacks the cards, because that
   rule is `(0,1,0)`. Put the override in its own separate rule and leave the base
   rule's specificity alone.

4. **Browser caches `case-study.css` hard.** A normal reload will show you stale
   CSS. Verify with a cache-busting query (below), and tell Negar to hard-refresh
   (Ctrl+F5). The live server sends `Cache-Control: max-age=600`.

5. **Entities are inconsistent in the HTML.** Some passages use `&mdash;`/`&rsquo;`,
   others use literal `—`/`’`. A string replace must try both forms.

## Verifying a change

The window will not resize in this environment. Measure in a same-origin iframe,
and bust the stylesheet cache **inside** the frame or you will measure stale CSS:

```js
window.__probe = async (w) => {
  document.getElementById('__f')?.remove();
  const f = document.createElement('iframe'); f.id = '__f';
  f.style.cssText = `position:fixed;left:-9999px;top:0;width:${w}px;height:900px;border:0`;
  f.src = '/fitness-app.html?cb=' + Date.now();
  document.body.appendChild(f);
  await new Promise(r => f.onload = r);
  for (const l of f.contentDocument.querySelectorAll('link[rel=stylesheet]')) {
    const u = new URL(l.href, location.href); u.searchParams.set('v', Date.now()); l.href = u.toString();
  }
  await new Promise(r => setTimeout(r, 900));
  const d = f.contentDocument, W = f.contentWindow, cs = W.getComputedStyle;
  // measure here
};
```

Check at **390, 800 and 1500** — below the stack point, between breakpoints, and
at the widest type step.

**Checklist for any layout change:**
- [ ] Component font size matches the body at all three widths (or is a deliberate 16px card size)
- [ ] Line-height matches the body (1.7) in the main column
- [ ] Left edge aligns with the body text — grids and lists should not be indented
- [ ] Gaps above and below read as 32px
- [ ] Panels use the one border treatment
- [ ] Card grids stack to one column below 820px
- [ ] Accent comes from `var(--cs-accent)`, not a hardcoded hex
- [ ] Dark mode still legible (toggle `[data-theme="dark"]`)

## Editing HTML safely

Content edits are done with Python string replacement, asserting before writing so
a failed match never leaves a half-edited file:

```python
def sw(old, new, label):
    global s
    assert old in s, 'NOT FOUND: ' + label
    s = s.replace(old, new, 1)
```

Never run a global whitespace normalisation (`s.replace('  ', ' ')`) — it halves
the indentation of the entire file and buries the real change in a 2500-line diff.

After editing, verify tag balance:

```python
bad = [t for t in ['p','ul','li','a','div','section','h2','h3','figure']
       if len(re.findall(r'<'+t+r'[\s>]', body)) != len(re.findall(r'</'+t+r'>', body))]
```

Strip `<style>` first — the CSS contains the literal text `<strong>` in a comment
and will register as an unbalanced tag.

## Voice

Not design, but it travels with these edits. Negar's register is plain and direct.
Avoid: aphoristic closers, "not X but Y" constructions, announcing honesty ("I
should be straight about..."), stacked em-dashes, and words that sound meaningful
but say nothing ("the lesser option", "a usable bar"). Name the cause rather than
gesturing at it. Do not make claims about named competitors.
