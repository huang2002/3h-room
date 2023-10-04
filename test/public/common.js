// @ts-check
export const PAGE_TITLE_BASE = 'chatting room';

/**
 * @param {string} tag
 * @param {Record<string, unknown>} [props]
 * @param {(Node | string)[]} [children]
 */
export const h = (tag, props, children) => {
    const element = document.createElement(tag);
    if (props) {
        Object.assign(element, props);
    }
    if (children) {
        for (const child of children) {
            if (typeof child === 'string') {
                element.appendChild(
                    document.createTextNode(child)
                );
            } else {
                element.appendChild(child);
            }
        }
    }
    return element;
}; export let currentIdentity = '';
