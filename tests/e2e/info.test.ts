import { expect, test } from '@playwright/test';

const FAQ_COUNT = 8;
const SCHEDULE_COUNT = 16;
const VENUE_FEATURE_COUNT = 6;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info');
});

test.describe('info faq', () => {
    test('renders a native details and summary accordion', async ({ page }) => {
        const items = page.locator('.info__faq-item');

        await expect(items).toHaveCount(FAQ_COUNT);

        const tagNames = await items.evaluateAll(elements => elements.map(element => element.tagName));

        expect(tagNames).toEqual(Array(FAQ_COUNT).fill('DETAILS'));

        await expect(page.locator('.info__faq-item > summary')).toHaveCount(FAQ_COUNT);
        await expect(page.locator('.info__faq-item[open]')).toHaveCount(0);
    });

    test('opens an entry and closes it when another opens', async ({ page }) => {
        const items = page.locator('.info__faq-item');
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
        await expect(page.locator('.info__schedule-row')).toHaveCount(SCHEDULE_COUNT);
        await expect(page.locator('.info__schedule-time').first()).toHaveText('7:00 PM');
        await expect(page.locator('.info__schedule-event').first()).toHaveText('Doors \u00b7 Ryley Hall');
        await expect(page.locator('.info__schedule-time').last()).toHaveText('2:00 AM');
        await expect(page.locator('.info__schedule-event').last()).toHaveText('Lights Up');
    });

    test('renders the venue features grid', async ({ page }) => {
        await expect(page.locator('.info__venue-name')).toHaveText('Cabana Club');
        await expect(page.locator('.info__venue-features li')).toHaveCount(VENUE_FEATURE_COUNT);
    });
});
