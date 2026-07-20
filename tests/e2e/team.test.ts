import { expect, test } from '@playwright/test';

const CORAL = 'rgb(255, 115, 94)';

const TEAM = [
    { name: 'Anna', portrait: true, role: 'Founder & Executive Producer' },
    { name: 'Ashleigh', portrait: false, role: 'Social Media Marketing Director' },
    { name: 'Jyme', portrait: true, role: 'Film Programming Director' },
    { name: 'Dan', portrait: true, role: 'Operations & Production Manager' },
    { name: 'Amiiri', portrait: true, role: 'PR & Outreach Director' },
    { name: 'Rocky', portrait: true, role: 'Sponsorship Administrator' },
    { name: 'Greta', portrait: true, role: 'Content Strategist' },
    { name: 'Marissa', portrait: false, role: 'Graphics Manager' },
    { name: 'Jasmine', portrait: false, role: 'Executive Coordinator' },
    { name: 'May', portrait: true, role: 'Dance Director & Fashion Designer' },
] as const;

const PORTRAITS = TEAM.filter(member => member.portrait).length;
const MONOGRAMS = TEAM.length - PORTRAITS;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/team');
});

test.describe('team roster', () => {
    test('renders the section heading', async ({ page }) => {
        await expect(page.locator('#team-title')).toHaveText('Meet the Team');
    });

    test('renders one card per team member with a portrait or monogram', async ({ page }) => {
        await expect(page.locator('.team__card')).toHaveCount(TEAM.length);
        await expect(page.locator('.team__image')).toHaveCount(PORTRAITS);
        await expect(page.locator('.team__monogram')).toHaveCount(MONOGRAMS);
    });

    test('shows each member name, role, and portrait or monogram', async ({ page }) => {
        for (const [index, member] of TEAM.entries()) {
            const card = page.locator('.team__card').nth(index);

            await expect(card.locator('.team__name')).toHaveText(member.name);
            await expect(card.locator('.team__role')).toHaveText(member.role);

            if (member.portrait) {
                await expect(card.locator('.team__image')).toHaveAttribute('alt', '');
            } else {
                const monogram = card.locator('.team__monogram');

                await expect(card.locator('.team__image')).toHaveCount(0);
                await expect(monogram).toHaveText(member.name.charAt(0));
                await expect(monogram).toHaveAttribute('aria-hidden', 'true');
            }
        }
    });

    test('keeps the roster visible under reduced motion', async ({ page }) => {
        await expect(page.locator('.team__grid')).toHaveCSS('opacity', '1');
    });

    test('reveals the coral accent when a card is hovered', async ({ page }) => {
        const card = page.locator('.team__card').first();

        await expect(card.locator('.team__role')).not.toHaveCSS('color', CORAL);
        await card.hover();
        await expect(card.locator('.team__role')).toHaveCSS('color', CORAL);
    });
});
