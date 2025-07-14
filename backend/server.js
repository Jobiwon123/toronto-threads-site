require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// ✅ Enable CORS globally, including preflight requests
const allowedOrigin = 'https://toronto-threads-site.onrender.com';

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

// ✅ Explicitly handle preflight OPTIONS requests
app.options('*', cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Health check route for Render
app.get('/', (req, res) => {
  res.send('Backend is live!');
});

// ✅ Stripe checkout session route
app.post('/create-checkout-session', async (req, res) => {
  try {
    const line_items = req.body.cart.map(item => ({
      price_data: {
        currency: 'cad',
        product_data: { name: item.product },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

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
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
