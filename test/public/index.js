// @ts-check
import { PAGE_TITLE_BASE } from './common.js';
import { output } from './output.js';
import { commandHandlerMap, currentIdentity } from './commands.js';

document.title = PAGE_TITLE_BASE;

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

            const handler = /** @type {import('./commands.js').CommandHandler} */(
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
