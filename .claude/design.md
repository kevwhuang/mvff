# ATX Music Video Film Festival — Design System

When generating any design, copy, layout, color, or motion for the ATX MVFF site, follow this system. It is the source of truth.

## Aesthetic

Make it feel like a **midnight premiere meets an Austin gig-poster wall**. Editorial newspaper grid bones. Oversized condensed display type. Electric ember and cyan punching out of inky black. Cinematic, kinetic, unapologetically loud.

The light theme is its own identity — cream paper, coffee ink, oxidized red. Think 35mm contact sheets and zine print. **Never treat light as inverted dark.**

## Type

Use these four families. Do not substitute.

- **Bebas Neue** — display. Headlines, hero, big numerals. Poster-energy condensed sans.
- **Instrument Serif Italic** — editorial. Taglines, descriptions, pull-quotes.
- **JetBrains Mono** — mono. Eyebrows, timestamps, tags, countdown, metadata.
- **Inter** — utility body fallback only.

## Color tokens

Use these CSS variables. Do not introduce ad-hoc colors.

### Dark
```css
--ink:    #0a0a0f;              /* near-black inky base */
--paper:  #f4f1ea;              /* warm off-white text */
--ember:  oklch(0.74 0.19 30);  /* primary accent — electric warm orange-red */
--cyan:   oklch(0.78 0.16 210); /* secondary accent — cool counterpoint */
```

### Light
```css
--cream:        #f1ead8;              /* warm cream paper */
--coffee:       #1a1612;              /* deep coffee ink */
--oxidized-red: oklch(0.50 0.16 28);  /* primary accent — muted vintage red */
--faded-teal:   oklch(0.55 0.10 200); /* secondary accent — desaturated counterpoint */
```

## Signature elements

These carry the festival identity. Preserve them across pages.

- **Parallax starfield** — three depth layers, 220 stars total, independent drift speeds, staggered twinkle.
- **Film grain** — turbulence texture + radial vignette on every surface.
- **Frame-corner brackets** — viewfinder feel on the hero.
- **Countdown** — LED-pulse in nav, giant numeric countdown in hero.
- **Marquee partner strip** — diamond separators between Madewell, Cabana Club, "EST · 2026", "AUSTIN TEXAS".
- **Loader** — film-laurel spin with scanning bar.
- **404** — RGB-split glitch.

## Pages

When working on a given page, include the following:

- **Home** — hero with poster image, "Screens → Stage" tagline, three-cell coordinates grid, five newspaper-style highlight rows, partners marquee.
- **Team** — eleven portraits in a hairline grid; grayscale by default, full color on hover.
- **Shop** — five products + sticky live cart (add / remove + checkout).
- **Gallery** — bento grid with lightbox detail (Esc closes).
- **Info** — twelve-row schedule, venue card, FAQ accordion, practical bullets.
- **Contact** — form with subject dropdown, success banner, direct-channel sidebar.
- **404** — glitch hero with return CTAs.

## Interaction states

Treat these as required, not decorative.

**Hover**
- Marquee-style title slide on highlight rows
- Team photos: scale + grayscale → full color
- Ember underline on FAQ items
- Cell darken on schedule and detail rows

**Focus**
- Ember outline on inputs
- Ember border on focus rings
- Full keyboard navigation on every control

**Motion**
- Countdown ticks every second
- Cart updates item counts in real time
- Page transitions between routes

---

*Tagline: SCREENS → STAGE · EST 2026 · AUSTIN TEXAS*
