import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

import type { APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://atxmusicvideofilmfestival.com';
const GALLERY_DIR = fileURLToPath(new URL('../../src/content/gallery', import.meta.url));

const SECURITY_HEADERS = {
    'content-security-policy': 'base-uri \'none\'; connect-src \'self\' https://*.supabase.co; default-src \'self\'; font-src \'self\' data:; form-action \'none\'; frame-ancestors \'self\'; img-src \'self\' data:; script-src \'self\' \'unsafe-inline\' data:; style-src \'self\' \'unsafe-inline\'',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'sameorigin',
} as const;

const galleryCount = readdirSync(GALLERY_DIR).filter(file => file.endsWith('.json')).length;

async function fetchHtml(api: APIRequestContext, path: string) {
    const response = await api.get(`${BASE_URL}${path}`);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');

    return response.text();
}

test.describe.configure({ timeout: 60_000 });

test.describe('production pages', () => {
    test('serves the home page with the bare festival title', async ({ request }) => {
        const html = await fetchHtml(request, '/');

        expect(html).toContain('<title>Austin Music Video Film Festival</title>');
        expect(html).toContain('hero__title');
    });

    test('serves the info page with the schedule and contact channels', async ({ request }) => {
        const html = await fetchHtml(request, '/info');

        expect(html).toContain('<title>Info \u2014 Austin Music Video Film Festival</title>');
        expect(html).toContain('info__schedule');
        expect(html).toContain('contact__channels');
    });

    test('serves the team page with the team grid', async ({ request }) => {
        const html = await fetchHtml(request, '/team');

        expect(html).toContain('<title>Team \u2014 Austin Music Video Film Festival</title>');
        expect(html).toContain('team__grid');
    });

    test('serves the gallery page with the gallery grid', async ({ request }) => {
        const html = await fetchHtml(request, '/gallery');

        expect(html).toContain('<title>Gallery \u2014 Austin Music Video Film Festival</title>');
        expect(html).toContain('gallery__grid');
    });

    test('returns the 404 html page for an unknown path', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/this-page-does-not-exist`);

        expect(response.status()).toBe(404);
        expect(response.headers()['content-type']).toContain('text/html');

        expect(await response.text()).toContain('<title>404 \u2014 Austin Music Video Film Festival</title>');
    });

    test('serves the configured security headers on the home page', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/`);

        const headers = response.headers();

        for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
            expect(headers[name]).toBe(value);
        }
    });

    test('renders the home page hero in a real browser', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/`);

        expect(response?.status()).toBe(200);

        await expect(page).toHaveTitle('Austin Music Video Film Festival');
        await expect(page.locator('#hero-title')).toBeVisible();
    });

    test('renders every gallery figure from the content collection in a real browser', async ({ page }) => {
        const response = await page.goto(`${BASE_URL}/gallery`);

        expect(response?.status()).toBe(200);

        await expect(page).toHaveTitle('Gallery \u2014 Austin Music Video Film Festival');
        await expect(page.locator('.gallery__grid')).toBeVisible();
        await expect(page.locator('.gallery__figure')).toHaveCount(galleryCount);
    });
});

test.describe('production api', () => {
    test('returns a json not found error for an unknown api path', async ({ request }) => {
        const response = await request.get(`${BASE_URL}/api/anything`);

        expect(response.status()).toBe(404);
        expect(response.headers()['content-type']).toContain('application/json');

        expect(await response.json()).toEqual({ error: 'Not found' });
    });
});
