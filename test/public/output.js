import { h } from './common.js';

const outputElement = /** @type {HTMLUListElement} */ (
    document.getElementById('output')
);

/**
 * @param {string} tag
 * @param {string} content
 */
export const output = (tag, content) => {

    const listItemElement = h('li', {
        className: 'output-item',
    }, [
        h('span', {
            className: 'output-tag',
        }, [
            tag + ': ',
        ]),
        h('span', {
            className: 'output-content',
        }, [
            content,
        ]),
    ]);

    outputElement.appendChild(listItemElement);
    listItemElement.scrollIntoView();

};
