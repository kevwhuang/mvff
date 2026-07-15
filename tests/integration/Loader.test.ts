import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Loader from '../../src/sections/Loader.astro';

describe('Loader', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Loader);
    });

    test('renders the loader section hidden from assistive tech', () => {
        expect(html).toMatch(/<section class="loader[^"]*" aria-hidden="true"/);
    });

    test('renders the pulsing logo mark eagerly with an empty alt', () => {
        expect(html).toMatch(/<img[^>]*alt fetchpriority="high" loading="eager"/);
        expect(html).toContain('austin_music_video_film_festival.webp');
    });

    test('renders the loading caption and progress bar', () => {
        expect(html).toMatch(/<div class="loader__text[^"]*"[^>]*>Loading reel &middot; 2026<\/div>/);
        expect(html).toMatch(/class="loader__progress[^"]*"/);
    });
});
