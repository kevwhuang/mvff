import { expect, test } from '@playwright/test';

const FIGURE_COUNT = 2;
const WIDTHS = [320, 768, 1280];

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/team');
});

test.describe('gallery composition', () => {
    test('renders exactly two portrait figures', async ({ page }) => {
        await expect(page.locator('.gallery__frame')).toHaveCount(FIGURE_COUNT);
        await expect(page.locator('.gallery__frame img')).toHaveCount(FIGURE_COUNT);
        await expect(page.locator('.gallery__figure')).toHaveCount(FIGURE_COUNT);
        await expect(page.locator('.gallery__figure').first()).toBeVisible();
        await expect(page.locator('.gallery__figure').last()).toBeVisible();
    });

    test('describes each portrait with specific alt text', async ({ page }) => {
        await expect(page.locator('.gallery__frame img').first()).toHaveAttribute('alt', /standing shoulder to shoulder/);
        await expect(page.locator('.gallery__frame img').last()).toHaveAttribute('alt', /seated and leaning together/);
    });

    test('captions the portraits with their titles', async ({ page }) => {
        await expect(page.locator('.gallery__meta')).toHaveCount(FIGURE_COUNT);
        await expect(page.locator('.gallery__meta').first()).toContainText('The Team, Standing');
        await expect(page.locator('.gallery__meta').nth(1)).toContainText('The Team, Seated');
    });

    test('leaves everything visible under reduced motion', async ({ page }) => {
        const grid = page.locator('.gallery__grid');
        const figure = page.locator('.gallery__figure').first();

        await expect(grid).toHaveCSS('opacity', '1');
        await expect(figure).toHaveCSS('opacity', '1');
    });

    test('never overflows the viewport width', async ({ page }) => {
        for (const width of WIDTHS) {
            await page.setViewportSize({ height: 900, width });

            const overflow = await page.evaluate(() => {
                const root = document.documentElement;

                return root.scrollWidth - root.clientWidth;
            });

            expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
        }
    });
});

test.describe('gallery lightbox', () => {
    test('opens a modal dialog from a figure and closes on escape', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');
        const frame = page.locator('.gallery__frame').first();

        await expect(lightbox).toBeHidden();
        await expect(lightbox).toHaveAttribute('role', 'dialog');
        await expect(lightbox).toHaveAttribute('aria-modal', 'true');
        await expect(lightbox).toHaveAttribute('aria-hidden', 'true');

        await frame.click();

        await expect(lightbox).toBeVisible();
        await expect(lightbox).toHaveAttribute('data-open', '');
        await expect(lightbox).not.toHaveAttribute('aria-hidden', 'true');
        await expect(page.locator('.gallery__lightbox-inner')).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(lightbox).toBeHidden();
        await expect(frame).toBeFocused();
    });

    test('mirrors the selected figure image and label', async ({ page }) => {
        const frame = page.locator('.gallery__frame').first();
        const source = await frame.getAttribute('data-gallery-source');

        await frame.click();

        await expect(page.locator('.gallery__lightbox-image')).toHaveAttribute('src', source ?? '');
        await expect(page.locator('.gallery__lightbox-label')).toHaveText('The Team, Standing');
    });

    test('stays open when the dialog inner is clicked', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');
        const frame = page.locator('.gallery__frame').first();

        await frame.click();

        await expect(lightbox).toBeVisible();

        await page.locator('.gallery__lightbox-inner').click();

        await expect(lightbox).toBeVisible();
    });

    test('closes when the backdrop is clicked and restores focus to the figure', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');
        const frame = page.locator('.gallery__frame').nth(1);

        await frame.click();

        await expect(lightbox).toBeVisible();

        await lightbox.click({ position: { x: 5, y: 5 } });

        await expect(lightbox).toBeHidden();
        await expect(frame).toBeFocused();
    });
});
