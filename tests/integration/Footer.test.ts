import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Footer from '../../src/sections/Footer.astro';
import { LINKS, ROUTES } from '../../src/lib/constants';

describe('Footer', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Footer);
    });

    test('labels the footer for assistive tech', () => {
        expect(html).toMatch(/<footer class="footer[^"]*"/);
        expect(html).toMatch(/<nav class="contents" aria-label="Footer"/);
    });

    test('renders the brand title as a link home', () => {
        expect(html).toMatch(/<a class="footer__title[^"]*" href="\/"[^>]*>\s*Austin Music Video Film Festival\s*<\/a>/);
    });

    test('renders a directory link for every route', () => {
        for (const route of ROUTES) {
            expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*"[^>]*href="${route.href}"[^>]*>${route.label}</a>`));
        }
    });

    test('disables only the store directory link', () => {
        const store = ROUTES.find(route => route.href.startsWith('http'));

        expect(store?.label).toBe('Store');
        expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*" aria-disabled="true" href="${store?.href}" tabindex="-1"[^>]*>Store</a>`));
    });

    test('renders the connect and insider channels', () => {
        expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*" href="${LINKS.instagram}" rel="noopener" target="_blank"[^>]*>Instagram</a>`));
        expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*" href="${LINKS.email}"[^>]*>Email</a>`));
        expect(html).toContain(`href="${LINKS.phone}"`);
        expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*" aria-disabled="true" href="${LINKS.calendly}" tabindex="-1"[^>]*>Schedule Call</a>`));
        expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*" href="${LINKS.pitchDeck}" rel="noopener" target="_blank"[^>]*>Pitch Deck</a>`));
        expect(html).toMatch(new RegExp(`<a class="footer__link[^"]*" aria-disabled="true" href="${LINKS.filmfreeway}" tabindex="-1"[^>]*>FilmFreeway</a>`));
    });

    test('renders the copyright and event coordinates', () => {
        expect(html).toContain('&copy; 2026 Austin Music Video Film Festival &middot; All rights reserved');
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18, 2026<\/time>/);
        expect(html).toMatch(/<time datetime="2026-07-18T19:00-05:00"[^>]*>7 PM<\/time>/);
        expect(html).toContain('Cabana Club');
    });
});
