// server.js
require('dotenv').config();
const stripe = require('stripe');
const express = require('express');
const { handlePaymentIntentSucceeded, sendPaymentToServer } = require('./services/payment');
const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            // Then define and call a method to handle the successful payment intent.
            handlePaymentIntentSucceeded(paymentIntent).then(dataToSend => {
                sendPaymentToServer(dataToSend);
            });
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            break;
        
        case 'customer.created.':
            const customer = event.data.object;
            // Then define and call a method to handle the successful creation of a customer.
            // handleCustomerCreated(customer);
            break;

        case 'customer.updated':
            const customer2 = event.data.object;
            // Then define and call a method to handle the successful update of a customer.
            // handleCustomerUpdated(customer);
            break;
        // ... handle other event types
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

const port = process.env.PORT || 4242;
app.listen(port, () => console.log('Running on port ' + port));