import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Roster from '../../src/sections/Roster.astro';

const TEAM = [
    { name: 'Anna', role: 'Founder &amp; Director' },
    { name: 'Rocky', role: 'Film Director' },
    { name: 'Jasmine', role: 'Event Coordinator' },
    { name: 'Jymes', role: 'Talent Programmer' },
    { name: 'Amiiri', role: 'Promotions Queen' },
    { name: 'Donovan', role: 'Social Media Manager' },
    { name: 'Marissa', role: 'Graphic Designer' },
    { name: 'Sebastian', role: 'Community Outreach' },
    { name: 'Phillip', role: 'Volunteer Coordinator' },
    { name: 'Killian', role: 'Visual Tech' },
    { name: 'Ben', role: 'Audio Tech' },
] as const;

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

    test('renders a card with a portrait for every team member', () => {
        expect(html.split('class="roster__card').length - 1).toBe(TEAM.length);
        expect(html.split('class="roster__image"').length - 1).toBe(TEAM.length);

        for (const member of TEAM) {
            expect(html).toMatch(new RegExp(`<img[^>]*alt="${member.name}"`));
        }
    });

    test('renders every member name and role', () => {
        for (const member of TEAM) {
            expect(html).toMatch(new RegExp(`<h2 class="roster__name"[^>]*>${member.name}</h2>`));
            expect(html).toMatch(new RegExp(`<span class="roster__role"[^>]*>${member.role}</span>`));
        }
    });
});
