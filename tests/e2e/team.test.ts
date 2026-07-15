import { expect, test } from '@playwright/test';

const TEAM = [
    { name: 'Anna', role: 'Founder & Director' },
    { name: 'Rocky', role: 'Film Director' },
    { name: 'Jasmine', role: 'Event Coordinator' },
    { name: 'Jymes', role: 'Talent Programmer' },
    { name: 'Amiiri', role: 'Promotions Queen' },
    { name: 'Donovan', role: 'Social Media Manager' },
    { name: 'Marissa', role: 'Graphic Designer' },
    { name: 'Sebastian', role: 'Community Outreach' },
    { name: 'Phillip', role: 'Volunteer Coordinator' },
    { name: 'Killian', role: 'Visual Tech' },
    { name: 'Ben', role: 'Audio Tech' },
] as const;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/team');
});

test.describe('team roster', () => {
    test('renders the section heading', async ({ page }) => {
        await expect(page.locator('#roster-title')).toHaveText('2026 Team');
    });

    test('renders one card per team member with an image', async ({ page }) => {
        await expect(page.locator('.roster__card')).toHaveCount(TEAM.length);
        await expect(page.locator('.roster__image')).toHaveCount(TEAM.length);
    });

    test('shows each member name, role, and image alt', async ({ page }) => {
        for (const [index, member] of TEAM.entries()) {
            const card = page.locator('.roster__card').nth(index);

            await expect(card.locator('.roster__name')).toHaveText(member.name);
            await expect(card.locator('.roster__role')).toHaveText(member.role);
            await expect(card.locator('.roster__image')).toHaveAttribute('alt', member.name);
        }
    });
});
