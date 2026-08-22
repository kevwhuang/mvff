import { expect, test } from '@playwright/test';

const CHANNELS = [
    { href: 'https://instagram.com/atxmvff', isExternal: true, label: 'Instagram', value: '@atxmvff' },
    { href: 'mailto:contact@atxmusicvideofilmfestival.com', isExternal: false, label: 'Email', value: 'contact@atxmusicvideofilmfestival.com' },
    { href: 'tel:+12814669387', isExternal: false, label: 'Phone', value: '(281) 466-9387' },
    { href: 'https://calendly.com/madewellanna99/30min', isExternal: true, label: 'Schedule Call', value: 'calendly.com/madewellanna99' },
] as const;

const FAQ_ENTRIES = 8;
const FAQ_FIRST_ANSWER = 'A one-night music video festival at Cabana Club in East Austin: live sets, three screening blocks, filmmaker Q&A panels, an awards ceremony, and an after party.';
const FAQ_FIRST_QUESTION = 'What is the Austin Music Video Film Festival?';
const FAQ_SECOND_ANSWER = 'Yes. 21+, doors to close.';
const SCHEDULE_ROWS = 16;
const VENUE_FEATURES = ['Big screen', 'Live stage', 'Outdoor pool', 'Full bar', '21+ only', 'ADA access'] as const;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('info page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/info');
    });

    test('loads with the info title and the guest info heading', async ({ page }) => {
        await expect(page).toHaveTitle('Info \u2014 Austin Music Video Film Festival');
        await expect(page.locator('#info-title')).toHaveText('Guest Info');
    });

    test('shows the venue card with the cabana club name, address, and features', async ({ page }) => {
        const venue = page.locator('.info__venue');

        await expect(venue).toBeVisible();
        await expect(venue.locator('.info__venue-name')).toHaveText('Cabana Club');
        await expect(venue.locator('.info__venue-address')).toHaveText('5012 E 7th St \u00B7 Austin, TX');
        await expect(venue.locator('.info__venue-features li')).toHaveText(VENUE_FEATURES);
    });

    test('renders sixteen program rows opening at 7:00 PM and closing with lights up', async ({ page }) => {
        const rows = page.locator('.info__schedule-row');

        await expect(rows).toHaveCount(SCHEDULE_ROWS);

        await expect(rows.first().locator('.info__schedule-time')).toHaveText('7:00 PM');
        await expect(rows.first().locator('.info__schedule-time')).toHaveAttribute('datetime', '2026-07-18T19:00-05:00');
        await expect(rows.first().locator('.info__schedule-event')).toHaveText('Ryley Hall');

        await expect(rows.last().locator('.info__schedule-time')).toHaveText('2:00 AM');
        await expect(rows.last().locator('.info__schedule-event')).toHaveText('Lights Up');
        await expect(rows.last().locator('.info__schedule-tag')).toHaveText('Close');
    });

    test('renders eight faq entries closed on load', async ({ page }) => {
        await expect(page.locator('.info__faq-item')).toHaveCount(FAQ_ENTRIES);
        await expect(page.locator('.info__faq-item[open]')).toHaveCount(0);
        await expect(page.locator('.info__subheading-badge')).toHaveText(`${FAQ_ENTRIES} Entries`);
        await expect(page.locator('.info__faq-text').first()).toHaveText(FAQ_FIRST_QUESTION);
        await expect(page.locator('.info__faq-answer').first()).toBeHidden();
    });

    test('opens an faq entry and reveals its answer when its question is clicked', async ({ page }) => {
        const entry = page.locator('.info__faq-item').first();

        await entry.locator('.info__faq-question').click();

        await expect(entry).toHaveAttribute('open', '');
        await expect(entry.locator('.info__faq-answer')).toBeVisible();
        await expect(entry.locator('.info__faq-answer')).toHaveText(FAQ_FIRST_ANSWER);
    });

    test('closes the open faq entry when a second question is opened', async ({ page }) => {
        const entries = page.locator('.info__faq-item');

        await entries.first().locator('.info__faq-question').click();
        await entries.nth(1).locator('.info__faq-question').click();

        await expect(entries.first()).not.toHaveAttribute('open');
        await expect(entries.first().locator('.info__faq-answer')).toBeHidden();

        await expect(entries.nth(1)).toHaveAttribute('open', '');
        await expect(entries.nth(1).locator('.info__faq-answer')).toHaveText(FAQ_SECOND_ANSWER);
    });

    test('lists the four contact channels with their labels, values, hrefs, and external targets', async ({ page }) => {
        const links = page.locator('.contact__channel-link');

        await expect(page.locator('#contact-title')).toHaveText('Contact Us');
        await expect(links).toHaveCount(CHANNELS.length);

        for (const [index, channel] of CHANNELS.entries()) {
            const link = links.nth(index);

            await expect(link).toHaveAttribute('href', channel.href);
            await expect(link.locator('.contact__channel-label')).toHaveText(channel.label);
            await expect(link.locator('.contact__channel-value')).toContainText(channel.value);

            if (channel.isExternal) {
                await expect(link).toHaveAttribute('rel', 'noopener');
                await expect(link).toHaveAttribute('target', '_blank');
            } else {
                await expect(link).not.toHaveAttribute('rel');
                await expect(link).not.toHaveAttribute('target');
            }
        }
    });
});
