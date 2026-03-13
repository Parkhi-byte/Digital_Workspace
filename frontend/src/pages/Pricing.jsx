import React from 'react';
import { Check, Zap, Shield, CreditCard, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const tiers = [
  {
    name: 'Free',
    price: '₹0',
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
    color: 'from-blue-400 to-cyan-400',
    iconBg: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/10'
  },
  {
    name: 'Pro',
    price: '₹999',
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
    priceId: null,
    color: 'from-indigo-500 to-purple-600',
    iconBg: 'from-indigo-500 to-purple-600',
    shadow: 'shadow-indigo-500/30'
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
    color: 'from-fuchsia-500 to-pink-500',
    iconBg: 'from-fuchsia-500 to-pink-500',
    shadow: 'shadow-fuchsia-500/10'
  }
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 18 } }
};

export default function Pricing() {
  const handleSelect = (tier) => {
    if (tier.name === 'Enterprise') {
      window.location.href = 'mailto:sales@aurora.example.com?subject=Aurora Enterprise Inquiry';
    } else {
      window.location.href = '/signup';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/30 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 text-sm font-bold mb-8 shadow-lg"
          >
            <Sparkles size={16} />
            Simple, Transparent Pricing
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Choose the plan that fits{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              your team
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Start for free, upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={cardVariants}
              whileHover={{ y: tier.highlight ? -8 : -6 }}
              className={`relative ${tier.highlight ? 'md:-mt-4' : ''}`}
            >
              {/* Pro glow ring */}
              {tier.highlight && (
                <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-sm opacity-60 animate-pulse-glow" />
              )}

              <div className={`relative rounded-3xl p-8 backdrop-blur-xl border transition-all duration-300 ${tier.shadow} shadow-xl ${tier.highlight
                  ? 'bg-white dark:bg-gray-800 border-indigo-200/50 dark:border-indigo-700/50'
                  : 'bg-white/70 dark:bg-gray-800/70 border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl'
                }`}>

                {/* Most Popular badge */}
                {tier.highlight && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-1.5 rounded-full text-sm font-black shadow-lg shadow-indigo-500/30 flex items-center gap-1.5">
                      <Zap size={14} fill="currentColor" /> Most Popular
                    </span>
                  </motion.div>
                )}

                {/* Plan icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.iconBg} flex items-center justify-center mb-6 shadow-lg`}>
                  {tier.name === 'Free' && <Sparkles size={22} className="text-white" />}
                  {tier.name === 'Pro' && <Zap size={22} className="text-white" fill="currentColor" />}
                  {tier.name === 'Enterprise' && <Shield size={22} className="text-white" />}
                </div>

                {/* Plan info */}
                <div className="mb-8">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-black text-gray-900 dark:text-white">{tier.price}</span>
                    {tier.price !== 'Custom' && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {tier.name === 'Enterprise'
                      ? 'For large organizations'
                      : tier.name === 'Pro'
                        ? 'For growing teams'
                        : 'For individuals & small teams'}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3.5 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1 rounded-full bg-gradient-to-br ${tier.color} text-white shadow-sm shrink-0`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(tier)}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${tier.highlight
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-md'
                    }`}
                >
                  <span>{tier.cta}</span>
                  {tier.name === 'Enterprise' ? <Mail size={16} /> : <ArrowRight size={16} />}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md text-gray-600 dark:text-gray-400 text-sm font-medium">
            <Shield size={16} className="text-emerald-500" />
            <span>Secure payments · 30-day money-back guarantee · Cancel anytime</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
