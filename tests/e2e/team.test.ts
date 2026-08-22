import { expect, test } from '@playwright/test';

const TEAM_NAMES = ['Anna', 'Jasmine', 'Amiri', 'Ashleigh', 'Dan', 'Greta', 'Jyme', 'Marissa', 'May', 'Rocky'] as const;

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('team page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/team');
    });

    test('loads with the team title and the meet the team heading', async ({ page }) => {
        await expect(page).toHaveTitle('Team \u2014 Austin Music Video Film Festival');
        await expect(page.locator('#team-title')).toHaveText('Meet the Team');
    });

    test('shows every team member name in the grid', async ({ page }) => {
        await expect(page.locator('.team__card')).toHaveCount(TEAM_NAMES.length);
        await expect(page.locator('.team__name')).toHaveText(TEAM_NAMES);
    });

    test('renders a portrait for every member except the single monogram card', async ({ page }) => {
        await expect(page.locator('.team__image')).toHaveCount(TEAM_NAMES.length - 1);
        await expect(page.locator('.team__monogram')).toHaveCount(1);
        await expect(page.locator('.team__monogram')).toHaveText('M');
    });
});
