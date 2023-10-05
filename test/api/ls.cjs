// @ts-check
const { room } = require('../common.cjs');

/**
 * @type {import('express').RequestHandler<{ name: string; }>}
 */
module.exports = (req, res) => {
    res.json(
        Array.from(room.members.values())
            .map((member) => ({
                identity: member.identity,
                timestamps: Object.fromEntries(
                    Array.from(Object.entries(member.timestamps))
                        .map(([key, value]) => ([
                            key,
                            (new Date(value)).toLocaleString(),
                        ]))
                ),
            }))
    );
};
