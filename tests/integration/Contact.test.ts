import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import Contact from '../../src/sections/Contact.astro';
import { LINKS } from '../../src/lib/constants';

const CHANNELS = [
    { href: LINKS.instagram, isExternal: true, label: 'Instagram' },
    { href: LINKS.email, isExternal: false, label: 'Email' },
    { href: LINKS.phone, isExternal: false, label: 'Phone' },
    { href: LINKS.calendly, isExternal: true, label: 'Schedule Call' },
] as const;

const INDICES = ['/ 01', '/ 02', '/ 03', '/ 04'] as const;

const externalChannels = CHANNELS.filter(channel => channel.isExternal);

describe('Contact', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(Contact);
    });

    test('labels the section by the section header heading rendered as an h2', () => {
        expect(html).toContain('<section class="contact section" aria-labelledby="contact-title"');
        expect(html).toMatch(/<h2 id="contact-title" class="section-header__title uppercase"[^>]*>Contact Us<\/h2>/);
    });

    test('marks the ordered channel list for a staggered scroll reveal', () => {
        expect(html).toMatch(/<ol class="contact__channels list-none" data-scroll data-scroll-stagger="0.08"/);
    });

    test('renders the four channels in order with the hrefs from the shared links', () => {
        const hrefs = [...html.matchAll(/class="contact__channel-link[^"]*" href="([^"]+)"/g)].map(match => match[1]);
        const labels = [...html.matchAll(/class="contact__channel-label[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(hrefs).toEqual(CHANNELS.map(channel => channel.href));
        expect(labels).toEqual(CHANNELS.map(channel => channel.label));
    });

    test('opens the instagram and calendly links in a new tab and gives them a right arrow cue', () => {
        const blocks = html.split('<li class="contact__channel ').slice(1);

        expect(blocks.map(block => block.includes('contact__channel-cue'))).toEqual(CHANNELS.map(channel => channel.isExternal));
        expect(html).toMatch(/class="contact__channel-cue self-center select-none" aria-hidden="true"[^>]*>&rarr;</);

        for (const channel of externalChannels) expect(html).toContain(`href="${channel.href}" rel="noopener" target="_blank"`);
    });

    test('gives the mailto and tel links neither rel nor target', () => {
        const anchors = html.match(/<a class="contact__channel-link[^>]*>/g) ?? [];

        const bareAnchors = anchors.filter(anchor => anchor.includes(`href="${LINKS.email}"`) || anchor.includes(`href="${LINKS.phone}"`));

        expect(bareAnchors).toHaveLength(2);

        for (const anchor of bareAnchors) {
            expect(anchor).not.toContain('rel=');
            expect(anchor).not.toContain('target=');
        }
    });

    test('numbers each channel with a zero-padded index hidden from assistive tech', () => {
        const indices = [...html.matchAll(/class="contact__channel-index[^>]*aria-hidden="true"[^>]*>([^<]+)</g)].map(match => match[1]);

        expect(indices).toEqual([...INDICES]);
    });

    test('renders each channel value and breaks only the email value before its at sign with a single wbr', () => {
        expect(html).toMatch(/<span class="min-w-0"[^>]*>@atxmvff<\/span>/);
        expect(html).toMatch(/<span class="min-w-0"[^>]*>contact<wbr[^>]*>@atxmusicvideofilmfestival\.com<\/span>/);
        expect(html).toMatch(/<span class="min-w-0"[^>]*>\(281\) 466-9387<\/span>/);
        expect(html).toMatch(/<span class="min-w-0"[^>]*>calendly\.com\/madewellanna99<\/span>/);
        expect(html.split('<wbr').length - 1).toBe(1);
    });
});
