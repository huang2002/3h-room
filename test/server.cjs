// @ts-check
const path = require('path');
const { STATUS_CODES } = require('http');
const express = require('express');
const SSE = require('3h-sse');
const HR = require('..');

const PORT = 8080;
const STATIC_ROOT = path.join(__dirname, 'public');

const SSE_EVENTS = {
    DEBUG: 'debug',
    WELCOME: 'welcome',
};

const app = express();
const backend = new SSE.NodeJSBackend();
const room = new HR.Room({
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
const logRequest = (method, path, statusCode) => {
    const statusText = STATUS_CODES[statusCode];
    console.log(`${method} ${path} -- ${statusCode} ${statusText}`);
};

// a simple logger
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/sub')) {
        res.once('close', () => {
            logRequest(
                req.method,
                req.path,
                res.statusCode,
            );
        });
    }
    next();
});

app.get('/api/sub/:name', (req, res) => {

    const member = new HR.Member({
        identity: decodeURIComponent(req.params.name),
        response: res,
        sseController: new SSE.SSEController({
            backend,
        }),
    });

    try {
        room.addMember(member);
    } catch (error) {
        res.status(403);
        res.end(String(error));
        return;
    }

    res.once('close', () => {
        room.removeMember(member);
        room.sendEvent(SSE_EVENTS.DEBUG, 'member left: ' + member.identity);
    });

    room.sendEvent(SSE_EVENTS.DEBUG, 'member entered: ' + member.identity);
    member.sendEvent(SSE_EVENTS.WELCOME);

    res.status(200);
    logRequest(req.method, req.path, 200);

});

app.post('/api/send/:name', express.text(), (req, res) => {

    const senderIdentity = decodeURIComponent(req.params.name);

    const messageData = JSON.stringify({
        sender: senderIdentity,
        message: req.body,
    });
    room.sendVerbatim(`data: ${messageData}\n\n`);

    room.members.get(senderIdentity)?.sendEvent('echo');

    res.status(200);
    res.end();

});

app.use(express.static(STATIC_ROOT));

app.listen(PORT, () => {
    console.log(`Test server started at localhost:${PORT}...`);
});
