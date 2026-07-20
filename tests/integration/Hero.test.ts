import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Hero from '../../src/sections/Hero.astro';
import { LINKS } from '../../src/lib/constants';

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
        expect(html).toMatch(/<video class="hero__video[^"]*" autoplay loop muted playsinline poster="[^"]*poster\.webp[^"]*"/);
        expect(html).toContain('<source src="/videos/hero.webm" type="video/webm"');
    });

    test('hides the decorative background and frame corners from assistive tech', () => {
        expect(html).toMatch(/<div class="hero__background[^"]*"[^>]*aria-hidden="true"/);
        expect(html.split('class="hero__corner').length - 1).toBe(4);
    });

    test('marks the event as over with a wrap banner instead of a countdown', () => {
        expect(html).toMatch(/<dl class="hero__countdown[^"]*"/);
        expect(html).toMatch(/<dd class="hero__countdown-over[^"]*"[^>]*>That's a wrap\.<\/dd>/);
        expect(html).not.toContain('role="timer"');
        expect(html).not.toContain('data-unit');
    });

    test('stamps the event date into a machine-readable time element', () => {
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18, 2026<\/time>/);
    });

    test('dims the primary and secondary calls to action as unclickable', () => {
        expect(html).toMatch(new RegExp(`<a class="button button--primary" aria-disabled="true" href="${LINKS.posh}" rel="noopener" tabindex="-1" target="_blank"[^>]*>\\s*Buy Tickets\\s*</a>`));
        expect(html).toMatch(new RegExp(`<a class="button" aria-disabled="true" href="${LINKS.sponsor}" rel="noopener" tabindex="-1" target="_blank"[^>]*>\\s*Sponsor Us\\s*</a>`));
        expect(html).not.toContain('button--disabled');
    });
});
