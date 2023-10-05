// @ts-check
const { room } = require('../common.cjs');

/**
 * @type {import('express').RequestHandler<{ name: string; }>}
 */
module.exports = (req, res) => {
    res.json(
        Array.from(room.members.values())
            .map((member) => (member.identity))
    );
};
