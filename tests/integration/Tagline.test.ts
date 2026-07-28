import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Tagline from '../../src/sections/Tagline.astro';

describe('Tagline', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Tagline);
    });

    test('labels the section by the single tagline heading', () => {
        expect(html).toContain('<section class="section tagline text-center" aria-labelledby="tagline-title"');
        expect(html.split('id="tagline-title"').length - 1).toBe(1);
    });

    test('gives the typewriter heading a stable accessible name', () => {
        expect(html).toMatch(/<h2 id="tagline-title" class="tagline__title uppercase select-none" aria-label="Screen to Stage" data-typewriter/);
    });

    test('renders screen before stage as the two typewriter words', () => {
        expect(html.split('data-typewriter-word').length - 1).toBe(2);
        expect(html).toMatch(/<span class="tagline__screen" data-typewriter-word[^>]*>Screen<\/span>/);
        expect(html).toMatch(/<span class="tagline__stage font-serif italic text-coral" data-typewriter-word[^>]*>Stage<\/span>/);
        expect(html.indexOf('tagline__screen')).toBeLessThan(html.indexOf('tagline__stage'));
    });

    test('renders the arrow glyph between the two words', () => {
        expect(html).toMatch(/<span class="tagline__screen"[^>]*>Screen<\/span><span class="tagline__arrow font-serif italic text-cream-60"[^>]*>&rarr;<\/span><span class="tagline__stage/);
    });

    test('ships exactly one module script', () => {
        expect(html.split('<script').length - 1).toBe(1);
        expect(html).toContain('<script type="module"');
    });
});
