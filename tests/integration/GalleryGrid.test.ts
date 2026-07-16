import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import GalleryGrid from '../../src/sections/GalleryGrid.astro';

const FIGURE_COUNT = 2;
const PLACEHOLDER_TOKENS = [
    'gallery__cell',
    'gallery__tile',
    'gallery__grid',
    'BLK_',
    'Frame 0',
    'linear-gradient',
    'data-gallery-block',
    'data-gallery-year',
    'data-gallery-caption',
    'lightbox__caption',
    'lightbox__info',
    'lightbox__meta',
    'Gallery content coming soon',
];

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

    test('composes exactly two staggered portrait figures', () => {
        expect(html).toContain('data-scroll-stagger="0.14"');
        expect(html.split('class="gallery__frame ').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('aria-label="View ').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('gallery__figure--lead').length - 1).toBe(1);
        expect(html.split('gallery__figure--trail').length - 1).toBe(1);
        expect(html.split('<img').length - 1).toBe(FIGURE_COUNT);
        expect(html).toContain('team_standing.webp');
        expect(html).toContain('team_seated.webp');
    });

    test('carries a descriptive label and a full-size source on each frame', () => {
        expect(html.split('data-gallery-label="').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('data-gallery-source="').length - 1).toBe(FIGURE_COUNT);
        expect(html).toContain('standing shoulder to shoulder');
        expect(html).toContain('seated and leaning together');
    });

    test('captions each portrait with its title and the 2026 year', () => {
        expect(html).toMatch(/<span[^>]*>The Team, Standing<\/span>/);
        expect(html).toMatch(/<span[^>]*>The Team, Seated<\/span>/);
        expect(html.split('class="gallery__year"').length - 1).toBe(FIGURE_COUNT);
        expect(html).toMatch(/<span class="gallery__year"[^>]*>2026<\/span>/);
    });

    test('keeps a single coming-soon note for the section', () => {
        expect(html).toMatch(/<p class="gallery__note"[^>]*>\s*Full event photography lands after July 18\.\s*<\/p>/);
    });

    test('renders the lightbox as a labelled modal dialog without caption text', () => {
        expect(html).toMatch(/<div class="lightbox[^"]*" aria-hidden="true" aria-labelledby="lightbox-title" aria-modal="true" role="dialog"/);
        expect(html).toMatch(/<h2 id="lightbox-title" class="sr-only"[^>]*>/);
        expect(html).toMatch(/<button class="lightbox__close[^"]*" aria-label="Close image" type="button"/);
        expect(html).toMatch(/<div class="lightbox__image"[^>]*>/);
        expect(html.split('type="button"').length - 1).toBe(FIGURE_COUNT + 1);
    });

    test('drops every placeholder-tile artifact', () => {
        for (const token of PLACEHOLDER_TOKENS) {
            expect(html).not.toContain(token);
        }
    });
});
