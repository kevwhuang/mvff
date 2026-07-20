import { expect, test } from '@playwright/test';

test.describe('500 page', () => {
    test('returns 500 and renders the error section', async ({ page }) => {
        const response = await page.goto('/500');

        expect(response?.status()).toBe(500);

        await expect(page.locator('#error-server-title')).toHaveText('500');
        await expect(page.locator('#error-server-title')).toHaveAttribute('data-text', '500');
        await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
    });

    test('navigates home from the back-home link', async ({ page }) => {
        await page.goto('/500');

        const backHome = page.getByRole('link', { name: 'Back to Home' });

        // The link is a data-scroll child, so on load it tweens up from y:60 as it
        // fades in; clicking mid-tween lets the moving anchor retarget the click to
        // its wrapper. Focusing it first triggers the site's own
        // `[data-scroll] > :focus-within { transform: none !important }` rule, which
        // pins the link static at its resting position so the click lands on it.
        await backHome.focus();
        await backHome.click();

        await expect(page).toHaveURL('/');
        await expect(page).toHaveTitle('Austin Music Video Film Festival');
    });
});
