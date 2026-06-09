import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { initScrollAnimations } from '@lib/scroll';

let ac: AbortController | undefined;
let rafPending = false;

export function initMotion(): void {
    ac?.abort();
    ac = new AbortController();

    ScrollTrigger.getAll().forEach(t => t.kill());
    initScrollAnimations();

    const layers = document.querySelectorAll<HTMLElement>('[data-parallax]');

    function update(): void {
        const scrollY = window.scrollY;

        layers.forEach((layer) => {
            layer.style.transform = 'translateY(' + (scrollY * +(layer.dataset.parallax || 0)) + 'px)';
        });

        rafPending = false;
    }

    window.addEventListener('scroll', () => {
        if (!rafPending) {
            requestAnimationFrame(update);
            rafPending = true;
        }
    }, { passive: true, signal: ac.signal });
}
