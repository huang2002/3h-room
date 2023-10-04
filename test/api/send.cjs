// @ts-check
const { room } = require('../common.cjs');

/**
 * @type {import('express').RequestHandler<{ name: string; }>}
 */
module.exports = (req, res) => {

    const senderIdentity = decodeURIComponent(req.params.name);

    const messageData = JSON.stringify({
        sender: senderIdentity,
        message: req.body,
    });
    room.sendVerbatim(`data: ${messageData}\n\n`);

    room.members.get(senderIdentity)?.sendEvent('echo');

    res.status(200);
    res.end();

};
