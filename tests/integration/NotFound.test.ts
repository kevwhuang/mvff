import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import NotFound from '../../src/sections/NotFound.astro';

describe('NotFound', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(NotFound);
    });

    test('labels the 404 block by its heading', () => {
        expect(html).toMatch(/<section class="error[^"]*" aria-labelledby="error-title"/);
    });

    test('renders the status code as the glitch heading', () => {
        expect(html).toMatch(/<h1 id="error-title" class="error__glitch[^"]*" data-text="404"[^>]*>404<\/h1>/);
        expect(html.split('id="error-title"').length - 1).toBe(1);
    });

    test('renders the subtitle', () => {
        expect(html).toMatch(/<p class="error__subtitle"[^>]*>This frame isn't on the program.<\/p>/);
    });

    test('renders the back home link', () => {
        expect(html).toMatch(/<a class="btn btn--primary" href="\/"[^>]*>Back to Home<\/a>/);
    });
});
