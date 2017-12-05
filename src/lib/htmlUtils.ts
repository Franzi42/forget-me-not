/**
 * License: zlib/libpng
 * @author Santo Pfingsten
 * @see https://github.com/Lusito/forget-me-not
 */

import * as browser from 'webextension-polyfill';
import * as MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

function setMarkdown(element:HTMLElement, value:string) {
    element.innerHTML = md.render(value);
    const links = element.querySelectorAll('a');
    for(let i=0; i<links.length; i++)
        links[i].target = '_blank';
}

export function byId(id: string) {
    return document.getElementById(id);
}

export function on<K extends keyof HTMLElementEventMap>(node: Node, event: K, callback: (this: HTMLInputElement, ev: HTMLElementEventMap[K]) => any) {
    node.addEventListener(event, callback);
}

export function translateElement(element: HTMLElement) {
    const i18n = element.dataset.i18n;
    if(i18n) {
        let parts = i18n.split('?');
        let id = parts[0];
        parts.splice(0, 1);
        // default to text
        if(parts.length === 0)
            parts = ['text'];
        for (const attribute of parts) {
            if(attribute === 'text')
                element.textContent = browser.i18n.getMessage(id);
            else if(attribute === 'markdown')
                setMarkdown(element, browser.i18n.getMessage(id));
            else
                (element as any)[attribute] = browser.i18n.getMessage(id + '@' + attribute);
        }
    }
}

export function translateChildren(parent: NodeSelector) {
    let elements = parent.querySelectorAll('[data-i18n]');
    for (let i = 0; i < elements.length; i++)
        translateElement(elements[i] as HTMLElement);
}

export function removeAllChildren(node: HTMLElement) {
    if (node.hasChildNodes()) {
        while (node.firstChild)
            node.removeChild(node.firstChild);
    }
}

type ElementAttributes = { [s: string]: string | number | boolean };

export function createElement(doc: Document, parent: HTMLElement | null, tagName: string, params?: ElementAttributes) {
    let e = doc.createElement(tagName);
    if (params) {
        for (let key in params) {
            (e as any)[key] = params[key];
        }
    }
    if (parent)
        parent.appendChild(e);
    return e;
}

export function addLink(doc: Document, path: string) {
    let head = doc.querySelector('head');
    if (head) {
        createElement(doc, head, 'link', {
            href: browser.runtime.getURL(path),
            type: "text/css",
            rel: "stylesheet"
        });
    }
}

export type MouseEventCallback = (this: HTMLInputElement, ev: MouseEvent) => any;

export function createButton(labelI18nKey: string, callback: MouseEventCallback) {
    let button = document.createElement('button');
    button.setAttribute('data-i18n', labelI18nKey);
    on(button, 'click', callback);
    return button;
}
