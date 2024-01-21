// @ts-check
import { output } from './output.js';
import { setupEventSource, eventSource, closeEventSource } from './eventSource.js';

/**
 * @typedef {(...args: string[]) => (void | Promise<void>)} CommandHandler
 */

/**
 * @typedef {{
 *     identity: string;
 *     timestamps: import('../..').MemberTimestamps;
 * }} MemberListItem
 */

/**
 * @type {Map<string, CommandHandler>}
 */
export const commandHandlerMap = new Map([

    ['/help', /** @type {CommandHandler} */() => {
        output('help', (
            'Available Commands:\n'
            + '/help             -- Print available commands.\n'
            + '/login <identity> -- Connect to chat server using specific identity.\n'
            + '/quit             -- Close current connection.\n'
            + '/ls               -- Show room members.\n'
            + 'Any other message starting with a slash causes an error.')
        );
    }],

    ['/login', /** @type {CommandHandler} */(identity) => {
        setupEventSource(identity);
    }],

    ['/quit', /** @type {CommandHandler} */() => {
        if (eventSource) {
            closeEventSource();
        } else {
            output('error', 'No connection to close.');
        }
    }],

    ['/ls', /** @type {CommandHandler} */(async () => {
        try {
            const response = await fetch('/api/ls');
            const memberList = /** @type {MemberListItem[]} */(
                await response.json()
            );
            if (memberList.length) {
                output('ls', (
                    memberList
                        .map((member) => (
                            member.identity
                            + ' '
                            + JSON.stringify(member.timestamps, null, 2)
                        ))
                        .join('\n'))
                );
            } else {
                output('ls', 'No room members.');
            }
        } catch (error) {
            console.error(error);
            output('error', '/ls failed due to an error.');
        }
    })],

]);
