import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import GalleryGrid from '../../src/sections/GalleryGrid.astro';

const TILE_COUNT = 15;
const WIDE_COUNT = 5;

describe('GalleryGrid', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(GalleryGrid);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="gallery[^"]*" aria-labelledby="gallery-title"/);
        expect(html).toMatch(/<span class="section__number"[^>]*>\[ G \]<\/span>/);
        expect(html).toMatch(/<h1 id="gallery-title"[^>]*>Gallery<\/h1>/);
    });

    test('renders a tile button for every frame', () => {
        expect(html.split('class="gallery__tile ').length - 1).toBe(TILE_COUNT);
        expect(html.split('aria-label="View ').length - 1).toBe(TILE_COUNT);
        expect(html.split('type="button"').length - 1).toBe(TILE_COUNT + 1);
    });

    test('lays out the tiles across wide and normal cells', () => {
        expect(html.split('gallery__cell--wide').length - 1).toBe(WIDE_COUNT);
        expect(html.split('gallery__cell--normal').length - 1).toBe(TILE_COUNT - WIDE_COUNT);
    });

    test('carries the frame metadata on data attributes', () => {
        expect(html).toContain('data-gallery-title="The 2026 Team"');
        expect(html).toContain('data-gallery-block="BLK_001"');
        expect(html).toContain('data-gallery-year="2026"');
        expect(html.split('data-gallery-block=').length - 1).toBe(TILE_COUNT);
    });

    test('renders the two studio portraits as lazy images', () => {
        expect(html.split('<img').length - 1).toBe(2);
        expect(html).toContain('team_standing.webp');
        expect(html).toContain('team_seated.webp');
    });

    test('renders the lightbox as a labelled modal dialog', () => {
        expect(html).toMatch(/<div class="lightbox[^"]*" aria-describedby="lightbox-caption" aria-hidden="true" aria-labelledby="lightbox-title" aria-modal="true" role="dialog"/);
        expect(html).toMatch(/<h2 id="lightbox-title"[^>]*>/);
        expect(html).toMatch(/<p id="lightbox-caption" class="lightbox__caption"[^>]*>\s*Gallery content coming soon.\s*<\/p>/);
        expect(html).toMatch(/<button class="lightbox__close[^"]*" aria-label="Close lightbox" type="button"/);
    });
});
