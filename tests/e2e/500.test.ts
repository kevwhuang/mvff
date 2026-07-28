import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('500 page', () => {
    test('returns a 500 status with the glitch heading and subtitle on direct visit', async ({ page }) => {
        const response = await page.goto('/500');

        expect(response?.status()).toBe(500);

        await expect(page.locator('#error-server-title')).toHaveText('500');
        await expect(page.locator('#error-server-title')).toHaveAttribute('data-text', '500');
        await expect(page.locator('.error .subtitle')).toHaveText('The projector jammed mid-reel.');
    });

    test('navigates home from the return home link', async ({ page }) => {
        await page.goto('/500');
        await page.getByRole('link', { name: 'Return Home' }).click();

        await expect(page).toHaveURL('/');
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });
});
