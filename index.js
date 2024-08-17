const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const VERIFY_TOKEN = 'pagebot';

// Parse application/json
app.use(bodyParser.json());

// Root route to handle GET requests to "/"
app.get('/', (req, res) => {
    res.send('Welcome to the Facebook Webhook!');
});

// Verification endpoint
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Webhook event handling endpoint
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const webhook_event = entry.messaging[0];
            console.log(webhook_event);
            // Process the event here
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
