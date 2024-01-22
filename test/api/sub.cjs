// @ts-check
const SSE = require('3h-sse');
const HR = require('../..');
const {
    room,
    SSE_EVENTS,
    logRequest,
    createSSEController,
} = require('../common.cjs');

/**
 * @type {import('express').RequestHandler<{ name: string; }>}
 */
module.exports = (req, res) => {
    const member = new HR.Member({
        identity: decodeURIComponent(req.params.name),
        response: res,
        sseController: createSSEController(),
    });

    member.on('enter', (_room) => {
        const message = 'member entered: ' + member.identity;
        console.log(message);
        _room.sendEvent(SSE_EVENTS.DEBUG, message);
    });
    member.on('leave', (_room) => {
        const message = 'member left: ' + member.identity;
        console.log(message);
        _room.sendEvent(SSE_EVENTS.DEBUG, message);
    });

    try {
        room.addMember(member);
    } catch (error) {
        res.status(403);
        res.type('text/plain');
        res.end(String(error));
        logRequest(req.method, req.path, 403);
        return;
    }

    res.once('close', () => {
        room.removeMember(member);
    });

    res.status(200);
    logRequest(req.method, req.path, 200);
};
