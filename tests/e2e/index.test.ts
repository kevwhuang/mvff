import { expect, test } from '@playwright/test';

const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 120;
const EXPERIENCE_TITLES = ['Live Music', 'Screenings', 'Q&A Panel', 'Awards', 'After Party'] as const;
const TAGLINE_LINE_HEIGHT = 0.9;
const TAGLINE_LINE_TOLERANCE = 1.5;
const TAGLINE_VIEWPORT_HEIGHT = 900;
const TAGLINE_VIEWPORT_WIDTHS = [320, 1440] as const;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('index page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('loads with the bare festival title', async ({ page }) => {
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });

    test('shows the hero with the wrap status and the festival logo', async ({ page }) => {
        await expect(page.locator('.hero')).toBeVisible();
        await expect(page.locator('.hero__countdown-over')).toBeVisible();
        await expect(page.locator('.hero__countdown-over')).toHaveText('That\'s a wrap.');

        await expect(page.locator('.hero__logo')).toBeVisible();
        await expect(page.locator('.hero__logo')).toHaveAttribute('alt', 'Austin Music Video Film Festival');
    });

    test('renders the tagline, details, experience, and partners sections with visible content', async ({ page }) => {
        await expect(page.locator('#tagline-title')).toBeVisible();
        await expect(page.locator('#tagline-title')).toHaveAttribute('aria-label', 'Screen to Stage');
        await expect(page.locator('.tagline__screen')).toHaveText('Screen');
        await expect(page.locator('.tagline__stage')).toHaveText('Stage');

        await expect(page.locator('.details__grid')).toBeVisible();
        await expect(page.locator('.details__grid dt')).toHaveText(['Date', 'Time', 'Venue']);
        await expect(page.locator('.details__grid dd').first()).toHaveText('July 18, 2026');
        await expect(page.locator('.details__grid dd').last()).toHaveText('Cabana Club');

        await expect(page.locator('#experience-title')).toHaveText('The Experience');
        await expect(page.locator('.experience__highlight')).toHaveCount(EXPERIENCE_TITLES.length);
        await expect(page.locator('.experience__highlight-title')).toHaveText(EXPERIENCE_TITLES);

        await expect(page.locator('.partners__track')).toBeVisible();
        await expect(page.locator('.partners__item').first()).toHaveText('Madewell Productions');
        await expect(page.locator('.partners__logo').nth(1)).toHaveAttribute('alt', 'Cabana Club');
    });

    test('keeps the tagline line box tight and the arrow vertically centered', async ({ page }) => {
        for (const width of TAGLINE_VIEWPORT_WIDTHS) {
            await page.setViewportSize({ height: TAGLINE_VIEWPORT_HEIGHT, width });
            await page.locator('#tagline-title').scrollIntoViewIfNeeded();
            await expect(page.locator('#tagline-title')).toHaveAttribute('data-typed', '');

            const metrics = await page.evaluate(() => {
                const arrow = (document.querySelector('.tagline__arrow svg') as SVGSVGElement).getBoundingClientRect();
                const screen = (document.querySelector('.tagline__screen') as HTMLElement).getBoundingClientRect();
                const title = document.querySelector('#tagline-title') as HTMLElement;

                return {
                    arrowCenter: arrow.top + arrow.height / 2,
                    clientHeight: title.clientHeight,
                    fontSize: parseFloat(getComputedStyle(title).fontSize),
                    screenBottom: screen.bottom,
                    screenHeight: screen.height,
                    screenTop: screen.top,
                };
            });

            expect(Math.abs(metrics.clientHeight - metrics.fontSize * TAGLINE_LINE_HEIGHT)).toBeLessThanOrEqual(TAGLINE_LINE_TOLERANCE);
            expect(metrics.arrowCenter).toBeGreaterThanOrEqual(metrics.screenTop + metrics.screenHeight / 4);
            expect(metrics.arrowCenter).toBeLessThanOrEqual(metrics.screenBottom - metrics.screenHeight / 4);
        }
    });

    test('exposes a meta description of the expected length', async ({ page }) => {
        const description = await page.locator('meta[name="description"]').getAttribute('content');

        expect(description).not.toBeNull();
        expect(String(description).length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(String(description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    });

    test('embeds parseable json-ld website data', async ({ page }) => {
        const raw = await page.locator('script[type="application/ld+json"]').textContent();

        const data = JSON.parse(String(raw)) as { '@type': string; 'name': string; 'url': string };

        expect(data['@type']).toBe('WebSite');
        expect(data.name).toBe('Austin Music Video Film Festival');
        expect(data.url).toBe('https://atxmusicvideofilmfestival.com/');
    });

    test('fits the default viewport without horizontal overflow', async ({ page }) => {
        const metrics = await page.evaluate(() => ({
            clientWidth: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
        }));

        expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    });

    test('loads without console errors', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        expect(errors).toEqual([]);
    });
});
