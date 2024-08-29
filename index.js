const express = require('express');
const Stripe = require('stripe');
const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Replace with your secret key

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/payment', async (req, res) => {
  const { email, amount, currency, description } = req.body; // Add description here

  try {
    // Get or create customer based on email
    let customer = await stripe.customers.list({ email, limit: 1 });
    if (customer.data.length === 0) {
      customer = await stripe.customers.create({ email });
    } else {
      customer = customer.data[0];
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: currency,
      customer: customer.id,
      description: description, // Add description here
      setup_future_usage: 'off_session', // To save the payment method for future payments
    });

    // Create an ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2022-08-01' }
    );

    res.status(200).json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5050, () => {
  console.log(`Server running at http://localhost:5050`);
});

