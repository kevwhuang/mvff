import { expect, test } from '@playwright/test';

const CORAL = 'rgb(255, 115, 94)';

const TEAM = [
    { name: 'Anna', portrait: true, role: 'Executive Festival Director' },
    { name: 'Ashleigh', portrait: false, role: 'Marketing Director' },
    { name: 'Jyme', portrait: true, role: 'Film Programming Director' },
    { name: 'Dan', portrait: false, role: 'Operations Director' },
    { name: 'Amiiri', portrait: true, role: 'Partnerships Director' },
    { name: 'Rocky', portrait: true, role: 'Sponsorship Admin Lead' },
    { name: 'Greta', portrait: false, role: 'Content Strategist' },
    { name: 'Marissa', portrait: true, role: 'Graphics Director' },
    { name: 'Jasmine', portrait: true, role: 'Event Coordinator' },
] as const;

const PORTRAITS = TEAM.filter(member => member.portrait).length;
const MONOGRAMS = TEAM.length - PORTRAITS;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/team');
});

test.describe('team roster', () => {
    test('renders the section heading', async ({ page }) => {
        await expect(page.locator('#roster-title')).toHaveText('2026 Team');
    });

    test('renders one card per team member with a portrait or monogram', async ({ page }) => {
        await expect(page.locator('.roster__card')).toHaveCount(TEAM.length);
        await expect(page.locator('.roster__image')).toHaveCount(PORTRAITS);
        await expect(page.locator('.roster__monogram')).toHaveCount(MONOGRAMS);
    });

    test('shows each member name, role, and portrait or monogram', async ({ page }) => {
        for (const [index, member] of TEAM.entries()) {
            const card = page.locator('.roster__card').nth(index);

            await expect(card.locator('.roster__name')).toHaveText(member.name);
            await expect(card.locator('.roster__role')).toHaveText(member.role);

            if (member.portrait) {
                await expect(card.locator('.roster__image')).toHaveAttribute('alt', `${member.name}, ${member.role}`);
            } else {
                await expect(card.locator('.roster__image')).toHaveCount(0);
                await expect(card.locator('.roster__monogram')).toHaveText(member.name.charAt(0));
            }
        }
    });

    test('numbers each card with a padded index badge', async ({ page }) => {
        const badges = page.locator('.roster__index');

        await expect(badges).toHaveCount(TEAM.length);
        await expect(badges.first()).toHaveText('01');
        await expect(badges.last()).toHaveText('09');
    });

    test('reveals the coral accent when a card is hovered', async ({ page }) => {
        const card = page.locator('.roster__card').first();

        await expect(card.locator('.roster__role')).not.toHaveCSS('color', CORAL);
        await card.hover();
        await expect(card.locator('.roster__role')).toHaveCSS('color', CORAL);
    });
});
