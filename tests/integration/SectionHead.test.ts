import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import SectionHeader from '../../src/components/SectionHeader.astro';

const HEADING_ID = 'section-title';
const MARKER = '[ 01 ]';
const SLOT = 'The Coordinates';

describe('SectionHeader', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(SectionHeader, { props: { headingId: HEADING_ID, marker: MARKER }, slots: { default: SLOT } });
    });

    test('renders the head as a scroll-animated header', () => {
        expect(html).toMatch(/<header class="section-header[^"]*"[^>]*data-scroll/);
    });

    test('renders the marker in the number cell', () => {
        expect(html).toMatch(/<span class="section-header__marker[^"]*"[^>]*>\[ 01 \]<\/span>/);
    });

    test('defaults the heading to an h1 carrying the id and slot', () => {
        expect(html).toMatch(new RegExp(`<h1 id="${HEADING_ID}" class="section-header__title[^"]*"[^>]*>${SLOT}</h1>`));
    });

    test('renders an h2 when the level prop requests one', async () => {
        const container = await AstroContainer.create();

        const heading = await container.renderToString(SectionHeader, { props: { headingId: HEADING_ID, level: 'h2', marker: '[ 02 ]' }, slots: { default: SLOT } });

        expect(heading).toMatch(new RegExp(`<h2 id="${HEADING_ID}" class="section-header__title[^"]*"[^>]*>${SLOT}</h2>`));
        expect(heading).not.toContain('<h1');
    });

    test('drops the marker cell when no marker is provided', async () => {
        const container = await AstroContainer.create();

        const bare = await container.renderToString(SectionHeader, { props: { headingId: HEADING_ID }, slots: { default: SLOT } });

        expect(bare).toMatch(/<header class="section-header[^"]*section-header--bare[^"]*"/);
        expect(bare).not.toContain('section-header__marker');
    });
});
