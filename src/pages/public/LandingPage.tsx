import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent } from 'react'
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Star,
  ChevronRight,
  Lock,
  Activity,
  Globe,
} from 'lucide-react'

// 3D Card Component
const Card3D = ({ 
  children, 
  className = '',
  glowColor = 'rgba(99, 102, 241, 0.3)'
}: { 
  children: React.ReactNode
  className?: string
  glowColor?: string
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    setRotateX(-mouseY / 10)
    setRotateY(mouseX / 10)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`relative ${className}`}
    >
      <div 
        className="absolute inset-0 rounded-2xl blur-xl opacity-50 -z-10"
        style={{ background: glowColor }}
      />
      {children}
    </motion.div>
  )
}

// Animated Chart Component
const AnimatedChart = () => {
  const [points, setPoints] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Generate initial points
    const initialPoints = []
    let value = 50
    for (let i = 0; i < 100; i++) {
      value += (Math.random() - 0.48) * 8
      value = Math.max(20, Math.min(80, value))
      initialPoints.push(value)
    }
    setPoints(initialPoints)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev.slice(1)]
        let lastValue = newPoints[newPoints.length - 1] || 50
        lastValue += (Math.random() - 0.45) * 6
        lastValue = Math.max(20, Math.min(80, lastValue))
        newPoints.push(lastValue)
        return newPoints
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || points.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Create gradient for line
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0)
    lineGradient.addColorStop(0, '#8B5CF6')
    lineGradient.addColorStop(0.5, '#06B6D4')
    lineGradient.addColorStop(1, '#22C55E')

    // Create gradient for fill
    const fillGradient = ctx.createLinearGradient(0, 0, 0, height)
    fillGradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    fillGradient.addColorStop(1, 'rgba(139, 92, 246, 0)')

    // Draw filled area
    ctx.beginPath()
    ctx.moveTo(0, height)
    points.forEach((point, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - (point / 100) * height
      if (i === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(width, height)
    ctx.closePath()
    ctx.fillStyle = fillGradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    points.forEach((point, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - (point / 100) * height
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.strokeStyle = lineGradient
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    // Draw glowing dot at the end
    const lastX = width
    const lastY = height - (points[points.length - 1] / 100) * height
    
    ctx.beginPath()
    ctx.arc(lastX - 2, lastY, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#22C55E'
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(lastX - 2, lastY, 10, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
    ctx.fill()

  }, [points])

  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={200}
      className="w-full h-full"
    />
  )
}

const LandingPage = () => {
  const [btcPrice, setBtcPrice] = useState(96432.80)
  const [btcChange] = useState(2.45)
  const [portfolioValue] = useState(1240000)
  const [dailyProfit] = useState(4210)
  const [activeTrades] = useState(24)

  // Animate BTC price
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => {
        const change = (Math.random() - 0.5) * 50
        return parseFloat((prev + change).toFixed(2))
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Trading',
      description: 'Practice with live market data simulation. Experience real market conditions without risk.',
    },
    {
      icon: Shield,
      title: 'Risk-Free Learning',
      description: 'Trade with virtual funds. No real money at stake while you learn and practice.',
    },
    {
      icon: BarChart3,
      title: 'Advanced Charts',
      description: 'Professional-grade charts with indicators, drawing tools, and multiple timeframes.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute orders instantly with our high-performance trading engine.',
    },
  ]

  const stats = [
    { value: '120K+', label: 'Active Traders' },
    { value: '$2.5B+', label: 'Trading Volume' },
    { value: '99.99%', label: 'Uptime' },
    { value: '24/7', label: 'Support' },
  ]

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Day Trader',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'NeonTrade helped me practice my strategies without risking real money. Now I trade with confidence!',
      rating: 5,
    },
    {
      name: 'Priya Patel',
      role: 'Investment Analyst',
      image: 'https://randomuser.me/api/portraits/women/2.jpg',
      content: 'The best trading platform I have used. The interface is intuitive and the charts are excellent.',
      rating: 5,
    },
    {
      name: 'Amit Kumar',
      role: 'Swing Trader',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      content: 'I learned to manage risk and emotions through paper trading. NeonTrade made it easy and fun.',
      rating: 5,
    },
  ]

  return (
    <div className="overflow-hidden bg-[#0a0b0f]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-20 lg:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-900/20 via-transparent to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-900/20 via-transparent to-transparent rounded-full blur-3xl"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxYTFiMjMiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwaDYwVjB6TTU5IDFIMXY1OGg1OFYxeiIgZmlsbD0iIzIyMjMzMyIgZmlsbC1vcGFjaXR5PSIuMyIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* AI Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 mb-8"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium tracking-wider uppercase">AI-Powered Trading Engine</span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                <span className="text-white">Trade</span>
                <br />
                <span className="text-white">Smarter.</span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
                  Grow Faster.
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                Execute trades in milliseconds with real-time market data, 
                AI-driven insights, and institutional-grade liquidity protocols.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link 
                  to="/signup" 
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                >
                  Start Trading
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/markets"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  Explore Live Markets
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <p className="text-gray-500 text-sm mb-12">(No credit card required)</p>

              {/* Trust Badges */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Lock className="w-4 h-4" />
                    <span className="uppercase tracking-wider text-xs font-medium">Bank-Grade Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Activity className="w-4 h-4" />
                    <span className="uppercase tracking-wider text-xs font-medium">99.99% Uptime</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-xs font-medium">Secure Infrastructure</span>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-4 mt-6 p-4 rounded-xl bg-white/5 border border-white/10 max-w-fit">
                  <div className="flex -space-x-2">
                    <img src="https://randomuser.me/api/portraits/men/1.jpg" className="w-8 h-8 rounded-full border-2 border-[#0a0b0f]" alt="" />
                    <img src="https://randomuser.me/api/portraits/women/2.jpg" className="w-8 h-8 rounded-full border-2 border-[#0a0b0f]" alt="" />
                    <img src="https://randomuser.me/api/portraits/men/3.jpg" className="w-8 h-8 rounded-full border-2 border-[#0a0b0f]" alt="" />
                    <img src="https://randomuser.me/api/portraits/women/4.jpg" className="w-8 h-8 rounded-full border-2 border-[#0a0b0f]" alt="" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#0a0b0f] bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">+</div>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">120K+ TRADERS</p>
                    <p className="text-gray-500 text-xs">Join the elite global community</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Content - 3D Trading Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[600px] hidden lg:block"
              style={{ perspective: '1500px' }}
            >
              {/* Main Price Card */}
              <Card3D 
                className="absolute top-0 right-0 z-30"
                glowColor="rgba(34, 197, 94, 0.2)"
              >
                <div className="bg-[#12131a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-emerald-400 text-sm font-medium">LIVE</span>
                      <span className="text-gray-400 text-sm">BTC/USDT</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-3 mb-1">
                    <motion.span 
                      key={btcPrice}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className="text-3xl font-bold text-white"
                    >
                      ${btcPrice.toLocaleString()}
                    </motion.span>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">+{btcChange}% Today</span>
                  
                  {/* Time filters */}
                  <div className="flex gap-2 mt-4">
                    {['1M', '1H', '1D', '1W'].map((tf, i) => (
                      <button 
                        key={tf}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          i === 2 ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </Card3D>

              {/* Portfolio Card */}
              <Card3D 
                className="absolute top-24 left-0 z-20"
                glowColor="rgba(99, 102, 241, 0.2)"
              >
                <div className="bg-[#12131a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 min-w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">PORTFOLIO</span>
                    <span className="text-gray-500 text-xs">3s ago</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-white">${(portfolioValue / 1000000).toFixed(2)}M</span>
                    <span className="text-emerald-400 text-sm font-medium">+12.4%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '72%' }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    />
                  </div>
                </div>
              </Card3D>

              {/* Animated Chart */}
              <div className="absolute top-48 left-10 right-10 h-48 z-10">
                <AnimatedChart />
              </div>

              {/* Daily Profit Card */}
              <Card3D 
                className="absolute bottom-32 right-0 z-20"
                glowColor="rgba(168, 85, 247, 0.2)"
              >
                <div className="bg-[#12131a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">DAILY PROFIT</span>
                    <span className="text-gray-500 text-xs">3s ago</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-emerald-400">+${dailyProfit.toLocaleString()}</span>
                    <span className="text-emerald-400 text-sm font-medium">+8.1%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </Card3D>

              {/* Active Trades Card */}
              <Card3D 
                className="absolute bottom-0 left-20 z-20"
                glowColor="rgba(59, 130, 246, 0.2)"
              >
                <div className="bg-[#12131a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 min-w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">ACTIVE TRADES</span>
                    <span className="text-gray-500 text-xs">2s ago</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-white">{activeTrades} Live</span>
                    <span className="text-emerald-400 text-sm font-medium">99.9% Success</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ delay: 0.9, duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    />
                  </div>
                </div>
              </Card3D>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5 bg-[#0a0b0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">{stat.value}</p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-[#0a0b0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Trade Smarter</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Professional tools and features designed to help you learn, practice, and master trading.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-[#0a0b0f] to-[#12131a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Start Trading in <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Get started with trading in minutes. No complicated setup required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up with your email and get instant access to your trading dashboard.',
              },
              {
                step: '02',
                title: 'Explore Markets',
                description: 'Browse stocks, indices, commodities, forex, and crypto markets.',
              },
              {
                step: '03',
                title: 'Start Trading',
                description: 'Place orders, track portfolio, and grow your investments.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center relative z-10 hover:border-purple-500/30 transition-colors">
                  <div className="text-6xl font-bold bg-gradient-to-b from-white/20 to-transparent bg-clip-text text-transparent mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-20">
                    <ChevronRight className="w-8 h-8 text-purple-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32 bg-[#12131a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Loved by <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Traders</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join thousands of traders who have improved their skills with NeonTrade.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-[#0a0b0f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 lg:p-12 text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border border-white/10"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Start Your Trading Journey?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join NeonTrade today and experience the future of trading with AI-powered insights.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/signup" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/features" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
