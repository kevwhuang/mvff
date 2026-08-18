import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

const CLOSED_SNAPSHOT = { ariaHidden: 'true', inertSiblings: 0, isOpen: false } as const;
const LOADER_SHOWN_KEY = 'mvff_loader_shown';
const MIN_DISPLAY_DURATION = 1_000;
const OPEN_SNAPSHOT = { ariaHidden: null, inertSiblings: 3, isOpen: true } as const;
const POLL_TIGHT = { intervals: [100], timeout: 10_000 };

function getLoaderSnapshot(page: Page) {
    return page.evaluate(() => {
        const loader = document.querySelector('.loader');
        const siblings = document.querySelectorAll('body > footer, body > header, body > main');

        return {
            ariaHidden: loader?.getAttribute('aria-hidden') ?? null,
            inertSiblings: [...siblings].filter(sibling => sibling.hasAttribute('inert')).length,
            isOpen: loader?.hasAttribute('data-open') ?? false,
        };
    });
}

function waitForLoaderClose(page: Page) {
    return page.evaluate(() => new Promise<number>((resolve) => {
        const loader = document.querySelector('.loader');

        if (!loader?.hasAttribute('data-open')) {
            resolve(Number.NEGATIVE_INFINITY);

            return;
        }

        const observer = new MutationObserver(() => {
            if (loader.hasAttribute('data-open')) return;

            observer.disconnect();
            resolve(performance.now());
        });

        observer.observe(loader, { attributeFilter: ['data-open'], attributes: true });
    }));
}

test.describe('loader', () => {
    test('opens the loader and makes the header, main, and footer inert on a first visit', async ({ page }) => {
        await page.goto('/', { waitUntil: 'commit' });

        await expect.poll(() => getLoaderSnapshot(page), POLL_TIGHT).toEqual(OPEN_SNAPSHOT);
    });

    test('holds the loader open for the minimum display duration and then hides it and lifts inert', async ({ page }) => {
        await page.goto('/', { waitUntil: 'commit' });

        await expect(page.locator('.loader')).toHaveAttribute('data-open', '');

        const closedAt = await waitForLoaderClose(page);

        expect(closedAt).toBeGreaterThanOrEqual(MIN_DISPLAY_DURATION);

        expect(await getLoaderSnapshot(page)).toEqual(CLOSED_SNAPSHOT);
    });

    test('stores the loader session key and leaves the loader closed on reload', async ({ page }) => {
        await page.goto('/');

        await expect.poll(() => page.evaluate(key => sessionStorage.getItem(key), LOADER_SHOWN_KEY), POLL_TIGHT).toBe('1');

        await page.reload();

        expect(await getLoaderSnapshot(page)).toEqual(CLOSED_SNAPSHOT);
        expect(await page.evaluate(key => sessionStorage.getItem(key), LOADER_SHOWN_KEY)).toBe('1');
    });

    test('leaves the loader closed after a client router navigation back to the home page', async ({ page }) => {
        await page.goto('/');

        await expect.poll(() => getLoaderSnapshot(page), POLL_TIGHT).toEqual(CLOSED_SNAPSHOT);

        await page.locator('.navbar__menu-link[href="/info"]').click();

        await expect(page).toHaveURL('/info');
        await expect(page.locator('.loader')).toHaveCount(0);

        await page.locator('.navbar__menu-link[href="/"]').click();

        await expect(page).toHaveURL('/');
        await expect(page.locator('.loader')).toHaveCount(1);

        expect(await getLoaderSnapshot(page)).toEqual(CLOSED_SNAPSHOT);
    });
});

test.describe('loader under reduced motion', () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('never opens the loader and leaves the page siblings interactive', async ({ page }) => {
        await page.goto('/');

        expect(await getLoaderSnapshot(page)).toEqual(CLOSED_SNAPSHOT);

        await expect(page.locator('.loader')).toBeHidden();
    });
});
