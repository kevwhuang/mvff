import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Partners from '../../src/sections/Partners.astro';

describe('Partners', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Partners);
    });

    test('labels the marquee for assistive tech', () => {
        expect(html).toMatch(/<section class="partners[^"]*" aria-label="Partners" data-scroll/);
    });

    test('renders both partner logos twice as decorative images', () => {
        expect(html.split('<img').length - 1).toBe(4);
        expect(html.split('class="partners__logo partners__logo--madewell').length - 1).toBe(2);
        expect(html.split('class="partners__logo object-contain').length - 1).toBe(2);
        expect(html.split('alt aria-hidden="true"').length - 1).toBe(2);
    });

    test('names both partners alongside the logos', () => {
        expect(html).toContain('Madewell Productions');
        expect(html).toContain('Cabana Club');
    });

    test('duplicates the track and hides the copies and diamonds from assistive tech', () => {
        expect((html.match(/class="partners__item[^"]*"[^>]*>/g) ?? []).length).toBe(8);
        expect((html.match(/class="partners__item[^"]*" aria-hidden="true"/g) ?? []).length).toBe(6);
        expect(html).toMatch(/<span class="partners__diamond[^"]*"/);
    });
});
