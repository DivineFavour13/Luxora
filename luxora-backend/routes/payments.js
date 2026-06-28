const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/payments/create-intent
// Creates a Stripe Payment Intent and returns the client secret
router.post('/create-intent', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Stripe requires amount in smallest currency unit (kobo for NGN, cents for USD)
    // Since I'm using USD for Stripe (NGN not supported), convert from NGN to USD
    // Using approximate rate: 1 USD = 1600 NGN
    const NGN_TO_USD_RATE = 1600;
    const amountInUSD = Math.round((amount / NGN_TO_USD_RATE) * 100); // in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInUSD,
      currency: 'usd',
      metadata: {
        userId: req.user.id.toString(),
        userEmail: req.user.email,
        originalAmountNGN: amount.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amountUSD: (amountInUSD / 100).toFixed(2),
    });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;