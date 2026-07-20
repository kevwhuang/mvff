import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Details from '../../src/sections/Details.astro';

const LABELS = ['Date', 'Time', 'Venue'] as const;

describe('Details', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Details);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="details[^"]*" aria-labelledby="details-title"/);
        expect(html).toMatch(/<h2 id="details-title" class="section-header__title[^"]*"/);
    });

    test('renders the section marker and title', () => {
        expect(html).toMatch(/<span class="section-header__marker[^"]*"[^>]*>\[ 01 \]<\/span>/);
        expect(html).toMatch(/<h2 id="details-title"[^>]*>The Coordinates<\/h2>/);
    });

    test('renders a definition cell for every coordinate', () => {
        expect(html.split('class="details__cell').length - 1).toBe(LABELS.length);

        for (const label of LABELS) {
            expect(html).toMatch(new RegExp(`<dt class="details__label[^"]*"[^>]*>${label}</dt>`));
        }
    });

    test('renders the venue, date, and time values', () => {
        expect(html).toMatch(/<dd class="details__value[^"]*"[^>]*>Cabana Club<\/dd>/);
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18, 2026<\/time>/);
        expect(html).toMatch(/<time datetime="2026-07-18T19:00-05:00"[^>]*>7 PM<\/time>/);
        expect(html).toMatch(/<time datetime="2026-07-19T02:00-05:00"[^>]*>2 AM<\/time>/);
    });
});
