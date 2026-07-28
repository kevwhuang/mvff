import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import IconMenu from '../../src/components/IconMenu.astro';

describe('IconMenu', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(IconMenu);
    });

    test('renders an unfilled 21 by 16 svg hidden from assistive tech', () => {
        expect(html).toContain('<svg aria-hidden="true"');
        expect(html).toContain('fill="none"');
        expect(html).toContain('height="16"');
        expect(html).toContain('viewBox="0 0 21 16"');
        expect(html).toContain('width="21"');
    });

    test('draws exactly three lines stroked in the current color', () => {
        expect(html.split('<line').length - 1).toBe(3);
        expect(html.split('stroke="currentColor"').length - 1).toBe(3);
        expect(html).toContain('<line stroke="currentColor" stroke-width="2" x1="0" x2="21" y1="1" y2="1">');
        expect(html).toContain('<line stroke="currentColor" stroke-width="2" x1="0" x2="21" y1="8" y2="8">');
        expect(html).toContain('<line stroke="currentColor" stroke-width="2" x1="0" x2="21" y1="15" y2="15">');
    });
});
