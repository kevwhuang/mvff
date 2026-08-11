import { describe, expect, test } from 'vitest';

import { LINKS, LOADER_SHOWN_KEY, REDUCED_MOTION_QUERY, ROUTES } from '../../src/lib/constants';

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
        for (const key of EXTERNAL_LINK_KEYS) expect(LINKS[key].startsWith('https://'), key).toBe(true);
    });

    test('points the pitch deck at an internal path', () => {
        for (const key of INTERNAL_LINK_KEYS) expect(LINKS[key].startsWith('/'), key).toBe(true);

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
    test('is the mvff-loader-shown session storage key', () => {
        expect(LOADER_SHOWN_KEY).toBe('mvff-loader-shown');
    });
});

describe('REDUCED_MOTION_QUERY', () => {
    test('is the prefers-reduced-motion reduce media query', () => {
        expect(REDUCED_MOTION_QUERY).toBe('(prefers-reduced-motion: reduce)');
    });
});

describe('ROUTES', () => {
    test('lists home, info, photos, and store in navigation order', () => {
        expect(ROUTES).toEqual([
            { href: '/', isDisabled: false, label: 'Home' },
            { href: '/info', isDisabled: false, label: 'Info' },
            { href: '/photos', isDisabled: false, label: 'Photos' },
            { href: SHOP_URL, isDisabled: true, label: 'Store' },
        ]);
    });

    test('disables exactly one route and points it at the shop subdomain', () => {
        const disabledRoutes = ROUTES.filter(route => route.isDisabled);

        expect(disabledRoutes).toHaveLength(1);
        expect(disabledRoutes[0].href).toBe(SHOP_URL);
        expect(disabledRoutes[0].label).toBe('Store');
    });

    test('gives every enabled route an internal absolute path', () => {
        const enabledRoutes = ROUTES.filter(route => !route.isDisabled);

        for (const route of enabledRoutes) expect(route.href.startsWith('/'), route.label).toBe(true);
    });

    test('gives every route a non-empty label and a unique href', () => {
        const hrefs = ROUTES.map(route => route.href);

        for (const route of ROUTES) expect(route.label.trim()).not.toBe('');

        expect(new Set(hrefs).size).toBe(ROUTES.length);
    });
});
