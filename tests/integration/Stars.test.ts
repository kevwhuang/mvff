import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Stars from '../../src/components/Stars.astro';

const PARALLAX = ['-0.15', '-0.35', '-0.65'] as const;

describe('Stars', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Stars);
    });

    test('renders a fixed starfield hidden from assistive tech', () => {
        expect(html).toMatch(/<div class="[^"]*"[^>]*aria-hidden="true"[^>]*>\s*<div class="starfield__layer/);
        expect(html).toContain('inset-0');
        expect(html).toContain('pointer-events-none');
    });

    test('renders three parallax layers', () => {
        expect(html.split('class="starfield__layer absolute"').length - 1).toBe(PARALLAX.length);

        for (const depth of PARALLAX) {
            expect(html).toContain(`data-parallax="${depth}"`);
        }
    });
});
