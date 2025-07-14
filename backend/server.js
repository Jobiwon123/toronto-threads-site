require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// CORS setup for local + live frontend
app.use(cors({
  origin: [
    'http://localhost:4242',
    'https://toronto-threads-site.onrender.com'
  ]
}));

app.use(express.json());

// Optional: serve static files if needed (if hosting frontend here too)
// app.use(express.static(path.join(__dirname, '../public')));

// Stripe Checkout Session route
app.post('/create-checkout-session', async (req, res) => {
  const line_items = req.body.cart.map(item => ({
    price_data: {
      currency: 'cad',
      product_data: {
        name: item.product
      },
      unit_amount: Math.round(item.price * 100)
    },
    quantity: 1
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://toronto-threads-site.onrender.com/success.html',
      cancel_url: 'https://toronto-threads-site.onrender.com/',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Checkout session failed' });
  }
});

// Start the server
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
