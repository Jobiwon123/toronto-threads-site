require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// ✅ Enable CORS with preflight support
app.use(cors({
  origin: 'https://toronto-threads-site.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ✅ Add this health-check route so Render doesn't return 404
app.get('/', (req, res) => {
  res.send('Backend is live!');
});

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
      success_url: 'https://toronto-threads-site.onrender.com/success.html',
      cancel_url: 'https://toronto-threads-site.onrender.com/',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start the server on Render’s dynamic port
const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
