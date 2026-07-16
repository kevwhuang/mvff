import { expect, test } from '@playwright/test';

test.describe('500 page', () => {
    test('returns 500 and renders the error section', async ({ page }) => {
        const response = await page.goto('/500');

        expect(response?.status()).toBe(500);

        await expect(page.locator('#error-title')).toHaveText('500');
        await expect(page.locator('#error-title')).toHaveAttribute('data-text', '500');
        await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
    });

    test('navigates home from the back-home link', async ({ page }) => {
        await page.goto('/500');
        await page.getByRole('link', { name: 'Back to Home' }).click();

        await expect(page).toHaveURL('/');
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });
});
