import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { REDUCED_MOTION_QUERY } from '@lib/constants';
import { initParallax } from '@lib/parallax';

const SCROLL_DURATION = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-slower')) || 0.6;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 60;
const SCROLL_START = 'top 85%';
const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

let batchFlushCalls: gsap.core.Animation[] = [];

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

            const timelineBefore = new Set(gsap.globalTimeline.getChildren(false, true, false));

            ScrollTrigger.batch(Array.from(element.children), {
                onEnter: batch => gsap.fromTo(batch, fromState, { ...toState, stagger }),
                once: true,
                start: SCROLL_START,
            });

            batchFlushCalls.push(...gsap.globalTimeline.getChildren(false, true, false).filter(tween => !timelineBefore.has(tween)));
        } else {
            gsap.fromTo(element, fromState, {
                ...toState,
                scrollTrigger: {
                    once: true,
                    start: SCROLL_START,
                    trigger: element,
                },
            });
        }
    });
}

gsap.registerPlugin(ScrollTrigger);
reducedMotionQuery.addEventListener('change', initMotion);

export function initMotion(): void {
    const prefersReducedMotion = reducedMotionQuery.matches;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    batchFlushCalls.forEach(tween => tween.kill());
    batchFlushCalls = [];

    initScrollAnimations(prefersReducedMotion);
    initParallax(prefersReducedMotion);
}
