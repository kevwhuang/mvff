import { expect, test } from '@playwright/test';

const FAQ_COUNT = 9;
const SCHEDULE_COUNT = 16;
const VENUE_FEATURE_COUNT = 6;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info');
});

test.describe('info faq', () => {
    test('renders a native details and summary accordion', async ({ page }) => {
        const items = page.locator('.faq__item');

        await expect(items).toHaveCount(FAQ_COUNT);

        const tagNames = await items.evaluateAll(elements => elements.map(element => element.tagName));

        expect(tagNames).toEqual(Array(FAQ_COUNT).fill('DETAILS'));

        await expect(page.locator('.faq__item > summary')).toHaveCount(FAQ_COUNT);
        await expect(page.locator('.faq__item[open]')).toHaveCount(0);
    });

    test('opens an entry and closes it when another opens', async ({ page }) => {
        const items = page.locator('.faq__item');
        const first = items.first();
        const third = items.nth(2);

        await first.locator('summary').click();

        await expect(first).toHaveAttribute('open', '');

        await third.locator('summary').click();

        await expect(third).toHaveAttribute('open', '');
        await expect(first).not.toHaveAttribute('open', '');
    });
});

test.describe('info schedule and venue', () => {
    test('renders the full run of show from doors to close', async ({ page }) => {
        await expect(page.locator('.schedule__row')).toHaveCount(SCHEDULE_COUNT);
        await expect(page.locator('.schedule__time').first()).toHaveText('7:00 PM');
        await expect(page.locator('.schedule__event').first()).toHaveText('Doors \u00b7 Ryley Hall');
        await expect(page.locator('.schedule__time').last()).toHaveText('2:00 AM');
        await expect(page.locator('.schedule__event').last()).toHaveText('Lights Up');
    });

    test('renders the venue features grid', async ({ page }) => {
        await expect(page.locator('.venue__name')).toHaveText('Cabana Club');
        await expect(page.locator('.venue__features li')).toHaveCount(VENUE_FEATURE_COUNT);
    });
});
