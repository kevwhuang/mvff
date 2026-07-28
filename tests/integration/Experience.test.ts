import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Experience from '../../src/sections/Experience.astro';

const HIGHLIGHTS = [
    { description: 'Live sets ran all night \u2014 flash mobs and a fire performer lighting up the floor.', title: 'Live Music' },
    { description: 'Three screening blocks of official selections \u2014 music videos back to back on the open-air screen.', title: 'Screenings' },
    { description: 'A raffle and a filmmaker Q&A after every block \u2014 directors and artists in conversation with the night\'s hosts.', title: 'Q&A Panel' },
    { description: 'Awards from the jury and the festival\'s partners \u2014 winners called to the stage at 11:45 PM.', title: 'Awards' },
    { description: 'The awards gave way to the pool deck \u2014 four late sets running straight to the 2 AM close.', title: 'After Party' },
] as const;

const INDICES = ['/ 01', '/ 02', '/ 03', '/ 04', '/ 05'] as const;

function escapeText(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

describe('Experience', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Experience);
    });

    test('labels the section by the section header heading rendered as an h2', () => {
        expect(html).toContain('<section class="experience section" aria-labelledby="experience-title"');
        expect(html).toMatch(/<h2 id="experience-title" class="section-header__title uppercase"[^>]*>The Experience<\/h2>/);
    });

    test('numbers the section header with the second bracketed marker', () => {
        expect(html).toMatch(/<span class="section-header__marker font-mono text-coral select-none"[^>]*>\[ 02 \]<\/span>/);
    });

    test('marks the ordered highlight list for a staggered scroll reveal', () => {
        expect(html).toMatch(/<ol class="list-none" data-scroll data-scroll-stagger="0.08"/);
    });

    test('renders the five highlight titles in order as h3 headings', () => {
        const titles = [...html.matchAll(/<h3 class="experience__highlight-title uppercase"[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(html.split('class="experience__highlight ').length - 1).toBe(HIGHLIGHTS.length);
        expect(titles).toEqual(HIGHLIGHTS.map(highlight => escapeText(highlight.title)));
    });

    test('renders the description paragraph belonging to each highlight', () => {
        const descriptions = [...html.matchAll(/<p class="experience__highlight-description[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(descriptions).toEqual(HIGHLIGHTS.map(highlight => escapeText(highlight.description)));
    });

    test('numbers each highlight with a zero-padded index hidden from assistive tech', () => {
        const indices = [...html.matchAll(/class="experience__highlight-number[^>]*aria-hidden="true"[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(indices).toEqual([...INDICES]);
    });

    test('renders the description em dashes as literal characters rather than entities', () => {
        expect(html.split('\u2014').length - 1).toBe(HIGHLIGHTS.length);
        expect(html).not.toContain('&mdash;');
    });
});
