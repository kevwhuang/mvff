import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';

const CONTACT_CHANNEL_COUNT = 4;
const HIDDEN_LEAD_OPACITIES = [0, 0, 0, 0, 0, 0] as const;
const HIDDEN_TRANSFORM = 'matrix(1, 0, 0, 1, 0, 60)';
const PARALLAX_SCROLL = 900;
const PARALLAX_TRANSFORMS = ['matrix(1, 0, 0, 1, 0, -135)', 'matrix(1, 0, 0, 1, 0, -315)', 'matrix(1, 0, 0, 1, 0, -585)'] as const;
const PARALLAX_WRAP_SCROLL = 3_000;
const PARALLAX_WRAP_TRANSFORMS = ['matrix(1, 0, 0, 1, 0, -450)', 'matrix(1, 0, 0, 1, 0, -170)', 'matrix(1, 0, 0, 1, 0, -910)'] as const;
const POLL = { timeout: 10_000 };
const POLL_TIGHT = { intervals: [100], timeout: 10_000 };
const REVEALED_LEAD_OPACITIES = [1, 1, 1, 1, 1, 1] as const;
const SETTLED_TRANSFORM = 'matrix(1, 0, 0, 1, 0, 0)';

function areAllRevealed(page: Page, selector: string) {
    return page.locator(selector).evaluateAll(
        elements => elements.every(element => getComputedStyle(element).opacity === '1'),
    );
}

function areInlineShown(page: Page) {
    return page.locator('[data-scroll]').evaluateAll(elements => elements.every(
        element => element instanceof HTMLElement && element.style.opacity === '1',
    ));
}

function areLayersUntransformed(page: Page) {
    return page.locator('.starfield__layer').evaluateAll(elements => elements.every(
        element => element instanceof HTMLElement && element.style.transform === '' && getComputedStyle(element).transform === 'none',
    ));
}

function areRevealed(page: Page) {
    return page.locator('[data-scroll], [data-scroll-stagger] > *').evaluateAll(
        elements => elements.every((element) => {
            const style = getComputedStyle(element);

            return style.opacity === '1' && style.transform === 'none';
        }),
    );
}

async function expectScrollContentShown(page: Page) {
    expect(await page.locator('[data-scroll]').count()).toBeGreaterThan(1);

    await expect.poll(() => areInlineShown(page), POLL).toBe(true);
    await expect.poll(() => areRevealed(page), POLL).toBe(true);
}

function getLeadFigureOpacities(page: Page) {
    return page.locator('.gallery__figure').evaluateAll(
        (elements, count) => elements.slice(0, count).map(element => Number.parseFloat(getComputedStyle(element).opacity)),
        HIDDEN_LEAD_OPACITIES.length,
    );
}

function getOpacity(locator: Locator) {
    return locator.evaluate(element => getComputedStyle(element).opacity);
}

function getTransform(locator: Locator) {
    return locator.evaluate(element => getComputedStyle(element).transform);
}

function getTransforms(locator: Locator) {
    return locator.evaluateAll(elements => elements.map(element => getComputedStyle(element).transform));
}

function scrollToCenter(locator: Locator) {
    return locator.evaluate((element) => {
        element.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
}

test.describe('scroll motion', () => {
    test('reveals the hero content on load without scrolling', async ({ page }) => {
        await page.goto('/');

        await expect.poll(() => getOpacity(page.locator('.hero__countdown')), POLL).toBe('1');
        await expect.poll(() => getOpacity(page.locator('.hero__title')), POLL).toBe('1');
        await expect.poll(() => getOpacity(page.locator('.hero__actions')), POLL).toBe('1');
        await expect.poll(() => getTransform(page.locator('.hero__title')), POLL).toBe(SETTLED_TRANSFORM);
    });

    test('keeps below-fold home sections hidden and offset until they are scrolled into view', async ({ page }) => {
        await page.goto('/');

        const detailsHeader = page.locator('.details .section-header');
        const partners = page.locator('.partners');

        await expect.poll(() => getTransform(detailsHeader), POLL).toBe(HIDDEN_TRANSFORM);
        await expect.poll(() => getTransform(partners), POLL).toBe(HIDDEN_TRANSFORM);

        expect(await getOpacity(detailsHeader)).toBe('0');
        expect(await getOpacity(partners)).toBe('0');

        await scrollToCenter(detailsHeader);

        await expect.poll(() => getOpacity(detailsHeader), POLL).toBe('1');
        await expect.poll(() => getTransform(detailsHeader), POLL).toBe(SETTLED_TRANSFORM);

        expect(await getOpacity(partners)).toBe('0');

        await scrollToCenter(partners);

        await expect.poll(() => getOpacity(partners), POLL).toBe('1');
        await expect.poll(() => getTransform(partners), POLL).toBe(SETTLED_TRANSFORM);
    });

    test('reveals the contact stagger parent and every channel once it is scrolled into view', async ({ page }) => {
        await page.goto('/info');

        const channelList = page.locator('.contact__channels');
        const channels = page.locator('.contact__channel');

        await expect(channels).toHaveCount(CONTACT_CHANNEL_COUNT);
        await expect.poll(() => getOpacity(channels.first()), POLL).toBe('0');

        expect(await getOpacity(channelList)).toBe('0');
        expect(await getTransform(channels.first())).toBe('none');

        await scrollToCenter(channelList);

        await expect.poll(() => getOpacity(channelList), POLL).toBe('1');
        await expect.poll(() => areAllRevealed(page, '.contact__channel'), POLL).toBe(true);
    });

    test('staggers the gallery figures so the first is opaque while the sixth is still fading in', async ({ page }) => {
        await page.goto('/photos');

        const grid = page.locator('.gallery__grid');

        await expect.poll(() => getLeadFigureOpacities(page), POLL).toEqual(HIDDEN_LEAD_OPACITIES);

        await scrollToCenter(grid);

        await expect.poll(async () => {
            const opacities = await getLeadFigureOpacities(page);

            return opacities[0] === 1 && opacities[opacities.length - 1] < 1;
        }, POLL_TIGHT).toBe(true);

        await expect.poll(() => getLeadFigureOpacities(page), POLL).toEqual(REVEALED_LEAD_OPACITIES);
        await expect.poll(() => getOpacity(grid), POLL).toBe('1');
    });

    test('hides the below-fold sections and staggers the gallery figures in on scroll after client router navigation to photos and back home', async ({ page }) => {
        await page.goto('/');

        await expect.poll(() => getOpacity(page.locator('.hero__title')), POLL).toBe('1');

        await page.locator('.navbar__menu-link[href="/photos"]').click();
        await expect(page).toHaveURL('/photos');

        const galleryHeader = page.locator('.gallery .section-header');
        const grid = page.locator('.gallery__grid');

        await expect.poll(() => getOpacity(page.locator('.team .section-header')), POLL).toBe('1');
        await expect.poll(() => getTransform(galleryHeader), POLL).toBe(HIDDEN_TRANSFORM);
        await expect.poll(() => getLeadFigureOpacities(page), POLL).toEqual(HIDDEN_LEAD_OPACITIES);

        expect(await getOpacity(galleryHeader)).toBe('0');

        await scrollToCenter(grid);

        await expect.poll(async () => {
            const opacities = await getLeadFigureOpacities(page);

            return opacities[0] === 1 && opacities[opacities.length - 1] < 1;
        }, POLL_TIGHT).toBe(true);

        await expect.poll(() => getLeadFigureOpacities(page), POLL).toEqual(REVEALED_LEAD_OPACITIES);
        await expect.poll(() => getOpacity(galleryHeader), POLL).toBe('1');

        await page.locator('.navbar__menu-link[href="/"]').click();
        await expect(page).toHaveURL('/');

        const detailsHeader = page.locator('.details .section-header');

        await expect.poll(() => getOpacity(page.locator('.hero__title')), POLL).toBe('1');
        await expect.poll(() => getTransform(detailsHeader), POLL).toBe(HIDDEN_TRANSFORM);

        expect(await getOpacity(detailsHeader)).toBe('0');
    });

    test('types both tagline words and reveals the arrow once the tagline is scrolled into view', async ({ page }) => {
        await page.goto('/');

        const arrow = page.locator('.tagline__arrow');
        const screenWord = page.locator('.tagline__screen');
        const stageWord = page.locator('.tagline__stage');
        const title = page.locator('[data-typewriter]');

        await expect.poll(() => screenWord.textContent(), POLL).toBe('');

        expect(await getOpacity(arrow)).toBe('0');

        await scrollToCenter(title);

        await expect(title).toHaveAttribute('data-arrow-visible', '', POLL);
        await expect(title).toHaveAttribute('data-typed', '', POLL);
        await expect(screenWord).toHaveText('Screen');
        await expect(stageWord).toHaveText('Stage');
        await expect.poll(() => getOpacity(arrow), POLL).toBe('1');
    });

    test('offsets the starfield layers from zero by their parallax factors after scrolling', async ({ page }) => {
        await page.goto('/');

        const layers = page.locator('.starfield__layer');

        await expect(layers).toHaveCount(PARALLAX_TRANSFORMS.length);
        await expect.poll(() => getTransform(layers.first()), POLL).toBe(SETTLED_TRANSFORM);

        await page.evaluate(offset => window.scrollTo(0, offset), PARALLAX_SCROLL);

        await expect.poll(() => getTransforms(layers), POLL).toEqual(PARALLAX_TRANSFORMS);
    });

    test('wraps each starfield layer offset by its parallax wrap period at a deep scroll position', async ({ page }) => {
        await page.goto('/');

        const layers = page.locator('.starfield__layer');

        await expect(layers).toHaveCount(PARALLAX_WRAP_TRANSFORMS.length);

        await page.evaluate(offset => window.scrollTo(0, offset), PARALLAX_WRAP_SCROLL);

        await expect.poll(() => getTransforms(layers), POLL).toEqual(PARALLAX_WRAP_TRANSFORMS);
    });

    test('clears the starfield layer transforms when reduced motion turns on after scrolling', async ({ page }) => {
        await page.goto('/');

        const layers = page.locator('.starfield__layer');

        await page.evaluate(offset => window.scrollTo(0, offset), PARALLAX_SCROLL);

        await expect.poll(() => getTransforms(layers), POLL).toEqual(PARALLAX_TRANSFORMS);

        await page.emulateMedia({ reducedMotion: 'reduce' });

        await expect.poll(() => areLayersUntransformed(page), POLL).toBe(true);
    });

    test('restores both tagline words and shows the arrow when reduced motion turns on mid typing', async ({ page }) => {
        await page.goto('/');

        const arrow = page.locator('.tagline__arrow');
        const screenWord = page.locator('.tagline__screen');
        const stageWord = page.locator('.tagline__stage');
        const title = page.locator('[data-typewriter]');

        await expect.poll(() => screenWord.textContent(), POLL).toBe('');

        await scrollToCenter(title);

        await expect(screenWord).toHaveAttribute('data-typing', '', POLL);

        await page.emulateMedia({ reducedMotion: 'reduce' });

        await expect(screenWord).toHaveText('Screen');
        await expect(stageWord).toHaveText('Stage');
        await expect(title).toHaveAttribute('data-arrow-visible', '');
        await expect(title).toHaveAttribute('data-typed', '');
        await expect(page.locator('[data-typewriter-word][data-typing]')).toHaveCount(0);
        await expect.poll(() => getOpacity(arrow), POLL).toBe('1');
    });

    test('reveals a hidden scroll container and its children when a descendant receives focus', async ({ page }) => {
        await page.goto('/info');

        const channelList = page.locator('.contact__channels');

        await expect.poll(() => getOpacity(channelList), POLL).toBe('0');

        await page.locator('.contact__channel-link').first().evaluate((element) => {
            element.focus();
        });

        await expect.poll(() => getOpacity(channelList), POLL).toBe('1');
        await expect.poll(() => areAllRevealed(page, '.contact__channel'), POLL).toBe(true);
    });
});

test.describe('scroll motion under reduced motion', () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
    });

    test('shows every home page data-scroll element immediately', async ({ page }) => {
        await page.goto('/');

        await expectScrollContentShown(page);
    });

    test('shows every info page data-scroll element immediately', async ({ page }) => {
        await page.goto('/info');

        await expectScrollContentShown(page);
    });

    test('shows every photos page data-scroll element immediately', async ({ page }) => {
        await page.goto('/photos');

        await expectScrollContentShown(page);
    });

    test('skips the typewriter and shows both untyped tagline words with the arrow immediately', async ({ page }) => {
        await page.goto('/');

        const title = page.locator('[data-typewriter]');

        await expect(title).toHaveAttribute('data-arrow-visible', '', POLL);
        await expect(title).toHaveAttribute('data-typed', '', POLL);
        await expect(page.locator('.tagline__screen')).toHaveText('Screen');
        await expect(page.locator('.tagline__stage')).toHaveText('Stage');
        await expect(page.locator('[data-typewriter-word][data-typing]')).toHaveCount(0);
        await expect.poll(() => getOpacity(page.locator('.tagline__arrow')), POLL).toBe('1');
    });

    test('leaves the starfield layers without a parallax transform after scrolling', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('.starfield__layer')).toHaveCount(PARALLAX_TRANSFORMS.length);
        await expect.poll(() => areAllRevealed(page, '[data-scroll]'), POLL).toBe(true);

        await page.evaluate(offset => window.scrollTo(0, offset), PARALLAX_SCROLL);

        await expect.poll(() => areLayersUntransformed(page), POLL).toBe(true);
    });
});
