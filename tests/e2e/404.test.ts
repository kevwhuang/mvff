import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/this-page-does-not-exist');
    });

    test('displays 404 heading', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('404');
    });

    test('has return link to home', async ({ page }) => {
        const link = page.getByRole('link', { name: 'Return Home' });

        await expect(link).toHaveAttribute('href', '/');
    });

    test('return link navigates home', async ({ page }) => {
        const link = page.getByRole('link', { name: 'Return Home' });

        await link.focus();
        await link.click();
        await page.waitForURL('/');
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });
});
