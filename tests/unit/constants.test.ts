import { describe, expect, test } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { LINKS, ROUTES } from '../../src/lib/constants';

const PAGES_DIR = join(process.cwd(), 'src', 'pages');
const PUBLIC_DIR = join(process.cwd(), 'public');

function isPublicLink(value: string) {
    return value.startsWith('https://') || value.startsWith('mailto:') || value.startsWith('/');
}

function pageForHref(href: string) {
    return href === '/' ? 'index.astro' : `${href.slice(1)}.astro`;
}

describe('LINKS', () => {
    test('exposes only https, mailto, or root-relative values', () => {
        for (const value of Object.values(LINKS)) expect(isPublicLink(value)).toBe(true);
    });

    test('keeps external urls free of trailing slashes', () => {
        const external = Object.values(LINKS).filter(value => value.startsWith('https://'));

        for (const value of external) expect(value.endsWith('/')).toBe(false);
    });

    test('points the posh link at the festival event page', () => {
        expect(LINKS.posh).toBe('https://posh.vip/e/austin-texas-music-video-film-festival');
    });

    test('sends the email link to a festival mailbox', () => {
        expect(LINKS.email).toBe('mailto:contact@atxmusicvideofilmfestival.com');
    });

    test('serves the pitch deck from a file that ships in public', () => {
        expect(LINKS.pitchDeck.startsWith('/')).toBe(true);
        expect(existsSync(join(PUBLIC_DIR, LINKS.pitchDeck))).toBe(true);
    });
});

describe('ROUTES', () => {
    test('starts with the home route', () => {
        expect(ROUTES[0]).toEqual({ href: '/', label: 'Home' });
    });

    test('gives every route a non-empty label', () => {
        for (const route of ROUTES) expect(route.label.length).toBeGreaterThan(0);
    });

    test('uses a unique label for every route', () => {
        const labels = ROUTES.map(route => route.label);

        expect(new Set(labels).size).toBe(labels.length);
    });

    test('uses a unique href for every route', () => {
        const hrefs = ROUTES.map(route => route.href);

        expect(new Set(hrefs).size).toBe(hrefs.length);
    });

    test('backs every internal route with a page in src/pages', () => {
        const internal = ROUTES.filter(route => !route.href.startsWith('http'));

        for (const route of internal) expect(existsSync(join(PAGES_DIR, pageForHref(route.href)))).toBe(true);
    });

    test('links the store to an external https storefront', () => {
        const store = ROUTES.find(route => route.label === 'Store');

        expect(store?.href.startsWith('https://')).toBe(true);
    });
});
