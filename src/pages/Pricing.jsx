import React from 'react';
import { Check, Zap, Shield, CreditCard } from 'lucide-react';
import { startCheckout } from '../services/payments';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Unlimited Chat',
      '1 Project Board',
      'Video Calls (30 min)',
      'Basic Notifications'
    ],
    cta: 'Get Started',
    priceId: null
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per user / month',
    features: [
      'Unlimited Boards & Projects',
      'AI Summaries & Task Generation',
      'Video Recording & Transcripts',
      'Priority Support'
    ],
    highlight: true,
    cta: 'Upgrade',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || null
  },
  {
    name: 'Enterprise',
    price: 'Let’s talk',
    period: '',
    features: [
      'SSO/SAML, SCIM',
      'Custom Workflows',
      'Advanced Security & Audit',
      'Dedicated Support'
    ],
    cta: 'Contact Sales',
    priceId: null
  }
];

export default function Pricing() {
  const handleSelect = async (tier) => {
    if (tier.priceId) {
      await startCheckout(tier.priceId);
    } else if (tier.name === 'Free') {
      window.location.href = '/signup';
    } else {
      window.location.href = 'mailto:sales@aurora.example.com?subject=Aurora Enterprise Inquiry';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aurora-50 dark:bg-aurora-900/30 text-aurora-700 dark:text-aurora-300 text-sm font-medium border border-aurora-200 dark:border-aurora-800">
          <Shield size={16} /> Secure Checkout Powered by Stripe
        </div>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 dark:text-gray-100">Simple, transparent pricing</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Choose the plan that fits your team today. Scale anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl border p-6 bg-white dark:bg-gray-800 ${tier.highlight ? 'border-aurora-300 dark:border-aurora-700 shadow-xl' : 'border-gray-200 dark:border-gray-700'} `}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{tier.name}</h3>
              {tier.highlight && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-aurora-700 dark:text-aurora-300 bg-aurora-50 dark:bg-aurora-900/30 border border-aurora-200 dark:border-aurora-800 px-2 py-0.5 rounded">
                  <Zap size={14} /> Popular
                </span>
              )}
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{tier.price}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tier.period}</div>
            </div>
            <ul className="mt-6 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Check size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(tier)}
              className={`mt-8 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-colors ${tier.highlight ? 'bg-aurora-600 hover:bg-aurora-700 text-white' : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
            >
              <CreditCard size={18} /> {tier.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Billing FAQs</h2>
        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1">
          <li>Change or cancel your plan anytime.</li>
          <li>Invoices and receipts are emailed after each payment.</li>
          <li>Eligible for discounts on annual billing.</li>
        </ul>
      </div>
    </div>
  );
}


