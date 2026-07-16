import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Hero from '../../src/sections/Hero.astro';
import { LINKS } from '../../src/lib/constants';

const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

describe('Hero', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Hero);
    });

    test('labels the section by its headline for assistive tech', () => {
        expect(html).toMatch(/<section class="hero[^"]*" aria-labelledby="hero-title"/);
        expect(html).toMatch(/<h1 id="hero-title"/);
        expect(html.split('id="hero-title"').length - 1).toBe(1);
    });

    test('renders the wordmark as the headline image', () => {
        expect(html).toMatch(/<h1[^>]*id="hero-title"[\s\S]*?<img[^>]*alt="Austin Music Video Film Festival"/);
        expect(html).toContain('austin_music_video_film_festival.webp');
        expect(html).toMatch(/<img[^>]*loading="eager"/);
    });

    test('renders the muted autoplay video with a poster and webm source', () => {
        expect(html).toMatch(/<video class="hero__video" autoplay loop muted playsinline poster="[^"]*poster\.webp[^"]*"/);
        expect(html).toContain('<source src="/videos/hero.webm" type="video/webm"');
    });

    test('hides the decorative background and frame corners from assistive tech', () => {
        expect(html).toMatch(/<div class="hero__background[^"]*"[^>]*aria-hidden="true"/);
        expect(html.split('hero__frame-').length - 1).toBe(4);
    });

    test('renders a countdown definition list with a slot for every unit', () => {
        expect(html).toMatch(/<dl class="hero__countdown[^"]*"[^>]*aria-label="Event countdown"[^>]*role="timer"/);
        expect(html.split('class="hero__countdown-number"').length - 1).toBe(UNITS.length);

        for (const unit of UNITS) {
            expect(html).toMatch(new RegExp(`<dd class="hero__countdown-number" data-unit="${unit}"[^>]*>\\s*00\\s*</dd>`));
        }
    });

    test('stamps the event date into a machine-readable time element', () => {
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18, 2026<\/time>/);
    });

    test('renders the primary and secondary calls to action in new tabs', () => {
        expect(html).toMatch(new RegExp(`<a class="btn btn--primary" href="${LINKS.posh}" target="_blank"[^>]*>\\s*Buy Tickets\\s*</a>`));
        expect(html).toMatch(new RegExp(`<a class="btn" href="${LINKS.sponsor}" target="_blank"[^>]*>\\s*Sponsor Us\\s*</a>`));
    });
});
