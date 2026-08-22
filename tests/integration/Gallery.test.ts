import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';

import Gallery from '../../src/sections/Gallery.astro';

import type { ImageMetadata } from 'astro';

const GALLERY_DIR = fileURLToPath(new URL('../../src/content/gallery', import.meta.url));
const LANDSCAPE_WIDTH = 1_168;
const PORTRAIT_WIDTH = 514;

const images = import.meta.glob<{ default: ImageMetadata }>('../../src/images/gallery/*.webp', { eager: true });

const figures = readdirSync(GALLERY_DIR)
    .filter(file => file.endsWith('.json'))
    .map((file) => {
        const id = file.replace('.json', '');

        const metadata = images[`../../src/images/gallery/${id}.webp`].default;

        return {
            height: metadata.height,
            id,
            isPortrait: metadata.height > metadata.width,
            width: metadata.width,
            ...JSON.parse(readFileSync(join(GALLERY_DIR, file), 'utf-8')) as { alt: string; label: string },
        };
    })
    .sort((figureA, figureB) => figureA.id.localeCompare(figureB.id));

const portraitFigures = figures.filter(figure => figure.isPortrait);

function escapeText(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

describe('Gallery', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Gallery);
    });

    test('labels the section by a markerless wrap heading', () => {
        expect(html).toContain('<section class="gallery section" aria-labelledby="gallery-title"');
        expect(html).toContain('class="section-header section-header--bare');
        expect(html).toMatch(/<h1 id="gallery-title" class="section-header__title uppercase"[^>]*>The Wrap<\/h1>/);
        expect(html).not.toContain('section-header__marker');
    });

    test('marks the figure list for a staggered scroll reveal', () => {
        expect(html).toMatch(/<ul class="gallery__grid flex flex-col list-none" data-scroll data-scroll-stagger="0.12"/);
    });

    test('renders one figure per collection entry captioned with its label in id order', () => {
        const captions = [...html.matchAll(/<figcaption[^>]*><span[^>]*>([^<]*)</g)].map(match => match[1]);

        expect(figures).toHaveLength(22);
        expect(html.split('<figure ').length - 1).toBe(figures.length);
        expect(captions).toEqual(figures.map(figure => escapeText(figure.label)));
    });

    test('gives each frame button a view label and the alt, label, orientation, ratio, and source the lightbox reads', () => {
        const buttons = html.match(/<button class="gallery__frame[^>]*>/g) ?? [];

        expect(buttons).toHaveLength(figures.length);

        buttons.forEach((button, index) => {
            const figure = figures[index];

            expect(button).toContain(`aria-label="View ${figure.label}"`);
            expect(button).toContain(`data-gallery-alt="${figure.alt}"`);
            expect(button).toContain(`data-gallery-label="${figure.label}"`);
            expect(button).toContain(`data-gallery-orientation="${figure.isPortrait ? 'portrait' : 'landscape'}"`);
            expect(button).toContain(`data-gallery-ratio="${figure.width} / ${figure.height}"`);
            expect(button).toContain('type="button"');
            expect(button).toMatch(new RegExp(`data-gallery-source="[^"]*${figure.id}\\.webp[^"]*&amp;w=${figure.width}&amp;h=${figure.height}"`));
        });
    });

    test('marks taller than wide figures portrait with a two by three frame and the rest landscape with a three by two frame', () => {
        const buttons = html.match(/<button class="gallery__frame[^>]*>/g) ?? [];
        const items = html.match(/<li class="gallery__figure[^>]*>/g) ?? [];

        expect(items).toHaveLength(figures.length);
        expect(html.split('gallery__figure--portrait').length - 1).toBe(portraitFigures.length);

        figures.forEach((figure, index) => {
            if (figure.isPortrait) {
                expect(items[index]).toContain('gallery__figure--portrait');
                expect(buttons[index]).toContain('aspect-2/3');
            } else {
                expect(items[index]).not.toContain('gallery__figure--portrait');
                expect(buttons[index]).toContain('aspect-3/2');
            }
        });
    });

    test('renders every grid image lazily at its orientation grid width with a retina srcset and the alt text from its entry', () => {
        const galleryImages = html.match(/<img [^>]*class="gallery__image[^"]*">/g) ?? [];

        expect(galleryImages).toHaveLength(figures.length);

        galleryImages.forEach((image, index) => {
            expect(image).toContain(`alt="${figures[index].alt}"`);
            expect(image).toContain('loading="lazy"');
            expect(image).toContain(`width="${figures[index].isPortrait ? PORTRAIT_WIDTH : LANDSCAPE_WIDTH}"`);
            expect(image).toMatch(/srcset="[^"]* 2x"/);
        });
    });

    test('renders the lightbox as a closed modal dialog with a focusable inner container and an empty image, label, and heading placeholder', () => {
        expect(html).toMatch(/<div class="gallery__lightbox[^"]*" aria-hidden="true" aria-labelledby="lightbox-title" aria-modal="true" role="dialog"/);
        expect(html).toMatch(/<div class="gallery__lightbox-inner[^"]*" tabindex="-1"/);
        expect(html).toMatch(/<h2 id="lightbox-title" class="sr-only"[^>]*>&nbsp;<\/h2>/);
        expect(html).toMatch(/<img class="gallery__lightbox-image[^"]*" alt="" draggable="false"/);
        expect(html).toMatch(/<span class="gallery__lightbox-label"[^>]*><\/span>/);
        expect(html).not.toContain('data-open');
    });

    test('renders the lightbox close button with an accessible name', () => {
        expect(html).toMatch(/<button class="gallery__lightbox-close[^"]*" aria-label="Close" type="button"/);
    });
});
