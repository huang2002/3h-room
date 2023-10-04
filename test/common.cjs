// @ts-check
const path = require('path');
const SSE = require('3h-sse');
const HR = require('..');
const { STATUS_CODES } = require('http');

exports.PORT = 8080;
exports.STATIC_ROOT = path.join(__dirname, 'public');

exports.SSE_EVENTS = {
    DEBUG: 'debug',
    WELCOME: 'welcome',
};

const backend = new SSE.NodeJSBackend();
exports.backend = backend;
exports.room = new HR.Room({
    maxMemberCount: 2,
    sseController: new SSE.SSEController({
        backend,
    }),
});

/**
 * @param {string} method
 * @param {string} path
 * @param {number} statusCode
*/
exports.logRequest = (method, path, statusCode) => {
    const statusText = STATUS_CODES[statusCode];
    console.log(`${method} ${path} -- ${statusCode} ${statusText}`);
};
