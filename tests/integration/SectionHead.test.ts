import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import SectionHead from '../../src/components/SectionHead.astro';

const HEADING_ID = 'section-title';
const MARKER = '[ 01 ]';
const SLOT = 'The Coordinates';

describe('SectionHead', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(SectionHead, { props: { headingId: HEADING_ID, marker: MARKER }, slots: { default: SLOT } });
    });

    test('renders the head as a scroll-animated grid', () => {
        expect(html).toMatch(/<div class="section__head[^"]*"[^>]*data-scroll/);
    });

    test('renders the marker in the number cell', () => {
        expect(html).toMatch(new RegExp(`<span class="section__number"[^>]*>\\[ 01 \\]</span>`));
    });

    test('defaults the heading to an h1 carrying the id and slot', () => {
        expect(html).toMatch(new RegExp(`<h1 id="${HEADING_ID}" class="section__title"[^>]*>${SLOT}</h1>`));
    });

    test('renders an h2 when the level prop requests one', async () => {
        const container = await AstroContainer.create();

        const heading = await container.renderToString(SectionHead, { props: { headingId: HEADING_ID, level: 'h2', marker: '[ 02 ]' }, slots: { default: SLOT } });

        expect(heading).toMatch(new RegExp(`<h2 id="${HEADING_ID}" class="section__title"[^>]*>${SLOT}</h2>`));
        expect(heading).not.toContain('<h1');
    });
});
