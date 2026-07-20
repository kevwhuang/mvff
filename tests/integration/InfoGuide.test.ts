import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Info from '../../src/sections/Info.astro';

const FAQ_COUNT = 8;
const SCHEDULE_COUNT = 16;
const VENUE_FEATURES = ['Outdoor screen', 'Live stage', 'Outdoor pool', 'Full bar', '21+ only', 'ADA access'] as const;

describe('Info', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Info);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="info[^"]*" aria-labelledby="info-title"/);
        expect(html).toMatch(/<h1 id="info-title" class="section-header__title[^"]*"[^>]*>Guest Info<\/h1>/);
    });

    test('renders a schedule row for every slot from doors to close', () => {
        expect(html.split('class="info__schedule-row').length - 1).toBe(SCHEDULE_COUNT);
        expect(html).toMatch(/<time class="info__schedule-time" datetime="2026-07-18T19:00-05:00"[^>]*>7:00 PM<\/time>/);
        expect(html).toMatch(/<span class="info__schedule-event[^"]*"[^>]*>Doors · Ryley Hall<\/span>/);
        expect(html).toMatch(/<time class="info__schedule-time" datetime="2026-07-19T02:00-05:00"[^>]*>2:00 AM<\/time>/);
        expect(html).toMatch(/<span class="info__schedule-event[^"]*"[^>]*>Lights Up<\/span>/);
    });

    test('renders the venue card and its feature list', () => {
        expect(html).toMatch(/<h3 class="info__venue-name[^"]*"[^>]*>Cabana Club<\/h3>/);
        expect(html).toContain('5012 E 7th St');
        expect(html).toMatch(/class="info__venue-features[^"]*"/);

        for (const feature of VENUE_FEATURES) {
            expect(html).toContain(`>${feature}</li>`);
        }
    });

    test('renders every faq as a grouped disclosure with all closed on load', () => {
        expect(html.split('<details').length - 1).toBe(FAQ_COUNT);
        expect(html.split('<summary').length - 1).toBe(FAQ_COUNT);
        expect(html.split('name="faq"').length - 1).toBe(FAQ_COUNT);
        expect(html.split('name="faq" open').length - 1).toBe(0);
        expect(html).toMatch(/<span class="subheading__badge"[^>]*>8 Entries<\/span>/);
        expect(html).toContain('What is the Austin Music Video Film Festival?');
    });
});
