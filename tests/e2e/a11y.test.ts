import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const DISABLED_LABELS = ['FilmFreeway', 'Store'] as const;
const FOCUS_OUTLINE = 'solid 2px rgb(255, 115, 94)';

const FOCUS_TARGETS = [
    { name: 'brand link', selector: '.navbar__brand' },
    { name: 'home nav link', selector: '.navbar__menu-link[href="/"]' },
    { name: 'info nav link', selector: '.navbar__menu-link[href="/info"]' },
    { name: 'photos nav link', selector: '.navbar__menu-link[href="/photos"]' },
] as const;

const HOME_TITLE = 'Austin Music Video Film Festival';
const MAX_TAB_PRESSES = 12;
const PUBLIC_PATHS = ['/', '/info', '/photos', '/500', '/nonexistent-404'] as const;
const TAB_SWEEP_PRESSES = 40;
const TITLE_PATTERN = /^.+ \u2014 Austin Music Video Film Festival$/;

function getOutline(page: Page, selector: string) {
    return page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);

        return `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`;
    });
}

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('document structure', () => {
    for (const path of PUBLIC_PATHS) {
        test(`${path} exposes one main, body-level landmarks, one h1, unskipped heading levels, image alt text, and resolvable label ids`, async ({ page }) => {
            await page.goto(path);

            const structure = await page.evaluate(() => ({
                footerParent: document.querySelector('footer')?.parentElement?.tagName,
                h1Count: document.querySelectorAll('h1').length,
                headerParent: document.querySelector('header')?.parentElement?.tagName,
                headingLevels: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(heading => Number(heading.tagName.slice(1))),
                mainCount: document.querySelectorAll('main, [role="main"]').length,
                missingAltCount: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length,
                nestedLandmarkCount: [...document.querySelectorAll('main footer, main header')].filter(element => !element.closest('article, aside, nav, section')).length,
                unresolvedLabelIds: [...document.querySelectorAll('[aria-labelledby]')]
                    .flatMap(element => (element.getAttribute('aria-labelledby') || '').split(/\s+/))
                    .filter(id => id && !document.getElementById(id)),
            }));

            const skippedLevels = structure.headingLevels.filter((level, index) => level > (structure.headingLevels[index - 1] ?? 0) + 1);

            expect(structure.mainCount).toBe(1);
            expect(structure.headerParent).toBe('BODY');
            expect(structure.footerParent).toBe('BODY');
            expect(structure.nestedLandmarkCount).toBe(0);
            expect(structure.h1Count).toBe(1);
            expect(skippedLevels).toEqual([]);
            expect(structure.missingAltCount).toBe(0);
            expect(structure.unresolvedLabelIds).toEqual([]);
        });
    }
});

test.describe('keyboard navigation', () => {
    test('tab from body reaches the brand link and every enabled nav link with a solid coral outline absent when unfocused', async ({ page }) => {
        await page.goto('/');

        const baseline: Record<string, string> = {};
        const remaining = new Map(FOCUS_TARGETS.map(target => [target.selector, target.name]));

        for (const target of FOCUS_TARGETS) {
            baseline[target.selector] = await getOutline(page, target.selector);

            expect(baseline[target.selector], `resting outline on ${target.name}`).toMatch(/^none /);
        }

        for (let press = 0; press < MAX_TAB_PRESSES && remaining.size > 0; press += 1) {
            await page.keyboard.press('Tab');

            for (const selector of [...remaining.keys()]) {
                const isFocused = await page.locator(selector).evaluate(element => element === document.activeElement);

                if (!isFocused) continue;

                const focusedOutline = await getOutline(page, selector);

                expect(focusedOutline, `focus indicator on ${remaining.get(selector)}`).toBe(FOCUS_OUTLINE);
                expect(focusedOutline, `focus indicator on ${remaining.get(selector)}`).not.toBe(baseline[selector]);
                remaining.delete(selector);
            }
        }

        expect([...remaining.values()]).toEqual([]);
    });

    test('the store and filmfreeway links carry tabindex -1 and never take focus while tabbing', async ({ page }) => {
        await page.goto('/');

        const disabledCount = await page.locator('a[aria-disabled="true"]').count();

        const disabledLabels = await page
            .locator('a[aria-disabled="true"][tabindex="-1"]')
            .evaluateAll(elements => [...new Set(elements.map(element => element.textContent?.trim() ?? ''))].sort());

        const guardedCount = await page.locator('a[aria-disabled="true"][tabindex="-1"]').count();

        expect(disabledLabels).toEqual([...DISABLED_LABELS]);
        expect(guardedCount).toBe(disabledCount);

        const focusedDisabledLabels: string[] = [];

        for (let press = 0; press < TAB_SWEEP_PRESSES; press += 1) {
            await page.keyboard.press('Tab');

            const label = await page.evaluate(() => {
                const active = document.activeElement;

                if (!active || active.getAttribute('aria-disabled') !== 'true') return null;

                return active.textContent?.trim() ?? '';
            });

            if (label !== null) focusedDisabledLabels.push(label);
        }

        expect(focusedDisabledLabels).toEqual([]);
    });
});

test.describe('page titles', () => {
    test('titles are unique, bare on home, and suffixed with an em dash elsewhere', async ({ page }) => {
        const titles: string[] = [];

        for (const path of PUBLIC_PATHS) {
            await page.goto(path);
            titles.push(await page.title());
        }

        expect(new Set(titles).size).toBe(titles.length);
        expect(titles[0]).toBe(HOME_TITLE);

        for (const title of titles.slice(1)) expect(title).toMatch(TITLE_PATTERN);
    });
});
