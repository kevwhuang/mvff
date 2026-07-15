import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeAll, describe, expect, test } from 'vitest';

import ContactPanel from '../../src/sections/ContactPanel.astro';
import { LINKS } from '../../src/lib/constants';

describe('ContactPanel', () => {
    let html: string;

    beforeAll(async () => {
        const container = await AstroContainer.create();

        html = await container.renderToString(ContactPanel);
    });

    test('labels the section by its heading for assistive tech', () => {
        expect(html).toMatch(/<section class="contact[^"]*" aria-labelledby="contact-title"/);
        expect(html).toMatch(/<span class="section__number"[^>]*>\[ C \]<\/span>/);
        expect(html).toMatch(/<h1 id="contact-title"[^>]*>Contact<\/h1>/);
    });

    test('wraps every field control in its label', () => {
        expect(html.split('<label ').length - 1).toBe(4);
        expect(html).toMatch(/<span class="label"[^>]*>Name <span class="label__required"[^>]*>\*<\/span><\/span>/);
        expect(html).toMatch(/<span class="label"[^>]*>Email <span class="label__required"[^>]*>\*<\/span><\/span>/);
        expect(html).toMatch(/<span class="label"[^>]*>Message <span class="label__required"[^>]*>\*<\/span><\/span>/);
    });

    test('marks the name, email, and message controls required', () => {
        expect(html.split('class="label__required"').length - 1).toBe(3);
        expect(html).toMatch(/<input[^>]*name="name"[^>]*required/);
        expect(html).toMatch(/<input[^>]*name="email"[^>]*type="email"[^>]*>/);
        expect(html).toMatch(/<textarea[^>]*name="message"[^>]*required/);
    });

    test('renders the subject options', () => {
        for (const option of ['General Inquiry', 'Press &amp; Media', 'Sponsorship', 'Submissions', 'Volunteering']) {
            expect(html).toMatch(new RegExp(`<option[^>]*>${option}</option>`));
        }
    });

    test('renders a disabled coming-soon submit button', () => {
        expect(html).toMatch(/<button class="btn btn--primary[^"]*" disabled type="submit"[^>]*>Coming Soon<\/button>/);
    });

    test('renders the direct contact directory', () => {
        expect(html).toMatch(new RegExp(`<a href="${LINKS.email}"[^>]*>contact@atxmusicvideofilmfestival.com</a>`));
        expect(html).toMatch(new RegExp(`<a[^>]*href="${LINKS.instagram}" target="_blank"[^>]*>\\s*@atxmvff\\s*</a>`));
        expect(html).toMatch(new RegExp(`<a[^>]*href="${LINKS.posh}" target="_blank"[^>]*>\\s*Posh &rarr;\\s*</a>`));
        expect(html).toMatch(new RegExp(`<a[^>]*href="${LINKS.pitchDeck}" target="_blank"[^>]*>\\s*Pitch Deck\\s*</a>`));
        expect(html).toMatch(new RegExp(`<a[^>]*href="${LINKS.calendly}" target="_blank"[^>]*>\\s*Calendly &rarr;\\s*</a>`));
    });

    test('credits the founder and studio', () => {
        expect(html).toContain('Anna Madewell');
        expect(html).toContain('Madewell Productions');
    });
});
