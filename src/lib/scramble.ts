import { ScrollTrigger } from 'gsap/ScrollTrigger';

const CHARS = 'iljtfr1|/';
const ITERATION_STEP = 0.5;
const SCRAMBLE_INTERVAL = 30;

function scrambleText(element: Element): void {
    const htmlElement = element as HTMLElement;
    const original = htmlElement.dataset.original || htmlElement.textContent || '';
    htmlElement.dataset.original = original;
    let iteration = 0;

    const interval = setInterval(() => {
        htmlElement.textContent = original
            .split('')
            .map((char, index) => {
                if (index < iteration) return original[index];
                if (char === ' ') return ' ';
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('');
        iteration += ITERATION_STEP;

        if (iteration >= original.length) {
            clearInterval(interval);
            htmlElement.textContent = original;
        }
    }, SCRAMBLE_INTERVAL);
}

export function initScrambleAnimations(): void {
    document.querySelectorAll('[data-scramble]').forEach((element) => {
        ScrollTrigger.create({
            once: true,
            onEnter: () => scrambleText(element),
            start: 'bottom bottom',
            trigger: element,
        });
    });
}
