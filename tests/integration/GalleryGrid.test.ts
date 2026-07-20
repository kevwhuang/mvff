import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Gallery from '../../src/sections/Gallery.astro';

const FIGURE_COUNT = 2;
const FIGURES = [
    { alt: 'standing shoulder to shoulder', label: 'The Team, Standing', source: 'team_standing.webp' },
    { alt: 'seated and leaning together', label: 'The Team, Seated', source: 'team_seated.webp' },
] as const;

describe('Gallery', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Gallery);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section id="gallery" class="gallery[^"]*" aria-labelledby="gallery-title"/);
        expect(html).toMatch(/<h2 id="gallery-title" class="section-header__title[^"]*"[^>]*>Gallery<\/h2>/);
    });

    test('composes exactly two staggered portrait figures', () => {
        expect(html).toContain('data-scroll-stagger="0.12"');
        expect(html.split('class="gallery__figure').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('class="gallery__frame').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('aria-label="View ').length - 1).toBe(FIGURE_COUNT);

        for (const figure of FIGURES) {
            expect(html).toContain(figure.source);
        }
    });

    test('carries a descriptive label and a full-size source on each frame', () => {
        expect(html.split('data-gallery-alt="').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('data-gallery-label="').length - 1).toBe(FIGURE_COUNT);
        expect(html.split('data-gallery-source="').length - 1).toBe(FIGURE_COUNT);

        for (const figure of FIGURES) {
            expect(html).toContain(figure.alt);
        }
    });

    test('captions each portrait with its title and no year chip', () => {
        expect(html).toMatch(/<span[^>]*>The Team, Standing<\/span>/);
        expect(html).toMatch(/<span[^>]*>The Team, Seated<\/span>/);
        expect(html).not.toContain('gallery__year');
    });

    test('renders the lightbox as a labelled modal dialog with no close control', () => {
        expect(html).toMatch(/<div class="gallery__lightbox[^"]*" aria-hidden="true" aria-labelledby="lightbox-title" aria-modal="true" role="dialog"/);
        expect(html).toMatch(/<h2 id="lightbox-title" class="sr-only"[^>]*>/);
        expect(html).toMatch(/<div class="gallery__lightbox-inner[^"]*" tabindex="-1"/);
        expect(html).not.toContain('lightbox__close');
        expect(html).not.toContain('gallery__lightbox-close');
    });

    test('marks every gallery frame as a button and adds no others', () => {
        expect(html.split('type="button"').length - 1).toBe(FIGURE_COUNT);
    });
});
