import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Team from '../../src/sections/Team.astro';

const TEAM = [
    { name: 'Anna', portrait: true, role: 'Founder &amp; Executive Producer' },
    { name: 'Ashleigh', portrait: false, role: 'Social Media Marketing Director' },
    { name: 'Jyme', portrait: true, role: 'Film Programming Director' },
    { name: 'Dan', portrait: true, role: 'Operations &amp; Production Manager' },
    { name: 'Amiiri', portrait: true, role: 'PR &amp; Outreach Director' },
    { name: 'Rocky', portrait: true, role: 'Sponsorship Administrator' },
    { name: 'Greta', portrait: true, role: 'Content Strategist' },
    { name: 'Marissa', portrait: false, role: 'Graphics Manager' },
    { name: 'Jasmine', portrait: false, role: 'Executive Coordinator' },
    { name: 'May', portrait: true, role: 'Dance Director &amp; Fashion Designer' },
] as const;

const PORTRAITS = TEAM.filter(member => member.portrait).length;
const MONOGRAMS = TEAM.length - PORTRAITS;

describe('Team', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Team);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="section team" aria-labelledby="team-title"/);
        expect(html).toMatch(/<h1 id="team-title" class="section-header__title[^"]*"[^>]*>Meet the Team<\/h1>/);
    });

    test('renders a card for every member with a portrait or monogram', () => {
        expect(html.split('<article class="team__card').length - 1).toBe(TEAM.length);
        expect(html.split('class="team__image').length - 1).toBe(PORTRAITS);
        expect(html.split('class="team__monogram').length - 1).toBe(MONOGRAMS);

        for (const member of TEAM) {
            if (!member.portrait) {
                expect(html).toMatch(new RegExp(`<span class="team__monogram[^"]*" aria-hidden="true"[^>]*>\\s*${member.name.charAt(0)}\\s*</span>`));
            }
        }
    });

    test('leaves portrait alt text empty for decorative images', () => {
        expect(html.split('class="team__image').length - 1).toBe(PORTRAITS);
        expect(html).not.toContain('alt="');
    });

    test('renders every member name and role', () => {
        for (const member of TEAM) {
            expect(html).toMatch(new RegExp(`<h2 class="team__name"[^>]*>${member.name}</h2>`));
            expect(html).toMatch(new RegExp(`<p class="team__role[^"]*"[^>]*>${member.role}</p>`));
        }
    });
});
