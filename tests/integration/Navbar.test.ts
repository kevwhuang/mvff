import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Navbar from '../../src/sections/Navbar.astro';
import { ROUTES } from '../../src/lib/constants';

describe('Navbar', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Navbar);
    });

    test('renders the brand link home with the festival logo', () => {
        expect(html).toMatch(/<a[^>]*class="navbar__brand[^"]*"[^>]*aria-label="Austin Music Video Film Festival Home"[^>]*href="\/"/);
        expect(html).toMatch(/<img[^>]*austin_music_video_film_festival\.webp/);
    });

    test('labels the primary nav for assistive tech', () => {
        expect(html).toMatch(/<nav class="navbar__menu" aria-label="Primary"/);
    });

    test('renders a nav link for every route', () => {
        for (const route of ROUTES) {
            expect(html).toMatch(new RegExp(`<a class="navbar__menu-link[^"]*"[^>]*href="${route.href}"`));
            expect(html).toMatch(new RegExp(`href="${route.href}"[^>]*>${route.label}</a>`));
        }
    });

    test('disables the store route without opening a new tab', () => {
        const store = ROUTES.find(route => route.href.startsWith('http'));

        expect(store?.label).toBe('Store');
        expect(html).toMatch(new RegExp(`<a class="navbar__menu-link[^"]*" aria-disabled="true" href="${store?.href}" tabindex="-1"`));
        expect(html).not.toContain('target="_blank"');
    });

    test('omits any buy tickets call to action', () => {
        expect(html).not.toContain('Buy Tickets');
        expect(html).not.toContain('navbar__tickets');
        expect(html).not.toContain('site-header__tickets');
    });

    test('renders the frozen countdown chip hidden from assistive tech', () => {
        expect(html).toMatch(/<div class="navbar__countdown[^"]*" aria-hidden="true" data-visible="false"/);
        expect(html).toMatch(/<span class="navbar__pulse[^"]*"[^>]*><\/span>/);
        expect(html).toContain('>00:00:00:00</span>');
        expect(html).not.toContain('role="timer"');
    });

    test('renders the mobile menu toggle collapsed with a hidden icon', () => {
        expect(html).toMatch(/<button class="navbar__icon-button navbar__toggle[^"]*" aria-expanded="false" aria-label="Open navigation" type="button"/);
        expect(html).toMatch(/<svg aria-hidden="true"[^>]*viewBox="0 0 16 12"/);
    });
});
