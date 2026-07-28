import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Info from '../../src/sections/Info.astro';

const FAQ = [
    { answer: 'A one-night music video festival at Cabana Club in East Austin: live sets, three screening blocks, filmmaker Q&amp;A panels, an awards ceremony, and an after party.', question: 'What is the Austin Music Video Film Festival?' },
    { answer: 'Yes. 21+, doors to close.', question: 'Was there an age requirement?' },
    { answer: 'Silk, tuxedos, and the occasional swimsuit. Red-carpet attire was optional, and guests dressed to be photographed.', question: 'What did people wear?' },
    { answer: 'Onsite parking at Cabana Club, plus street parking around the venue for overflow. Rideshare covered the rest.', question: 'How did guests get there?' },
    { answer: 'Yes. Food vendors served, and the full bar poured all night.', question: 'Was there food and drink?' },
    { answer: 'Cameras were everywhere. Guests shot the night from the floor, and several media members worked alongside them.', question: 'Were cameras allowed?' },
    { answer: 'Submissions for 2026 are closed. The official selections screened across the three blocks on July 18. Follow @atxmvff on Instagram for the next open call.', question: 'How do I submit a music video?' },
    { answer: 'Sponsorships and partnerships are open for next year. Start with the pitch deck in the footer, then apply through Future Partnerships.', question: 'How do brands get involved?' },
] as const;

const SCHEDULE = [
    { datetime: '2026-07-18T19:00-05:00', event: 'Ryley Hall', tag: 'Live', time: '7:00 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T19:25-05:00', event: 'Dasmayan Daydreamers', tag: 'Live', time: '7:25 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T20:00-05:00', event: 'Tipping Culture', tag: 'Live', time: '8:00 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T20:35-05:00', event: 'Anna Madewell', tag: 'Live', time: '8:35 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T21:30-05:00', event: 'Music Video Block\u00A0One', tag: 'Screening', time: '9:30 PM', tone: 'text-coral' },
    { datetime: '2026-07-18T22:00-05:00', event: 'Raffle &amp; Q&amp;A', tag: 'Panel', time: '10:00 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T22:15-05:00', event: 'Music Video Block\u00A0Two', tag: 'Screening', time: '10:15 PM', tone: 'text-coral' },
    { datetime: '2026-07-18T22:45-05:00', event: 'Raffle &amp; Q&amp;A', tag: 'Panel', time: '10:45 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T23:00-05:00', event: 'Music Video Block\u00A0Three', tag: 'Screening', time: '11:00 PM', tone: 'text-coral' },
    { datetime: '2026-07-18T23:30-05:00', event: 'Raffle &amp; Q&amp;A', tag: 'Panel', time: '11:30 PM', tone: 'text-cream-60' },
    { datetime: '2026-07-18T23:45-05:00', event: 'Awards Ceremony', tag: 'Awards', time: '11:45 PM', tone: 'text-coral' },
    { datetime: '2026-07-19T00:05-05:00', event: 'Jyme', tag: 'After Party', time: '12:05 AM', tone: 'text-cream-60' },
    { datetime: '2026-07-19T00:35-05:00', event: 'Natia', tag: 'After Party', time: '12:35 AM', tone: 'text-cream-60' },
    { datetime: '2026-07-19T01:05-05:00', event: 'Amiri Tafari', tag: 'After Party', time: '1:05 AM', tone: 'text-cream-60' },
    { datetime: '2026-07-19T01:35-05:00', event: 'Surprise Set', tag: 'After Party', time: '1:35 AM', tone: 'text-cream-60' },
    { datetime: '2026-07-19T02:00-05:00', event: 'Lights Up', tag: 'Close', time: '2:00 AM', tone: 'text-cream-60' },
] as const;

const VENUE_DESCRIPTION = 'An indoor-outdoor club in East Austin, where an open-air screen lit the pool deck, a live stage carried the music, and high tables sat under the patio roof. A small red-carpet section set the tone, and the night ran 7 PM straight to the 2 AM close.';
const VENUE_FEATURES = ['Big screen', 'Live stage', 'Outdoor pool', 'Full bar', '21+ only', 'ADA access'] as const;

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function expectAscending(positions: number[]) {
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((positionA, positionB) => positionA - positionB));
}

describe('Info', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Info);
    });

    test('labels the section by a markerless guest info heading', () => {
        expect(html).toContain('<section class="info section" aria-labelledby="info-title"');
        expect(html).toContain('class="section-header section-header--bare');
        expect(html).toMatch(/<h1 id="info-title" class="section-header__title uppercase"[^>]*>Guest Info<\/h1>/);
        expect(html).not.toContain('section-header__marker');
    });

    test('renders the venue card with its name, address, description, and six features in order', () => {
        expect(html).toMatch(/<h2 class="info__subheading[^"]*"[^>]*>Venue<\/h2>/);
        expect(html).toMatch(/<h3 class="info__venue-name mb-2"[^>]*>Cabana Club<\/h3>/);
        expect(html).toMatch(/<p class="info__venue-address[^"]*"[^>]*>5012 E 7th St &middot; Austin, TX<\/p>/);
        expect(html).toContain(`>${VENUE_DESCRIPTION}</p>`);

        const featuresStart = html.indexOf('class="info__venue-features');

        const features = html.slice(featuresStart, html.indexOf('</ul>', featuresStart));

        expect(features.split('<li').length - 1).toBe(VENUE_FEATURES.length);

        for (const feature of VENUE_FEATURES) expect(features).toContain(`>${feature}</li>`);

        expectAscending(VENUE_FEATURES.map(feature => features.indexOf(`>${feature}</li>`)));
    });

    test('renders the program as an ordered list of sixteen rows in chronological order', () => {
        expect(html).toMatch(/<h2 class="info__subheading[^"]*"[^>]*>Program<\/h2>/);
        expect(html).toMatch(/<ol class="info__schedule flex flex-col list-none"/);
        expect(html.split('class="info__schedule-row').length - 1).toBe(SCHEDULE.length);
        expectAscending(SCHEDULE.map(row => html.indexOf(`datetime="${row.datetime}"`)));
    });

    test('renders each schedule row as a datetime-stamped time, an event name, and a comma read only to screen readers', () => {
        for (const row of SCHEDULE) {
            expect(html).toMatch(new RegExp(`<time class="info__schedule-time[^"]*" datetime="${row.datetime}"[^>]*>${escapeRegExp(row.time)}</time><span class="info__schedule-event font-display"[^>]*>${escapeRegExp(row.event)}</span><span class="sr-only"[^>]*>, </span>`));
        }

        expect(html.split('class="sr-only"').length - 1).toBe(SCHEDULE.length);
    });

    test('tags the screening and awards rows in coral and every other row in muted cream', () => {
        for (const row of SCHEDULE) {
            expect(html).toMatch(new RegExp(`<span class="info__schedule-tag font-mono uppercase ${row.tone}"[^>]*>${row.tag}</span>`));
        }

        expect(html.split('class="info__schedule-tag font-mono uppercase text-coral"').length - 1).toBe(4);
    });

    test('renders the faq subheading with an eight entry badge', () => {
        expect(html).toMatch(new RegExp(`<h2 class="info__subheading[^"]*"[^>]*>Frequently Asked Questions <span class="info__subheading-badge[^"]*"[^>]*>${FAQ.length} Entries</span></h2>`));
    });

    test('renders eight mutually exclusive faq details that all start closed', () => {
        expect(html.split('<details').length - 1).toBe(FAQ.length);
        expect(html.split('name="faq"').length - 1).toBe(FAQ.length);
        expect(html).not.toMatch(/<details[^>]* open/);
    });

    test('renders every faq question as a summary with an aria-hidden icon and its answer below', () => {
        for (const entry of FAQ) {
            expect(html).toMatch(new RegExp(`<summary class="info__faq-question[^"]*"[^>]*><span class="info__faq-text"[^>]*>${escapeRegExp(entry.question)}</span><span class="info__faq-icon[^"]*" aria-hidden="true"[^>]*>\\+</span></summary><p class="info__faq-answer[^"]*"[^>]*>${escapeRegExp(entry.answer)}</p>`));
        }

        expect(html.split('class="info__faq-icon font-mono text-coral" aria-hidden="true"').length - 1).toBe(FAQ.length);
    });

    test('marks the header, the staggered venue and program stack, and the faq block for scroll animation', () => {
        expect(html).toMatch(/<header class="section-header[^"]*" data-scroll/);
        expect(html).toMatch(/<div class="info__stack flex flex-col" data-scroll data-scroll-stagger="0\.12"/);
        expect(html).toMatch(/<div class="relative" data-scroll/);
        expect(html.split('data-scroll').length - 1).toBe(4);
    });
});
