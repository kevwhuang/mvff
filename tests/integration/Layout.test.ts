import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import Layout from '../../src/Layout.astro';

const DESCRIPTION = 'Gallery for the Austin Music Video Film Festival \u2014 first portraits of the 2026 team, with full event photography coming soon.';
const SITE = 'https://atxmusicvideofilmfestival.com';
const SITE_NAME = 'Austin Music Video Film Festival';
const SLOT = '<p data-slot="page">Slot content</p>';
const TITLE = 'Gallery \u2014 Austin Music Video Film Festival';

class SiteAwareUrl extends URL {
    constructor(input: string | URL, base?: string | URL) {
        super(input, base ?? SITE);
    }
}

describe('Layout', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        vi.stubGlobal('URL', SiteAwareUrl);

        try {
            html = await container.renderToString(Layout, {
                partial: false,
                props: { description: DESCRIPTION, title: TITLE },
                slots: { default: SLOT },
            });
        } finally {
            vi.unstubAllGlobals();
        }
    });

    test('renders the full page skeleton in english', () => {
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toMatch(/<html lang="en"/);
        expect(html).toContain('<head>');
        expect(html).toContain('</head>');
        expect(html).toMatch(/<body class="[^"]*bg-night text-cream"/);
    });

    test('declares the charset and viewport metas', () => {
        expect(html).toContain('<meta charset="utf-8">');
        expect(html).toContain('<meta content="width=device-width, initial-scale=1" name="viewport">');
    });

    test('composes the document title from the title prop', () => {
        expect(html).toContain(`<title>${TITLE}</title>`);
    });

    test('wires the description prop into meta tags', () => {
        expect(html).toContain(`<meta content="${DESCRIPTION}" name="description">`);
        expect(html).toContain(`<meta content="${DESCRIPTION}" property="og:description">`);
        expect(html).toContain(`<meta content="${DESCRIPTION}" name="twitter:description">`);
    });

    test('mirrors the title into social metas', () => {
        expect(html).toContain(`<meta content="${TITLE}" property="og:title">`);
        expect(html).toContain(`<meta content="${TITLE}" name="twitter:title">`);
    });

    test('renders canonical and site identity tags', () => {
        expect(html).toContain(`<link href="${SITE}/" rel="canonical">`);
        expect(html).toContain(`<meta content="${SITE_NAME}" property="og:site_name">`);
        expect(html).toContain('<meta content="website" property="og:type">');
        expect(html).toContain('<meta content="summary_large_image" name="twitter:card">');
        expect(html).toContain('<meta content="Kevin Huang" name="author">');
        expect(html).toContain('<meta content="#0a0a0f" name="theme-color">');
        expect(html).toContain('<meta content="index, follow" name="robots">');
        expect(html).toContain('property="og:image"');
    });

    test('links the favicon and touch icon', () => {
        expect(html).toContain('<link href="/apple-touch-icon.png" rel="apple-touch-icon">');
        expect(html).toContain('<link href="/favicon.png" rel="icon" type="image/png">');
    });

    test('embeds valid json-ld describing the site', () => {
        const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

        const jsonLd = match ? JSON.parse(match[1]) : null;

        expect(jsonLd).not.toBeNull();
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('WebSite');
        expect(jsonLd.name).toBe(SITE_NAME);
        expect(jsonLd.author).toEqual({ '@type': 'Person', 'name': 'Kevin Huang' });
    });

    test('embeds event json-ld with the venue and ticketing facts', () => {
        const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

        expect(matches).toHaveLength(2);

        const event = JSON.parse(matches[1][1]);

        expect(event['@type']).toBe('Event');
        expect(event.name).toBe(SITE_NAME);
        expect(event.startDate).toBe('2026-07-18T19:00:00-05:00');
        expect(event.endDate).toBe('2026-07-19T02:00:00-05:00');
        expect(event.location.name).toBe('Cabana Club');
        expect(event.location.address.streetAddress).toBe('5012 E 7th St');
        expect(event.offers.url).toBe('https://posh.vip/e/austin-texas-music-video-film-festival');
        expect(event.organizer.name).toBe('Madewell Productions');
    });

    test('enables the client router', () => {
        expect(html).toContain('<meta name="astro-view-transitions-enabled" content="true">');
        expect(html).toContain('<meta name="astro-view-transitions-fallback" content="animate">');
        expect(html.split('ClientRouter.astro?astro&type=script').length - 1).toBe(1);
    });

    test('renders exactly one main between the header and footer siblings', () => {
        expect(html.split('<main').length - 1).toBe(1);
        expect(html.split('<header').length - 1).toBe(1);
        expect(html.split('<footer').length - 1).toBe(1);
        expect(html.indexOf('<header')).toBeLessThan(html.indexOf('<main'));
        expect(html.indexOf('<main')).toBeLessThan(html.indexOf('<footer'));
    });

    test('renders slot content inside the body', () => {
        expect(html).toContain(SLOT);
        expect(html.indexOf(SLOT)).toBeGreaterThan(html.indexOf('<body'));
        expect(html.indexOf(SLOT)).toBeLessThan(html.indexOf('</body>'));
    });
});

describe('Layout noindex', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        vi.stubGlobal('URL', SiteAwareUrl);

        try {
            html = await container.renderToString(Layout, {
                partial: false,
                props: { description: DESCRIPTION, noindex: true, title: TITLE },
                slots: { default: SLOT },
            });
        } finally {
            vi.unstubAllGlobals();
        }
    });

    test('switches the robots meta to noindex, nofollow', () => {
        expect(html).toContain('<meta content="noindex, nofollow" name="robots">');
        expect(html).not.toContain('<meta content="index, follow" name="robots">');
    });

    test('renders exactly one robots meta', () => {
        expect(html.split('name="robots"').length - 1).toBe(1);
    });
});
