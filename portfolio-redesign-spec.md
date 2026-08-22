# Portfolio UI/UX Redevelopment Spec

**Reference inspiration:** [bouayaben.com](https://bouayaben.com/) — Mehdi Bouayaben, Senior Product Designer
**Stack:** React
**Status:** Design direction draft v1

---

## 1. Design Philosophy

The reference site reads as a restrained, editorial, case-study-first portfolio: near-black background, huge amounts of negative space, quiet typography doing most of the work, and content (not decoration) as the hero. The redesign should borrow that discipline rather than any literal visual asset:

- **Content-led, not chrome-led.** No heavy UI framing — let type, spacing, and real work carry the page.
- **One idea per screen.** Hero, then a short intro, then work — each section gets room to breathe instead of competing for attention.
- **Confidence through restraint.** Few colors, few font weights, few motion effects — each one used deliberately.
- **Dark-first, light as an equally polished alternative** — not a bolted-on inverted stylesheet.

---

## 2. Theming: Dark & Light

Build theming as **design tokens**, not hardcoded hex values, so both themes stay in sync structurally and only swap values.

### Dark theme (default)
| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#0A0A0A` | Page background |
| `--bg-secondary` | `#121212` | Cards, panels, alt sections |
| `--text-primary` | `#F5F5F3` | Headings, body |
| `--text-secondary` | `#9A9A96` | Meta text, captions |
| `--border` | `#242424` | Hairline dividers |
| `--accent` | `#E5432D` *(placeholder — pick your brand accent)* | Links, highlights, CTA |

### Light theme
| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#FAFAF8` | Page background |
| `--bg-secondary` | `#F0F0EE` | Cards, panels, alt sections |
| `--text-primary` | `#0F0F0F` | Headings, body |
| `--text-secondary` | `#6B6B68` | Meta text, captions |
| `--border` | `#E2E2DE` | Hairline dividers |
| `--accent` | same accent, adjusted for contrast | Links, highlights, CTA |

**Notes:**
- Keep the accent color identical (or near-identical) across themes for brand consistency; only shift its lightness slightly for AA contrast.
- Avoid pure `#000000`/`#FFFFFF` — the slightly warm off-black/off-white (as in the reference's `#0A0A0A`) feels less harsh and more premium.
- Theme toggle should be a small, quiet control (icon or text switch, e.g. "Dark / Light") in the nav — not a prominent feature.
- Respect `prefers-color-scheme` on first load, then persist user choice (localStorage in a real deploy; in-memory state is fine for prototyping in Claude artifacts).
- Transition theme changes with a short (150–200ms) crossfade on background/text colors — avoid a jarring snap.

---

## 3. Typography

- **Two typefaces max**: one for display/headings (can have some character — a clean grotesque or a subtly editorial serif), one for body/UI (neutral grotesque: Inter, General Sans, Neue Montreal, or similar).
- **Large hero type.** Name/title in hero should feel oversized relative to typical portfolios — think 64–120px on desktop, scaling fluidly with `clamp()`.
- **Tight, deliberate hierarchy**: 3–4 sizes total (hero, section heading, body, caption/meta) — resist adding more.
- **Generous line-height on body copy** (1.5–1.7) and **tighter line-height on display type** (1.0–1.1).
- **Letter-spacing:** slightly negative tracking on large headings, slightly positive (uppercase) tracking on small labels/eyebrows (e.g. "SELECTED WORK", "01 — INTRO").

---

## 4. Layout & Grid

- **12-column grid** on desktop, generous outer margins (don't run content edge-to-edge except for full-bleed imagery).
- **Max content width** ~1200–1320px, centered.
- **Vertical rhythm:** large section padding (120–200px between major sections on desktop) to preserve the "quiet" feeling.
- **Asymmetry is fine** — e.g. project title left-aligned in a narrow column, description in a wider column — but keep a consistent underlying grid so it doesn't feel random.
- **Mobile:** collapse to single column, reduce section padding to ~64–96px, keep hero type large but responsive via `clamp()`.

---

## 5. Core Page Structure

1. **Nav**
   - Fixed/sticky, minimal: name or wordmark left, 2–4 links right (Work, About, Contact), theme toggle.
   - Transparent over hero, solidifies (subtle background + blur) on scroll.

2. **Hero**
   - Name + role/one-line value proposition in large type.
   - One short supporting sentence (like the reference's meta description: what you do, for whom, at what scale).
   - Optional subtle scroll cue.

3. **Selected Work / Case Studies**
   - List or grid of projects, each with: thumbnail/cover, project name, one-line context (client/domain/impact), tags (role, year).
   - Prefer a **list-style layout with large hover-reveal imagery** (image appears/scales on row hover) over a dense grid — matches the editorial, spacious feel.
   - Each project links to a dedicated case-study page (problem → process → outcome), not just a modal.

4. **About**
   - Short bio, focused on trajectory and specialization, not a full resume dump.
   - Optional: a compact skills/tools list styled as plain text, not badges/pills.

5. **Contact / Footer**
   - Simple, direct: email as a prominent link, 2–3 social/profile links, maybe current availability status.
   - Footer can double as a closing statement rather than a generic link dump.

---

## 6. Components

| Component | Behavior |
|---|---|
| Nav | Sticky, background fade-in on scroll, active-link underline |
| Theme toggle | Icon button, animated icon swap, instant token switch |
| Project row/card | Hover: image scale (1.0 → 1.03), slight brightness/overlay shift, cursor can follow with a "View" label |
| Buttons/links | Underline-on-hover or animated underline sweep; avoid boxed buttons except for a single primary CTA |
| Section eyebrow labels | Small uppercase tracked text above headings ("WORK", "ABOUT") |
| Dividers | 1px hairline using `--border` token, full-width or grid-aligned |

---

## 7. Motion & Micro-interactions

Keep motion **subtle and purposeful** — the reference site's feel comes from confidence, not flashiness:

- Page/section entrance: small fade + 12–24px upward translate on scroll into view (once, not repeating).
- Hero text: optional staggered fade-in on load (words or lines, 60–100ms stagger).
- Hover states: 150–250ms ease-out transitions on color/scale/opacity — nothing longer.
- Theme switch: crossfade colors, no layout shift.
- Avoid parallax, heavy scroll-jacking, or looping background animation — none of that fits the restrained tone.

---

## 8. Imagery

- High-quality, consistent-aspect-ratio project covers (avoid mixing wildly different crop ratios).
- Prefer real product screenshots/mockups presented cleanly (device frames or flat crops) over stock photography.
- Muted, consistent color grading across project thumbnails so the grid/list feels cohesive even with different projects.

---

## 9. Accessibility

- Maintain **WCAG AA contrast** in both themes (verify `--text-secondary` against both backgrounds — muted grays are the most common failure point).
- All interactive elements need visible focus states (a simple 1–2px outline in `--accent` works well and stays on-brand).
- Respect `prefers-reduced-motion`: disable scroll-entrance animation and hover-scale for users who opt out.
- Ensure the theme toggle is keyboard-operable and announces state to screen readers (`aria-pressed` or similar).

---

## 10. React Implementation Notes

- Model theme as a **CSS custom-properties layer** (`:root[data-theme="dark"]`, `:root[data-theme="light"]`) driven by a small `ThemeContext` + `useState`/`useReducer` — avoid re-rendering the whole tree on toggle.
- Keep design tokens in one file (e.g. `tokens.css` or a `theme.ts` object) so components never hardcode colors.
- Use `IntersectionObserver` (or a lightweight lib) for scroll-entrance animations rather than a heavy animation library, to keep the site fast — performance is part of the "confident, premium" feel.
- Case-study pages can be simple MDX or structured JSON-driven templates so adding new work doesn't require new layout code each time.

---

## 11. Open Questions to Resolve Before Build

- What's the actual content scope: how many case studies, do they need dedicated sub-pages or is a single-page portfolio enough for now?
- Final accent color and wordmark/logotype treatment.
- Whether resume/CV download is needed alongside the About section.
- Any existing brand assets (logo, existing color use) that should carry over rather than be replaced.
