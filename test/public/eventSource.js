// @ts-check
import { PAGE_TITLE_BASE } from './common.js';
export let currentIdentity = '';
import { output } from './output.js';

/**
 * @type {EventSource | null}
 */
export let eventSource = null;

export const closeEventSource = () => {
    if (!eventSource) {
        return;
    }
    eventSource.close();
    eventSource = null;
};

/**
 * @param {string} identity
 */
export const setupEventSource = (identity) => {

    if (eventSource) {
        closeEventSource();
        output('info', 'Closed previous connection.');
    }

    const eventSourceUrl = '/api/sub/' + encodeURIComponent(identity);
    eventSource = new EventSource(eventSourceUrl);

    eventSource.addEventListener('open', () => {
        currentIdentity = identity;
        document.title = `${PAGE_TITLE_BASE} (${identity})`;
        output('info', `Connection established. (identity: ${identity})`);
    });

    eventSource.addEventListener('error', (event) => {
        output('info', `Connection lost due to an error. (identity: ${identity})`);
        console.error(event);
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
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
