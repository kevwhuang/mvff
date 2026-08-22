const PAD_LENGTH = 2;

export function getExternalLinkProps(href: string): { rel?: 'noopener'; target?: '_blank' } {
    return href.startsWith('https://') ? { rel: 'noopener', target: '_blank' } : {};
}

export function pad(value: number): string {
    return String(value).padStart(PAD_LENGTH, '0');
}

export function registerPageScript(init: (signal: AbortSignal) => void): void {
    let controller: AbortController | undefined;

    function handlePageLoad() {
        teardown();
        controller = new AbortController();
        init(controller.signal);
    }

    function teardown() {
        controller?.abort();
    }

    document.addEventListener('astro:before-swap', teardown);
    document.addEventListener('astro:page-load', handlePageLoad);
}
