const EVENT_DATE = new Date('2026-07-18T19:00:00-05:00').getTime();
const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_SECOND = 1_000;
const PAD_LENGTH = 2;

export function getCountdownParts(): CountdownParts {
    const remaining = EVENT_DATE - Date.now();
    const d = Math.floor(remaining / MS_PER_DAY);
    const h = Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR);
    const m = Math.floor((remaining % MS_PER_HOUR) / MS_PER_MINUTE);
    const s = Math.floor((remaining % MS_PER_MINUTE) / MS_PER_SECOND);

    return { d, h, m, remaining, s };
}

export function pad(n: number): string {
    return String(n).padStart(PAD_LENGTH, '0');
}
