require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..')));

// Default route to serve your HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../toronto_clothing_store.html'));
});

// Stripe checkout route
app.post('/create-checkout-session', async (req, res) => {
  const line_items = req.body.cart.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: { name: item.product },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:4242/success.html',
      cancel_url: 'http://localhost:4242/',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start server
app.listen(4242, () => console.log('✅ Server running at http://localhost:4242'));
