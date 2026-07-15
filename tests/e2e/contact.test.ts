import { expect, test } from '@playwright/test';

const CALENDLY_URL = 'https://calendly.com/madewellanna99/30min';
const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 120;
const EMAIL_URL = 'mailto:contact@atxmusicvideofilmfestival.com';
const INSTAGRAM_URL = 'https://instagram.com/atxmvff';
const PITCH_DECK_URL = '/austin_music_video_film_festival_pitch_deck.pdf';
const POSH_URL = 'https://posh.vip/e/austin-texas-music-video-film-festival';
const REQUIRED_FIELDS = ['name', 'email', 'message'] as const;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/contact');
});

test.describe('contact form', () => {
    test('wraps each required field in a label with a visible marker', async ({ page }) => {
        const form = page.locator('.contact__form');

        for (const field of REQUIRED_FIELDS) {
            const control = form.locator(`[name="${field}"]`);

            await expect(control).toHaveAttribute('required', '');

            const inLabel = await control.evaluate(element => element.closest('label') !== null);

            expect(inLabel, `${field} is wrapped in a label`).toBe(true);
        }

        await expect(form.locator('.label__required')).toHaveCount(REQUIRED_FIELDS.length);

        for (let index = 0; index < REQUIRED_FIELDS.length; index += 1) {
            await expect(form.locator('.label__required').nth(index)).toBeVisible();
        }
    });

    test('shows a disabled Coming Soon submit button', async ({ page }) => {
        const submit = page.locator('.contact__form button[type="submit"]');

        await expect(submit).toBeDisabled();
        await expect(submit).toHaveText('Coming Soon');
    });
});

test.describe('contact directory', () => {
    test('lists the direct channels with the correct targets', async ({ page }) => {
        await expect(page.locator(`.contact__line a[href="${EMAIL_URL}"]`)).toBeVisible();
        await expect(page.locator(`.contact__line a[href="${INSTAGRAM_URL}"]`)).toHaveAttribute('target', '_blank');
        await expect(page.locator(`.contact__line a[href="${POSH_URL}"]`)).toHaveAttribute('target', '_blank');
        await expect(page.locator(`.contact__line a[href="${CALENDLY_URL}"]`)).toHaveAttribute('target', '_blank');
        await expect(page.locator(`.contact__line a[href="${PITCH_DECK_URL}"]`)).toHaveAttribute('target', '_blank');
    });

    test('serves the linked pitch deck pdf', async ({ request }) => {
        const response = await request.get(PITCH_DECK_URL);

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toContain('application/pdf');
    });
});

test.describe('contact page metadata', () => {
    test('exposes a meta description of the expected length', async ({ page }) => {
        const description = await page.locator('meta[name="description"]').getAttribute('content');

        expect(description).not.toBeNull();
        expect(String(description).length).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(String(description).length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    });

    test('renders the subheads in the display typeface', async ({ page }) => {
        const fontFamily = await page.locator('.subhead').first().evaluate(element => getComputedStyle(element).fontFamily);

        expect(fontFamily).toContain('Bebas Neue');
    });
});
