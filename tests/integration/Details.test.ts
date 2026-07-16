import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Details from '../../src/sections/Details.astro';

const CELLS = [
    { label: 'Venue', note: '5012 E 7th St, Austin, TX' },
    { label: 'Date', note: 'A Saturday night in Austin.' },
    { label: 'Time', note: 'Seven hours, doors to pool.' },
] as const;

describe('Details', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Details);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="details[^"]*" aria-labelledby="details-title"/);
        expect(html).toMatch(/<h2 id="details-title" class="section__title"/);
    });

    test('renders the section marker and title', () => {
        expect(html).toMatch(/<span class="section__number"[^>]*>\[ 01 \]<\/span>/);
        expect(html).toMatch(/<h2 id="details-title"[^>]*>The Coordinates<\/h2>/);
    });

    test('renders a definition cell for every coordinate', () => {
        expect(html.split('class="details__cell').length - 1).toBe(CELLS.length);

        for (const cell of CELLS) {
            expect(html).toMatch(new RegExp(`<dt class="details__label[^"]*"[^>]*>${cell.label}</dt>`));
            expect(html).toContain(cell.note);
        }
    });

    test('renders the venue, date, and time values', () => {
        expect(html).toMatch(/<dd class="details__value"[^>]*>Cabana Club<\/dd>/);
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18<\/time>/);
        expect(html).toMatch(/<dd class="details__value"[^>]*>7 PM&ndash;2 AM<\/dd>/);
    });
});
