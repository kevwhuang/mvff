import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { collections } from '../../src/content.config';

interface SchemaParser {
    safeParse: (data: unknown) => { error?: { message: string }; success: boolean };
}

const CURLY_APOSTROPHE_PATTERN = /[\u2018\u2019]/;
const ENTRY_COUNT = 22;
const GALLERY_FIELDS = ['alt', 'label'] as const;
const PREFIX_LENGTH = 2;
const STEM_PATTERN = /^\d{2}_[a-z][a-z0-9_]*$/;

const galleryParser = collections.gallery.schema as SchemaParser;

const galleryRoot = join(process.cwd(), 'src/content/gallery');
const imageRoot = join(process.cwd(), 'src/images/gallery');

const galleryEntries = readdirSync(galleryRoot)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map((file) => {
        const raw = readFileSync(join(galleryRoot, file), 'utf-8');

        return {
            data: JSON.parse(raw) as Record<string, unknown>,
            name: `gallery/${file}`,
            raw,
            stem: file.replace('.json', ''),
        };
    });

const imageStems = readdirSync(imageRoot)
    .filter(file => file.endsWith('.webp'))
    .map(file => file.replace('.webp', ''))
    .sort();

describe('gallery', () => {
    test('holds twenty-two entries', () => {
        expect(galleryEntries).toHaveLength(ENTRY_COUNT);
    });

    test('every entry has non-empty alt and label strings and no other keys', () => {
        for (const { data, name } of galleryEntries) {
            expect(Object.keys(data).sort(), name).toEqual([...GALLERY_FIELDS]);

            for (const field of GALLERY_FIELDS) {
                expect(typeof data[field], `${name} ${field}`).toBe('string');
                expect(String(data[field]).trim(), `${name} ${field}`).not.toBe('');
            }
        }
    });

    test('stems follow NN_slug with zero-padded prefixes ascending from 01', () => {
        galleryEntries.forEach(({ stem }, index) => {
            expect(stem).toMatch(STEM_PATTERN);
            expect(stem.slice(0, PREFIX_LENGTH)).toBe(String(index + 1).padStart(PREFIX_LENGTH, '0'));
        });
    });

    test('every entry has a matching webp in src/images/gallery', () => {
        for (const { name, stem } of galleryEntries) expect(existsSync(join(imageRoot, `${stem}.webp`)), name).toBe(true);
    });

    test('every webp in src/images/gallery has a matching entry', () => {
        const stems = galleryEntries.map(entry => entry.stem);

        for (const stem of imageStems) expect(stems, stem).toContain(stem);
    });
});

describe('schemas', () => {
    test('every gallery file parses against the gallery collection schema', () => {
        expect(typeof galleryParser.safeParse).toBe('function');

        for (const { data, name } of galleryEntries) {
            const result = galleryParser.safeParse(data);

            expect(result.success, `${name}${result.error ? ` ${result.error.message}` : ''}`).toBe(true);
        }
    });

    test('the gallery collection schema rejects an empty alt and an empty label', () => {
        expect(galleryParser.safeParse({ alt: '', label: 'Opening set' }).success).toBe(false);
        expect(galleryParser.safeParse({ alt: 'Opening set', label: '' }).success).toBe(false);
    });
});

describe('json files', () => {
    test('files end without a trailing newline', () => {
        for (const { name, raw } of galleryEntries) expect(raw.endsWith('\n'), name).toBe(false);
    });

    test('keys and values contain no curly apostrophes', () => {
        for (const { data, name } of galleryEntries) {
            for (const [key, value] of Object.entries(data)) {
                expect(CURLY_APOSTROPHE_PATTERN.test(key), `${name} ${key}`).toBe(false);
                expect(CURLY_APOSTROPHE_PATTERN.test(String(value)), `${name} ${key}`).toBe(false);
            }
        }
    });
});
