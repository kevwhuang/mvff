import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import SectionHeader from '../../src/components/SectionHeader.astro';

const HEADING = 'The Experience';
const HEADING_ID = 'experience-title';
const MARKER = '[ 02 ]';

async function renderHeader(props: Record<string, unknown>) {
    const container = await AstroContainer.create();

    return container.renderToString(SectionHeader, { props, slots: { default: HEADING } });
}

describe('SectionHeader', () => {
    let html: string;

    beforeAll(async () => {
        html = await renderHeader({ headingId: HEADING_ID, marker: MARKER });
    });

    test('renders an h1 carrying the heading id by default', () => {
        expect(html).toContain(`<h1 id="${HEADING_ID}" class="section-header__title uppercase"`);
        expect(html).toContain('</h1>');
    });

    test('renders an h2 when the level prop is h2', async () => {
        const demoted = await renderHeader({ headingId: HEADING_ID, level: 'h2', marker: MARKER });

        expect(demoted).toContain(`<h2 id="${HEADING_ID}" class="section-header__title uppercase"`);
        expect(demoted).not.toContain('<h1');
    });

    test('renders the marker span before the heading and keeps the header unbare when a marker is given', () => {
        expect(html).toContain('<span class="section-header__marker font-mono text-coral select-none"');
        expect(html).toContain(`>${MARKER}</span>`);
        expect(html.indexOf('section-header__marker')).toBeLessThan(html.indexOf(`<h1 id="${HEADING_ID}"`));
        expect(html).toContain('<header class="section-header grid items-baseline');
        expect(html).not.toContain('section-header--bare');
    });

    test('adds the bare modifier and omits the marker span without a marker', async () => {
        const bare = await renderHeader({ headingId: HEADING_ID });

        expect(bare).toContain('<header class="section-header section-header--bare grid items-baseline');
        expect(bare).not.toContain('section-header__marker');
        expect(bare).not.toContain('<span');
    });

    test('renders slot content inside the heading', () => {
        expect(html).toContain(`>${HEADING}</h1>`);
    });

    test('marks the header for scroll animation', () => {
        expect(html).toContain('data-scroll');
        expect(html.split('data-scroll').length - 1).toBe(1);
    });
});
