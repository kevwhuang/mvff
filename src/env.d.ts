/// <reference types="astro/client" />

declare module 'eslint-plugin-jsx-a11y';

interface CartItem {
    id: string;
    name: string;
    price: number;
    qty: number;
}

interface CountdownParts {
    d: number;
    h: number;
    m: number;
    remaining: number;
    s: number;
}
