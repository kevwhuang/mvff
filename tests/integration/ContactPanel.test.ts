import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Contact from '../../src/sections/Contact.astro';
import { LINKS } from '../../src/lib/constants';

const CHANNELS = [
    { href: LINKS.instagram, index: '/ 01', label: 'Instagram' },
    { href: LINKS.email, index: '/ 02', label: 'Email' },
    { href: LINKS.phone, index: '/ 03', label: 'Phone' },
] as const;

describe('Contact', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Contact);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section id="contact" class="contact[^"]*" aria-labelledby="contact-title"/);
        expect(html).toMatch(/<h2 id="contact-title" class="section-header__title[^"]*"[^>]*>Contact Us<\/h2>/);
    });

    test('renders a channel row for every contact method', () => {
        expect(html.split('class="contact__channel border').length - 1).toBe(CHANNELS.length);

        for (const channel of CHANNELS) {
            expect(html).toContain(`href="${channel.href}"`);
            expect(html).toMatch(new RegExp(`<span class="contact__channel-index[^"]*" aria-hidden="true"[^>]*>${channel.index}</span>`));
            expect(html).toMatch(new RegExp(`<span class="contact__channel-label[^"]*"[^>]*>${channel.label}</span>`));
        }
    });

    test('opens only the external instagram channel in a new tab', () => {
        expect(html).toMatch(new RegExp(`href="${LINKS.instagram}" rel="noopener" target="_blank"`));
        expect(html.split('target="_blank"').length - 1).toBe(1);
        expect(html.split('rel="noopener"').length - 1).toBe(1);
    });

    test('marks the external channel with a directional cue', () => {
        expect(html.split('class="contact__channel-cue"').length - 1).toBe(1);
        expect(html).toMatch(/<span class="contact__channel-cue" aria-hidden="true"[^>]*>&rarr;<\/span>/);
    });

    test('prints each contact value', () => {
        expect(html).toContain('@atxmvff');
        expect(html).toContain('@atxmusicvideofilmfestival.com');
        expect(html).toContain('(281) 466-9387');
    });
});
