import { afterEach, describe, expect, test, vi } from 'vitest';

interface LayerStub {
    dataset: { parallax?: string; parallaxWrap?: string };
    style: { transform: string };
}

const PARALLAX_SELECTOR = '[data-parallax]';

function buildLayer(parallax?: string, parallaxWrap?: string): LayerStub {
    return { dataset: { parallax, parallaxWrap }, style: { transform: '' } };
}

async function loadParallax(layers: LayerStub[], scrollY: number) {
    vi.resetModules();

    const addEventListener = vi.fn<(type: string, handler: () => void, options: AddEventListenerOptions) => void>();
    const querySelectorAll = vi.fn(() => layers);
    const requestAnimationFrame = vi.fn<(callback: () => void) => number>();

    const windowStub = { addEventListener, scrollY };

    vi.stubGlobal('document', { querySelectorAll });
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.stubGlobal('window', windowStub);

    const { initParallax } = await import('../../src/lib/parallax');

    const [[, scroll]] = addEventListener.mock.calls;

    return { addEventListener, initParallax, querySelectorAll, requestAnimationFrame, scroll, windowStub };
}

afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
});

describe('module scope', () => {
    test('registers a passive scroll listener on the window', async () => {
        const { addEventListener } = await loadParallax([], 0);

        expect(addEventListener).toHaveBeenCalledExactlyOnceWith('scroll', expect.any(Function), { passive: true });
    });
});

describe('initParallax', () => {
    test('collects [data-parallax] elements and applies a transform from the current scroll position', async () => {
        const layers = [buildLayer('0.5'), buildLayer('0.25')];

        const { initParallax, querySelectorAll } = await loadParallax(layers, 200);

        initParallax(false);

        expect(querySelectorAll).toHaveBeenCalledExactlyOnceWith(PARALLAX_SELECTOR);
        expect(layers[0].style.transform).toBe('translateY(100px)');
        expect(layers[1].style.transform).toBe('translateY(50px)');
    });

    test('treats a missing data-parallax value as a zero factor', async () => {
        const layer = buildLayer();

        const { initParallax } = await loadParallax([layer], 640);

        initParallax(false);

        expect(layer.style.transform).toBe('translateY(0px)');
    });

    test('wraps the offset with a modulo when data-parallax-wrap is positive', async () => {
        const layer = buildLayer('1', '120');

        const { initParallax } = await loadParallax([layer], 500);

        initParallax(false);

        expect(layer.style.transform).toBe('translateY(20px)');
    });

    test('keeps the wrapped offset negative for an upward-drifting layer', async () => {
        const layer = buildLayer('-0.5', '120');

        const { initParallax } = await loadParallax([layer], 500);

        initParallax(false);

        expect(layer.style.transform).toBe('translateY(-10px)');
    });

    test('clears the transform of every registered layer when reduced motion is preferred', async () => {
        const layer = buildLayer('0.5');

        const { initParallax } = await loadParallax([layer], 200);

        initParallax(false);

        expect(layer.style.transform).toBe('translateY(100px)');

        initParallax(true);

        expect(layer.style.transform).toBe('');
    });

    test('empties the registry when reduced motion is preferred, without querying the document', async () => {
        const layer = buildLayer('0.5');

        const { initParallax, querySelectorAll, requestAnimationFrame, scroll } = await loadParallax([layer], 200);

        initParallax(false);
        initParallax(true);
        scroll();

        expect(querySelectorAll).toHaveBeenCalledTimes(1);
        expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
});

describe('scroll handler', () => {
    test('queues no animation frame while no layers are registered', async () => {
        const { requestAnimationFrame, scroll } = await loadParallax([], 0);

        scroll();

        expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    test('queues a single animation frame for a burst of scroll events', async () => {
        const { initParallax, requestAnimationFrame, scroll } = await loadParallax([buildLayer('0.5')], 100);

        initParallax(false);
        scroll();
        scroll();
        scroll();

        expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    });

    test('reapplies transforms from the latest scroll position when the queued frame runs', async () => {
        const layer = buildLayer('0.5');

        const { initParallax, requestAnimationFrame, scroll, windowStub } = await loadParallax([layer], 100);

        initParallax(false);
        windowStub.scrollY = 400;
        scroll();

        const [[update]] = requestAnimationFrame.mock.calls;

        update();

        expect(layer.style.transform).toBe('translateY(200px)');
    });

    test('queues another animation frame once the previous one has run', async () => {
        const { initParallax, requestAnimationFrame, scroll } = await loadParallax([buildLayer('0.5')], 100);

        initParallax(false);
        scroll();

        const [[update]] = requestAnimationFrame.mock.calls;

        update();
        scroll();

        expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    });
});
