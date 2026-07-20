const PAD_LENGTH = 2;

export function externalLinkProps(href: string): { rel?: 'noopener'; target?: '_blank' } {
    return href.startsWith('http') ? { rel: 'noopener', target: '_blank' } : {};
}

export function initDisabledLinks(selector: string, signal: AbortSignal): void {
    document.querySelectorAll(selector).forEach((link) => {
        link.addEventListener('click', event => event.preventDefault(), { signal });
    });
}

export function normalizePath(pathname: string): string {
    return pathname.replace(/\/$/, '') || '/';
}

export function pad(value: number, length = PAD_LENGTH): string {
    return String(value).padStart(length, '0');
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
