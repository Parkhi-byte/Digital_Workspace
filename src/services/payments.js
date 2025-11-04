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
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    
    // Create checkout session on backend
    const response = await fetch(`${backendUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    
    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (e) {
    console.error(e);
    alert('Unable to start checkout. Please try again later.');
  }
}


