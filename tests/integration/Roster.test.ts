import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Roster from '../../src/sections/Roster.astro';

const TEAM = [
    { name: 'Anna', portrait: true, role: 'Executive Festival Director' },
    { name: 'Ashleigh', portrait: false, role: 'Marketing Director' },
    { name: 'Jyme', portrait: true, role: 'Film Programming Director' },
    { name: 'Dan', portrait: false, role: 'Operations Director' },
    { name: 'Amiiri', portrait: true, role: 'Partnerships Director' },
    { name: 'Rocky', portrait: true, role: 'Sponsorship Admin Lead' },
    { name: 'Greta', portrait: false, role: 'Content Strategist' },
    { name: 'Marissa', portrait: true, role: 'Graphics Director' },
    { name: 'Jasmine', portrait: true, role: 'Event Coordinator' },
] as const;

const PORTRAITS = TEAM.filter(member => member.portrait).length;
const MONOGRAMS = TEAM.length - PORTRAITS;

describe('Roster', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Roster);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="roster[^"]*" aria-labelledby="roster-title"/);
        expect(html).toMatch(/<h1 id="roster-title" class="section__title"/);
    });

    test('renders the section marker and title', () => {
        expect(html).toMatch(/<span class="section__number"[^>]*>\[ T \]<\/span>/);
        expect(html).toMatch(/<h1 id="roster-title"[^>]*>2026 Team<\/h1>/);
    });

    test('renders an article card for every team member with a portrait or monogram', () => {
        expect(html.split('<article class="roster__card').length - 1).toBe(TEAM.length);
        expect(html.split('class="roster__image').length - 1).toBe(PORTRAITS);
        expect(html.split('class="roster__monogram').length - 1).toBe(MONOGRAMS);

        for (const member of TEAM) {
            if (member.portrait) {
                expect(html).toMatch(new RegExp(`<img[^>]*alt="${member.name}, ${member.role}"`));
            } else {
                expect(html).toMatch(new RegExp(`<span class="roster__monogram[^"]*" aria-hidden="true"[^>]*>\\s*${member.name.charAt(0)}\\s*</span>`));
            }
        }
    });

    test('renders every member name and role', () => {
        for (const member of TEAM) {
            expect(html).toMatch(new RegExp(`<h2 class="roster__name"[^>]*>${member.name}</h2>`));
            expect(html).toMatch(new RegExp(`<span class="roster__role"[^>]*>${member.role}</span>`));
        }
    });

    test('numbers every card with an aria-hidden padded index badge', () => {
        expect(html.split('class="roster__index').length - 1).toBe(TEAM.length);

        for (const [index] of TEAM.entries()) {
            const badge = String(index + 1).padStart(2, '0');

            expect(html).toMatch(new RegExp(`<span class="roster__index[^"]*" aria-hidden="true"[^>]*>\\s*${badge}\\s*</span>`));
        }
    });
});
