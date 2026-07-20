import { expect, test } from '@playwright/test';

const CHANNEL_INDICES = ['/ 01', '/ 02', '/ 03'] as const;
const CHANNEL_LABELS = ['Instagram', 'Email', 'Phone'] as const;
const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 120;
const EMAIL_URL = 'mailto:contact@atxmusicvideofilmfestival.com';
const INSTAGRAM_URL = 'https://instagram.com/atxmvff';
const PHONE_URL = 'tel:+12814669387';

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info');
});

test.describe('contact section', () => {
    test('labels the section by its heading for assistive tech', async ({ page }) => {
        const section = page.locator('section#contact');

        await expect(section).toHaveAttribute('aria-labelledby', 'contact-title');
        await expect(page.locator('#contact-title')).toHaveText('Contact Us');
    });

    test('places the contact section after the guest info', async ({ page }) => {
        const contactAfterInfo = await page.evaluate(() => {
            const info = document.querySelector('.info');
            const contact = document.querySelector('#contact');

            if (!info || !contact) return false;

            return Boolean(info.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING);
        });

        expect(contactAfterInfo).toBe(true);
    });

    test('renders a channel for every direct line', async ({ page }) => {
        await expect(page.locator('.contact__channel')).toHaveCount(CHANNEL_LABELS.length);
        await expect(page.locator('.contact__channel-label')).toHaveText([...CHANNEL_LABELS]);
    });

    test('lists the direct channels with the correct targets', async ({ page }) => {
        await expect(page.locator(`.contact__channel-link[href="${INSTAGRAM_URL}"] .contact__channel-value`)).toContainText('@atxmvff');
        await expect(page.locator(`.contact__channel-link[href="${EMAIL_URL}"] .contact__channel-value`)).toContainText('contact@atxmusicvideofilmfestival.com');
        await expect(page.locator(`.contact__channel-link[href="${PHONE_URL}"] .contact__channel-value`)).toContainText('(281) 466-9387');
    });

    test('opens only the external channel in a new tab', async ({ page }) => {
        const instagram = page.locator(`.contact__channel-link[href="${INSTAGRAM_URL}"]`);

        await expect(instagram).toHaveAttribute('target', '_blank');
        await expect(instagram).toHaveAttribute('rel', /noopener/);
        await expect(page.locator(`.contact__channel-link[href="${EMAIL_URL}"]`)).not.toHaveAttribute('target', '_blank');
        await expect(page.locator(`.contact__channel-link[href="${PHONE_URL}"]`)).not.toHaveAttribute('target', '_blank');
    });

    test('hides the channel indices and external cue from assistive tech', async ({ page }) => {
        await expect(page.locator('.contact__channel-index')).toHaveText([...CHANNEL_INDICES]);
        await expect(page.locator('.contact__channel-index[aria-hidden="true"]')).toHaveCount(CHANNEL_LABELS.length);

        const cue = page.locator('.contact__channel-cue');

        await expect(cue).toHaveCount(1);
        await expect(cue).toHaveAttribute('aria-hidden', 'true');
    });
});

test.describe('contact section metadata', () => {
    test('exposes a meta description of the expected length', async ({ page }) => {
        const description = await page.locator('meta[name="description"]').getAttribute('content');

        expect(description).not.toBeNull();
        expect(String(description).length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(String(description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    });

    test('renders the channel labels in the display typeface', async ({ page }) => {
        const fontFamily = await page.locator('.contact__channel-label').first().evaluate(element => getComputedStyle(element).fontFamily);

        expect(fontFamily).toContain('Bebas Neue');
    });
});
