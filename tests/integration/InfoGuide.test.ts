import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import InfoGuide from '../../src/sections/InfoGuide.astro';

const FAQ_COUNT = 9;
const SCHEDULE_COUNT = 16;
const VENUE_FEATURES = ['Indoor screen', 'Outdoor pool', 'Full bar', 'VIP lounge', 'Red carpet', 'ADA access'] as const;

describe('InfoGuide', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(InfoGuide);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="info[^"]*" aria-labelledby="info-title"/);
        expect(html).toMatch(/<span class="section__number"[^>]*>\[ I \]<\/span>/);
        expect(html).toMatch(/<h1 id="info-title"[^>]*>Info<\/h1>/);
    });

    test('renders a schedule row for every slot from doors to close', () => {
        expect(html.split('class="schedule__row').length - 1).toBe(SCHEDULE_COUNT);
        expect(html).toMatch(/<span class="schedule__time"[^>]*>7:00 PM<\/span>/);
        expect(html).toMatch(/<span class="schedule__event"[^>]*>Doors \u00b7 Ryley Hall<\/span>/);
        expect(html).toMatch(/<span class="schedule__time"[^>]*>2:00 AM<\/span>/);
        expect(html).toMatch(/<span class="schedule__event"[^>]*>Lights Up<\/span>/);
    });

    test('renders the venue card and its feature list', () => {
        expect(html).toMatch(/<h3 class="venue__name"[^>]*>Cabana Club<\/h3>/);
        expect(html).toMatch(/class="venue__features[^"]*"/);

        for (const feature of VENUE_FEATURES) {
            expect(html).toMatch(new RegExp(`<li[^>]*>${feature}</li>`));
        }
    });

    test('renders every faq as a grouped disclosure with all closed on load', () => {
        expect(html.split('<details').length - 1).toBe(FAQ_COUNT);
        expect(html.split('<summary').length - 1).toBe(FAQ_COUNT);
        expect(html.split('name="faq"').length - 1).toBe(FAQ_COUNT);
        expect(html.split('name="faq" open').length - 1).toBe(0);
        expect(html).toContain('What exactly is the Austin Music Video Film Festival?');
        expect(html).toContain('When and where is it happening?');
    });
});
