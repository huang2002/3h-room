import { PAGE_TITLE_BASE } from './common.js';
import { output } from './output.js';
import { setupEventSource, eventSource, closeEventSource } from './eventSource.js';

export let currentIdentity = '';

/**
 * @typedef {(...args: string[]) => void} CommandHandler
 */

/**
 * @type {Map<string, CommandHandler>}
 */
export const commandHandlerMap = new Map([

    ['/help', /** @type {CommandHandler} */() => {
        output('help', (
            'Available Commands:\n'
            + '/help               -- Print available commands.\n'
            + '/connect <identity> -- Connect to chat server using specific identity.\n'
            + '/disconnect         -- Close current connection.\n'
            + '/ls                 -- Show room members.'
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
            closeEventSource();
        } else {
            output('error', 'No connection to close.');
        }
    }],

    ['/ls', /** @type {CommandHandler} */async () => {
        try {
            const response = await fetch('/api/ls');
            /**
             * @type {string[]}
             */
            const memberList = await response.json();
            output('ls', memberList.join('\n'));
        } catch (error) {
            console.error(error);
            output('error', '/ls failed due to an error.');
        }
    }],

]);
