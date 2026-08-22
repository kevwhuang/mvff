import { expect, test } from '@playwright/test';

const PAGES = [
    { name: 'home', path: '/' },
    { name: 'info', path: '/info' },
    { name: 'team', path: '/team' },
    { name: 'gallery', path: '/gallery' },
    { name: 'server error', path: '/500' },
    { name: 'not found', path: '/nonexistent-404' },
] as const;

const VIEWPORT_HEIGHT = 800;
const WIDTHS = [320, 375, 767, 768, 769, 1_023, 1_024, 1_025, 1_280, 1_440] as const;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('responsive layout', () => {
    for (const entry of PAGES) {
        test(`${entry.name} page has no horizontal overflow at any width`, async ({ page }) => {
            await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: WIDTHS[0] });
            await page.goto(entry.path);
            await page.locator('main').waitFor();

            for (const width of WIDTHS) {
                await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });

                const delta = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

                expect(delta, `horizontal overflow at width ${width}`).toBeLessThanOrEqual(0);
            }
        });
    }
});
