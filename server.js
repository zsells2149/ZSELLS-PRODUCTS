// server.js

const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
app.use(bodyParser.json());

// Set up PayPal environment
const clientId = 'YOUR_PAYPAL_CLIENT_ID';
const clientSecret = 'YOUR_PAYPAL_CLIENT_SECRET';
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

app.post('/api/payment/stripe', async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
        });
        res.status(200).send(paymentIntent);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/api/payment/paypal', async (req, res) => {
    const { amount } = req.body;
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: amount,
            },
        }],
    });
    try {
        const order = await client.execute(request);
        res.status(200).send(order.result);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
