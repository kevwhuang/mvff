import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Loader from '../../src/sections/Loader.astro';
import { LOADER_SHOWN_KEY, REDUCED_MOTION_QUERY } from '../../src/lib/constants';

describe('Loader', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Loader);
    });

    test('renders the overlay as a status region that starts closed and hidden from assistive tech', () => {
        expect(html).toContain('<div class="loader fixed flex inset-0 items-center justify-center z-300 bg-night" aria-hidden="true" aria-label="Loading" role="status"');
        expect(html).not.toMatch(/<div class="loader [^>]*data-open/);
    });

    test('renders the festival logo as a decorative eager high-priority image decoded synchronously', () => {
        expect(html).toContain('data-image-component="true"');
        expect(html).toContain('austin_music_video_film_festival.webp');
        expect(html).toMatch(/<img[^>]* alt decoding="sync" draggable="false" fetchpriority="high" loading="eager"/);
        expect(html).toContain('width="480"');
        expect(html).toMatch(/srcset="[^"]* 2x"/);
    });

    test('renders the progress sweep inside a clipped bar', () => {
        expect(html).toMatch(/<div class="loader__bar overflow-hidden relative h-1 w-full bg-cream-15"[^>]*><div class="loader__progress absolute inset-0 bg-coral"[^>]*><\/div><\/div>/);
    });

    test('inlines exactly one script carrying the session key and the reduced-motion query', () => {
        expect(html.split('<script').length - 1).toBe(1);
        expect(html).not.toContain('type="module"');
        expect(html).toContain(`loaderShownKey = "${LOADER_SHOWN_KEY}"`);
        expect(html).toContain(`reducedMotionQuery = "${REDUCED_MOTION_QUERY}"`);
        expect(html).toContain('sessionStorage.getItem(loaderShownKey)');
        expect(html).toContain('window.matchMedia(reducedMotionQuery)');
    });
});
