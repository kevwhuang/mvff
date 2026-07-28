import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import Layout from '../../src/Layout.astro';

const DESCRIPTION = 'Guest info for the Austin Music Video Film Festival. The program, venue details, and frequently asked questions, plus every way to reach the team.';
const NOINDEX_DESCRIPTION = 'This frame isn\'t on the program. The page may have been moved or cut from the reel. Head back to the Austin Music Video Film Festival.';
const NOINDEX_TITLE = '404 \u2014 Austin Music Video Film Festival';
const OVERLAY = '<div data-slot="overlay">Overlay content</div>';
const SITE = 'https://atxmusicvideofilmfestival.com';
const SLOT = '<section data-slot="page">Slot content</section>';
const TITLE = 'Info \u2014 Austin Music Video Film Festival';

class SiteAwareUrl extends URL {
    constructor(input: URL | string, base?: URL | string) {
        super(input, base ?? SITE);
    }
}

async function renderLayout(props: Record<string, unknown>, slots: Record<string, string> = { default: SLOT }) {
    const container = await AstroContainer.create();

    vi.stubGlobal('URL', SiteAwareUrl);

    try {
        return await container.renderToString(Layout, { partial: false, props, slots });
    } finally {
        vi.unstubAllGlobals();
    }
}

describe('Layout', () => {
    let html: string;

    beforeAll(async () => {
        html = await renderLayout({ description: DESCRIPTION, title: TITLE });
    });

    test('renders the full document skeleton', () => {
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<html class="overflow-x-clip" lang="en"');
        expect(html).toContain('<head>');
        expect(html).toContain('</head>');
        expect(html).toContain('<body class="flex flex-col overflow-x-clip relative isolate min-h-screen antialiased font-mono bg-night text-cream"');
        expect(html).toContain('</body></html>');
    });

    test('declares the charset and viewport metas', () => {
        expect(html).toContain('<meta charset="utf-8">');
        expect(html).toContain('<meta content="width=device-width, initial-scale=1" name="viewport">');
    });

    test('renders the title prop as the document title', () => {
        expect(html).toContain(`<title>${TITLE}</title>`);
    });

    test('wires the description prop into the description and social description metas', () => {
        expect(html).toContain(`<meta content="${DESCRIPTION}" name="description">`);
        expect(html).toContain(`<meta content="${DESCRIPTION}" property="og:description">`);
        expect(html).toContain(`<meta content="${DESCRIPTION}" name="twitter:description">`);
    });

    test('mirrors the title prop into the social title metas', () => {
        expect(html).toContain(`<meta content="${TITLE}" property="og:title">`);
        expect(html).toContain(`<meta content="${TITLE}" name="twitter:title">`);
    });

    test('points the canonical link and og:url at the site url', () => {
        expect(html).toContain(`<link href="${SITE}/" rel="canonical">`);
        expect(html).toContain(`<meta content="${SITE}/" property="og:url">`);
    });

    test('renders the og site name, og type, twitter card, author, and theme color metas', () => {
        expect(html).toContain('<meta content="Austin Music Video Film Festival" property="og:site_name">');
        expect(html).toContain('<meta content="website" property="og:type">');
        expect(html).toContain('<meta content="summary_large_image" name="twitter:card">');
        expect(html).toContain('<meta content="Kevin Huang" name="author">');
        expect(html).toContain('<meta content="#0a0a0f" name="theme-color">');
    });

    test('allows indexing without the noindex prop', () => {
        expect(html).toContain('<meta content="index, follow" name="robots">');
    });

    test('blocks indexing when the noindex prop is set', async () => {
        const noindexed = await renderLayout({ description: NOINDEX_DESCRIPTION, noindex: true, title: NOINDEX_TITLE });

        expect(noindexed).toContain('<meta content="noindex, nofollow" name="robots">');
        expect(noindexed).not.toContain('<meta content="index, follow" name="robots">');
    });

    test('points the social image metas at og.png', () => {
        expect(html).toMatch(/<meta content="[^"]*og\.png" property="og:image">/);
        expect(html).toMatch(/<meta content="[^"]*og\.png" name="twitter:image">/);
    });

    test('links the touch icon and favicon', () => {
        expect(html).toContain('<link href="/apple-touch-icon.png" rel="apple-touch-icon">');
        expect(html).toContain('<link href="/favicon.png" rel="icon" type="image/png">');
    });

    test('embeds parseable json-ld describing the site', () => {
        const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

        const jsonLd = match ? JSON.parse(match[1]) : null;

        expect(jsonLd).not.toBeNull();
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('WebSite');
        expect(jsonLd.author).toEqual({ '@type': 'Person', 'name': 'Kevin Huang' });
        expect(jsonLd.inLanguage).toBe('en');
        expect(jsonLd.name).toBe('Austin Music Video Film Festival');
    });

    test('enables the client router once', () => {
        expect(html).toContain('<meta name="astro-view-transitions-enabled" content="true">');
        expect(html).toContain('<meta name="astro-view-transitions-fallback" content="animate">');
        expect(html.split('ClientRouter.astro?astro&type=script').length - 1).toBe(1);
    });

    test('attaches exactly one page-load script hook', () => {
        expect(html.split('Layout.astro?astro&type=script').length - 1).toBe(1);
    });

    test('hides the grain and vignette layers from assistive tech', () => {
        expect(html).toContain('<div class="grain fixed -z-10 pointer-events-none" aria-hidden="true"');
        expect(html).toContain('<div class="vignette fixed inset-0 -z-20 pointer-events-none" aria-hidden="true"');
    });

    test('renders the starfield, navbar header, and footer chrome', () => {
        expect(html).toContain('class="starfield fixed inset-0 overflow-hidden -z-30 pointer-events-none"');
        expect(html).toContain('<header data-astro-transition-persist="navbar" class="navbar sticky top-0 z-50 border-b border-cream-15"');
        expect(html).toContain('<footer class="footer border-cream-15 border-t bg-navy"');
    });

    test('renders slot content inside main between the body bounds', () => {
        expect(html).toContain(SLOT);
        expect(html.indexOf(SLOT)).toBeGreaterThan(html.indexOf('<main class="flex flex-1 flex-col"'));
        expect(html.indexOf(SLOT)).toBeLessThan(html.indexOf('</main>'));
        expect(html.indexOf('<main class="flex flex-1 flex-col"')).toBeGreaterThan(html.indexOf('<body'));
        expect(html.indexOf('</main>')).toBeLessThan(html.indexOf('</body>'));
    });

    test('omits the overlay slot by default and renders it before main when provided', async () => {
        const overlaid = await renderLayout({ description: DESCRIPTION, title: TITLE }, { default: SLOT, overlay: OVERLAY });

        expect(html).not.toContain(OVERLAY);
        expect(overlaid).toContain(OVERLAY);
        expect(overlaid.indexOf(OVERLAY)).toBeGreaterThan(overlaid.indexOf('<body'));
        expect(overlaid.indexOf(OVERLAY)).toBeLessThan(overlaid.indexOf('<main class="flex flex-1 flex-col"'));
    });
});
