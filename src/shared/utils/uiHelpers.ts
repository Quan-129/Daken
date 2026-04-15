// Small DOM helper utilities to centralize common operations
export function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
}

export function qs<T extends Element = Element>(selector: string): T | null {
    return document.querySelector(selector) as T | null;
}

export function qsa<T extends Element = Element>(selector: string): NodeListOf<T> {
    return document.querySelectorAll(selector) as NodeListOf<T>;
}

export function on<K extends keyof HTMLElementEventMap>(el: HTMLElement | null, ev: K, handler: (ev: HTMLElementEventMap[K]) => any) {
    if (!el) return;
    el.addEventListener(ev, handler as EventListener);
}

export function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, opts?: {
    className?: string;
    text?: string;
    attrs?: Record<string, string>;
}): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (opts) {
        if (opts.className) el.className = opts.className;
        if (opts.text) el.textContent = opts.text;
        if (opts.attrs) {
            Object.keys(opts.attrs).forEach(k => el.setAttribute(k, opts.attrs![k]));
        }
    }
    return el;
}

export function safeHTML(el: HTMLElement | null, html: string) {
    if (!el) return;
    el.innerHTML = html;
}
