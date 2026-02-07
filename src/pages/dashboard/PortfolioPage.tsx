import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  PieChart,
  Filter,
  ChevronDown,
  Clock,
  X,
  AlertCircle
} from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const PortfolioPage = () => {
  const { summary, holdings, positions } = useAppSelector((state) => state.portfolio)
  const [activeTab, setActiveTab] = useState<'holdings' | 'positions' | 'orders'>('holdings')
  const [filterOpen, setFilterOpen] = useState(false)

  // Sample holdings data
  const holdingsData = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', qty: 10, avgPrice: 2380.50, ltp: 2456.50, pnl: 760, pnlPercent: 3.19, invested: 23805, current: 24565 },
    { symbol: 'TCS', name: 'Tata Consultancy', qty: 5, avgPrice: 3850.00, ltp: 3890.75, pnl: 203.75, pnlPercent: 1.06, invested: 19250, current: 19453.75 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', qty: 15, avgPrice: 1650.25, ltp: 1678.25, pnl: 420, pnlPercent: 1.70, invested: 24753.75, current: 25173.75 },
    { symbol: 'INFY', name: 'Infosys', qty: 12, avgPrice: 1520.00, ltp: 1456.80, pnl: -758.40, pnlPercent: -4.16, invested: 18240, current: 17481.60 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', qty: 20, avgPrice: 985.50, ltp: 1023.45, pnl: 759, pnlPercent: 3.85, invested: 19710, current: 20469 },
  ]

  // Sample positions data (intraday)
  const positionsData = [
    { symbol: 'RELIANCE', type: 'LONG', qty: 5, entryPrice: 2445.00, ltp: 2456.50, pnl: 57.50, pnlPercent: 0.47, margin: 6112.50 },
    { symbol: 'SBIN', type: 'SHORT', qty: 25, entryPrice: 632.50, ltp: 628.75, pnl: 93.75, pnlPercent: 0.59, margin: 3953.13 },
  ]

  // Sample orders data
  const ordersData = [
    { id: '1', symbol: 'BHARTIARTL', type: 'BUY', orderType: 'LIMIT', qty: 10, price: 1240.00, status: 'open', time: '10:30 AM' },
    { id: '2', symbol: 'LT', type: 'SELL', orderType: 'SL', qty: 5, price: 3200.00, status: 'open', time: '11:15 AM' },
    { id: '3', symbol: 'WIPRO', type: 'BUY', orderType: 'MARKET', qty: 50, price: 456.25, status: 'filled', time: '09:45 AM' },
  ]

  // Allocation data for pie chart
  const allocationData = holdingsData.map((h) => ({
    name: h.symbol,
    value: h.current,
  }))

  const COLORS = ['#8B5CF6', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#06B6D4']

  // Sector allocation
  const sectorData = [
    { sector: 'Technology', value: 36946.35, percent: 34.5 },
    { sector: 'Banking', value: 45642.75, percent: 42.6 },
    { sector: 'Energy', value: 24565, percent: 22.9 },
  ]

  const totalInvested = holdingsData.reduce((sum, h) => sum + h.invested, 0)
  const currentValue = holdingsData.reduce((sum, h) => sum + h.current, 0)
  const totalPnl = currentValue - totalInvested
  const totalPnlPercent = (totalPnl / totalInvested) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400">Track your investments and positions</p>
        </div>
        <Link to="/reports" className="btn-secondary inline-flex items-center gap-2 self-start">
          <PieChart className="w-5 h-5" />
          View Reports
        </Link>
      </motion.div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total Invested</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">₹{totalInvested.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Current Value</p>
          <p className="text-2xl lg:text-3xl font-bold text-white">₹{currentValue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total P&L</p>
          <p className={`text-2xl lg:text-3xl font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
            {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)}
          </p>
          <p className={`text-sm flex items-center gap-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
            {totalPnl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(totalPnlPercent).toFixed(2)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 lg:p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Day's P&L</p>
          <p className="text-2xl lg:text-3xl font-bold text-emerald-400">+₹1,245.35</p>
          <p className="text-sm flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            1.16%
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Holdings/Positions/Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 glass-card"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['holdings', 'positions', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-4 font-medium capitalize transition-colors relative ${
                  activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
                {tab === 'positions' && positionsData.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs">
                    {positionsData.length}
                  </span>
                )}
                {tab === 'orders' && ordersData.filter(o => o.status === 'open').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-warning text-white text-xs">
                    {ordersData.filter(o => o.status === 'open').length}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div className="p-4">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 text-sm font-medium">
                <div className="col-span-3">Stock</div>
                <div className="col-span-2 text-right">Qty/Avg</div>
                <div className="col-span-2 text-right">LTP</div>
                <div className="col-span-2 text-right">Current</div>
                <div className="col-span-3 text-right">P&L</div>
              </div>
              <div className="divide-y divide-white/10">
                {holdingsData.map((holding) => (
                  <Link
                    key={holding.symbol}
                    to={`/trade/${holding.symbol}`}
                    className="grid grid-cols-2 lg:grid-cols-12 gap-4 p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="lg:col-span-3">
                      <p className="text-white font-medium">{holding.symbol}</p>
                      <p className="text-gray-400 text-sm hidden lg:block">{holding.name}</p>
                    </div>
                    <div className="text-right lg:col-span-2">
                      <p className="text-white">{holding.qty}</p>
                      <p className="text-gray-400 text-sm">@₹{holding.avgPrice.toFixed(2)}</p>
                    </div>
                    <div className="hidden lg:block col-span-2 text-right">
                      <p className="text-white">₹{holding.ltp.toFixed(2)}</p>
                    </div>
                    <div className="hidden lg:block col-span-2 text-right">
                      <p className="text-white">₹{holding.current.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Inv: ₹{holding.invested.toLocaleString()}</p>
                    </div>
                    <div className="lg:col-span-3 text-right">
                      <p className={`font-medium ${holding.pnl >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
                        {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)}
                      </p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${
                        holding.pnlPercent >= 0 ? 'text-emerald-400' : 'text-danger'
                      }`}>
                        {holding.pnlPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(holding.pnlPercent).toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div className="p-4">
              {positionsData.length > 0 ? (
                <>
                  <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 text-sm font-medium">
                    <div className="col-span-3">Stock</div>
                    <div className="col-span-2 text-center">Type</div>
                    <div className="col-span-2 text-right">Qty/Entry</div>
                    <div className="col-span-2 text-right">LTP</div>
                    <div className="col-span-3 text-right">P&L</div>
                  </div>
                  <div className="divide-y divide-white/10">
                    {positionsData.map((position, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-2 lg:grid-cols-12 gap-4 p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="lg:col-span-3">
                          <p className="text-white font-medium">{position.symbol}</p>
                          <p className="text-gray-400 text-sm lg:hidden">{position.type}</p>
                        </div>
                        <div className="hidden lg:flex col-span-2 justify-center">
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            position.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-danger/20 text-danger'
                          }`}>
                            {position.type}
                          </span>
                        </div>
                        <div className="text-right lg:col-span-2">
                          <p className="text-white">{position.qty}</p>
                          <p className="text-gray-400 text-sm">@₹{position.entryPrice.toFixed(2)}</p>
                        </div>
                        <div className="hidden lg:block col-span-2 text-right">
                          <p className="text-white">₹{position.ltp.toFixed(2)}</p>
                        </div>
                        <div className="lg:col-span-3 text-right">
                          <p className={`font-medium ${position.pnl >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
                            {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)}
                          </p>
                          <p className={`text-sm flex items-center justify-end gap-1 ${
                            position.pnlPercent >= 0 ? 'text-emerald-400' : 'text-danger'
                          }`}>
                            {position.pnlPercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(position.pnlPercent).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg font-medium mb-2">No Open Positions</p>
                  <p className="text-gray-400 mb-4">Start trading to see your intraday positions here</p>
                  <Link to="/markets" className="btn-primary inline-flex items-center gap-2">
                    Explore Markets
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-4">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2 text-gray-400 text-sm font-medium">
                <div className="col-span-3">Stock</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              <div className="divide-y divide-white/10">
                {ordersData.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-2 lg:grid-cols-12 gap-4 p-4 items-center"
                  >
                    <div className="lg:col-span-3">
                      <p className="text-white font-medium">{order.symbol}</p>
                      <p className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.time}
                      </p>
                    </div>
                    <div className="hidden lg:flex col-span-2 justify-center">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        order.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-danger/20 text-danger'
                      }`}>
                        {order.type} · {order.orderType}
                      </span>
                    </div>
                    <div className="text-right lg:col-span-2">
                      <p className="text-white">{order.qty}</p>
                    </div>
                    <div className="hidden lg:block col-span-2 text-right">
                      <p className="text-white">₹{order.price.toFixed(2)}</p>
                    </div>
                    <div className="lg:col-span-2 text-center">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        order.status === 'open' ? 'bg-warning/20 text-warning' :
                        order.status === 'filled' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-danger/20 text-danger'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="hidden lg:flex col-span-1 justify-center">
                      {order.status === 'open' && (
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Allocation Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Portfolio Allocation */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Portfolio Allocation</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(14, 20, 27, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {allocationData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-400 text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Allocation */}
          <div className="glass-card p-6">
            <h3 className="text-white font-semibold mb-4">Sector Allocation</h3>
            <div className="space-y-4">
              {sectorData.map((sector, index) => (
                <div key={sector.sector}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">{sector.sector}</span>
                    <span className="text-white text-sm font-medium">{sector.percent}%</span>
                  </div>
                  <div className="h-2 bg-[#12131a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sector.percent}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PortfolioPage
