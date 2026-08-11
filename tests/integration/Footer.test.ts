import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Footer from '../../src/sections/Footer.astro';
import { LINKS, ROUTES } from '../../src/lib/constants';

const CHANNELS = [
    { href: LINKS.instagram, isExternal: true, label: 'Instagram' },
    { href: LINKS.email, isExternal: false, label: 'Email' },
    { href: LINKS.phone, isExternal: false, label: 'Phone' },
    { href: LINKS.calendly, isExternal: true, label: 'Schedule Call' },
] as const;

const HEADINGS = ['Site', 'Connect', 'Insider'] as const;

const INSIDER_LINKS = [
    { href: LINKS.pitchDeck, isDisabled: false, label: 'Pitch Deck' },
    { href: LINKS.filmfreeway, isDisabled: true, label: 'FilmFreeway' },
] as const;

const TAGLINE = 'Austin\'s music video scene, staged like a premiere: live sets, screening blocks, awards, and an after party that ran to 2 AM. One night at Cabana Club.';

const linkCount = ROUTES.length + CHANNELS.length + INSIDER_LINKS.length;

function findLink(html: string, label: string): string {
    return html.match(new RegExp(`<a class="footer__link[^>]*>${label}</a>`))?.[0] ?? '';
}

describe('Footer', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Footer);
    });

    test('renders the brand link back to the home page above the festival tagline', () => {
        expect(html).toMatch(/<a class="footer__title[^"]*" href="\/"[^>]*>Austin Music Video Film Festival<\/a>/);
        expect(html).toMatch(/<a class="footer__title[^>]*>Austin Music Video Film Festival<\/a><p class="footer__tag[^>]*>/);
        expect(html).toContain(`>${TAGLINE}</p>`);
    });

    test('labels the link columns as a footer navigation with three headings', () => {
        const headings = [...html.matchAll(/class="footer__heading[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(html).toContain('<nav class="contents" aria-label="Footer"');
        expect(headings).toEqual([...HEADINGS]);
    });

    test('lists the routes, channels, and insider links in order under their own columns', () => {
        const columns = html.split('<div class="footer__column"').slice(1);

        const columnLabels = columns.map(column => [...column.matchAll(/<a class="footer__link[^>]*>([^<]+)</g)].map(match => match[1]));

        expect(columnLabels).toEqual([
            ROUTES.map(route => route.label),
            CHANNELS.map(channel => channel.label),
            INSIDER_LINKS.map(insiderLink => insiderLink.label),
        ]);
    });

    test('renders one link per route, channel, and insider entry', () => {
        expect(html.split('class="footer__link').length - 1).toBe(linkCount);
    });

    test('renders every site route with its href and disables only the store route', () => {
        for (const route of ROUTES) {
            const link = findLink(html, route.label);

            expect(link).toContain(`href="${route.href}"`);

            if (route.isDisabled) {
                expect(link).toContain('aria-disabled="true"');
                expect(link).toContain('tabindex="-1"');
            } else {
                expect(link).not.toContain('aria-disabled');
                expect(link).not.toContain('tabindex');
            }
        }
    });

    test('omits target and rel from every site route because only the disabled store route is external', () => {
        for (const route of ROUTES) {
            const link = findLink(html, route.label);

            expect(link).toContain(`href="${route.href}"`);
            expect(link).not.toContain('rel=');
            expect(link).not.toContain('target=');
        }
    });

    test('renders the connect channels with their hrefs and opens only instagram and calendly in a new tab', () => {
        for (const channel of CHANNELS) {
            const link = findLink(html, channel.label);

            expect(link).toContain(`href="${channel.href}"`);

            if (channel.isExternal) {
                expect(link).toContain('rel="noopener"');
                expect(link).toContain('target="_blank"');
            } else {
                expect(link).not.toContain('rel=');
                expect(link).not.toContain('target=');
            }
        }
    });

    test('opens the pitch deck in a new tab and disables the filmfreeway link', () => {
        for (const insiderLink of INSIDER_LINKS) {
            const link = findLink(html, insiderLink.label);

            expect(link).toContain(`href="${insiderLink.href}"`);

            if (insiderLink.isDisabled) {
                expect(link).toContain('aria-disabled="true"');
                expect(link).toContain('tabindex="-1"');
                expect(link).not.toContain('rel=');
                expect(link).not.toContain('target=');
            } else {
                expect(link).toContain('rel="noopener"');
                expect(link).toContain('target="_blank"');
            }
        }
    });

    test('renders the copyright and the event date and window with machine-readable datetimes', () => {
        expect(html).toMatch(/<p[^>]*>&copy; 2026 Austin Music Video Film Festival &middot; All rights reserved<\/p>/);
        expect(html).toMatch(/<time datetime="2026-07-18"[^>]*>July 18, 2026<\/time>/);
        expect(html).toMatch(/<time datetime="2026-07-18T19:00-05:00"[^>]*>7 PM<\/time>&nbsp;&ndash;&nbsp;<time datetime="2026-07-19T02:00-05:00"[^>]*>2 AM<\/time>/);
        expect(html).toContain('&middot; Cabana Club &middot; Austin, TX</p>');
    });
});
