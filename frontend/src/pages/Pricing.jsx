import React from 'react';
import { Check, Zap, Shield, CreditCard, Sparkles } from 'lucide-react';
import { startCheckout } from '../services/payments';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Unlimited Chat History',
      '1 Project Board',
      'Video Calls (up to 45 min)',
      'Basic File Sharing (5GB)',
      'Community Support'
    ],
    cta: 'Get Started',
    priceId: null,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per user / month',
    features: [
      'Unlimited Boards & Projects',
      'AI Summaries & Task Generation',
      'Unlimited Video Recording',
      'Advanced File Sharing (1TB)',
      'Priority Email Support',
      'Guest Access'
    ],
    highlight: true,
    cta: 'Upgrade to Pro',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || null,
    color: 'from-aurora-500 to-purple-600'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'billed annually',
    features: [
      'SSO/SAML & SCIM Provisioning',
      'Custom Workflows & API Access',
      'Advanced Security & Audit Logs',
      'Dedicated Success Manager',
      '24/7 Phone Support',
      'On-premise Deployment Option'
    ],
    cta: 'Contact Sales',
    priceId: null,
    color: 'from-orange-400 to-pink-500'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-aurora-50 dark:bg-aurora-900/30 border border-aurora-200 dark:border-aurora-800 text-aurora-700 dark:text-aurora-300 text-sm font-medium mb-8 backdrop-blur-sm shadow-sm">
          <Sparkles size={16} className="mr-2" />
          Simple, Transparent Pricing
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          Choose the plan that fits your <span className="bg-clip-text text-transparent bg-gradient-to-r from-aurora-500 to-purple-600">team's needs</span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Start for free, upgrade when you need more power. No hidden fees, cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-3xl p-8 transition-all duration-300 ${tier.highlight
                ? 'bg-white dark:bg-gray-800 shadow-2xl scale-105 border-2 border-aurora-500 z-10'
                : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1'
              }`}
          >
            {tier.highlight && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-aurora-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <Zap size={14} fill="currentColor" /> Most Popular
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{tier.price}</span>
                {tier.price !== 'Custom' && <span className="text-gray-500 dark:text-gray-400">{tier.period}</span>}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {tier.name === 'Enterprise' ? 'For large organizations' : tier.name === 'Pro' ? 'For growing teams' : 'For individuals & small teams'}
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className={`mt-0.5 p-0.5 rounded-full bg-gradient-to-br ${tier.color} text-white`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect(tier)}
              className={`w-full py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${tier.highlight
                  ? 'bg-gradient-to-r from-aurora-600 to-purple-600 hover:from-aurora-700 hover:to-purple-700 text-white hover:shadow-aurora-500/25'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <Shield size={16} className="text-emerald-500" />
          <span>Secure payments powered by Stripe. 30-day money-back guarantee.</span>
        </div>
      </div>
    </div>
  );
}
