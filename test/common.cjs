// @ts-check
const path = require('path');
const SSE = require('3h-sse');
const HR = require('..');
const { STATUS_CODES } = require('http');

exports.PORT = 8080;
exports.STATIC_ROOT = path.join(__dirname, 'public');

const SSE_EVENTS = {
    DEBUG: 'debug',
    WELCOME: 'welcome',
};
exports.SSE_EVENTS = SSE_EVENTS;

const createSSEController = () =>
    new SSE.SSEController({
        backend: new SSE.NodeJSBackend(),
    });
exports.createSSEController = createSSEController;

const room = new HR.Room({
    maxMemberCount: 3,
    sseController: createSSEController(),
});
room.on(
    'enter',
    /**
     * @param {HR.Member} member
     */
    (member) => {
        member.sendEvent(SSE_EVENTS.WELCOME, '');
    },
).on(
    'leave',
    /**
     * @param {HR.Member} member
     */
    (member) => {
        member.sendEvent(SSE_EVENTS.DEBUG, `See ya, ${member.identity}~`);
    },
);
exports.room = room;

/**
 * @param {string} method
 * @param {string} path
 * @param {number} statusCode
 */
exports.logRequest = (method, path, statusCode) => {
    const statusText = STATUS_CODES[statusCode];
    console.log(`${method} ${path} -- ${statusCode} ${statusText}`);
};
