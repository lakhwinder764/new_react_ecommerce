require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn(
    'STRIPE_SECRET_KEY is not set. Checkout will fail until you add it to server/.env'
  );
}
const stripe = require('stripe')(stripeSecret || 'sk_test_placeholder');

const PORT = process.env.PORT || 7000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(express.json());
app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { products } = req.body;

    if (!products?.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const lineItems = products.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item?.name,
        },
        unit_amount: item?.price,
      },
      quantity: item?.amount,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 5000,
              currency: 'inr',
            },
            display_name: 'Next day air',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 1 },
            },
          },
        },
      ],
      payment_method_types: ['card'],
      success_url: `${CLIENT_URL}/success`,
      cancel_url: `${CLIENT_URL}/cart`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.info(`Checkout server running on http://localhost:${PORT}`);
});
