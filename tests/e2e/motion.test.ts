import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const POLL = { timeout: 10_000 };

async function areAllRevealed(page: Page, selector: string) {
    try {
        return await page.locator(selector).evaluateAll(
            elements => elements.every(element => getComputedStyle(element).opacity === '1'),
        );
    } catch {
        return false;
    }
}

async function countHidden(page: Page) {
    try {
        return await page.evaluate(() => [...document.querySelectorAll('[data-scroll]')].filter((element) => {
            const style = getComputedStyle(element);

            return style.opacity === '0' || style.visibility === 'hidden';
        }).length);
    } catch {
        return -1;
    }
}

async function getOpacity(locator: Locator) {
    try {
        return await locator.evaluate(element => getComputedStyle(element).opacity);
    } catch {
        return null;
    }
}

async function scrollToCenter(locator: Locator) {
    try {
        await locator.evaluate((element) => {
            element.scrollIntoView({ behavior: 'instant', block: 'center' });
        });
    } catch {
        return;
    }
}

test.describe('scroll motion', () => {
    test('reveals hero content on load without scrolling', async ({ page }) => {
        await page.goto('/');

        await expect.poll(() => getOpacity(page.locator('.hero__subtitle')), POLL).toBe('1');
    });

    test('keeps below-fold sections hidden until scrolled into view', async ({ page }) => {
        await page.goto('/');

        const head = page.locator('.experience .section-header');

        await expect.poll(() => getOpacity(head), POLL).toBe('0');

        await scrollToCenter(head);

        await expect.poll(() => getOpacity(head), POLL).toBe('1');
    });

    test('shows stagger parents while their children animate in', async ({ page }) => {
        await page.goto('/');

        const cards = page.locator('.experience__highlight');
        const list = page.locator('.experience ol[data-scroll]');

        await expect.poll(() => getOpacity(list), POLL).toBe('1');

        expect(await cards.count()).toBeGreaterThan(1);

        await expect.poll(() => getOpacity(cards.first()), POLL).toBe('0');

        await scrollToCenter(cards.last());

        await expect.poll(() => areAllRevealed(page, '.experience__highlight'), POLL).toBe(true);
    });
});

test.describe('scroll motion under reduced motion', () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('shows every data-scroll element immediately and frees the page', async ({ page }) => {
        await page.goto('/');

        expect(await page.locator('[data-scroll]').count()).toBeGreaterThan(1);

        await expect.poll(() => areAllRevealed(page, '[data-scroll]'), POLL).toBe(true);
        await expect.poll(() => countHidden(page), POLL).toBe(0);
        await expect(page.locator('.loader')).toBeHidden();
    });

    test('types the full tagline immediately', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('[data-typewriter]')).toHaveAttribute('data-typed', '');
        await expect(page.locator('.tagline__screens')).toHaveText('Screens');
        await expect(page.locator('.tagline__stage')).toHaveText('Stage');
    });

    test('renders the frozen countdown chip', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('.navbar__countdown')).toHaveText('00:00:00:00');
    });
});
