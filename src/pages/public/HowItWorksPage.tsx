import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  UserPlus,
  Search,
  LineChart,
  TrendingUp,
  PieChart,
  GraduationCap,
  ArrowRight,
  Check
} from 'lucide-react'

const HowItWorksPage = () => {
  const steps = [
    {
      icon: UserPlus,
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up with your email or phone number. Get ₹500 NPR demo balance instantly credited to your account.',
      details: [
        'Quick signup with email/phone',
        'Instant ₹500 NPR demo balance',
        'No credit card required',
        'Complete KYC for full access',
      ],
    },
    {
      icon: Search,
      number: '02',
      title: 'Explore the Markets',
      description: 'Browse through stocks, indices, commodities, forex, and crypto. Add your favorites to the watchlist.',
      details: [
        'Live market simulation',
        'Multiple asset classes',
        'Custom watchlists',
        'Market news & analysis',
      ],
    },
    {
      icon: LineChart,
      number: '03',
      title: 'Analyze with Charts',
      description: 'Use professional charts with technical indicators, drawing tools, and multiple timeframes.',
      details: [
        'TradingView charts',
        'Technical indicators',
        'Multiple timeframes',
        'Pattern recognition',
      ],
    },
    {
      icon: TrendingUp,
      number: '04',
      title: 'Place Your Trades',
      description: 'Execute buy and sell orders using market, limit, stop-loss, or take-profit orders.',
      details: [
        'Market & limit orders',
        'Stop-loss protection',
        'Take-profit targets',
        'Order modification',
      ],
    },
    {
      icon: PieChart,
      number: '05',
      title: 'Track Your Portfolio',
      description: 'Monitor your holdings, track P&L, and analyze your trading performance.',
      details: [
        'Real-time P&L',
        'Portfolio analytics',
        'Trade history',
        'Performance reports',
      ],
    },
    {
      icon: GraduationCap,
      number: '06',
      title: 'Learn & Improve',
      description: 'Access learning resources, analyze your mistakes, and continuously improve your strategies.',
      details: [
        'Learning modules',
        'Trading tutorials',
        'Strategy backtesting',
        'Community insights',
      ],
    },
  ]

  return (
    <div className="py-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            How <span className="text-gradient">TradeX</span> Works
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Start your paper trading journey in minutes. Follow these simple steps 
            to begin practicing and improving your trading skills.
          </p>
        </motion.div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col lg:flex-row items-center gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Content */}
              <div className="flex-1 glass-card p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-4xl font-bold text-white/10">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 mb-6">{step.description}</p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {step.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-gray-400">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="flex-1 h-64 lg:h-80 w-full rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                <step.icon className="w-24 h-24 text-purple-400/30" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#12131a]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Journey Today
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of traders practicing on TradeX. It's free and takes less than a minute.
            </p>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HowItWorksPage
