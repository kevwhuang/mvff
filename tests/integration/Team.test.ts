import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Team from '../../src/sections/Team.astro';

const EAGER_IMAGES = 5;

const TEAM = [
    { image: 'anna.webp', loading: 'eager', name: 'Anna', role: 'Founder &amp; Executive Producer' },
    { image: 'jasmine.webp', loading: 'eager', name: 'Jasmine', role: 'Administration Coordinator' },
    { image: 'amiri.webp', loading: 'eager', name: 'Amiri', role: 'PR &amp; Outreach Director' },
    { image: 'ashleigh.webp', loading: 'eager', name: 'Ashleigh', role: 'Social Media Marketing Director' },
    { image: 'dan.webp', loading: 'eager', name: 'Dan', role: 'Operations &amp; Production Manager' },
    { image: 'greta.webp', loading: 'lazy', name: 'Greta', role: 'Content Strategist' },
    { image: 'jyme.webp', loading: 'lazy', name: 'Jyme', role: 'Film Programming Director' },
    { monogram: 'M', name: 'Marissa', role: 'Graphics Manager' },
    { image: 'may.webp', loading: 'lazy', name: 'May', role: 'Dance Director &amp; Fashion Designer' },
    { image: 'rocky.webp', loading: 'lazy', name: 'Rocky', role: 'Sponsorship Administrator' },
] as const;

const imageMembers = TEAM.filter(member => 'image' in member);
const monogramMembers = TEAM.filter(member => 'monogram' in member);

function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('Team', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Team);
    });

    test('labels the section by a markerless meet the team heading', () => {
        expect(html).toContain('<section class="section team" aria-labelledby="team-title"');
        expect(html).toContain('class="section-header section-header--bare');
        expect(html).toMatch(/<h1 id="team-title" class="section-header__title uppercase"[^>]*>Meet the Team<\/h1>/);
        expect(html).not.toContain('section-header__marker');
    });

    test('marks the header and the staggered card grid for scroll animation', () => {
        expect(html).toMatch(/<header class="section-header[^"]*" data-scroll/);
        expect(html).toMatch(/<ul class="team__grid grid grid-cols-4 list-none" data-scroll data-scroll-stagger="0\.04"/);
        expect(html.split('data-scroll').length - 1).toBe(3);
    });

    test('renders ten cards in source order with each name as a heading above its role', () => {
        expect(html.split('<article class="team__card').length - 1).toBe(TEAM.length);

        for (const member of TEAM) {
            expect(html).toMatch(new RegExp(`<h2 class="team__name"[^>]*>${member.name}</h2><p class="team__role font-mono uppercase text-cream-60"[^>]*>${escapeRegExp(member.role)}</p>`));
        }

        const positions = TEAM.map(member => html.indexOf(`>${member.name}</h2>`));

        expect(positions.every(position => position >= 0)).toBe(true);
        expect(positions).toEqual([...positions].sort((positionA, positionB) => positionA - positionB));
    });

    test('renders a decorative portrait for the nine members with photos, eager only within the first five cards', () => {
        expect(html.split('class="team__image').length - 1).toBe(imageMembers.length);

        for (const member of imageMembers) {
            expect(html).toMatch(new RegExp(`<img[^>]*${escapeRegExp(member.image)}[^>]*alt loading="${member.loading}"`));
        }

        expect(html.split('loading="eager"').length - 1).toBe(EAGER_IMAGES);
        expect(html.split('loading="lazy"').length - 1).toBe(imageMembers.length - EAGER_IMAGES);
        expect(html.split(' 2x"').length - 1).toBe(imageMembers.length);
    });

    test('renders an aria-hidden monogram initial for the one member without a photo', () => {
        expect(html.split('class="team__monogram').length - 1).toBe(monogramMembers.length);

        for (const member of monogramMembers) {
            expect(html).toMatch(new RegExp(`<span class="team__monogram[^"]*" aria-hidden="true"[^>]*>${member.monogram}</span>`));
        }
    });
});
