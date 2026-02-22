const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('your_stripe_secret_key');
const square = require('square');
const paypal = require('@paypal/checkout-server-sdk');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Configure PayPal client
const paypalClient = paypal.core.LiveEnvironment('client_id', 'client_secret');
const paypalClientContext = new paypal.core.PayPalHttpClient(paypalClient);

// Stripe payment processing route
app.post('/payment/stripe', async (req, res) => {
    const { amount, currency, source } = req.body;
    try {
        const charge = await stripe.charges.create({
            amount,
            currency,
            source,
        });
        res.status(200).json({ success: true, charge });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Square payment processing route
app.post('/payment/square', async (req, res) => {
    const { amount, token } = req.body;
    try {
        const client = new square.Client({
            environment: square.Environment.Production,
            accessToken: 'your_square_access_token',
        });
        const response = await client.paymentsApi.createPayment({
            sourceId: token,
            amountMoney: {
                amount,
                currency: 'USD',
            },
        });
        res.status(200).json({ success: true, response });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PayPal payment processing route
app.post('/payment/paypal', async (req, res) => {
    const { amount } = req.body;
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchaseUnits: [{
            amount: { currencyCode: 'USD', value: amount },
        }],
    });
    try {
        const order = await paypalClientContext.execute(request);
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
