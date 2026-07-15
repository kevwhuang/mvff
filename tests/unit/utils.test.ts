import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getCountdownParts, pad } from '../../src/lib/utils';

const EVENT_MS = new Date('2026-07-18T19:00:00-05:00').getTime();
const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_SECOND = 1_000;

describe('getCountdownParts', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('breaks the remaining time into days, hours, minutes, and seconds', () => {
        const remaining = 2 * MS_PER_DAY + 3 * MS_PER_HOUR + 4 * MS_PER_MINUTE + 5 * MS_PER_SECOND;

        vi.setSystemTime(new Date(EVENT_MS - remaining));

        expect(getCountdownParts()).toEqual({
            days: 2,
            hours: 3,
            minutes: 4,
            remaining,
            seconds: 5,
        });
    });

    test('counts whole days with no remainder well before the event', () => {
        vi.setSystemTime(new Date(EVENT_MS - 30 * MS_PER_DAY));

        expect(getCountdownParts()).toEqual({
            days: 30,
            hours: 0,
            minutes: 0,
            remaining: 30 * MS_PER_DAY,
            seconds: 0,
        });
    });

    test('zeroes every part at the exact event instant', () => {
        vi.setSystemTime(new Date(EVENT_MS));

        expect(getCountdownParts()).toEqual({
            days: 0,
            hours: 0,
            minutes: 0,
            remaining: 0,
            seconds: 0,
        });
    });

    test('leaves one second on the clock one second before the event', () => {
        vi.setSystemTime(new Date(EVENT_MS - MS_PER_SECOND));

        expect(getCountdownParts()).toEqual({
            days: 0,
            hours: 0,
            minutes: 0,
            remaining: MS_PER_SECOND,
            seconds: 1,
        });
    });

    test('goes negative once the event has passed', () => {
        vi.setSystemTime(new Date(EVENT_MS + MS_PER_SECOND));

        expect(getCountdownParts()).toEqual({
            days: -1,
            hours: -1,
            minutes: -1,
            remaining: -MS_PER_SECOND,
            seconds: -1,
        });
    });

    test('stays timezone-agnostic across a daylight-saving boundary', () => {
        vi.setSystemTime(new Date('2026-03-01T00:00:00.000Z'));

        expect(getCountdownParts()).toEqual({
            days: 140,
            hours: 0,
            minutes: 0,
            remaining: 140 * MS_PER_DAY,
            seconds: 0,
        });
    });

    test('resolves the event to midnight utc from the central offset', () => {
        vi.setSystemTime(new Date('2026-07-19T00:00:00.000Z'));

        expect(getCountdownParts().remaining).toBe(0);
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
