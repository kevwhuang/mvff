import { expect, test } from '@playwright/test';

test.describe('404 page', () => {
    test('returns 404 and renders the error section for an unknown path', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist');

        expect(response?.status()).toBe(404);

        await expect(page.locator('#error-not-found-title')).toHaveText('404');
        await expect(page.locator('#error-not-found-title')).toHaveAttribute('data-text', '404');
        await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
    });

    test('returns 404 for deep unknown paths', async ({ page }) => {
        const response = await page.goto('/gallery/nope/deeper');

        expect(response?.status()).toBe(404);

        await expect(page.locator('#error-not-found-title')).toHaveText('404');
    });

    test('navigates home from the back-home link', async ({ page }) => {
        await page.goto('/this-page-does-not-exist');

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
