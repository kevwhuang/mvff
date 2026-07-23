import { describe, expect, test } from 'vitest';

import { externalLinkProps, normalizePath, pad } from '../../src/lib/utils';

describe('externalLinkProps', () => {
    test('opens https urls in a new tab with a safe rel', () => {
        expect(externalLinkProps('https://example.com/entry-form')).toEqual({ rel: 'noopener', target: '_blank' });
    });

    test('treats plain http urls as external too', () => {
        expect(externalLinkProps('http://example.com')).toEqual({ rel: 'noopener', target: '_blank' });
    });

    test('leaves root-relative links free of target and rel', () => {
        expect(externalLinkProps('/info')).toEqual({});
    });

    test('keeps mailto and tel links internal', () => {
        expect(externalLinkProps('mailto:contact@atxmusicvideofilmfestival.com')).toEqual({});
        expect(externalLinkProps('tel:+12814669387')).toEqual({});
    });
});

describe('normalizePath', () => {
    test('strips a single trailing slash', () => {
        expect(normalizePath('/info/')).toBe('/info');
    });

    test('leaves a path without a trailing slash unchanged', () => {
        expect(normalizePath('/team')).toBe('/team');
    });

    test('keeps the root path as a single slash', () => {
        expect(normalizePath('/')).toBe('/');
    });

    test('falls back to the root for an empty path', () => {
        expect(normalizePath('')).toBe('/');
    });
});

describe('pad', () => {
    test('zero-pads a single digit to a width of two', () => {
        expect(pad(0)).toBe('00');
        expect(pad(5)).toBe('05');
        expect(pad(9)).toBe('09');
    });

    test('leaves a two-digit value unchanged', () => {
        expect(pad(10)).toBe('10');
        expect(pad(42)).toBe('42');
    });

    test('defaults to a width of two', () => {
        expect(pad(1)).toBe('01');
    });

    test('pads to a custom width', () => {
        expect(pad(7, 3)).toBe('007');
        expect(pad(0, 4)).toBe('0000');
    });

    test('returns values wider than the width unchanged', () => {
        expect(pad(100, 2)).toBe('100');
        expect(pad(1_234, 2)).toBe('1234');
    });
});
