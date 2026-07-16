import { expect, test } from '@playwright/test';

const FIGURE_COUNT = 2;
const WIDTHS = [320, 768, 1280];

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/gallery');
});

test.describe('gallery composition', () => {
    test('renders exactly two portrait figures', async ({ page }) => {
        await expect(page.locator('.gallery__frame')).toHaveCount(FIGURE_COUNT);
        await expect(page.locator('.gallery__frame img')).toHaveCount(FIGURE_COUNT);
        await expect(page.locator('.gallery__figure--lead')).toBeVisible();
        await expect(page.locator('.gallery__figure--trail')).toBeVisible();
    });

    test('describes each portrait with specific alt text', async ({ page }) => {
        await expect(page.locator('.gallery__figure--lead img')).toHaveAttribute('alt', /standing shoulder to shoulder/);
        await expect(page.locator('.gallery__figure--trail img')).toHaveAttribute('alt', /seated and leaning together/);
    });

    test('captions the portraits with their titles and year', async ({ page }) => {
        await expect(page.locator('.gallery__meta').first()).toContainText('The Team, Standing');
        await expect(page.locator('.gallery__meta').nth(1)).toContainText('The Team, Seated');
        await expect(page.locator('.gallery__year')).toHaveCount(FIGURE_COUNT);
    });

    test('leaves everything visible under reduced motion', async ({ page }) => {
        const composition = page.locator('.gallery__composition');
        const note = page.locator('.gallery__note');

        await expect(composition).toHaveCSS('opacity', '1');
        await expect(note).toHaveCSS('opacity', '1');
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
        const lightbox = page.locator('.lightbox');
        const frame = page.locator('.gallery__frame').first();

        await expect(lightbox).toBeHidden();
        await expect(lightbox).toHaveAttribute('role', 'dialog');
        await expect(lightbox).toHaveAttribute('aria-modal', 'true');

        await frame.click();

        await expect(lightbox).toBeVisible();
        await expect(lightbox).toHaveAttribute('aria-hidden', 'false');
        await expect(page.locator('.lightbox__close')).toBeFocused();

        await page.keyboard.press('Escape');

        await expect(lightbox).toBeHidden();
        await expect(frame).toBeFocused();
    });

    test('shows only the image with no caption block', async ({ page }) => {
        await page.locator('.gallery__frame').first().click();

        await expect(page.locator('.lightbox__caption')).toHaveCount(0);
        await expect(page.locator('.lightbox__info')).toHaveCount(0);

        const background = await page.locator('.lightbox__image').evaluate(
            node => getComputedStyle(node).backgroundImage,
        );

        expect(background).toContain('url(');
    });

    test('closes from the close button and restores focus to the figure', async ({ page }) => {
        const lightbox = page.locator('.lightbox');
        const frame = page.locator('.gallery__frame').first();

        await frame.click();

        await expect(lightbox).toBeVisible();

        await page.locator('.lightbox__close').click();

        await expect(lightbox).toBeHidden();
        await expect(frame).toBeFocused();
    });

    test('closes when the backdrop is clicked', async ({ page }) => {
        const lightbox = page.locator('.lightbox');
        const frame = page.locator('.gallery__frame').nth(1);

        await frame.click();

        await expect(lightbox).toBeVisible();

        await lightbox.click({ position: { x: 5, y: 5 } });

        await expect(lightbox).toBeHidden();
    });
});
