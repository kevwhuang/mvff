import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Starfield from '../../src/components/Starfield.astro';

const PARALLAX = ['-0.15', '-0.35', '-0.65'] as const;

describe('Starfield', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Starfield);
    });

    test('renders a fixed starfield hidden from assistive tech', () => {
        expect(html).toMatch(/<div [^>]*aria-hidden="true"[^>]*>\s*<div class="starfield__layer/);
        expect(html).toContain('inset-0');
        expect(html).toContain('pointer-events-none');
    });

    test('persists across view transitions', () => {
        expect(html).toContain('data-astro-transition-persist="starfield"');
    });

    test('renders three parallax layers', () => {
        expect(html.split('class="starfield__layer').length - 1).toBe(PARALLAX.length);

        for (const depth of PARALLAX) {
            expect(html).toContain(`data-parallax="${depth}"`);
        }
    });
});
