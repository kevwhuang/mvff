import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Navbar from '../../src/sections/Navbar.astro';
import { LINKS, ROUTES } from '../../src/lib/constants';

describe('Navbar', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Navbar);
    });

    test('renders the brand link home with the festival logo', () => {
        expect(html).toMatch(/<a[^>]*class="site-header__brand[^"]*"[^>]*aria-label="Austin Music Video Film Festival Home"[^>]*href="\/"/);
        expect(html).toMatch(/<img[^>]*austin_music_video_film_festival\.webp/);
    });

    test('labels the primary nav for assistive tech', () => {
        expect(html).toMatch(/<nav[^>]*class="site-nav"[^>]*aria-label="Primary"/);
    });

    test('renders a nav link for every route', () => {
        for (const route of ROUTES) {
            expect(html).toMatch(new RegExp(`class="site-nav__link[^"]*" href="${route.href}"`));
            expect(html).toMatch(new RegExp(`href="${route.href}"[^>]*>${route.label}</a>`));
        }
    });

    test('opens external routes in a new tab', () => {
        const store = ROUTES.find(route => route.href.startsWith('http'));

        expect(store?.label).toBe('Store');
        expect(html).toMatch(new RegExp(`href="${store?.href}" target="_blank"`));
        expect(html).toMatch(/href="\/team"(?![^>]*target)/);
    });

    test('renders the buy tickets link to the posh page in a new tab', () => {
        expect(html).toMatch(new RegExp(`<a[^>]*class="site-header__tickets[^"]*"[^>]*href="${LINKS.posh}"[^>]*target="_blank"`));
        expect(html).toContain('>Buy Tickets</a>');
    });

    test('renders the live countdown scaffold labelled as a timer', () => {
        expect(html).toMatch(/<div[^>]*class="site-header__countdown[^"]*"[^>]*aria-label="Event countdown"[^>]*role="timer"/);
        expect(html).toContain('<span class="site-header__countdown-text"');
        expect(html).toContain('>00:00:00:00</span>');
    });

    test('renders the mobile menu toggle collapsed with a hidden icon', () => {
        expect(html).toMatch(/<button[^>]*class="nav-toggle[^"]*"[^>]*aria-expanded="false"[^>]*aria-label="Toggle menu"[^>]*type="button"/);
        expect(html).toMatch(/<svg aria-hidden="true"[^>]*viewBox="0 0 16 12"/);
    });
});
