import { expect, test, type Page } from '@playwright/test';

const CALENDLY_URL = 'https://calendly.com/madewellanna99/30min';
const DESCRIPTION_MAX = 160;
const DESCRIPTION_MIN = 120;
const EMAIL_URL = 'mailto:contact@atxmusicvideofilmfestival.com';
const FORMS_ENDPOINT = '**/forms/';
const INSTAGRAM_URL = 'https://instagram.com/atxmvff';
const PITCH_DECK_URL = '/austin_music_video_film_festival_pitch_deck.pdf';
const POSH_URL = 'https://posh.vip/e/austin-texas-music-video-film-festival';
const REQUIRED_FIELDS = ['name', 'email', 'message'] as const;

async function fillContactForm(page: Page) {
    await page.fill('.contact__form input[name="name"]', 'Test User');
    await page.fill('.contact__form input[name="email"]', 'test@example.com');
    await page.fill('.contact__form textarea[name="message"]', 'Hello from the test suite.');
}

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

    test('wires the form for netlify forms', async ({ page }) => {
        const form = page.locator('.contact__form');

        await expect(form).toHaveAttribute('data-netlify', 'true');
        await expect(form).toHaveAttribute('data-netlify-honeypot', 'bot-field');
        await expect(form).toHaveAttribute('method', 'POST');
        await expect(form).toHaveAttribute('name', 'contact');
        await expect(form.locator('input[name="form-name"]')).toHaveAttribute('value', 'contact');
        await expect(form.locator('input[name="bot-field"]')).toHaveCount(1);
    });

    test('enables the Send Message submit button', async ({ page }) => {
        const submit = page.locator('.contact__form button[type="submit"]');

        await expect(submit).toBeEnabled();
        await expect(submit).toHaveText('Send Message');
    });

    test('confirms a success banner and resets after a submission', async ({ page }) => {
        await page.route(FORMS_ENDPOINT, route => route.fulfill({ body: '', status: 200 }));
        await fillContactForm(page);
        await page.click('.contact__form button[type="submit"]');

        const banner = page.locator('.contact__banner');

        await expect(banner).toHaveAttribute('data-visible', '');
        await expect(banner).toContainText('Message sent');
        await expect(page.locator('.contact__form input[name="name"]')).toHaveValue('');
        await expect(page.locator('.contact__form button[type="submit"]')).toBeEnabled();
    });

    test('surfaces an error banner when the submission fails', async ({ page }) => {
        await page.route(FORMS_ENDPOINT, route => route.fulfill({ body: '', status: 500 }));
        await fillContactForm(page);
        await page.click('.contact__form button[type="submit"]');

        const banner = page.locator('.contact__banner');

        await expect(banner).toHaveAttribute('data-variant', 'error');
        await expect(banner).toContainText('Something went wrong');
        await expect(page.locator('.contact__form button[type="submit"]')).toBeEnabled();
    });
});

test.describe('contact directory', () => {
    test('renders the directory ahead of the form', async ({ page }) => {
        const directoryBeforeForm = await page.evaluate(() => {
            const directory = document.querySelector('.contact__directory');
            const form = document.querySelector('.contact__form');

            if (!directory || !form) return false;

            return Boolean(directory.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING);
        });

        expect(directoryBeforeForm).toBe(true);
    });

    test('elevates the directory into two contact cards', async ({ page }) => {
        await expect(page.locator('.contact__card')).toHaveCount(2);
        await expect(page.locator('.contact__card .subhead', { hasText: 'Direct Channels' })).toBeVisible();
        await expect(page.locator('.contact__card .subhead', { hasText: 'Founder' })).toBeVisible();
    });

    test('lists the direct channels with the correct targets', async ({ page }) => {
        await expect(page.locator(`.contact__line a[href="${EMAIL_URL}"]`)).toBeVisible();
        await expect(page.locator('.contact__line a[href="tel:+12814669387"]')).toHaveText('(281) 466-9387');
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
