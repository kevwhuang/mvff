import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Hero from '../../src/sections/Hero.astro';
import { LINKS } from '../../src/lib/constants';

const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
const META_ITEMS = ['Vol. 01', 'July 18, 2026', 'Cabana Club &middot; Austin, TX'] as const;

const REVEAL_BLOCKS = [
    'class="hero__countdown hero__reveal"',
    'class="hero__meta hero__reveal flex flex-wrap items-center gap-6 list-none"',
    'class="hero__reveal hero__title"',
    'class="hero__reveal subtitle font-serif italic text-cream-80"',
    'class="hero__actions hero__reveal flex"',
] as const;

describe('Hero', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Hero);
    });

    test('labels the section by the single hero title heading', () => {
        expect(html).toContain('<section class="hero grid items-center overflow-hidden relative isolate" aria-labelledby="hero-title"');
        expect(html).toMatch(/<h1 id="hero-title"/);
        expect(html.split('id="hero-title"').length - 1).toBe(1);
    });

    test('renders an autoplaying muted looping playsinline video with a poster and a webm source', () => {
        expect(html).toMatch(/<video class="hero__video object-cover h-full w-full" autoplay loop muted playsinline poster="[^"]*poster\.webp/);
        expect(html).toContain('<source src="/videos/hero.webm" type="video/webm"');
    });

    test('hides the background wrapper, the grain overlay, and the four corner rules from assistive tech', () => {
        expect(html).toContain('<div class="hero__background absolute inset-0 -z-1" aria-hidden="true"');
        expect(html).toContain('<div class="grain absolute" aria-hidden="true"');

        for (const corner of CORNERS) expect(html).toContain(`<div class="hero__corner hero__corner--${corner} absolute border border-cream" aria-hidden="true"`);

        expect(html.split('aria-hidden="true"').length - 1).toBe(6);
    });

    test('announces the wrap status through a description list with a screen-reader-only term', () => {
        expect(html).toMatch(/<dl class="hero__countdown hero__reveal"/);
        expect(html).toMatch(/<dt class="sr-only"[^>]*>Status<\/dt>/);
        expect(html).toMatch(/<dd class="hero__countdown-over font-display whitespace-nowrap text-coral"[^>]*>That's a wrap\.<\/dd>/);
    });

    test('renders the volume, date, and venue meta items in order with a machine-readable event date', () => {
        expect(html.split('class="hero__meta-item').length - 1).toBe(META_ITEMS.length);
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18, 2026<\/time>/);

        const positions = META_ITEMS.map(item => html.indexOf(item));

        expect(positions.every(position => position >= 0)).toBe(true);
        expect(positions).toEqual([...positions].sort((positionA, positionB) => positionA - positionB));
    });

    test('wraps the eager festival logo image in the hero heading with a retina srcset', () => {
        expect(html).toMatch(/<h1 id="hero-title" class="hero__reveal hero__title"[^>]*><img /);
        expect(html).toContain('data-image-component="true"');
        expect(html).toContain('austin_music_video_film_festival.webp');
        expect(html).toContain('alt="Austin Music Video Film Festival"');
        expect(html).toContain('loading="eager"');
        expect(html).toContain('width="640"');
        expect(html).toMatch(/srcset="[^"]* 2x"/);
    });

    test('renders the subtitle as two separately blocked lines', () => {
        expect(html).toMatch(/<p class="hero__reveal subtitle font-serif italic text-cream-80"/);
        expect(html).toMatch(/<span class="block"[^>]*>A red-carpet premiere for the music video\.<\/span>/);
        expect(html).toMatch(/<span class="block"[^>]*>Bold artists, from screen to stage\.<\/span>/);
    });

    test('opens the review action in a new tab as the only action', () => {
        expect(html).toContain(`href="${LINKS.review}" rel="noopener" target="_blank"`);
        expect(html).toMatch(/<a class="button button--primary"[^>]*>Leave a Review<\/a>/);
        expect(html.split('class="button').length - 1).toBe(1);
        expect(html).not.toContain('aria-disabled');
    });

    test('marks the five content blocks for the load-time reveal instead of scroll animation', () => {
        expect(html.split('hero__reveal').length - 1).toBe(REVEAL_BLOCKS.length);

        for (const block of REVEAL_BLOCKS) expect(html).toContain(block);

        expect(html).not.toContain('data-scroll');
    });
});
