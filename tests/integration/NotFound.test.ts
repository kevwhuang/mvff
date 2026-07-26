import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import ErrorNotFound from '../../src/sections/ErrorNotFound.astro';

describe('ErrorNotFound', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(ErrorNotFound);
    });

    test('renders 404 heading', () => {
        expect(html).toMatch(/<h1[^>]*>\s*404\s*<\/h1>/);
    });

    test('renders return link to home', () => {
        expect(html).toContain('href="/"');
        expect(html).toContain('Back to Home');
    });
});
