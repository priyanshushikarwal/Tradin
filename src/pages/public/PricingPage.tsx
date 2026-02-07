import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, X, ArrowRight, Sparkles } from 'lucide-react'

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for beginners to learn and practice',
      features: [
        { text: '₹500 NPR demo balance', included: true },
        { text: 'Basic charting tools', included: true },
        { text: 'Market & limit orders', included: true },
        { text: 'Portfolio tracking', included: true },
        { text: 'Learning resources', included: true },
        { text: 'Email support', included: true },
        { text: 'Advanced indicators', included: false },
        { text: 'Strategy builder', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro',
      price: '₹499',
      period: '/month',
      description: 'For serious traders who want advanced tools',
      features: [
        { text: '₹10,000 NPR demo balance', included: true },
        { text: 'Advanced charting tools', included: true },
        { text: 'All order types', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Strategy builder', included: true },
        { text: 'Backtesting', included: true },
        { text: 'Price alerts (unlimited)', included: true },
        { text: 'Priority support', included: true },
        { text: 'API access', included: false },
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For institutions and professional traders',
      features: [
        { text: 'Unlimited demo balance', included: true },
        { text: 'All Pro features', included: true },
        { text: 'API access', included: true },
        { text: 'White-label options', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'SLA guarantee', included: true },
        { text: 'Training & onboarding', included: true },
        { text: '24/7 phone support', included: true },
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ]

  const feeStructure = [
    { item: 'Account Opening', fee: 'Free' },
    { item: 'Demo Trading', fee: 'Free' },
    { item: 'Profitable Trade Commission', fee: '5% of profit' },
    { item: 'Withdrawal Processing', fee: '₹25 per request' },
    { item: 'Deposit Processing', fee: 'Free' },
    { item: 'Account Maintenance', fee: 'Free' },
  ]

  return (
    <div className="py-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Simple, Transparent
            <span className="text-gradient"> Pricing</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Start free and upgrade as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`glass-card p-8 relative ${
                plan.popular ? 'border-purple-500 ring-1 ring-purple-500/20' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-blue rounded-full text-white text-sm font-medium flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-400' : 'text-gray-500'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-glass'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 bg-[#12131a]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Fee Structure</h2>
            <p className="text-gray-400">
              Transparent fees with no hidden charges. You only pay when you profit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card overflow-hidden"
          > 
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Item</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Fee</th>
                </tr>
              </thead>
              <tbody>
                {feeStructure.map((row) => (
                  <tr key={row.item} className="border-b border-white/10 last:border-0">
                    <td className="py-4 px-6 text-white">{row.item}</td>
                    <td className="py-4 px-6 text-right">
                      <span className={`font-semibold ${row.fee === 'Free' ? 'text-emerald-400' : 'text-white'}`}>
                        {row.fee}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <p className="text-center text-gray-400 text-sm mt-6">
            * Commission is only charged on profitable trades. No fee on losing trades.
          </p>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Have Questions?</h2>
          <p className="text-gray-400 mb-6">
            Check our FAQ or contact our support team for more information.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/faq" className="btn-glass">
              View FAQ
            </Link>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              Contact Us
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PricingPage
