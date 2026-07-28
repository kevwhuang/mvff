import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Starfield from '../../src/components/Starfield.astro';

describe('Starfield', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Starfield);
    });

    test('renders a persisted fixed backdrop hidden from assistive tech', () => {
        expect(html).toContain('data-astro-transition-persist="starfield"');
        expect(html).toContain('class="starfield fixed inset-0 overflow-hidden -z-30 pointer-events-none" aria-hidden="true"');
    });

    test('renders exactly three parallax layers', () => {
        expect(html.split('class="starfield__layer absolute backface-hidden will-change-transform"').length - 1).toBe(3);
        expect(html.split('data-parallax=').length - 1).toBe(3);
        expect(html.split('data-parallax-wrap=').length - 1).toBe(3);
    });

    test('deepens the parallax factor and wrap of each successive layer', () => {
        const factors = [...html.matchAll(/data-parallax="([^"]*)"/g)].map(match => Number(match[1]));
        const wraps = [...html.matchAll(/data-parallax-wrap="([^"]*)"/g)].map(match => Number(match[1]));

        expect(factors).toEqual([-0.15, -0.35, -0.65]);
        expect(wraps).toEqual([720, 880, 1_040]);
    });
});
