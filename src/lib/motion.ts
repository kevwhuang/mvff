import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { REDUCED_MOTION_QUERY } from '@lib/constants';
import { initParallax } from '@lib/parallax';

const SCROLL_DURATION = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-slower')) || 0.6;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 60;
const SCROLL_START_RATIO = 0.85;
const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

const SCROLL_START = `top ${SCROLL_START_RATIO * 100}%`;

let batchFlushCalls: gsap.core.Animation[] = [];
let hasRevealed = false;

function handleFocusIn(event: FocusEvent) {
    const { target } = event;

    if (!(target instanceof Element)) return;

    const container = target.closest<HTMLElement>('[data-scroll]');

    if (!container) return;

    const children = Array.from(container.children);

    const focusedChild = children.find(child => child.contains(target));

    const candidates = focusedChild ? [container, focusedChild] : [container, ...children];

    if (!candidates.some(element => Number.parseFloat(getComputedStyle(element).opacity) === 0)) return;

    ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger && container.contains(trigger.trigger)) trigger.kill();
    });

    revealInstantly(container);
}

function initScrollAnimations(prefersReducedMotion: boolean) {
    const elements = document.querySelectorAll<HTMLElement>('[data-scroll]');

    if (prefersReducedMotion) {
        elements.forEach(revealInstantly);

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
            const children = Array.from(element.children);

            const hiddenChildren = hasRevealed ? children.filter(child => !isPastScrollStart(child)) : children;
            const revealedChildren = hasRevealed ? children.filter(child => isPastScrollStart(child)) : [];

            gsap.set(element, { opacity: 1 });

            if (revealedChildren.length > 0) gsap.set(revealedChildren, { clearProps: 'transform', opacity: 1 });

            if (hiddenChildren.length === 0) return;

            gsap.set(hiddenChildren, fromState);

            const timelineBefore = new Set(gsap.globalTimeline.getChildren(false, true, false));

            ScrollTrigger.batch(hiddenChildren, {
                onEnter: batch => batchFlushCalls.push(gsap.fromTo(batch, fromState, { ...toState, stagger })),
                once: true,
                start: SCROLL_START,
            });

            batchFlushCalls.push(...gsap.globalTimeline.getChildren(false, true, false).filter(tween => !timelineBefore.has(tween)));
        } else if (hasRevealed && isPastScrollStart(element)) {
            revealInstantly(element);
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

function isPastScrollStart(element: Element) {
    return element.getBoundingClientRect().top < window.innerHeight * SCROLL_START_RATIO;
}

function revealInstantly(element: HTMLElement) {
    const targets = [element, ...element.children];

    gsap.getTweensOf(targets).forEach(tween => tween.kill());
    gsap.set(targets, { clearProps: 'transform', opacity: 1 });
}

document.addEventListener('focusin', handleFocusIn);
reducedMotionQuery.addEventListener('change', initMotion);
gsap.registerPlugin(ScrollTrigger);

export function initMotion(): void {
    const prefersReducedMotion = reducedMotionQuery.matches;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    batchFlushCalls.forEach(tween => tween.kill());
    batchFlushCalls = [];
    initParallax(prefersReducedMotion);
    initScrollAnimations(prefersReducedMotion);
    hasRevealed = true;
}
