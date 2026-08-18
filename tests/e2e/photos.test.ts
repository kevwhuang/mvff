import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';

interface GalleryFigure {
    alt: string;
    label: string;
}

const BACKDROP_OFFSET = 8;
const GALLERY_DIR = fileURLToPath(new URL('../../src/content/gallery', import.meta.url));
const IMAGE_DELAY = 750;
const TEAM_NAMES = ['Anna', 'Jasmine', 'Amiri', 'Ashleigh', 'Dan', 'Greta', 'Jyme', 'Marissa', 'May', 'Rocky'] as const;

const figures = readdirSync(GALLERY_DIR)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => JSON.parse(readFileSync(join(GALLERY_DIR, file), 'utf-8')) as GalleryFigure);

const [firstFigure] = figures;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('photos page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/photos');
    });

    test('loads with the photos title and the meet the team heading', async ({ page }) => {
        await expect(page).toHaveTitle('Photos \u2014 Austin Music Video Film Festival');
        await expect(page.locator('#team-title')).toHaveText('Meet the Team');
    });

    test('shows every team member name in the grid', async ({ page }) => {
        await expect(page.locator('.team__card')).toHaveCount(TEAM_NAMES.length);
        await expect(page.locator('.team__name')).toHaveText(TEAM_NAMES);
    });

    test('renders the wrap heading and a captioned figure for every gallery entry', async ({ page }) => {
        await expect(page.locator('#gallery-title')).toHaveText('The Wrap');
        await expect(page.locator('.gallery__figure')).toHaveCount(figures.length);
        await expect(page.locator('.gallery__meta')).toHaveText(figures.map(figure => figure.label));
    });
});

test.describe('gallery lightbox without reduced motion', () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.goto('/photos');

        await expect(page.locator('.navbar__menu-link[href="/photos"]')).toHaveAttribute('aria-current', 'page');
    });

    test('opens the dialog with the frame source, alt, orientation, and label, locks page scroll, and focuses the close button', async ({ page }) => {
        const frame = page.locator('.gallery__frame').first();
        const lightbox = page.locator('.gallery__lightbox');

        const source = await frame.getAttribute('data-gallery-source');

        await frame.click();

        await expect(lightbox).toHaveAttribute('data-open', '');
        await expect(lightbox).not.toHaveAttribute('aria-hidden');
        await expect(lightbox).toHaveAttribute('data-gallery-orientation', 'landscape');
        await expect(lightbox.locator('.gallery__lightbox-close')).toBeFocused();
        await expect(lightbox.locator('.gallery__lightbox-image')).toHaveAttribute('src', String(source));
        await expect(lightbox.locator('.gallery__lightbox-image')).toHaveAttribute('alt', firstFigure.alt);
        await expect(lightbox.locator('.gallery__lightbox-label')).toHaveText(firstFigure.label);
        await expect(page.locator('#lightbox-title')).toHaveText(firstFigure.label);
        await expect(page.locator('html')).toHaveAttribute('style', /overflow: hidden/);
    });

    test('reserves the frame ratio on the dialog image while the full size image is pending and clears it once loaded', async ({ page }) => {
        const frame = page.locator('.gallery__frame').first();
        const lightbox = page.locator('.gallery__lightbox');

        const ratio = await frame.getAttribute('data-gallery-ratio');
        const source = await frame.getAttribute('data-gallery-source');

        await page.route(String(source), async (route) => {
            await new Promise(resolve => setTimeout(resolve, IMAGE_DELAY));
            await route.continue();
        });

        await frame.click();

        await expect(lightbox.locator('.gallery__lightbox-image')).toHaveCSS('aspect-ratio', String(ratio));
        await expect(lightbox.locator('.gallery__lightbox-image')).toHaveCSS('aspect-ratio', 'auto');
    });

    test('closes the dialog on escape, unlocks page scroll, and returns focus to the triggering frame', async ({ page }) => {
        const frame = page.locator('.gallery__frame').first();
        const lightbox = page.locator('.gallery__lightbox');

        await frame.click();
        await page.keyboard.press('Escape');

        await expect(lightbox).not.toHaveAttribute('data-open');
        await expect(lightbox).toHaveAttribute('aria-hidden', 'true');
        await expect(frame).toBeFocused();
        await expect(page.locator('html')).not.toHaveAttribute('style', /overflow: hidden/);
    });

    test('closes the dialog from the close button and returns focus to the triggering frame', async ({ page }) => {
        const frame = page.locator('.gallery__frame').first();
        const lightbox = page.locator('.gallery__lightbox');

        await frame.click();
        await lightbox.locator('.gallery__lightbox-close').click();

        await expect(lightbox).not.toHaveAttribute('data-open');
        await expect(lightbox).toHaveAttribute('aria-hidden', 'true');
        await expect(frame).toBeFocused();
    });

    test('closes the dialog when the backdrop outside the image is clicked', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');

        await page.locator('.gallery__frame').first().click();
        await lightbox.click({ position: { x: BACKDROP_OFFSET, y: BACKDROP_OFFSET } });

        await expect(lightbox).not.toHaveAttribute('data-open');
        await expect(lightbox).toHaveAttribute('aria-hidden', 'true');
    });

    test('keeps the dialog open when the image inside it is clicked', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');

        await page.locator('.gallery__frame').first().click();
        await lightbox.locator('.gallery__lightbox-image').click();

        await expect(lightbox).toHaveAttribute('data-open', '');
        await expect(lightbox).not.toHaveAttribute('aria-hidden');
    });

    test('keeps focus on the close button when tab is pressed in the open dialog', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');

        await page.locator('.gallery__frame').first().click();
        await page.keyboard.press('Tab');

        await expect(lightbox).toHaveAttribute('data-open', '');
        await expect(lightbox.locator('.gallery__lightbox-close')).toBeFocused();
    });
});

test.describe('gallery lightbox under reduced motion', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/photos');

        await expect(page.locator('.navbar__menu-link[href="/photos"]')).toHaveAttribute('aria-current', 'page');
    });

    test('opens the dialog and focuses the close button', async ({ page }) => {
        const lightbox = page.locator('.gallery__lightbox');

        await page.locator('.gallery__frame').first().click();

        await expect(lightbox).toHaveAttribute('data-open', '');
        await expect(lightbox.locator('.gallery__lightbox-close')).toBeFocused();
    });
});
