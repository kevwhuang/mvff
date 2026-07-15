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
        expect(html).toMatch(/<footer class="site-footer" aria-label="Site footer"/);
    });

    test('renders the brand title as a link home', () => {
        expect(html).toMatch(/<a class="site-footer__title" href="\/"[^>]*>Austin Music Video Film Festival<\/a>/);
    });

    test('renders a directory link for every route', () => {
        for (const route of ROUTES) {
            expect(html).toMatch(new RegExp(`href="${route.href}"[^>]*>${route.label}</a>`));
        }
    });

    test('renders the connect and insider channels', () => {
        expect(html).toMatch(new RegExp(`<a href="${LINKS.instagram}" target="_blank"[^>]*>Instagram</a>`));
        expect(html).toMatch(new RegExp(`<a href="${LINKS.email}"[^>]*>Email</a>`));
        expect(html).toMatch(new RegExp(`<a href="${LINKS.calendly}" target="_blank"[^>]*>Schedule a Call</a>`));
        expect(html).toMatch(new RegExp(`<a href="${LINKS.filmfreeway}" target="_blank"[^>]*>FilmFreeway</a>`));
        expect(html).toMatch(new RegExp(`<a href="${LINKS.pitchDeck}" target="_blank"[^>]*>Pitch Deck</a>`));
    });

    test('renders the legal nav as a list of policy links', () => {
        expect(html).toMatch(/<nav aria-label="Legal"/);
        expect(html).toMatch(/<ul class="site-footer__legal[^"]*"/);
        expect(html).toMatch(/<a href="\/privacy"[^>]*>Privacy<\/a>/);
        expect(html).toMatch(/<a href="\/terms"[^>]*>Terms<\/a>/);
    });

    test('renders the copyright and event coordinates', () => {
        expect(html).toContain('&copy; 2026 Austin Music Video Film Festival &middot; All rights reserved');
        expect(html).toMatch(/<time datetime="2026-07-18T19:00-05:00"[^>]*>July 18, 2026<\/time>/);
    });
});
