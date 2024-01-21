# 3h-room

> A simple lib for SSE room management.

## Example

Here's an example SSE room server based on express:

```js
const express = require('express');
const SSE = require('3h-sse');
const HR = require('3h-room');

const app = express();

const backend = new SSE.NodeJSBackend();
const room = new HR.Room({
    maxMemberCount: 2,
    sseController: new SSE.SSEController({
        backend,
    }),
});

app.get('/sub/:name', (req, res) => {

    const member = new HR.Member({
        identity: decodeURIComponent(req.params.name),
        response: res,
        sseController: new SSE.SSEController({
            backend,
        }),
    });

    member.on('enter', (_room) => {
        _room.sendEvent('debug', 'member entered: ' + member.identity);
    });
    member.on('leave', (_room) => {
        _room.sendEvent('debug', 'member left: ' + member.identity);
    });

    try {
        room.addMember(member);
    } catch (error) {
        res.status(403);
        res.end();
        return;
    }

    res.once('close', () => {
        room.removeMember(member);
    });

    member.sendEvent('info', 'welcome');

});

app.listen(8080);
```

## Links

- [API Reference](https://github.com/huang2002/3h-room/wiki)
- [Changelog](./CHANGELOG.md)
- [License (ISC)](./LICENSE)
