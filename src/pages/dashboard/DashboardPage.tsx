import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Briefcase,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { LineChart as ReLineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth)
  const { balance } = useAppSelector((state) => state.wallet)
  const { summary, holdings } = useAppSelector((state) => state.portfolio)

  // Sample data for charts
  const portfolioData = [
    { date: 'Jan', value: 450 },
    { date: 'Feb', value: 480 },
    { date: 'Mar', value: 520 },
    { date: 'Apr', value: 490 },
    { date: 'May', value: 550 },
    { date: 'Jun', value: 580 },
    { date: 'Jul', value: 620 },
  ]

  const watchlistData = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.50, change: 2.45, volume: '12.5M' },
    { symbol: 'TCS', name: 'Tata Consultancy', price: 3890.75, change: -0.85, volume: '5.2M' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1678.25, change: 1.23, volume: '8.7M' },
    { symbol: 'INFY', name: 'Infosys', price: 1456.80, change: -1.56, volume: '6.3M' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1023.45, change: 0.95, volume: '9.1M' },
  ]

  const recentOrders = [
    { id: '1', symbol: 'RELIANCE', type: 'BUY', quantity: 10, price: 2450, status: 'filled', time: '10:30 AM' },
    { id: '2', symbol: 'TCS', type: 'SELL', quantity: 5, price: 3895, status: 'filled', time: '11:15 AM' },
    { id: '3', symbol: 'HDFCBANK', type: 'BUY', quantity: 15, price: 1675, status: 'pending', time: '02:45 PM' },
  ]

  const marketNews = [
    { id: '1', title: 'Sensex hits all-time high amid global rally', time: '2h ago' },
    { id: '2', title: 'RBI keeps repo rate unchanged at 6.5%', time: '4h ago' },
    { id: '3', title: 'IT stocks surge on strong Q3 earnings', time: '6h ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, {user?.firstName || 'Trader'}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <Link to="/trade" className="btn-primary inline-flex items-center gap-2 self-start">
          <Plus className="w-5 h-5" />
          New Trade
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs text-gray-400">Available</span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
            ₹{balance.available.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Demo Balance</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-cyan-400" />
            </div>
            <span className={`text-xs flex items-center gap-1 ${summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
              {summary.totalPnl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(summary.totalPnlPercent).toFixed(2)}%
            </span>
          </div>
          <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
            ₹{summary.currentValue.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Portfolio Value</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl ${summary.dayPnl >= 0 ? 'bg-emerald-500/20' : 'bg-danger/20'} flex items-center justify-center`}>
              {summary.dayPnl >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger" />
              )}
            </div>
            <span className="text-xs text-gray-400">Today</span>
          </div>
          <p className={`text-2xl lg:text-3xl font-bold ${summary.dayPnl >= 0 ? 'text-emerald-400' : 'text-danger'} mb-1`}>
            {summary.dayPnl >= 0 ? '+' : ''}₹{summary.dayPnl.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Day's P&L</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 lg:p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className={`text-2xl lg:text-3xl font-bold ${summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-danger'} mb-1`}>
            {summary.totalPnl >= 0 ? '+' : ''}₹{summary.totalPnl.toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Total P&L</p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Portfolio Performance</h2>
            <div className="flex gap-2">
              {['1W', '1M', '3M', '1Y'].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    period === '1M'
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Watchlist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Watchlist</h2>
            <Link to="/markets" className="text-purple-400 text-sm hover:underline flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {watchlistData.map((stock) => (
              <Link
                key={stock.symbol}
                to={`/trade/${stock.symbol}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{stock.symbol}</p>
                  <p className="text-gray-400 text-xs">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">₹{stock.price.toLocaleString()}</p>
                  <p className={`text-xs flex items-center justify-end gap-1 ${
                    stock.change >= 0 ? 'text-emerald-400' : 'text-danger'
                  }`}>
                    {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stock.change)}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
            <Link to="/portfolio" className="text-purple-400 text-sm hover:underline flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#12131a]/80"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    order.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-danger/20'
                  }`}>
                    {order.type === 'BUY' ? (
                      <ArrowUpRight className={`w-4 h-4 text-emerald-400`} />
                    ) : (
                      <ArrowDownRight className={`w-4 h-4 text-danger`} />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.symbol}</p>
                    <p className="text-gray-400 text-xs">
                      {order.type} · {order.quantity} shares
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">₹{order.price.toLocaleString()}</p>
                  <p className={`text-xs ${
                    order.status === 'filled' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Market News */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Market News</h2>
            <Link to="/learn" className="text-purple-400 text-sm hover:underline flex items-center gap-1">
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {marketNews.map((news) => (
              <div
                key={news.id}
                className="p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                <p className="text-white font-medium mb-1">{news.title}</p>
                <p className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {news.time}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
