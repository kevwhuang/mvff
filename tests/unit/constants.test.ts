import { describe, expect, test } from 'vitest';

import { LINKS, LOADER_SHOWN_KEY, REDUCED_MOTION_QUERY, RESIZE_SETTLE_DELAY, ROUTES } from '../../src/lib/constants';

const EXTERNAL_LINK_KEYS = ['calendly', 'filmfreeway', 'instagram', 'review'] as const;
const INTERNAL_LINK_KEYS = ['pitchDeck'] as const;

const LINK_KEYS = [
    'calendly',
    'email',
    'filmfreeway',
    'instagram',
    'phone',
    'pitchDeck',
    'review',
] as const;

const MAILTO_PATTERN = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROUTE_KEYS = ['href', 'label'] as const;
const SHOP_URL = 'https://shop.atxmusicvideofilmfestival.com';
const TEL_PATTERN = /^tel:\+\d{11}$/;

describe('LINKS', () => {
    test('exposes exactly the seven destination keys', () => {
        expect(Object.keys(LINKS)).toEqual([...LINK_KEYS]);
    });

    test('gives every key a non-empty string value', () => {
        for (const key of LINK_KEYS) {
            expect(typeof LINKS[key], key).toBe('string');
            expect(LINKS[key].trim(), key).not.toBe('');
        }
    });

    test('points every off-site destination at an https url', () => {
        for (const key of EXTERNAL_LINK_KEYS) {
            expect(LINKS[key].startsWith('https://'), key).toBe(true);
        }
    });

    test('points the pitch deck at an internal path', () => {
        for (const key of INTERNAL_LINK_KEYS) {
            expect(LINKS[key].startsWith('/'), key).toBe(true);
        }

        expect(LINKS.pitchDeck.endsWith('.pdf')).toBe(true);
    });

    test('uses the mailto scheme for the festival address', () => {
        expect(LINKS.email).toMatch(MAILTO_PATTERN);
        expect(LINKS.email).toBe('mailto:contact@atxmusicvideofilmfestival.com');
    });

    test('uses the tel scheme with an e164 us number', () => {
        expect(LINKS.phone).toMatch(TEL_PATTERN);
        expect(LINKS.phone).toBe('tel:+12814669387');
    });
});

describe('LOADER_SHOWN_KEY', () => {
    test('is the mvff_loader_shown session storage key', () => {
        expect(LOADER_SHOWN_KEY).toBe('mvff_loader_shown');
    });
});

describe('REDUCED_MOTION_QUERY', () => {
    test('is the prefers-reduced-motion reduce media query', () => {
        expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)');
    });
});

describe('RESIZE_SETTLE_DELAY', () => {
    test('is a 150 millisecond settle delay', () => {
        expect(RESIZE_SETTLE_DELAY).toBe(150);
    });
});

describe('ROUTES', () => {
    test('lists home, info, team, gallery, and store in navigation order', () => {
        expect(ROUTES).toEqual([
            { href: '/', label: 'Home' },
            { href: '/info', label: 'Info' },
            { href: '/team', label: 'Team' },
            { href: '/gallery', label: 'Gallery' },
            { href: SHOP_URL, label: 'Store' },
        ]);
    });

    test('gives every route exactly an href and a label', () => {
        for (const route of ROUTES) {
            expect(Object.keys(route).sort(), route.label).toEqual([...ROUTE_KEYS]);
        }
    });

    test('points only the store route off-site at the https shop subdomain', () => {
        const externalRoutes = ROUTES.filter(route => !route.href.startsWith('/'));

        expect(externalRoutes).toEqual([{ href: SHOP_URL, label: 'Store' }]);

        for (const route of externalRoutes) {
            expect(route.href.startsWith('https://'), route.label).toBe(true);
        }
    });

    test('gives every route a non-empty label and a unique href', () => {
        const hrefs = ROUTES.map(route => route.href);

        for (const route of ROUTES) {
            expect(route.label.trim()).not.toBe('');
        }

        expect(new Set(hrefs).size).toBe(ROUTES.length);
    });
});
