import { describe, expect, test, vi } from 'vitest';

import { onRequest } from '../../src/middleware';

import type { APIContext, MiddlewareNext } from 'astro';

function createContext(pathname: string) {
    const rewrite = vi.fn(async () => new Response('rewritten'));

    const context = { rewrite, url: new URL(`http://localhost:8888${pathname}`) } as unknown as APIContext;

    return { context, rewrite };
}

describe('onRequest', () => {
    test('returns the next response unchanged', async () => {
        const { context, rewrite } = createContext('/info');
        const page = new Response('ok', { status: 200 });

        const next: MiddlewareNext = vi.fn(async () => page);

        const response = await onRequest(context, next);

        expect(response).toBe(page);
        expect(next).toHaveBeenCalledTimes(1);
        expect(rewrite).not.toHaveBeenCalled();
    });

    test('passes 5xx responses straight through without rewriting', async () => {
        const { context, rewrite } = createContext('/team');
        const failure = new Response(null, { status: 500 });

        const next: MiddlewareNext = vi.fn(async () => failure);

        const response = await onRequest(context, next);

        expect(response).toBe(failure);
        expect(rewrite).not.toHaveBeenCalled();
    });

    test('invokes next without arguments', async () => {
        const { context } = createContext('/');

        const next: MiddlewareNext = vi.fn(async () => new Response('ok'));

        await onRequest(context, next);

        expect(next).toHaveBeenCalledWith();
    });
});
