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

    test('wires the form for netlify forms submissions', () => {
        expect(html).toMatch(/<form class="contact__form[^"]*" data-netlify="true" data-netlify-honeypot="bot-field" method="POST" name="contact"/);
    });

    test('carries the hidden form-name and honeypot fields', () => {
        expect(html).toMatch(/<input name="form-name" type="hidden" value="contact"[^>]*>/);
        expect(html).toMatch(/<label class="hidden"[^>]*>\s*Leave this field empty\s*<input name="bot-field"[^>]*>\s*<\/label>/);
    });

    test('wraps every visible field control in its label', () => {
        expect(html.split('<label class="flex flex-col"').length - 1).toBe(4);
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

    test('renders an enabled send-message submit button', () => {
        expect(html).toMatch(/<button class="btn btn--primary[^"]*" type="submit"[^>]*>\s*Send Message\s*<\/button>/);
        expect(html).not.toMatch(/<button[^>]*disabled/);
        expect(html).not.toContain('Coming Soon');
    });

    test('renders the directory column ahead of the form', () => {
        const directoryIndex = html.indexOf('contact__directory');
        const formIndex = html.indexOf('contact__form');

        expect(directoryIndex).toBeGreaterThanOrEqual(0);
        expect(formIndex).toBeGreaterThan(directoryIndex);
    });

    test('elevates the directory into two contact cards', () => {
        expect(html.split('class="contact__card"').length - 1).toBe(2);
        expect(html).toMatch(/<div class="contact__card"[^>]*>\s*<h2 class="subhead"[^>]*>Direct Channels<\/h2>/);
        expect(html).toMatch(/<div class="contact__card"[^>]*>\s*<h2 class="subhead"[^>]*>Founder<\/h2>/);
    });

    test('renders the direct contact directory', () => {
        expect(html).toMatch(new RegExp(`<a class="contact__line-link" href="${LINKS.email}"[^>]*>contact@atxmusicvideofilmfestival.com</a>`));
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
