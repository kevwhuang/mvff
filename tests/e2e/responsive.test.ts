import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const PAGES = [
    { name: 'home', path: '/' },
    { name: 'info', path: '/info' },
    { name: 'team', path: '/team' },
    { name: 'gallery', path: '/gallery' },
    { name: 'contact', path: '/contact' },
    { name: 'terms', path: '/terms' },
    { name: 'privacy', path: '/privacy' },
    { name: 'not found', path: '/this-page-does-not-exist' },
] as const;

const SCRIPT_TIMEOUT = 20_000;
const VIEWPORT_HEIGHT = 800;
const WIDTHS = [320, 375, 767, 768, 769, 1_023, 1_024, 1_025, 1_280, 1_440] as const;

function getOverflow(page: Page) {
    return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('responsive layout', () => {
    for (const entry of PAGES) {
        test(`${entry.name} page fits every width without horizontal overflow`, async ({ page }) => {
            await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: WIDTHS[0] });
            await page.goto(entry.path);
            await page.locator('main').waitFor();

            for (const width of WIDTHS) {
                await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });

                await expect
                    .poll(() => getOverflow(page), { message: `horizontal overflow at width ${width}`, timeout: SCRIPT_TIMEOUT })
                    .toBeLessThanOrEqual(0);
            }
        });
    }
});
