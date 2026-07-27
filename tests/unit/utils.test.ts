import { describe, expect, test } from 'vitest';

import { getExternalLinkProps, pad } from '../../src/lib/utils';

describe('getExternalLinkProps', () => {
    test('returns external attributes for http and https hrefs', () => {
        expect(getExternalLinkProps('https://instagram.com/atxmvff')).toEqual({ rel: 'noopener', target: '_blank' });
        expect(getExternalLinkProps('http://example.com')).toEqual({ rel: 'noopener', target: '_blank' });
    });

    test('returns empty props for internal and non-http hrefs', () => {
        expect(getExternalLinkProps('/info')).toEqual({});
        expect(getExternalLinkProps('mailto:contact@atxmusicvideofilmfestival.com')).toEqual({});
        expect(getExternalLinkProps('tel:+12814669387')).toEqual({});
    });
});

describe('pad', () => {
    test('pads single digits to two characters', () => {
        expect(pad(0)).toBe('00');
        expect(pad(9)).toBe('09');
    });

    test('leaves two or more digits unchanged', () => {
        expect(pad(12)).toBe('12');
        expect(pad(123)).toBe('123');
    });
});
