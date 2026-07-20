import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { REDUCED_MOTION_QUERY } from '@lib/constants';

const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
const SCROLL_DURATION = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-slower')) || 0.6;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 60;
const SCROLL_START = 'top 85%';

let isParallaxQueued = false;
let parallaxLayers: { element: HTMLElement; factor: number }[] = [];

function handleScroll() {
    if (!parallaxLayers.length || isParallaxQueued) return;

    isParallaxQueued = true;
    requestAnimationFrame(updateParallax);
}

export function initMotion(): void {
    const prefersReducedMotion = reducedMotionQuery.matches;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    initScrollAnimations(prefersReducedMotion);
    initParallax(prefersReducedMotion);
}

function initParallax(prefersReducedMotion: boolean) {
    if (prefersReducedMotion) {
        parallaxLayers.forEach(({ element }) => {
            element.style.transform = '';
        });
        parallaxLayers = [];

        return;
    }

    parallaxLayers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'), element => ({
        element,
        factor: Number.parseFloat(element.dataset.parallax || '0'),
    }));

    updateParallax();
}

function initScrollAnimations(prefersReducedMotion: boolean) {
    const elements = document.querySelectorAll<HTMLElement>('[data-scroll]');

    if (prefersReducedMotion) {
        elements.forEach((element) => {
            element.style.opacity = '1';
            gsap.set(element, { clearProps: 'transform' });
            gsap.set(element.children, { clearProps: 'transform', opacity: 1 });
        });

        return;
    }

    elements.forEach((element) => {
        const fromState = { opacity: 0, y: SCROLL_OFFSET };
        const stagger = Number.parseFloat(element.dataset.scrollStagger || '0');

        const toState: gsap.TweenVars = {
            duration: SCROLL_DURATION,
            ease: SCROLL_EASE,
            opacity: 1,
            y: 0,
        };

        if (stagger > 0) {
            gsap.set(element, { opacity: 1 });
            gsap.set(element.children, fromState);
            ScrollTrigger.batch(Array.from(element.children), {
                onEnter: batch => gsap.fromTo(batch, fromState, { ...toState, stagger }),
                start: SCROLL_START,
            });
        } else {
            gsap.fromTo(element, fromState, {
                ...toState,
                scrollTrigger: {
                    start: SCROLL_START,
                    trigger: element,
                },
            });
        }
    });
}

function updateParallax() {
    isParallaxQueued = false;

    const scrollY = window.scrollY;

    parallaxLayers.forEach(({ element, factor }) => {
        element.style.transform = `translateY(${scrollY * factor}px)`;
    });
}

gsap.registerPlugin(ScrollTrigger);
window.addEventListener('scroll', handleScroll, { passive: true });
reducedMotionQuery.addEventListener('change', initMotion);
