import { afterEach, describe, expect, test, vi } from 'vitest';

import { getExternalLinkProps, initDisabledLinks, pad, registerPageScript } from '../../src/lib/utils';

import type { Mock } from 'vitest';

interface LinkStub {
    addEventListener: Mock<(type: string, handler: (event: Event) => void, options: { signal: AbortSignal }) => void>;
}

const DISABLED_SELECTOR = '.navbar__menu-link[aria-disabled="true"]';
const EXTERNAL_PROPS = { rel: 'noopener', target: '_blank' } as const;

function buildLink(): LinkStub {
    return { addEventListener: vi.fn() };
}

function stubLinks(links: LinkStub[]) {
    const querySelectorAll = vi.fn(() => links);

    vi.stubGlobal('document', { querySelectorAll });

    return querySelectorAll;
}

function stubPageEvents(init: Mock<(signal: AbortSignal) => void>) {
    const handlers = new Map<string, () => void>();

    vi.stubGlobal('document', {
        addEventListener: (type: string, handler: () => void) => {
            handlers.set(type, handler);
        },
    });

    registerPageScript(init);

    return handlers;
}

describe('getExternalLinkProps', () => {
    test('opens https hrefs in a new tab with rel noopener', () => {
        expect(getExternalLinkProps('https://example.com')).toEqual(EXTERNAL_PROPS);
        expect(getExternalLinkProps('https://shop.atxmusicvideofilmfestival.com')).toEqual(EXTERNAL_PROPS);
    });

    test('returns no props for internal, mailto, and tel hrefs', () => {
        expect(getExternalLinkProps('/')).toEqual({});
        expect(getExternalLinkProps('/photos')).toEqual({});
        expect(getExternalLinkProps('mailto:contact@atxmusicvideofilmfestival.com')).toEqual({});
        expect(getExternalLinkProps('tel:+12814669387')).toEqual({});
    });

    test('returns no props for insecure http hrefs and http-prefixed strings without an https scheme', () => {
        expect(getExternalLinkProps('http://example.com')).toEqual({});
        expect(getExternalLinkProps('httpd-notes')).toEqual({});
        expect(getExternalLinkProps('https')).toEqual({});
        expect(getExternalLinkProps('httpx://example.com')).toEqual({});
    });
});

describe('initDisabledLinks', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('queries the document once with the given selector', () => {
        const querySelectorAll = stubLinks([]);

        initDisabledLinks(DISABLED_SELECTOR, new AbortController().signal);

        expect(querySelectorAll).toHaveBeenCalledExactlyOnceWith(DISABLED_SELECTOR);
    });

    test('registers auxclick and click listeners on every match with the given signal', () => {
        const links = [buildLink(), buildLink()];
        const { signal } = new AbortController();

        stubLinks(links);
        initDisabledLinks(DISABLED_SELECTOR, signal);

        for (const link of links) {
            expect(link.addEventListener).toHaveBeenCalledTimes(2);
            expect(link.addEventListener).toHaveBeenNthCalledWith(1, 'auxclick', expect.any(Function), { signal });
            expect(link.addEventListener).toHaveBeenNthCalledWith(2, 'click', expect.any(Function), { signal });
        }
    });

    test('prevents the default action in both registered handlers', () => {
        const link = buildLink();

        stubLinks([link]);
        initDisabledLinks(DISABLED_SELECTOR, new AbortController().signal);

        for (const [, handler] of link.addEventListener.mock.calls) {
            const event = { preventDefault: vi.fn() };

            handler(event as unknown as Event);

            expect(event.preventDefault).toHaveBeenCalledTimes(1);
        }
    });
});

describe('pad', () => {
    test('zero-pads single digits to two characters', () => {
        expect(pad(0)).toBe('00');
        expect(pad(7)).toBe('07');
        expect(pad(9)).toBe('09');
    });

    test('leaves two-digit and longer values unchanged', () => {
        expect(pad(10)).toBe('10');
        expect(pad(59)).toBe('59');
        expect(pad(365)).toBe('365');
    });
});

describe('registerPageScript', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('listens for astro:before-swap and astro:page-load without calling init', () => {
        const init = vi.fn<(signal: AbortSignal) => void>();

        const handlers = stubPageEvents(init);

        expect([...handlers.keys()].sort()).toEqual(['astro:before-swap', 'astro:page-load']);
        expect(init).not.toHaveBeenCalled();
    });

    test('calls init with an unaborted signal on page load', () => {
        const init = vi.fn<(signal: AbortSignal) => void>();

        const handlers = stubPageEvents(init);

        handlers.get('astro:page-load')?.();

        expect(init).toHaveBeenCalledTimes(1);
        expect(init.mock.calls[0][0].aborted).toBe(false);
    });

    test('aborts the previous signal and passes a fresh one on the next page load', () => {
        const init = vi.fn<(signal: AbortSignal) => void>();

        const handlers = stubPageEvents(init);

        const pageLoad = handlers.get('astro:page-load');

        pageLoad?.();
        pageLoad?.();

        const [[first], [second]] = init.mock.calls;

        expect(init).toHaveBeenCalledTimes(2);
        expect(first.aborted).toBe(true);
        expect(second.aborted).toBe(false);
        expect(second).not.toBe(first);
    });

    test('aborts the current signal on before-swap', () => {
        const init = vi.fn<(signal: AbortSignal) => void>();

        const handlers = stubPageEvents(init);

        handlers.get('astro:page-load')?.();
        handlers.get('astro:before-swap')?.();

        expect(init.mock.calls[0][0].aborted).toBe(true);
    });

    test('tolerates a before-swap that arrives before any page load', () => {
        const init = vi.fn<(signal: AbortSignal) => void>();

        const handlers = stubPageEvents(init);

        expect(() => handlers.get('astro:before-swap')?.()).not.toThrow();
        expect(init).not.toHaveBeenCalled();
    });
});
