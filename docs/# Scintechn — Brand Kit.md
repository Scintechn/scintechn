# Scintechn — Brand Kit

**Version 1 · May 2026**

> From requirement to working software, in weeks. Delivery-led, not sales-led.

---

## 1. Identity

The Scintechn identity pairs a **module-flow mark** with a **monospace wordmark**.

- **The mark** — three blocks of growing height, fusing left-to-right. It reads as atomic modules consolidating into a finished product, mirroring Scintechn's delivery cadence (requirement → product). The third block is the violet accent — the moment the system "ships."
- **The wordmark** — set in JetBrains Mono Bold, with the lowercase "i" replaced by a violet vertical bar. The bar ties the wordmark visually to the mark and signals engineering rigor (terminal cursor, code caret).

Together they form a compact, technical, trustworthy lockup.

---

## 2. Color tokens

| Token  | Hex       | Use                                              |
|--------|-----------|--------------------------------------------------|
| Ink    | `#0B0F14` | Primary text, mark on light backgrounds          |
| Paper  | `#F7F6F2` | Page background, mark on dark backgrounds        |
| Violet | `#702DB4` | Accent — third module, "i" bar, primary CTA      |
| Muted  | `#6B7280` | Tagline, captions on light                       |
| Muted· | `#8A8F98` | Tagline, captions on dark                        |

**Rules**
- Violet is an accent, not a ground color. Use it sparingly: one violet element per composition.
- Never tint or gradient the violet. Solid `#702DB4` only.
- White space is part of the brand. Don't crowd the mark.

---

## 3. Type

| Family               | Weight        | Use                              |
|----------------------|---------------|----------------------------------|
| **JetBrains Mono**   | 700 Bold      | Wordmark, headlines, code        |
| **JetBrains Mono**   | 400 Regular   | Tagline, captions, metadata      |
| **Inter Tight**      | 400–600       | Body, UI, longform copy          |

- Tracking on the wordmark is `-0.02em`.
- Taglines are uppercase with `+0.08em` letter-spacing.
- Minimum body size: 14px web, 10pt print.

---

## 4. The mark — construction

The mark lives on an **80 × 64 grid**.

| Block | x  | y  | w  | h  | Fill   |
|-------|----|----|----|----|--------|
| 1     | 2  | 20 | 20 | 20 | Ink    |
| 2     | 26 | 14 | 20 | 32 | Ink    |
| 3     | 50 | 6  | 28 | 48 | Violet |

A **4-unit gap** sits between blocks — drawn as a Paper-colored rectangle. On dark grounds the gap becomes Ink; on the violet app-icon ground the gap becomes Violet.

**Clear space** — at least one block-width (20 grid units / 25% of the mark height) on every side.

**Minimum size** — 24 px (mark height ≈ 19 px). Below this, switch to the favicon variant.

---

## 5. The wordmark — construction

`sc` + violet bar + `ntechn`

- Set in JetBrains Mono Bold (700).
- The violet "i" bar is **14% of the cap height wide** and **78% of the cap height tall**, baseline-aligned.
- Side gaps to the bar: **10% of the cap height** on each side.
- Letter tracking: `-0.02em`.
- The wordmark and mark are aligned to the same vertical center; the gap between them equals the mark width × 0.25.

---

## 6. File reference

All files are in `/delivery`. Nine SVGs total.

### Lockups (mark + wordmark + tagline)
- `scintechn-lockup-light.svg` — primary, on light grounds. **1080 × 280.**
- `scintechn-lockup-dark.svg` — for dark grounds (includes ink rectangle ground). **1080 × 280.**

### Mark only
- `scintechn-mark-primary.svg` — three-color mark for light grounds.
- `scintechn-mark-on-dark.svg` — paper-block variant for dark grounds.
- `scintechn-mark-mono.svg` — single-fill version that uses CSS `currentColor`. Paste anywhere a single color is required (favicons in monochrome contexts, embossing, single-spot print).

### Wordmark only
- `scintechn-wordmark-light.svg` — wordmark for light grounds.
- `scintechn-wordmark-dark.svg` — wordmark for dark grounds.

### App icon & favicon
- `scintechn-app-icon-512.svg` — square 512×512, violet ground, paper + ink mark. iOS / macOS / social avatars.
- `scintechn-favicon-32.svg` — simplified mark optimized for browser tabs. Holds at 16×16.

---

## 7. Usage

### Do
- Use the lockup as the primary brand presence.
- Reverse to dark when the brand sits on photography or saturated grounds.
- Pair the mark alone with the wordmark alone (not both stacked).
- Keep the violet element solid and singular per composition.

### Don't
- Don't recolor the mark. The violet block always remains violet (or paper on the violet app-icon).
- Don't outline, drop-shadow, gradient, or 3D-extrude the mark.
- Don't replace the "i" bar with a different glyph or a dot.
- Don't set the wordmark in any other typeface.
- Don't compress or stretch the lockup. Scale uniformly.

---

## 8. Web embed

```html
<!-- Header lockup -->
<img src="/brand/scintechn-lockup-light.svg" alt="Scintechn" height="48">

<!-- Mark only -->
<img src="/brand/scintechn-mark-primary.svg" alt="" width="40" height="32">

<!-- Mark inline, theme-aware, single color -->
<span style="color: var(--ink)">
  <svg width="40" height="32"><use href="/brand/scintechn-mark-mono.svg#mark"/></svg>
</span>
```

### Favicon
```html
<link rel="icon" type="image/svg+xml" href="/brand/scintechn-favicon-32.svg">
<link rel="apple-touch-icon" href="/brand/scintechn-app-icon-512.svg">
```

---

## 9. Production notes

- The wordmark / lockup SVGs reference **JetBrains Mono** by name. Browsers with the font (or with the Google Font loaded on the page) render them correctly.
- For **distribution to printers, third-party platforms, or environments without the font**, outline the type to paths. Any vector tool can do this: open the SVG → select all text → "Convert to outlines" / "Object to Path" → re-export.
- All SVGs use `currentColor` only on `mark-mono`. Other files have hex values inlined.
- No raster fallbacks are included — the SVGs are resolution-independent and recommended everywhere. Generate PNGs at 1×/2×/3× from these source files if needed.

---

## 10. Voice

The brand voice is **direct, technical, and confident**. Write the way you'd write a commit message.

- "From requirement to working software, in weeks."
- "Delivery-led, not sales-led."
- "We design, build, and ship AI-powered SaaS products."

Avoid: marketing puffery, exclamation points, "leverage", "synergy", emoji.

---

*Questions or new asset needs — drop a note. This document is the canonical reference for v1 of the Scintechn identity.*
