
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

async function handlePaymentIntentSucceeded(paymentIntent) {
    // const order_id = paymentIntent.description.split('#')[1].split(',')[0];
    let order_id = '';
    let product_id = '';

    if (paymentIntent.description.includes('Basement Beast Sales')) {
        order_id = paymentIntent.description.split('#')[1].split(',')[0];
        product_id = paymentIntent.description.split('#')[2].split(':')[0]
    } else if (paymentIntent.description.includes('Shop - Order')) {
        // example: Basement Beast - Shop - Order 155468
        order_id = paymentIntent.description.split('Order')[1].trim();
    }

    const getUserData = (customer) => {

        const firstName = customer.name.split(' ')[0];
        const lastName = customer.name.split(' ')[1];
        const ammount = paymentIntent.amount / 100;

        let dataToSend = {
            order_id,
            'payment_intent_id': paymentIntent.id,
            'customer_stripe_id': customer.id,
            first_name: firstName,
            last_name: lastName,
            email: customer.email,
            ammount,
            product_id,
        };

        console.log(`
            -----------------
            PaymentIntent for ${paymentIntent.amount} was successful!
            -----------------`);
        const description = paymentIntent.description;
        console.log(`
            -----------------
            PaymentIntent description: ${description} 
            -----------------`);

        console.log(`
            -----------------
            PaymentIntent customer: ${customer.id}
            -----------------`);

        console.log(`
            -----------------
            PaymentIntent customer full name: ${firstName} ${lastName} and email: ${customer.email}
            -----------------`);

        return dataToSend;
    }

    if (paymentIntent.customer === null) {
        // customer is null, so we need to create a customer
        const customer = await stripe.customers.create({
            email: paymentIntent.receipt_email,
            name: paymentIntent.shipping.name,
            phone: paymentIntent.shipping.phone,
        });

        // update the payment intent with the customer id
        await stripe.paymentIntents.update(paymentIntent.id, {
            customer: customer.id,
        });
        const userData = getUserData(customer);

        return userData;

    } else {
        // customer is not null, so we can just get the customer
        const customer = await stripe.customers.retrieve(
            paymentIntent.customer
        );
        const userData = getUserData(customer)

        return userData;
    }
}

async function sendPaymentToServer(dataToSend) {

    // mi webhook tester id
    // const response = await axios.post('https://webhook.site/d0949635-aa98-46e8-ba6b-634e05486739', {

    // const response = await fetch('https://webhook.site/dcdccb27-f1bb-42f4-9a1b-d059ce98c57f', {
         // mi webhook tester id
    // const response = await fetch('https://webhook.site/d0949635-aa98-46e8-ba6b-634e05486739', {

    const response = await fetch('https://webhook.site/dcdccb27-f1bb-42f4-9a1b-d059ce98c57f', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    });
    // const data = await response.json();
    // console.log('Success:', response);
}

module.exports = {
    handlePaymentIntentSucceeded,
    sendPaymentToServer,
}