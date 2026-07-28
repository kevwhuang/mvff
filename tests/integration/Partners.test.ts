import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Partners from '../../src/sections/Partners.astro';

const MARQUEE_COPIES = 6;
const PARTNERS_PER_COPY = 2;

describe('Partners', () => {
    let html: string;
    let items: string[];

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Partners);
        items = html.match(/<li class="partners__item[^>]*>/g) ?? [];
    });

    test('labels the marquee section for assistive tech and marks it for scroll animation once', () => {
        expect(html).toContain('<section class="partners section border-cream-15 border-y bg-navy select-none" aria-label="Partners" data-scroll');
        expect(html.split('data-scroll').length - 1).toBe(1);
    });

    test('publishes the copy count to css for the scroll keyframes', () => {
        expect(html).toContain(`<ul class="partners__track flex items-center w-max list-none" style="--partners-copies: ${MARQUEE_COPIES}"`);
    });

    test('repeats the madewell and cabana club pair six times', () => {
        expect(items).toHaveLength(MARQUEE_COPIES * PARTNERS_PER_COPY);
        expect(html.split('>Madewell Productions</span>').length - 1).toBe(MARQUEE_COPIES);
        expect(html.split('alt="Cabana Club"').length - 1).toBe(MARQUEE_COPIES);
    });

    test('exposes only the first copy of the pair and hides every repeat from assistive tech', () => {
        for (const item of items.slice(0, PARTNERS_PER_COPY)) expect(item).not.toContain('aria-hidden');

        for (const item of items.slice(PARTNERS_PER_COPY)) expect(item).toContain('aria-hidden="true"');
    });

    test('renders the madewell logo as decorative next to its wordmark and the cabana club logo with alt text', () => {
        expect(html).toMatch(/<img[^>]*madewell_productions\.webp[^>]*alt aria-hidden="true"[^>]*><span[^>]*>Madewell Productions<\/span>/);
        expect(html).toMatch(/<img[^>]*cabana_club\.webp[^>]*alt="Cabana Club"/);
        expect(html.split('alt aria-hidden="true"').length - 1).toBe(MARQUEE_COPIES);
        expect(html.split(' 2x"').length - 1).toBe(MARQUEE_COPIES * PARTNERS_PER_COPY);
    });
});
