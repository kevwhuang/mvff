/// <reference types="astro/client" />

declare module 'eslint-plugin-jsx-a11y';

type Direction = 'down' | 'left' | 'right' | 'up';

type Timer = ReturnType<typeof setInterval>;

interface CountdownParts {
    days: number;
    hours: number;
    minutes: number;
    remaining: number;
    seconds: number;
}
