let isParallaxQueued = false;
let parallaxLayers: { element: HTMLElement; factor: number; wrap: number }[] = [];

function handleScroll() {
    if (isParallaxQueued || !parallaxLayers.length) return;

    isParallaxQueued = true;
    requestAnimationFrame(updateParallax);
}

function updateParallax() {
    isParallaxQueued = false;

    const scrollY = window.scrollY;

    parallaxLayers.forEach(({ element, factor, wrap }) => {
        const offset = scrollY * factor;

        element.style.transform = `translateY(${wrap > 0 ? offset % wrap : offset}px)`;
    });
}

window.addEventListener('scroll', handleScroll, { passive: true });

export function initParallax(prefersReducedMotion: boolean): void {
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
        wrap: Number.parseFloat(element.dataset.parallaxWrap || '0'),
    }));

    updateParallax();
}
