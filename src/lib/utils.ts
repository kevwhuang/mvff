const EVENT_DATE = new Date('2026-07-18T19:00:00-05:00').getTime();
const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;
const MS_PER_SECOND = 1_000;
const PAD_LENGTH = 2;
const REFRESH_INTERVAL = 1_000;

export function getCountdownParts(): CountdownParts {
    const remaining = EVENT_DATE - Date.now();

    const days = Math.floor(remaining / MS_PER_DAY);
    const hours = Math.floor((remaining % MS_PER_DAY) / MS_PER_HOUR);
    const minutes = Math.floor((remaining % MS_PER_HOUR) / MS_PER_MINUTE);
    const seconds = Math.floor((remaining % MS_PER_MINUTE) / MS_PER_SECOND);

    return { days, hours, minutes, remaining, seconds };
}

export function pad(value: number, length = PAD_LENGTH): string {
    return String(value).padStart(length, '0');
}

export function startCountdown(render: (parts: CountdownParts) => void): () => void {
    render(getCountdownParts());

    const interval = setInterval(() => render(getCountdownParts()), REFRESH_INTERVAL);

    return () => clearInterval(interval);
}
