// @ts-check
const SSE = require('3h-sse');
const HR = require('../..');
const { room, SSE_EVENTS, logRequest, backend } = require('../common.cjs');

/**
 * @type {import('express').RequestHandler<{ name: string; }>}
 */
module.exports = (req, res) => {

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
        res.type('text/plain');
        res.end(String(error));
        logRequest(req.method, req.path, 403);
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

};
