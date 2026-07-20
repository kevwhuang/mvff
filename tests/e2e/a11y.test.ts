import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const FOCUS_TARGETS = [
    { name: 'home nav link', selector: '.navbar__menu-link[href="/"]' },
    { name: 'info nav link', selector: '.navbar__menu-link[href="/info"]' },
    { name: 'team nav link', selector: '.navbar__menu-link[href="/team"]' },
] as const;

const MAX_TAB_PRESSES = 12;
const PUBLIC_PATHS = ['/', '/info', '/team', '/this-page-does-not-exist', '/500'] as const;
const TITLE_PATTERN = /^.+ — Austin Music Video Film Festival$/;

function readOutline(selector: string, page: Page) {
    return page.locator(selector).evaluate((element) => {
        const style = getComputedStyle(element);

        return `${style.outlineStyle}|${style.outlineWidth}|${style.outlineColor}`;
    });
}

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('document structure', () => {
    for (const path of PUBLIC_PATHS) {
        test(`${path} exposes sound landmarks, headings, and labels`, async ({ page }) => {
            await page.goto(path);

            const structure = await page.evaluate(() => ({
                footerParent: document.querySelector('footer')?.parentElement?.tagName,
                h1Count: document.querySelectorAll('h1').length,
                headerParent: document.querySelector('header')?.parentElement?.tagName,
                headingLevels: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(heading => Number(heading.tagName.slice(1))),
                mainCount: document.querySelectorAll('main, [role="main"]').length,
                missingAltCount: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length,
                nestedLandmarkCount: document.querySelectorAll('main main, main [role="banner"], main [role="contentinfo"], main [role="main"]').length,
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
    test('tab from body reaches the nav links with a visible focus outline', async ({ page }) => {
        await page.goto('/');

        const baseline: Record<string, string> = {};
        const remaining = new Map(FOCUS_TARGETS.map(target => [target.selector, target.name]));

        for (const target of FOCUS_TARGETS) {
            baseline[target.selector] = await readOutline(target.selector, page);
        }

        for (let press = 0; press < MAX_TAB_PRESSES && remaining.size > 0; press += 1) {
            await page.keyboard.press('Tab');

            for (const selector of [...remaining.keys()]) {
                const isFocused = await page.locator(selector).evaluate(element => element === document.activeElement);

                if (!isFocused) continue;

                const focusedOutline = await readOutline(selector, page);

                expect(focusedOutline, `focus indicator on ${remaining.get(selector)}`).toContain('solid');
                expect(focusedOutline, `focus indicator on ${remaining.get(selector)}`).not.toBe(baseline[selector]);
                remaining.delete(selector);
            }
        }

        expect([...remaining.values()]).toEqual([]);
    });
});

test.describe('page titles', () => {
    test('titles are unique and follow the festival suffix pattern', async ({ page }) => {
        const titles: string[] = [];

        for (const path of PUBLIC_PATHS) {
            await page.goto(path);
            titles.push(await page.title());
        }

        expect(new Set(titles).size).toBe(titles.length);
        expect(titles[0]).toBe('Austin Music Video Film Festival');

        for (const title of titles.slice(1)) expect(title).toMatch(TITLE_PATTERN);
    });
});
