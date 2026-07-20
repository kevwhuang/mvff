import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Experience from '../../src/sections/Experience.astro';

const HIGHLIGHTS = [
    { number: '/ 01', title: 'Screenings' },
    { number: '/ 02', title: 'Awards' },
    { number: '/ 03', title: 'Q&amp;A Panel' },
    { number: '/ 04', title: 'Live Music' },
    { number: '/ 05', title: 'Pool Party' },
] as const;

describe('Experience', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Experience);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="experience[^"]*" aria-labelledby="experience-title"/);
        expect(html).toMatch(/<h2 id="experience-title" class="section-header__title[^"]*"/);
    });

    test('renders the section marker and title', () => {
        expect(html).toMatch(/<span class="section-header__marker[^"]*"[^>]*>\[ 02 \]<\/span>/);
        expect(html).toMatch(/<h2 id="experience-title"[^>]*>The Experience<\/h2>/);
    });

    test('renders a highlight row for every entry', () => {
        expect(html.split('class="experience__highlight ').length - 1).toBe(HIGHLIGHTS.length);

        for (const highlight of HIGHLIGHTS) {
            expect(html).toMatch(new RegExp(`<span class="experience__highlight-number[^"]*"[^>]*>${highlight.number}</span>`));
            expect(html).toMatch(new RegExp(`<h3 class="experience__highlight-title[^"]*"[^>]*>${highlight.title}</h3>`));
        }
    });

    test('renders each highlight description', () => {
        expect(html).toContain('Three screening blocks, 22 official selections');
        expect(html).toContain('Ten jury awards and the Spotlight Partner Award');
        expect(html.split('class="experience__highlight-description').length - 1).toBe(HIGHLIGHTS.length);
    });
});
