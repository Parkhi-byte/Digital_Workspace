import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

function getStripe() {
  if (!stripePromise) {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

export async function startCheckout(priceId) {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      alert('Stripe not configured. Set VITE_STRIPE_PUBLISHABLE_KEY and price IDs.');
      return;
    }
    await stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      successUrl: window.location.origin + '/?checkout=success',
      cancelUrl: window.location.origin + '/pricing?checkout=cancelled'
    });
  } catch (e) {
    console.error(e);
    alert('Unable to start checkout. Please try again later.');
  }
}


