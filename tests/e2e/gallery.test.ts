import { expect, test } from '@playwright/test';

const TILE_COUNT = 15;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/gallery');
});

test.describe('gallery grid', () => {
    test('renders the full tile grid', async ({ page }) => {
        await expect(page.locator('.gallery__tile')).toHaveCount(TILE_COUNT);
    });

    test('includes the team photographs', async ({ page }) => {
        await expect(page.locator('.gallery__tile img')).toHaveCount(2);
        await expect(page.locator('.gallery__tile[data-gallery-title="The 2026 Team"]')).toBeVisible();
        await expect(page.locator('.gallery__tile[data-gallery-title="Crew Portrait"]')).toBeVisible();
    });

    test('labels every tile with the 2026 year', async ({ page }) => {
        const years = await page.locator('.gallery__tile').evaluateAll(
            tiles => tiles.map(tile => tile.getAttribute('data-gallery-year')),
        );

        expect(years).toEqual(Array(TILE_COUNT).fill('2026'));
    });
});

test.describe('gallery lightbox', () => {
    test('opens a modal dialog from a tile and closes on escape', async ({ page }) => {
        const lightbox = page.locator('.lightbox');
        const tile = page.locator('.gallery__tile').first();

        await expect(lightbox).toBeHidden();
        await expect(lightbox).toHaveAttribute('role', 'dialog');
        await expect(lightbox).toHaveAttribute('aria-modal', 'true');

        await tile.click();

        await expect(lightbox).toBeVisible();
        await expect(lightbox).toHaveAttribute('aria-hidden', 'false');
        await expect(page.locator('.lightbox__close')).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(lightbox).toBeHidden();
        await expect(tile).toBeFocused();
    });

    test('closes from the close button and restores focus to the tile', async ({ page }) => {
        const lightbox = page.locator('.lightbox');
        const tile = page.locator('.gallery__tile').first();

        await tile.click();

        await expect(lightbox).toBeVisible();

        await page.locator('.lightbox__close').click();

        await expect(lightbox).toBeHidden();
        await expect(tile).toBeFocused();
    });

    test('closes when the backdrop is clicked', async ({ page }) => {
        const lightbox = page.locator('.lightbox');
        const tile = page.locator('.gallery__tile').nth(2);

        await tile.click();

        await expect(lightbox).toBeVisible();

        await lightbox.click({ position: { x: 5, y: 5 } });

        await expect(lightbox).toBeHidden();
    });
});
