import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Tagline from '../../src/sections/Tagline.astro';

describe('Tagline', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Tagline);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="tagline[^"]*" aria-labelledby="tagline-title"/);
        expect(html).toMatch(/<h2 id="tagline-title"[^>]*class="tagline__main[^"]*"[^>]*data-typewriter/);
    });

    test('renders the screens word as a typewriter target', () => {
        expect(html).toMatch(/<span class="tagline__screens[^"]*" data-typewriter-word[^>]*>\s*Screens\s*<\/span>/);
    });

    test('renders the stage word as a typewriter target', () => {
        expect(html).toMatch(/<span class="tagline__stage" data-typewriter-word[^>]*>\s*Stage\s*<\/span>/);
    });

    test('separates the words with a decorative arrow', () => {
        expect(html).toMatch(/<span class="tagline__arrow"[^>]*>&rarr;<\/span>/);
    });
});
