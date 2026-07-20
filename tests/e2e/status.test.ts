import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = [
    { path: '/assets/austin_music_video_film_festival_pitch_deck.pdf', type: 'application/pdf' },
    { path: '/og.png', type: 'image/png' },
    { path: '/favicon.png', type: 'image/png' },
] as const;

const DELETED_PATHS = ['/contact', '/gallery'] as const;
const DIST = join(process.cwd(), 'dist');
const PAGE_PATHS = ['/', '/info', '/team'] as const;
const SECURITY_HEADERS = {
    'content-security-policy': 'default-src \'self\'',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-frame-options': 'sameorigin',
} as const;

test.describe('pages', () => {
    test('serves every core page as html', async ({ request }) => {
        for (const path of PAGE_PATHS) {
            const response = await request.get(path);

            expect(response.status(), path).toBe(200);
            expect(response.headers()['content-type']).toContain('text/html');
        }
    });

    test('returns 404 for an unknown page without redirecting', async ({ request }) => {
        const response = await request.get('/this-page-does-not-exist', { maxRedirects: 0 });

        expect(response.status()).toBe(404);
        expect(response.headers()['content-type']).toContain('text/html');
    });

    test('returns 404 for the retired contact and gallery routes', async ({ request }) => {
        for (const path of DELETED_PATHS) {
            const response = await request.get(path, { maxRedirects: 0 });

            expect(response.status(), path).toBe(404);
            expect(response.headers()['content-type'], path).toContain('text/html');
        }
    });

    test('serves a trailing-slash path directly', async ({ request }) => {
        const response = await request.get('/info/', { maxRedirects: 0 });

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('text/html');
    });
});

test.describe('assets', () => {
    for (const asset of ASSETS) {
        test(`serves ${asset.path} with the ${asset.type} content type`, async ({ request }) => {
            const response = await request.get(asset.path);

            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toContain(asset.type);
        });
    }
});

test.describe('security headers', () => {
    test('sets the configured headers on the home page', async ({ request }) => {
        const headers = (await request.get('/')).headers();

        for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
            expect(headers[name], name).toBeDefined();
            expect(headers[name], name).toContain(value);
        }
    });
});

test.describe('build artifacts', () => {
    test('generates robots.txt pointing at the sitemap', async ({ request }) => {
        const response = await request.get('/robots.txt', { maxRedirects: 0 });

        if (response.status() === 200) {
            expect(response.headers()['content-type']).toContain('text/plain');
            expect(await response.text()).toContain('Sitemap');

            return;
        }

        test.skip(!existsSync(join(DIST, 'robots.txt')), 'dev server does not emit the build-time robots.txt');
        expect(readFileSync(join(DIST, 'robots.txt'), 'utf-8')).toContain('Sitemap');
    });

    test('generates the sitemap index', async ({ request }) => {
        const response = await request.get('/sitemap-index.xml', { maxRedirects: 0 });

        if (response.status() === 200) {
            expect(response.headers()['content-type']).toContain('xml');
            expect(await response.text()).toContain('<sitemapindex');

            return;
        }

        test.skip(!existsSync(join(DIST, 'sitemap-index.xml')), 'dev server does not emit the build-time sitemap');
        expect(readFileSync(join(DIST, 'sitemap-index.xml'), 'utf-8')).toContain('<sitemapindex');
    });
});
