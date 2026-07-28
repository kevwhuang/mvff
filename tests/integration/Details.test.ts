import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Details from '../../src/sections/Details.astro';

const DATETIMES = ['2026-07-18', '2026-07-18T19:00-05:00', '2026-07-19T02:00-05:00'] as const;
const TERMS = ['Date', 'Time', 'Venue'] as const;

describe('Details', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Details);
    });

    test('labels the section by the section header heading rendered as an h2', () => {
        expect(html).toContain('<section class="details section" aria-labelledby="details-title"');
        expect(html).toMatch(/<h2 id="details-title" class="section-header__title uppercase"[^>]*>The Coordinates<\/h2>/);
    });

    test('numbers the section header with the first bracketed marker', () => {
        expect(html).toMatch(/<span class="section-header__marker font-mono text-coral select-none"[^>]*>\[ 01 \]<\/span>/);
    });

    test('marks the description list for a staggered scroll reveal', () => {
        expect(html).toMatch(/<dl class="details__grid grid grid-cols-3 border border-cream-15 bg-navy" data-scroll data-scroll-stagger="0.12"/);
    });

    test('renders three cells termed date, time, and venue in order', () => {
        const terms = [...html.matchAll(/<dt class="details__label[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(html.split('class="details__cell').length - 1).toBe(TERMS.length);
        expect(terms).toEqual([...TERMS]);
    });

    test('renders the event date, window, and venue as the cell values', () => {
        expect(html).toMatch(/<dd class="details__value[^>]*><time datetime="2026-07-18"[^>]*>July 18, 2026<\/time><\/dd>/);
        expect(html).toMatch(/<time datetime="2026-07-18T19:00-05:00"[^>]*>7 PM<\/time>&nbsp;&ndash;&nbsp;<time datetime="2026-07-19T02:00-05:00"[^>]*>2 AM<\/time>/);
        expect(html).toMatch(/<dd class="details__value[^>]*>Cabana Club<\/dd>/);
    });

    test('stamps a machine-readable datetime on the date and on both window bounds', () => {
        const datetimes = [...html.matchAll(/<time datetime="([^"]+)"/g)].map(match => match[1]);

        expect(datetimes).toEqual([...DATETIMES]);
    });
});
