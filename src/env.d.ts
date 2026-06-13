declare module 'eslint-plugin-jsx-a11y';

type Direction = 'down' | 'left' | 'right' | 'up';

type Timer = ReturnType<typeof setInterval>;

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface CountdownParts {
    days: number;
    hours: number;
    minutes: number;
    remaining: number;
    seconds: number;
}
