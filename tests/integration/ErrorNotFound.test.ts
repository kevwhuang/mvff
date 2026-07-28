import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import ErrorNotFound from '../../src/sections/ErrorNotFound.astro';

describe('ErrorNotFound', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(ErrorNotFound);
    });

    test('labels the section by the status code heading', () => {
        expect(html).toContain('<section class="error flex items-center justify-center relative text-center" aria-labelledby="error-not-found-title"');
        expect(html.split('id="error-not-found-title"').length - 1).toBe(1);
    });

    test('renders 404 as both the heading text and its glitch data-text', () => {
        expect(html).toMatch(/<h1 id="error-not-found-title" class="error__glitch inline-block relative mb-6 select-none" data-text="404">404<\/h1>/);
    });

    test('renders the subtitle telling the visitor the frame is not on the program', () => {
        expect(html).toContain('<p class="subtitle font-serif italic text-cream-80">This frame isn\'t on the program.</p>');
    });

    test('links back to the home page with a primary button', () => {
        expect(html).toContain('<a class="button button--primary" href="/">Return Home</a>');
    });

    test('renders exactly one scroll reveal container', () => {
        expect(html).toContain('<div data-scroll>');
        expect(html.split('data-scroll').length - 1).toBe(1);
    });
});
