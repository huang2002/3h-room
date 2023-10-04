// @ts-check
const PAGE_TITLE_BASE = 'chatting room';
document.title = PAGE_TITLE_BASE;

/**
 * @param {string} tag
 * @param {Record<string, unknown>} [props]
 * @param {(Node | string)[]} [children]
 */
const h = (tag, props, children) => {
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
};

const outputElement = /** @type {HTMLUListElement} */(
    document.getElementById('output')
);

/**
 * @param {string} tag
 * @param {string} content
 */
const output = (tag, content) => {

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

/**
 * @type {EventSource | null}
 */
let eventSource = null;

/**
 * @param {string} identity
 */
const setupEventSource = (identity) => {

    if (eventSource) {
        eventSource.close();
        eventSource = null;
        output('info', 'Closed previous connection.');
    }

    const eventSourceUrl = '/api/sub/' + encodeURIComponent(identity);
    eventSource = new EventSource(eventSourceUrl);

    eventSource.addEventListener('open', () => {
        output('info', `Connection established. (identity: ${identity})`);
    });

    eventSource.addEventListener('error', (event) => {
        output('info', `Connection lost due to an error. (identity: ${identity})`);
        console.error(event);
        eventSource = null;
    }, { once: true });

    eventSource.addEventListener('message', (event) => {
        try {
            /**
             * @type {{
             *     sender: string;
             *     message: string;
             * }}
             */
            const data = JSON.parse(event.data);
            output('message', (
                '('
                + data.sender
                + ') '
                + data.message
            ));
        } catch (error) {
            console.error(error);
            output('error', 'Failed to display received message due to an error.');
        }
    });

    eventSource.addEventListener('debug', (event) => {
        output('debug', event.data);
    });

    eventSource.addEventListener('welcome', () => {
        output('welcome', `Hello, ${identity}!`);
    });

};

let currentIdentity = '';

/**
 * @typedef {(...args: string[]) => void} CommandHandler
 */

/**
 * @type {Map<string, CommandHandler>}
 */
const commandHandlerMap = new Map([

    ['/help', /** @type {CommandHandler} */() => {
        output('help', (
            'Available Commands:\n'
            + '/help               -- Print available commands.\n'
            + '/connect <identity> -- Connect to chat server using specific identity.\n'
            + '/disconnect         -- Close current connection.\n'
            + 'Any other message starting with a slash causes an error.')
        );
    }],

    ['/connect', /** @type {CommandHandler} */(identity) => {
        currentIdentity = identity;
        document.title = `${PAGE_TITLE_BASE} (${identity})`;
        output('info', `Set current identity to "${identity}".`);
        setupEventSource(identity);
    }],

    ['/disconnect', /** @type {CommandHandler} */() => {
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        } else {
            output('error', 'No connection to close.');
        }
    }],

]);

const formElement = /** @type {HTMLFormElement} */(
    document.getElementById('form')
);
const inputElement = /** @type {HTMLInputElement} */(
    document.getElementById('input')
);
formElement.addEventListener('submit', () => {

    const submittedContent = inputElement.value;
    inputElement.value = '';

    if (submittedContent.startsWith('/')) {

        const [command, ...params] = submittedContent.split(/\s+/);

        output('command', [command, ...params].join(' '));

        if (!commandHandlerMap.has(command)) {
            output('error', 'Unknown command: ' + submittedContent);
        } else {

            const handler = /** @type {CommandHandler} */(
                commandHandlerMap.get(command)
            );

            const actualParamCount = params.length;
            const expectedParamCount = handler.length;
            if (actualParamCount < expectedParamCount) {
                output('error', (
                    'Not enough params! for'
                    + command
                    + '!\n'
                    + 'expected: '
                    + expectedParamCount
                    + ', actual: '
                    + actualParamCount
                ));
                return;
            }

            handler(...params);

        }

        return;

    }

    if (!currentIdentity) {
        output('error', 'Connect before sending messages!');
        return;
    }

    const requestUrl = '/api/send/' + encodeURIComponent(currentIdentity);
    fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: submittedContent,
    }).catch((error) => {
        output('error', 'Failed to send the message due to an error.');
        console.error(error);
    });

});

output('info', (
    'Welcome to the chatting room!\n'
    + 'Use /help to get available commands.')
);
inputElement.focus();
