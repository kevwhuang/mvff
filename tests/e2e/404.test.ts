import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
    test('returns 404 and renders the error section for an unknown path', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist');

        expect(response?.status()).toBe(404);

        await expect(page.locator('#error-title')).toHaveText('404');
        await expect(page.locator('#error-title')).toHaveAttribute('data-text', '404');
        await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
    });

    test('returns 404 for deep unknown paths', async ({ page }) => {
        const response = await page.goto('/gallery/nope/deeper');

        expect(response?.status()).toBe(404);

        await expect(page.locator('#error-title')).toHaveText('404');
    });

    test('navigates home from the back-home link', async ({ page }) => {
        await page.goto('/this-page-does-not-exist');
        await page.getByRole('link', { name: 'Back to Home' }).click();

        await expect(page).toHaveURL('/');
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });
});
