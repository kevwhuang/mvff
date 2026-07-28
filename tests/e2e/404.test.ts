import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('404 page', () => {
    test('returns a 404 status with the glitch heading and subtitle for an unknown path', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist');

        expect(response?.status()).toBe(404);

        await expect(page.locator('#error-not-found-title')).toHaveText('404');
        await expect(page.locator('#error-not-found-title')).toHaveAttribute('data-text', '404');
        await expect(page.locator('.error .subtitle')).toHaveText('This frame isn\'t on the program.');
    });

    test('returns a 404 status for deep unknown paths', async ({ page }) => {
        const response = await page.goto('/info/nope/deep');

        expect(response?.status()).toBe(404);

        await expect(page.locator('#error-not-found-title')).toHaveText('404');
    });

    test('navigates home from the return home link', async ({ page }) => {
        await page.goto('/this-page-does-not-exist');
        await page.getByRole('link', { name: 'Return Home' }).click();

        await expect(page).toHaveURL('/');
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });
});
