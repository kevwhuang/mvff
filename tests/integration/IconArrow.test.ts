import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import IconArrow from '../../src/components/IconArrow.astro';

describe('IconArrow', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(IconArrow);
    });

    test('renders an unfilled em-sized svg hidden from assistive tech', () => {
        expect(html).toContain('<svg class="icon-arrow" aria-hidden="true"');
        expect(html).toContain('fill="none"');
        expect(html).toContain('height="0.29em"');
        expect(html).toContain('viewBox="0 0 97 51"');
        expect(html).toContain('width="0.551em"');
    });

    test('draws a stroked shaft and a filled swept head in the current color', () => {
        expect(html.split('<line').length - 1).toBe(1);
        expect(html.split('<path').length - 1).toBe(1);
        expect(html).toContain('<line stroke="currentColor" stroke-width="9" x1="0" x2="72" y1="25.5" y2="25.5"');
        expect(html).toContain('<path d="M76.5 0 L77.5 0 L96.5 25.5 Q82 34.75 66 51 L70 29 L71.5 21.5 Z" fill="currentColor"');
    });
});
