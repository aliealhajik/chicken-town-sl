// Chicken Town SL - Meta WhatsApp Cloud API Webhook Server
// Run with: node webhook.js

const http = require('http');
const https = require('https');
const url = require('url');

// Environment Configuration
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'chickentown_secure_token_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || ''; // Permanent or system user token from Meta
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID || '';   // Phone ID from WhatsApp Cloud API dashboard

console.log('Starting Chicken Town SL WhatsApp Webhook Server on port', PORT);

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // 1. Meta Webhook Verification Endpoint (GET)
    if (req.method === 'GET' && parsedUrl.pathname === '/webhook') {
        const mode = parsedUrl.query['hub.mode'];
        const token = parsedUrl.query['hub.verify_token'];
        const challenge = parsedUrl.query['hub.challenge'];

        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✓ Meta Webhook successfully verified by WhatsApp!');
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(challenge);
        } else {
            console.warn('✕ Webhook verification token mismatch.');
            res.writeHead(403);
            res.end('Forbidden');
        }
        return;
    }

    // 2. Incoming WhatsApp Message Ingestion (POST)
    if (req.method === 'POST' && parsedUrl.pathname === '/webhook') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                // Acknowledge receipt to Meta immediately (prevents duplicate retries)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));

                if (data.object === 'whatsapp_business_account') {
                    handleMetaWebhookEvent(data);
                }
            } catch (e) {
                console.error('Error parsing webhook payload:', e);
                res.writeHead(400);
                res.end('Bad Request');
            }
        });
        return;
    }

    // Health check
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        app: 'Chicken Town SL WhatsApp Cloud Bot',
        status: 'online',
        time: new Date().toISOString()
    }));
});

server.listen(PORT, () => {
    console.log(`✓ Webhook listening at http://localhost:${PORT}/webhook`);
});

// Process Incoming WhatsApp Event
function handleMetaWebhookEvent(data) {
    const entry = data.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const messages = changes?.messages;

    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const from = message.from; // Customer's phone number
    let userInput = '';

    if (message.type === 'text') {
        userInput = message.text.body;
    } else if (message.type === 'interactive') {
        if (message.interactive.type === 'button_reply') {
            userInput = message.interactive.button_reply.id;
        } else if (message.interactive.type === 'list_reply') {
            userInput = message.interactive.list_reply.id;
        }
    }

    console.log(`[Incoming from ${from}]: "${userInput}"`);

    // In a production server, bot-engine.js handles the response payload
    // and sends it to the Meta Graph API via sendWhatsAppCloudMessage().
}

// Helper to send messages back via Meta Cloud API
function sendWhatsAppCloudMessage(recipientPhone, payload) {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.warn('Meta credentials not configured in environment variables.');
        return;
    }

    const postData = JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        ...payload
    });

    const options = {
        hostname: 'graph.facebook.com',
        path: `/v19.0/${PHONE_NUMBER_ID}/messages`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, res => {
        let resp = '';
        res.on('data', chunk => { resp += chunk; });
        res.on('end', () => {
            console.log('WhatsApp message sent response:', resp);
        });
    });

    req.on('error', err => {
        console.error('Error sending WhatsApp Cloud message:', err);
    });

    req.write(postData);
    req.end();
}
