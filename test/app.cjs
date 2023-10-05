// @ts-check
const express = require('express');
const { STATIC_ROOT, PORT, logRequest } = require('./common.cjs');
const subHandler = require('./api/sub.cjs');
const sendHandler = require('./api/send.cjs');
const lsHandler = require('./api/ls.cjs');

const app = express();

// a simple logger
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/sub')) {
        res.once('close', () => {
            logRequest(req.method, req.path, res.statusCode);
        });
    }
    next();
});

app.get('/api/sub/:name', subHandler);
app.post('/api/send/:name', express.text(), sendHandler);
app.get('/api/ls', lsHandler);

app.use(express.static(STATIC_ROOT));

app.listen(PORT, () => {
    console.log(`Test server started at localhost:${PORT}...`);
});
