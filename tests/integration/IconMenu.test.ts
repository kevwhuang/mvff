import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import IconMenu from '../../src/components/IconMenu.astro';

describe('IconMenu', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(IconMenu);
    });

    test('renders a hidden svg icon', () => {
        expect(html).toContain('<svg aria-hidden="true"');
        expect(html).toContain('fill="none"');
        expect(html).toContain('viewBox="0 0 16 12"');
        expect(html).toContain('height="12"');
        expect(html).toContain('width="16"');
    });

    test('draws three inline strokes in the current color', () => {
        expect(html.split('<line').length - 1).toBe(3);
        expect(html).toContain('stroke="currentColor"');
        expect(html).toContain('stroke-width="1.5"');
        expect(html).not.toContain('href=');
        expect(html).not.toContain('src=');
    });
});
