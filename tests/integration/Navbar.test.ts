import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Navbar from '../../src/sections/Navbar.astro';
import { ROUTES } from '../../src/lib/constants';

describe('Navbar', () => {
    let html: string;
    let menuLinks: string[];

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Navbar);

        menuLinks = html.match(/<a class="navbar__menu-link[^>]*>/g) ?? [];
    });

    test('persists the header across view transitions', () => {
        expect(html).toContain('<header data-astro-transition-persist="navbar" class="navbar sticky top-0 z-50 border-b border-cream-15"');
    });

    test('links the brand home with the full festival name as its accessible label', () => {
        expect(html).toMatch(/<a class="navbar__brand relative no-underline select-none" aria-label="Austin Music Video Film Festival Home" href="\/"/);
    });

    test('renders a single decorative eager brand logo with a retina srcset', () => {
        expect(html.split('data-image-component="true"').length - 1).toBe(1);
        expect(html).toContain('austin_music_video_film_festival.webp');
        expect(html).toMatch(/<img[^>]* alt loading="eager"/);
        expect(html).toContain('width="80"');
        expect(html).toMatch(/srcset="[^"]* 2x"/);
    });

    test('labels the primary nav and its close button', () => {
        expect(html).toMatch(/<nav class="navbar__menu" aria-label="Primary"/);
        expect(html).toMatch(/<button class="[^"]*navbar__menu-close[^"]*" aria-label="Close navigation" type="button"/);
    });

    test('renders a menu link for every route in order', () => {
        expect(menuLinks).toHaveLength(ROUTES.length);

        ROUTES.forEach((route, index) => {
            expect(menuLinks[index]).toContain(`href="${route.href}"`);
            expect(html).toMatch(new RegExp(`href="${route.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>${route.label}</a>`));
        });
    });

    test('marks the disabled store route aria-disabled and unfocusable without new-tab props', () => {
        const disabledLinks = menuLinks.filter((_, index) => ROUTES[index].isDisabled);

        expect(disabledLinks).toHaveLength(1);

        for (const link of disabledLinks) {
            expect(link).toContain('aria-disabled="true"');
            expect(link).toContain('tabindex="-1"');
            expect(link).not.toContain('rel="noopener"');
            expect(link).not.toContain('target="_blank"');
        }
    });

    test('leaves every enabled route focusable and free of disabled markup and new-tab props', () => {
        const enabledLinks = menuLinks.filter((_, index) => !ROUTES[index].isDisabled);

        expect(enabledLinks).toHaveLength(ROUTES.length - 1);

        for (const link of enabledLinks) {
            expect(link).not.toContain('aria-disabled');
            expect(link).not.toContain('tabindex');
            expect(link).not.toContain('target=');
        }
    });

    test('renders the post-event countdown as a zeroed readout hidden from assistive tech', () => {
        expect(html).toMatch(/<div class="navbar__countdown[^"]*" aria-hidden="true"/);
        expect(html).toContain('<span class="navbar__pulse inline-block size-1.5 rounded-full bg-coral"');
        expect(html).toMatch(/<span[^>]*>00:00:00:00<\/span>/);
    });

    test('renders the menu toggle collapsed with the hamburger icon', () => {
        expect(html).toMatch(/<button class="[^"]*navbar__toggle[^"]*" aria-expanded="false" aria-label="Open navigation" type="button"/);
        expect(html).toContain('<svg aria-hidden="true" fill="none" height="16" viewBox="0 0 21 16" width="21">');
        expect(html.split('<line stroke="currentColor" stroke-width="2"').length - 1).toBe(3);
    });
});
