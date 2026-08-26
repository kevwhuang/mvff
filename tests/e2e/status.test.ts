import { expect, test } from '@playwright/test';

const CONTENT_SECURITY_POLICY = 'base-uri \'none\'; connect-src \'self\' https://*.supabase.co; default-src \'self\'; font-src \'self\' data:; form-action \'none\'; frame-ancestors \'self\'; img-src \'self\' data:; script-src \'self\' \'unsafe-inline\' data:; style-src \'self\' \'unsafe-inline\'';
const PAGE_PATHS = ['/', '/info', '/team', '/gallery'] as const;

test.describe('pages', () => {
    test('serves the core pages as html', async ({ request }) => {
        for (const path of PAGE_PATHS) {
            const response = await request.get(path);

            expect(response.status(), `status for ${path}`).toBe(200);
            expect(response.headers()['content-type'], `content type for ${path}`).toContain('text/html');
        }
    });

    test('returns 404 for unknown pages', async ({ request }) => {
        const response = await request.get('/this-page-does-not-exist');

        expect(response.status()).toBe(404);
        expect(response.headers()['content-type']).toContain('text/html');
    });

    test('serves the hardened security headers', async ({ request }) => {
        const response = await request.get('/');

        expect(response.headers()['content-security-policy']).toBe(CONTENT_SECURITY_POLICY);
        expect(response.headers()['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
        expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
        expect(response.headers()['strict-transport-security']).toBe('max-age=31536000; includeSubDomains; preload');
        expect(response.headers()['x-content-type-options']).toBe('nosniff');
        expect(response.headers()['x-frame-options']).toBe('sameorigin');
    });
});

test.describe('api', () => {
    test('returns a json 404 for an unknown api path on get', async ({ request }) => {
        const response = await request.get('/api/anything');

        expect(response.status()).toBe(404);
        expect(response.headers()['content-type']).toContain('application/json');

        const body: Record<string, unknown> = await response.json();

        expect(body.error).toBe('Not found.');
    });

    test('returns a json 404 for an unknown api path on post', async ({ request }) => {
        const response = await request.post('/api/anything', { data: {} });

        expect(response.status()).toBe(404);
        expect(response.headers()['content-type']).toContain('application/json');

        const body: Record<string, unknown> = await response.json();

        expect(body.error).toBe('Not found.');
    });
});
