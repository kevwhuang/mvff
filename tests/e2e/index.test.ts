import { expect, test } from '@playwright/test';

const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 120;
const SECTIONS = ['.hero', '.tagline', '.details', '.experience', '.partners'] as const;

test.describe('index page', () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
    });

    test('loads with the festival title', async ({ page }) => {
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });

    test('labels the hero logo with the festival name', async ({ page }) => {
        await expect(page.locator('.hero__logo')).toHaveAttribute('alt', 'Austin Music Video Film Festival');
    });

    test('presents a dimmed Leave a Review call to action', async ({ page }) => {
        const review = page.locator('.hero__content').getByRole('link', { name: 'Leave a Review' });

        await expect(review).toBeVisible();
        await expect(review).toHaveAttribute('aria-disabled', 'true');
    });

    test('presents a dimmed Future Partnerships call to action', async ({ page }) => {
        const partner = page.locator('.hero__content').getByRole('link', { name: 'Future Partnerships' });

        await expect(partner).toBeVisible();
        await expect(partner).toHaveAttribute('aria-disabled', 'true');
    });

    test('exposes a meta description of the expected length', async ({ page }) => {
        const description = await page.locator('meta[name="description"]').getAttribute('content');

        expect(description).not.toBeNull();
        expect(String(description).length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(String(description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    });

    test('names the site in its open graph metadata', async ({ page }) => {
        await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Austin Music Video Film Festival');
    });

    test('composes the home sections in order', async ({ page }) => {
        const ordered = await page.evaluate((selectors) => {
            const elements = selectors.map(selector => document.querySelector(selector));

            if (elements.some(element => !element)) return false;

            return selectors.every((_, index) => {
                const current = elements[index];
                const previous = elements[index - 1];

                return index === 0
                    || Boolean(previous && current && previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING);
            });
        }, [...SECTIONS]);

        expect(ordered).toBe(true);
    });
});

test.describe('index countdown', () => {
    test('freezes the hero countdown on the wrapped banner', async ({ page }) => {
        await page.goto('/');

        const banner = page.locator('.hero__countdown-over');

        await expect(banner).toBeVisible();
        await expect(banner).toHaveText('That\'s a wrap.');
        await expect(page.locator('.hero__countdown-number')).toHaveCount(0);
    });
});
