import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Filter,
  ChevronDown
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const ReportsPage = () => {
  const [period, setPeriod] = useState('1M')
  const [reportType, setReportType] = useState('pnl')

  const pnlData = [
    { date: '01 Jan', pnl: 450, trades: 12 },
    { date: '08 Jan', pnl: -280, trades: 8 },
    { date: '15 Jan', pnl: 620, trades: 15 },
    { date: '22 Jan', pnl: 380, trades: 10 },
    { date: '29 Jan', pnl: -150, trades: 6 },
    { date: '05 Feb', pnl: 890, trades: 18 },
    { date: '12 Feb', pnl: 520, trades: 14 },
  ]

  const monthlyStats = [
    { month: 'Aug', profit: 12500, loss: 3200 },
    { month: 'Sep', profit: 8900, loss: 4500 },
    { month: 'Oct', profit: 15600, loss: 2800 },
    { month: 'Nov', profit: 11200, loss: 5600 },
    { month: 'Dec', profit: 18500, loss: 3900 },
    { month: 'Jan', profit: 14200, loss: 4100 },
  ]

  const tradingMetrics = {
    totalTrades: 156,
    winningTrades: 98,
    losingTrades: 58,
    winRate: 62.8,
    avgWin: 1250,
    avgLoss: 680,
    profitFactor: 2.12,
    maxDrawdown: 8.5,
    sharpeRatio: 1.85,
    avgHoldingPeriod: '2.3 days'
  }

  const recentReports = [
    { id: '1', name: 'P&L Statement - January 2024', type: 'pnl', date: '01 Feb 2024', size: '245 KB' },
    { id: '2', name: 'Trade History - January 2024', type: 'trades', date: '01 Feb 2024', size: '128 KB' },
    { id: '3', name: 'Tax Report - FY 2023-24', type: 'tax', date: '15 Jan 2024', size: '512 KB' },
    { id: '4', name: 'Holdings Report', type: 'holdings', date: '10 Jan 2024', size: '89 KB' },
  ]

  const periods = ['1W', '1M', '3M', '6M', '1Y', 'ALL']

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-400">Analyze your trading performance</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Custom Range
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              period === p
                ? 'bg-accent-blue text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Net P&L</p>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-400">+₹24,580</p>
          <p className="text-emerald-400 text-sm flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-4 h-4" />
            +12.4% vs last period
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Win Rate</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{tradingMetrics.winRate}%</p>
          <p className="text-gray-400 text-sm mt-1">
            {tradingMetrics.winningTrades}W / {tradingMetrics.losingTrades}L
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total Trades</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{tradingMetrics.totalTrades}</p>
          <p className="text-gray-400 text-sm mt-1">
            Avg {tradingMetrics.avgHoldingPeriod}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Profit Factor</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">{tradingMetrics.profitFactor}</p>
          <p className="text-gray-400 text-sm mt-1">
            Sharpe: {tradingMetrics.sharpeRatio}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* P&L Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">P&L Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(14, 20, 27, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                  formatter={(value: number) => [`₹${value}`, 'P&L']}
                />
                <Area type="monotone" dataKey="pnl" stroke="#22C55E" strokeWidth={2} fill="url(#pnlGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(14, 20, 27, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="profit" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Trading Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Average Win</p>
            <p className="text-xl font-bold text-emerald-400">₹{tradingMetrics.avgWin.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Average Loss</p>
            <p className="text-xl font-bold text-danger">₹{tradingMetrics.avgLoss.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Max Drawdown</p>
            <p className="text-xl font-bold text-danger">{tradingMetrics.maxDrawdown}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Sharpe Ratio</p>
            <p className="text-xl font-bold text-white">{tradingMetrics.sharpeRatio}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Profit Factor</p>
            <p className="text-xl font-bold text-white">{tradingMetrics.profitFactor}</p>
          </div>
        </div>
      </motion.div>

      {/* Downloadable Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass-card"
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Downloadable Reports</h3>
        </div>
        <div className="divide-y divide-white/10">
          {recentReports.map((report) => (
            <div key={report.id} className="p-4 lg:px-6 flex items-center justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-400/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{report.name}</p>
                  <p className="text-gray-400 text-sm">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ReportsPage
