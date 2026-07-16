import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import ErrorServer from '../../src/sections/ErrorServer.astro';

describe('ErrorServer', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(ErrorServer);
    });

    test('labels the 500 block by its heading', () => {
        expect(html).toMatch(/<section class="error[^"]*" aria-labelledby="error-title"/);
    });

    test('renders the status code as the glitch heading', () => {
        expect(html).toMatch(/<h1 id="error-title" class="error__glitch[^"]*" data-text="500"[^>]*>500<\/h1>/);
        expect(html.split('id="error-title"').length - 1).toBe(1);
    });

    test('renders the subtitle', () => {
        expect(html).toMatch(/<p class="error__subtitle"[^>]*>The projector jammed mid-reel.<\/p>/);
    });

    test('renders the back home link', () => {
        expect(html).toMatch(/<a class="btn btn--primary" href="\/"[^>]*>Back to Home<\/a>/);
    });
});
