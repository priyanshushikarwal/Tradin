import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  LineChart,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Bell,
  Wallet,
  Users,
  BookOpen,
  Lightbulb,
  ArrowRight,
  Check,
  Globe,
  Smartphone,
  Lock,
  PieChart
} from 'lucide-react'

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: LineChart,
      title: 'Advanced Charting',
      description: 'Professional TradingView charts with candlesticks, indicators like MA, RSI, MACD, Bollinger Bands, and drawing tools.',
      highlights: ['Multiple timeframes', 'Technical indicators', 'Drawing tools', 'Real-time updates'],
    },
    {
      icon: TrendingUp,
      title: 'Paper Trading',
      description: 'Practice trading with virtual funds. Execute market, limit, stop-loss, and take-profit orders without real risk.',
      highlights: ['Market & limit orders', 'Stop-loss & take-profit', 'Order modification', 'Trade history'],
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Learn to manage risk with position sizing, margin calculations, and max loss controls.',
      highlights: ['Margin calculator', 'Position sizing', 'Max loss limits', 'Kill switch'],
    },
    {
      icon: BarChart3,
      title: 'Portfolio Analytics',
      description: 'Track your investments with detailed analytics, P&L tracking, and performance reports.',
      highlights: ['P&L tracking', 'Asset allocation', 'Day change', 'Downloadable reports'],
    },
    {
      icon: Bell,
      title: 'Price Alerts',
      description: 'Set price alerts and get notified when instruments reach your target prices.',
      highlights: ['Custom triggers', 'Multiple conditions', 'Instant notifications', 'Alert history'],
    },
    {
      icon: Lightbulb,
      title: 'Strategy Builder',
      description: 'Create and backtest trading strategies with our rule-based strategy builder.',
      highlights: ['Rule-based logic', 'Backtesting', 'Performance analytics', 'Strategy templates'],
    },
  ]

  const additionalFeatures = [
    { icon: Globe, title: 'Multi-Asset Trading', description: 'Stocks, indices, commodities, forex, and crypto' },
    { icon: Smartphone, title: 'Mobile Responsive', description: 'Trade from any device, anywhere' },
    { icon: Lock, title: 'Secure Platform', description: 'Bank-grade security with 2FA' },
    { icon: PieChart, title: 'Market Analysis', description: 'News, economic calendar, and earnings' },
    { icon: Wallet, title: 'Virtual Wallet', description: 'Manage demo funds and transactions' },
    { icon: BookOpen, title: 'Learning Center', description: 'Tutorials, glossary, and guides' },
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
            Powerful Features for
            <span className="text-gradient"> Serious Traders</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Everything you need to learn, practice, and master trading. Professional tools 
            in an intuitive interface.
          </p>
          <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Main Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 lg:p-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-6">{feature.description}</p>
              <ul className="space-y-2">
                {feature.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-[#12131a]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">And Much More...</h2>
            <p className="text-gray-400">
              Discover all the tools and features designed to help you succeed.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Experience These Features?
            </h2>
            <p className="text-gray-400 mb-8">
              Create your free account and start trading with ₹500 NPR demo balance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn-primary">
                Start Trading Free
              </Link>
              <Link to="/how-it-works" className="btn-glass">
                See How It Works
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default FeaturesPage
