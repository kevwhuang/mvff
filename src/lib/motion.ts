import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SCROLL_DURATION = 0.8;
const SCROLL_EASE = 'power3.out';
const SCROLL_OFFSET = 60;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let parallaxLayers: NodeListOf<HTMLElement> | undefined;
let parallaxQueued = false;

function handleScroll() {
    if (!parallaxLayers?.length || parallaxQueued) return;

    parallaxQueued = true;
    requestAnimationFrame(updateParallax);
}

function initScrollAnimations() {
    const elements = document.querySelectorAll<HTMLElement>('[data-scroll]');

    if (prefersReducedMotion) {
        elements.forEach((element) => {
            element.style.opacity = '1';
        });

        return;
    }

    elements.forEach((element) => {
        const delay = Number.parseFloat(element.dataset.scrollDelay || '0');
        const direction = (element.dataset.scroll || 'up') as Direction;
        const duration = Number.parseFloat(element.dataset.scrollDuration || String(SCROLL_DURATION));
        const from: gsap.TweenVars = { opacity: 0 };
        const stagger = Number.parseFloat(element.dataset.scrollStagger || '0');

        const to: gsap.TweenVars = {
            delay,
            duration,
            ease: SCROLL_EASE,
            opacity: 1,
            scrollTrigger: {
                start: 'top 85%',
                trigger: element,
            },
        };

        switch (direction) {
            case 'down':
                from.y = -SCROLL_OFFSET;
                to.y = 0;
                break;
            case 'left':
                from.x = SCROLL_OFFSET;
                to.x = 0;
                break;
            case 'right':
                from.x = -SCROLL_OFFSET;
                to.x = 0;
                break;
            case 'up':
                from.y = SCROLL_OFFSET;
                to.y = 0;
        }

        if (stagger > 0) {
            const children = element.children;

            gsap.set(element, { opacity: 1 });
            gsap.set(children, from);
            to.stagger = stagger;
            gsap.to(children, to);
        } else {
            gsap.fromTo(element, from, to);
        }
    });
}

function updateParallax() {
    parallaxQueued = false;

    const scrollY = window.scrollY;

    parallaxLayers?.forEach((layer) => {
        layer.style.transform = `translateY(${scrollY * Number.parseFloat(layer.dataset.parallax || '0')}px)`;
    });
}

gsap.registerPlugin(ScrollTrigger);
window.addEventListener('scroll', handleScroll, { passive: true });

export function initMotion(): void {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    initScrollAnimations();

    parallaxLayers = prefersReducedMotion ? undefined : document.querySelectorAll('[data-parallax]');
    updateParallax();
}
