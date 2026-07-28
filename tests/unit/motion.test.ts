import { afterEach, describe, expect, test, vi } from 'vitest';

import type { Mock } from 'vitest';

interface BatchConfig {
    onEnter: (batch: unknown[]) => void;
    once: boolean;
    start: string;
}

interface Killable {
    kill: Mock;
    trigger?: ElementStub;
}

interface MotionOptions {
    durationValue?: string;
    elements?: ElementStub[];
    prefersReducedMotion?: boolean;
}

const DURATION_PROPERTY = '--duration-slower';
const DURATION_VALUE = '0.6s';
const HIDDEN_OPACITY = '0';
const INLINE_UNSET_OPACITY = '';
const OFFSCREEN_TOP = 2_000;
const ONSCREEN_TOP = 0;
const PARALLAX_SELECTOR = '[data-parallax]';
const RESIZE_SETTLE_DELAY = 150;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 60;
const SCROLL_SELECTOR = '[data-scroll]';
const SCROLL_START = 'top 85%';
const VIEWPORT_HEIGHT = 800;
const VIEWPORT_WIDTH = 1_280;
const VISIBLE_OPACITY = '1';

const { gsapStub, scrollTriggerStub, state } = vi.hoisted(() => {
    const state = {
        scrollTriggers: [] as Killable[],
        tweensOf: [] as Killable[],
    };

    const gsapStub = {
        fromTo: vi.fn<(target: unknown, from: unknown, to: Record<string, unknown>) => { kill: Mock }>(() => ({ kill: vi.fn() })),
        getTweensOf: vi.fn(() => state.tweensOf),
        globalTimeline: { getChildren: vi.fn(() => [] as unknown[]) },
        registerPlugin: vi.fn(),
        set: vi.fn<(targets: unknown, vars: Record<string, unknown>) => void>(),
    };

    const scrollTriggerStub = {
        batch: vi.fn<(targets: unknown[], config: BatchConfig) => void>(),
        getAll: vi.fn(() => state.scrollTriggers),
    };

    return { gsapStub, scrollTriggerStub, state };
});

vi.mock('gsap', () => ({ default: gsapStub }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: scrollTriggerStub }));

class ElementStub {
    children: ElementStub[];
    closest: (selector: string) => ElementStub | null;
    contains: (target: unknown) => boolean;
    dataset: { scrollStagger?: string };
    getBoundingClientRect: () => { top: number };
    opacity = HIDDEN_OPACITY;
    style = { opacity: INLINE_UNSET_OPACITY };

    constructor(children: ElementStub[] = [], scrollStagger?: string, top = OFFSCREEN_TOP) {
        this.children = children;
        this.closest = () => null;
        this.contains = target => children.includes(target as ElementStub) || target === this;
        this.dataset = { scrollStagger };
        this.getBoundingClientRect = () => ({ top });
    }
}

const htmlElementStub = { [Symbol.hasInstance]: (value: unknown) => value instanceof ElementStub };

function buildKillable(trigger?: ElementStub): Killable {
    return { kill: vi.fn(), trigger };
}

async function loadMotion({ durationValue = DURATION_VALUE, elements = [], prefersReducedMotion = false }: MotionOptions = {}) {
    state.scrollTriggers = [];
    state.tweensOf = [];
    vi.clearAllMocks();
    vi.resetModules();

    const documentStub = {
        addEventListener: vi.fn<(type: string, handler: (event?: unknown) => void) => void>(),
        documentElement: {},
        querySelectorAll: vi.fn((selector: string) => selector === SCROLL_SELECTOR ? elements : []),
    };

    const mediaQueryStub = {
        addEventListener: vi.fn<(type: string, handler: () => void) => void>(),
        matches: prefersReducedMotion,
    };

    const windowStub = {
        addEventListener: vi.fn<(type: string, handler: (event?: unknown) => void) => void>(),
        innerHeight: VIEWPORT_HEIGHT,
        innerWidth: VIEWPORT_WIDTH,
        matchMedia: vi.fn(() => mediaQueryStub),
        scrollY: 0,
    };

    vi.stubGlobal('Element', ElementStub);
    vi.stubGlobal('HTMLElement', htmlElementStub);
    vi.stubGlobal('document', documentStub);

    vi.stubGlobal('getComputedStyle', (target: unknown) => ({
        getPropertyValue: (property: string) => property === DURATION_PROPERTY ? durationValue : '',
        opacity: (target as ElementStub).opacity ?? HIDDEN_OPACITY,
    }));

    vi.stubGlobal('window', windowStub);

    const { initMotion } = await import('../../src/lib/motion');

    return { documentStub, initMotion, mediaQueryStub, windowStub };
}

afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
});

describe('module scope', () => {
    test('registers the scroll trigger plugin with gsap', async () => {
        await loadMotion();

        expect(gsapStub.registerPlugin).toHaveBeenCalledExactlyOnceWith(scrollTriggerStub);
    });

    test('subscribes to focusin, resize, and reduced-motion changes', async () => {
        const { documentStub, initMotion, mediaQueryStub, windowStub } = await loadMotion();

        expect(documentStub.addEventListener).toHaveBeenCalledExactlyOnceWith('focusin', expect.any(Function));
        expect(mediaQueryStub.addEventListener).toHaveBeenCalledExactlyOnceWith('change', initMotion);
        expect(windowStub.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    test('matches the reduced-motion media query', async () => {
        const { windowStub } = await loadMotion();

        expect(windowStub.matchMedia).toHaveBeenCalledExactlyOnceWith('(prefers-reduced-motion: reduce)');
    });
});

describe('initMotion', () => {
    test('kills every scroll trigger returned by getAll', async () => {
        const { initMotion } = await loadMotion();
        const triggers = [buildKillable(), buildKillable()];

        state.scrollTriggers = triggers;
        initMotion();

        for (const trigger of triggers) expect(trigger.kill).toHaveBeenCalledTimes(1);
    });

    test('kills the animations pushed by a previous batch on the next run', async () => {
        const child = new ElementStub();

        const { initMotion } = await loadMotion({ elements: [new ElementStub([child], '0.1')] });

        initMotion();

        const animation = buildKillable();
        const [[, config]] = scrollTriggerStub.batch.mock.calls;

        gsapStub.fromTo.mockReturnValueOnce(animation);
        config.onEnter([child]);
        initMotion();

        expect(animation.kill).toHaveBeenCalledTimes(1);
    });

    test('collects parallax layers before scroll targets', async () => {
        const { documentStub, initMotion } = await loadMotion({ elements: [new ElementStub()] });

        initMotion();

        expect(documentStub.querySelectorAll).toHaveBeenNthCalledWith(1, PARALLAX_SELECTOR);
        expect(documentStub.querySelectorAll).toHaveBeenNthCalledWith(2, SCROLL_SELECTOR);
    });
});

describe('initMotion with reduced motion', () => {
    test('kills the tweens of every data-scroll element and its children', async () => {
        const child = new ElementStub();
        const tween = buildKillable();

        const element = new ElementStub([child]);

        const { initMotion } = await loadMotion({ elements: [element], prefersReducedMotion: true });

        state.tweensOf = [tween];
        initMotion();

        expect(gsapStub.getTweensOf).toHaveBeenCalledExactlyOnceWith([element, child]);
        expect(tween.kill).toHaveBeenCalledTimes(1);
    });

    test('reveals every data-scroll element instantly at full opacity with transform cleared', async () => {
        const child = new ElementStub();

        const element = new ElementStub([child]);

        const { initMotion } = await loadMotion({ elements: [element], prefersReducedMotion: true });

        initMotion();

        expect(gsapStub.set).toHaveBeenCalledExactlyOnceWith([element, child], { clearProps: 'transform', opacity: 1 });
    });

    test('registers no tweens and no batches', async () => {
        const { initMotion } = await loadMotion({ elements: [new ElementStub([new ElementStub()], '0.1')], prefersReducedMotion: true });

        initMotion();

        expect(gsapStub.fromTo).not.toHaveBeenCalled();
        expect(scrollTriggerStub.batch).not.toHaveBeenCalled();
    });

    test('queries the scroll targets without collecting parallax layers', async () => {
        const { documentStub, initMotion } = await loadMotion({ elements: [new ElementStub()], prefersReducedMotion: true });

        initMotion();

        expect(documentStub.querySelectorAll).not.toHaveBeenCalledWith(PARALLAX_SELECTOR);
        expect(documentStub.querySelectorAll).toHaveBeenCalledExactlyOnceWith(SCROLL_SELECTOR);
    });
});

describe('initMotion without reduced motion', () => {
    test('fades and lifts each unstaggered data-scroll element on a scroll trigger starting at top 85%', async () => {
        const element = new ElementStub();

        const { initMotion } = await loadMotion({ elements: [element] });

        initMotion();

        expect(gsapStub.fromTo).toHaveBeenCalledExactlyOnceWith(
            element,
            { opacity: 0, y: SCROLL_OFFSET },
            {
                duration: 0.6,
                ease: SCROLL_EASE,
                opacity: 1,
                scrollTrigger: { once: true, start: SCROLL_START, trigger: element },
                y: 0,
            },
        );
    });

    test('reads the tween duration from the --duration-slower custom property', async () => {
        const { initMotion } = await loadMotion({ durationValue: '1.2s', elements: [new ElementStub()] });

        initMotion();

        expect(gsapStub.fromTo.mock.calls[0][2].duration).toBe(1.2);
    });

    test('falls back to a 0.6 second duration when the custom property is empty', async () => {
        const { initMotion } = await loadMotion({ durationValue: '', elements: [new ElementStub()] });

        initMotion();

        expect(gsapStub.fromTo.mock.calls[0][2].duration).toBe(0.6);
    });

    test('fades a staggered container in on its own scroll trigger without lifting it', async () => {
        const element = new ElementStub([new ElementStub()], '0.1');

        const { initMotion } = await loadMotion({ elements: [element] });

        initMotion();

        expect(gsapStub.fromTo).toHaveBeenCalledExactlyOnceWith(
            element,
            { opacity: 0 },
            {
                duration: 0.6,
                ease: SCROLL_EASE,
                opacity: 1,
                scrollTrigger: { once: true, start: SCROLL_START, trigger: element },
            },
        );
    });

    test('hides the children of a staggered container and batches them at top 85% once', async () => {
        const children = [new ElementStub(), new ElementStub()];

        const { initMotion } = await loadMotion({ elements: [new ElementStub(children, '0.1')] });

        initMotion();

        expect(gsapStub.set).toHaveBeenCalledExactlyOnceWith(children, { opacity: 0 });
        expect(scrollTriggerStub.batch).toHaveBeenCalledExactlyOnceWith(children, {
            onEnter: expect.any(Function),
            once: true,
            start: SCROLL_START,
        });
    });

    test('staggers the entering batch with the data-scroll-stagger value', async () => {
        const children = [new ElementStub(), new ElementStub()];

        const { initMotion } = await loadMotion({ elements: [new ElementStub(children, '0.15')] });

        initMotion();

        const [[, config]] = scrollTriggerStub.batch.mock.calls;

        gsapStub.fromTo.mockClear();
        config.onEnter(children);

        expect(gsapStub.fromTo).toHaveBeenCalledExactlyOnceWith(
            children,
            { opacity: 0, y: SCROLL_OFFSET },
            {
                duration: 0.6,
                ease: SCROLL_EASE,
                opacity: 1,
                stagger: 0.15,
                y: 0,
            },
        );
    });

    test('skips the batch path for a container whose data-scroll-stagger is 0', async () => {
        const { initMotion } = await loadMotion({ elements: [new ElementStub([new ElementStub()], '0')] });

        initMotion();

        expect(gsapStub.fromTo).toHaveBeenCalledTimes(1);
        expect(scrollTriggerStub.batch).not.toHaveBeenCalled();
    });

    test('reveals an already on-screen unstaggered element instantly on a second run', async () => {
        const element = new ElementStub([], undefined, ONSCREEN_TOP);

        const { initMotion } = await loadMotion({ elements: [element] });

        initMotion();
        initMotion();

        expect(gsapStub.fromTo).toHaveBeenCalledTimes(1);
        expect(gsapStub.set).toHaveBeenCalledExactlyOnceWith([element], { clearProps: 'transform', opacity: 1 });
    });

    test('clears the transform of a staggered child carrying an inline full opacity instead of re-batching it on a second run', async () => {
        const child = new ElementStub();

        const { initMotion } = await loadMotion({ elements: [new ElementStub([child], '0.1')] });

        initMotion();
        child.style.opacity = VISIBLE_OPACITY;
        gsapStub.set.mockClear();
        scrollTriggerStub.batch.mockClear();
        initMotion();

        expect(gsapStub.set).toHaveBeenCalledExactlyOnceWith([child], { clearProps: 'transform', opacity: 1 });
        expect(scrollTriggerStub.batch).not.toHaveBeenCalled();
    });

    test('re-hides and re-batches a staggered child that computes to full opacity without an inline reveal on a second run', async () => {
        const child = new ElementStub();

        const { initMotion } = await loadMotion({ elements: [new ElementStub([child], '0.1')] });

        initMotion();
        child.opacity = VISIBLE_OPACITY;
        gsapStub.set.mockClear();
        scrollTriggerStub.batch.mockClear();
        initMotion();

        expect(gsapStub.set).toHaveBeenCalledExactlyOnceWith([child], { opacity: 0 });
        expect(scrollTriggerStub.batch).toHaveBeenCalledExactlyOnceWith([child], {
            onEnter: expect.any(Function),
            once: true,
            start: SCROLL_START,
        });
    });

    test('sets an on-screen staggered container to full opacity instead of fading it on a second run', async () => {
        const element = new ElementStub([new ElementStub()], '0.1', ONSCREEN_TOP);

        const { initMotion } = await loadMotion({ elements: [element] });

        initMotion();
        gsapStub.fromTo.mockClear();
        gsapStub.set.mockClear();
        initMotion();

        expect(gsapStub.set).toHaveBeenCalledWith(element, { opacity: 1 });
        expect(gsapStub.fromTo).not.toHaveBeenCalled();
    });
});

describe('focusin handling', () => {
    test('ignores a focusin whose target has no data-scroll ancestor', async () => {
        const { documentStub } = await loadMotion();
        const target = new ElementStub();

        const [[, focusIn]] = documentStub.addEventListener.mock.calls;

        focusIn({ target });

        expect(scrollTriggerStub.getAll).not.toHaveBeenCalled();
        expect(gsapStub.set).not.toHaveBeenCalled();
    });

    test('ignores a focusin when the container and the focused child are already visible', async () => {
        const child = new ElementStub();

        const container = new ElementStub([child]);

        child.closest = () => container;
        child.opacity = VISIBLE_OPACITY;
        container.opacity = VISIBLE_OPACITY;

        const { documentStub } = await loadMotion();

        const [[, focusIn]] = documentStub.addEventListener.mock.calls;

        focusIn({ target: child });

        expect(scrollTriggerStub.getAll).not.toHaveBeenCalled();
        expect(gsapStub.set).not.toHaveBeenCalled();
    });

    test('kills the scroll triggers inside the container and reveals it when the focused child is hidden', async () => {
        const child = new ElementStub();
        const sibling = new ElementStub();

        const container = new ElementStub([child, sibling]);

        child.closest = () => container;
        container.opacity = VISIBLE_OPACITY;

        const { documentStub } = await loadMotion();

        const inside = buildKillable(child);
        const outside = buildKillable(new ElementStub());

        state.scrollTriggers = [inside, outside];

        const [[, focusIn]] = documentStub.addEventListener.mock.calls;

        focusIn({ target: child });

        expect(inside.kill).toHaveBeenCalledTimes(1);
        expect(outside.kill).not.toHaveBeenCalled();
        expect(gsapStub.set).toHaveBeenCalledExactlyOnceWith([container, child, sibling], { clearProps: 'transform', opacity: 1 });
    });
});

describe('resize handling', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    test('ignores a resize that leaves the viewport width unchanged', async () => {
        const { windowStub } = await loadMotion();

        const resize = windowStub.addEventListener.mock.calls.find(([type]) => type === 'resize')?.[1];

        vi.useFakeTimers();
        resize?.();
        vi.advanceTimersByTime(RESIZE_SETTLE_DELAY);

        expect(scrollTriggerStub.getAll).not.toHaveBeenCalled();
    });

    test('collapses a burst of width changes into a single initMotion run 150ms later', async () => {
        const { windowStub } = await loadMotion();

        const resize = windowStub.addEventListener.mock.calls.find(([type]) => type === 'resize')?.[1];

        vi.useFakeTimers();
        windowStub.innerWidth = VIEWPORT_WIDTH + 1;
        resize?.();
        windowStub.innerWidth = VIEWPORT_WIDTH + 2;
        resize?.();
        vi.advanceTimersByTime(RESIZE_SETTLE_DELAY - 1);

        expect(scrollTriggerStub.getAll).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);

        expect(scrollTriggerStub.getAll).toHaveBeenCalledTimes(1);
    });
});
