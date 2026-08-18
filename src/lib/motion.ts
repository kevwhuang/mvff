import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { REDUCED_MOTION_QUERY, RESIZE_SETTLE_DELAY } from '@lib/constants';
import { initParallax } from '@lib/parallax';

const PERCENT_SCALE = 100;
const SCROLL_DURATION = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-slower')) || 0.6;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 60;
const SCROLL_START_RATIO = 0.85;

const SCROLL_START = `top ${SCROLL_START_RATIO * PERCENT_SCALE}%`;

const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);

let batchAnimations: gsap.core.Animation[] = [];
let hasRevealed = false;
let lastViewportWidth = window.innerWidth;
let resizeSettleTimer: ReturnType<typeof setTimeout> | undefined;

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

function handleResize() {
    if (window.innerWidth === lastViewportWidth) return;

    lastViewportWidth = window.innerWidth;
    clearTimeout(resizeSettleTimer);
    resizeSettleTimer = setTimeout(initMotion, RESIZE_SETTLE_DELAY);
}

function hasInlineReveal(element: Element) {
    return element instanceof HTMLElement && element.style.opacity === '1';
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

            const hiddenChildren = hasRevealed ? children.filter(child => !hasInlineReveal(child) && !isPastScrollStart(child)) : children;
            const revealedChildren = hasRevealed ? children.filter(child => hasInlineReveal(child) || isPastScrollStart(child)) : [];

            if (hasRevealed && (isPastScrollStart(element) || isRevealed(element))) {
                gsap.set(element, { opacity: 1 });
            } else {
                gsap.fromTo(element, { opacity: 0 }, {
                    duration: SCROLL_DURATION,
                    ease: SCROLL_EASE,
                    opacity: 1,
                    scrollTrigger: {
                        once: true,
                        start: SCROLL_START,
                        trigger: element,
                    },
                });
            }

            if (revealedChildren.length > 0) gsap.set(revealedChildren, { clearProps: 'transform', opacity: 1 });

            if (hiddenChildren.length === 0) return;

            gsap.set(hiddenChildren, { opacity: 0 });

            const tweensBefore = new Set(gsap.globalTimeline.getChildren(false, true, false));

            ScrollTrigger.batch(hiddenChildren, {
                onEnter: batch => batchAnimations.push(gsap.fromTo(batch, fromState, { ...toState, stagger })),
                once: true,
                start: SCROLL_START,
            });

            batchAnimations.push(...gsap.globalTimeline.getChildren(false, true, false).filter(tween => !tweensBefore.has(tween)));
        } else if (hasRevealed && (isPastScrollStart(element) || isRevealed(element))) {
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

function isRevealed(element: Element) {
    return Number.parseFloat(getComputedStyle(element).opacity) === 1;
}

function revealInstantly(element: HTMLElement) {
    const targets = [element, ...element.children];

    gsap.getTweensOf(targets).forEach(tween => tween.kill());
    gsap.set(targets, { clearProps: 'transform', opacity: 1 });
}

document.addEventListener('focusin', handleFocusIn);
gsap.registerPlugin(ScrollTrigger);
reducedMotionQuery.addEventListener('change', initMotion);
window.addEventListener('resize', handleResize);

export function initMotion(): void {
    const prefersReducedMotion = reducedMotionQuery.matches;

    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    batchAnimations.forEach(tween => tween.kill());
    batchAnimations = [];
    initParallax(prefersReducedMotion);
    initScrollAnimations(prefersReducedMotion);
    hasRevealed = true;
}
