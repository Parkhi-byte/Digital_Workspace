import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS for local dev frontend
app.use(cors({ origin: true }));

// Stripe needs raw body for webhook signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

  if (!stripe || !webhookSecret) {
    return res.status(200).send('Webhook not configured');
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: provision user/org access based on session
      console.log('Checkout completed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// JSON body after webhook route so it doesn't interfere
app.use(express.json());

// Create Stripe checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const { priceId } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/?checkout=success`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/pricing?checkout=cancelled`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});


