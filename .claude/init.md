# ATX Music Video Film Festival — Landing Page

> Single HTML file. Modern + bold. Starry night aesthetic. Fully accessible. SEO-optimized.

---

## Tech Stack

| Requirement   | Spec                                                        |
|---------------|-------------------------------------------------------------|
| Format        | Single HTML file with embedded CSS, inline SVGs             |
| CSS           | BEM conventions, mobile-first, Prettier-formatted           |
| Breakpoints   | 768px (tablet), 1024px (laptop), 1440px (large)             |
| Accessibility | WCAG 2.1 AA (skip link, ARIA, focus states, 4.5:1 contrast) |
| SEO           | Open Graph, Twitter Cards, structured data, canonical       |

---

## Design

- **Style**: Modern professionalism with bold creative choices
- **Audience**: Filmmakers, music video creators, festival attendees
- **Background**: CSS-only starry night — deep cosmic gradient, radial gradient stars, subtle twinkle
  - Keep animations lightweight (prefer `opacity` over `transform`)
  - Ensure text contrast with subtle overlay if needed
  - No heavy particle effects or JS-based stars
- **Palette**: Dark navy/purple base, gold or vibrant accent, crisp white text
- **Typography**: Clean sans-serif, strong hierarchy

---

## HTML Structure

```html
<header>
  <nav></nav>
  <section class="hero"></section>
</header>
<main>
  <section class="tagline"></section>
  <section class="event-details"></section>
  <section class="sponsorship"></section>
  <section class="categories"></section>
</main>
<footer></footer>
```

---

## Page Sections

### 1. Nav

- Fixed/sticky, extensible
- **CTA**: "Submit Music Video HERE" → `https://google.com` (placeholder)
- Visually prominent button style

### 2. Hero

- Festival title: **ATX MUSIC VIDEO FILM FESTIVAL**
- Laurels image: `assets/logo-hero.png`
- Favicon: `assets/favicon.ico`

### 3. Tagline

- Text: "Screens to Stage — An immersive production blending music and film, celebrating artists."
- Use `<span>` elements for styling hooks or subtle animation

### 4. Event Details

| Field | Value       |
|-------|-------------|
| Date  | July 18     |
| Time  | 7PM–2AM     |
| Venue | Cabana Club |

### 5. Sponsorship CTA

- Text: "View Sponsorship Deck →"
- Link: `assets/pitch-deck.pdf` (new tab)
- Key conversion point — make it stand out

### 6. Categories

- Music Video Screening Blocks
- Award Ceremony
- Live Performances
- Q&A Panel
- Summer Pool Party

### 7. Footer

- **Instagram**: @atxmvff → `https://instagram.com/atxmvff` (new tab) → `assets/icon-instagram.svg`
- **Email**: `mailto:contact@atxmusicvideofilmfestival.com` → `assets/icon-email.svg`
- **Calendly**: "Schedule a Call with the Festival Director" → `https://calendly.com/madewellanna99/30min` (new tab) → `assets/icon-calendar.svg`

---

## Assets

```
assets/
  favicon.ico        ← Multi-size (16/32/48px)
  logo-hero.png      ← Festival laurels (hero image)
  pitch-deck.pdf     ← Sponsorship pitch deck
  icon-instagram.svg ← Footer icon
  icon-email.svg     ← Footer icon
  icon-calendar.svg  ← Footer icon (Calendly)
```

---

## SEO Meta Tags

```html
<!-- Primary -->
<title>ATX Music Video Film Festival | July 18, 2026 | Austin TX</title>
<meta name="description" content="Screens to Stage — An immersive production blending music and film, celebrating artists. Music video screenings, live performances, Q&A panels, award ceremony, and pool party. July 18, 7PM–2AM at Cabana Club, Austin TX.">
<meta name="keywords" content="ATX Music Video Film Festival, Austin film festival, music video screening, live music Austin, film awards, Cabana Club, Texas film festival, music video awards, 2026 festival, summer festival Austin">
<meta name="author" content="ATX Music Video Film Festival">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://atxmusicvideofilmfestival.com">
<link rel="icon" href="assets/favicon.ico" type="image/x-icon">

<!-- Open Graph -->
<meta property="og:type" content="event">
<meta property="og:title" content="ATX Music Video Film Festival | July 18, 2026">
<meta property="og:description" content="Screens to Stage — Music video screenings, live performances, award ceremony & pool party. July 18 at Cabana Club, Austin TX.">
<meta property="og:image" content="https://atxmusicvideofilmfestival.com/assets/logo-hero.png">
<meta property="og:url" content="https://atxmusicvideofilmfestival.com">
<meta property="og:site_name" content="ATX Music Video Film Festival">
<meta property="og:locale" content="en_US">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="ATX Music Video Film Festival | July 18, 2026">
<meta name="twitter:description" content="Screens to Stage — Music video screenings, live performances, award ceremony & pool party. Austin TX.">
<meta name="twitter:image" content="https://atxmusicvideofilmfestival.com/assets/logo-hero.png">
<meta name="twitter:site" content="@atxmvff">

<!-- Additional -->
<meta name="theme-color" content="#0a0e1a">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
