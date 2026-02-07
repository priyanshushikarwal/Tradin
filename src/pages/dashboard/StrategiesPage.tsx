import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Zap,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Copy,
  Settings,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock
} from 'lucide-react'

interface Strategy {
  id: string
  name: string
  description: string
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'custom'
  status: 'active' | 'paused' | 'draft'
  symbols: string[]
  trades: number
  pnl: number
  winRate: number
  createdAt: string
}

const StrategiesPage = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'templates' | 'marketplace'>('my')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const strategies: Strategy[] = [
    {
      id: '1',
      name: 'RSI Oversold Buy',
      description: 'Buys when RSI drops below 30, sells when RSI crosses above 70',
      type: 'mean_reversion',
      status: 'active',
      symbols: ['RELIANCE', 'TCS', 'HDFCBANK'],
      trades: 45,
      pnl: 12500,
      winRate: 68,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Moving Average Crossover',
      description: 'Trades based on 20/50 EMA crossovers',
      type: 'momentum',
      status: 'active',
      symbols: ['INFY', 'ICICIBANK'],
      trades: 32,
      pnl: 8200,
      winRate: 56,
      createdAt: '2024-01-05'
    },
    {
      id: '3',
      name: 'Support/Resistance Breakout',
      description: 'Identifies key levels and trades breakouts',
      type: 'breakout',
      status: 'paused',
      symbols: ['SBIN', 'LT'],
      trades: 18,
      pnl: -2400,
      winRate: 44,
      createdAt: '2024-01-08'
    },
  ]

  const templates = [
    {
      id: 't1',
      name: 'Simple Moving Average Strategy',
      description: 'Classic SMA crossover strategy for trending markets',
      type: 'momentum',
      rating: 4.5,
      users: 1250
    },
    {
      id: 't2',
      name: 'Bollinger Band Squeeze',
      description: 'Trades volatility expansion after low volatility periods',
      type: 'breakout',
      rating: 4.2,
      users: 890
    },
    {
      id: 't3',
      name: 'MACD Divergence',
      description: 'Identifies potential reversals using MACD divergence',
      type: 'mean_reversion',
      rating: 4.0,
      users: 675
    },
  ]

  const getTypeColor = (type: Strategy['type']) => {
    switch (type) {
      case 'momentum': return 'text-purple-400 bg-purple-500/20'
      case 'mean_reversion': return 'text-accent-purple bg-accent-purple/20'
      case 'breakout': return 'text-warning bg-warning/20'
      case 'custom': return 'text-gray-400 bg-white/5'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Trading Strategies</h1>
          <p className="text-gray-400">Build and manage automated trading strategies</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          New Strategy
        </button>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 border border-purple-500/30 bg-purple-500/5"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium mb-1">Paper Trading Only</p>
            <p className="text-gray-400 text-sm">
              All strategies run on paper trading mode. Test your ideas without risking real money.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm mb-1">Active Strategies</p>
          <p className="text-2xl font-bold text-white">{strategies.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-white">{strategies.reduce((sum, s) => sum + s.trades, 0)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${strategies.reduce((sum, s) => sum + s.pnl, 0) >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
            ₹{strategies.reduce((sum, s) => sum + s.pnl, 0).toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-gray-400 text-sm mb-1">Avg Win Rate</p>
          <p className="text-2xl font-bold text-white">
            {(strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1)}%
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {[
          { id: 'my', label: 'My Strategies' },
          { id: 'templates', label: 'Templates' },
          { id: 'marketplace', label: 'Marketplace' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-blue text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {activeTab === 'my' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {strategies.length > 0 ? (
            strategies.map((strategy) => (
              <div key={strategy.id} className="glass-card p-4 lg:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      strategy.status === 'active' ? 'bg-emerald-500/20' : 'bg-white/5'
                    }`}>
                      <Zap className={`w-6 h-6 ${
                        strategy.status === 'active' ? 'text-emerald-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-lg">{strategy.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(strategy.type)}`}>
                          {strategy.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{strategy.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {strategy.symbols.map((symbol) => (
                          <span key={symbol} className="px-2 py-0.5 rounded bg-white/5 text-gray-400 text-xs">
                            {symbol}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {strategy.status === 'active' ? (
                      <button className="p-2 rounded-xl bg-danger/20 text-danger hover:bg-danger/30 transition-colors">
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-xl bg-white/5 hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Status</p>
                    <p className={`font-medium capitalize ${
                      strategy.status === 'active' ? 'text-emerald-400' :
                      strategy.status === 'paused' ? 'text-warning' :
                      'text-gray-400'
                    }`}>
                      {strategy.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Trades</p>
                    <p className="text-white font-medium">{strategy.trades}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">P&L</p>
                    <p className={`font-medium ${strategy.pnl >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
                      {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Win Rate</p>
                    <p className="text-white font-medium">{strategy.winRate}%</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-12 text-center">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-lg font-medium mb-2">No strategies yet</p>
              <p className="text-gray-400 mb-4">Create your first automated trading strategy</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                Create Strategy
              </button>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {templates.map((template) => (
            <div key={template.id} className="glass-card p-6 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-purple" />
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(template.type as any)}`}>
                  {template.type.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-white font-bold mb-2">{template.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-warning">★ {template.rating}</span>
                  <span className="text-gray-400">{template.users} users</span>
                </div>
                <button className="btn-secondary text-sm py-1.5">Use</button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {activeTab === 'marketplace' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-12 text-center"
        >
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-white text-lg font-medium mb-2">Coming Soon</p>
          <p className="text-gray-400">
            Browse and subscribe to strategies created by experienced traders
          </p>
        </motion.div>
      )}

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Create New Strategy</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Strategy Name</label>
                <input
                  type="text"
                  placeholder="My Trading Strategy"
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Strategy Type</label>
                <select className="input-glass w-full">
                  <option>Momentum</option>
                  <option>Mean Reversion</option>
                  <option>Breakout</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what your strategy does..."
                  className="input-glass w-full resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Symbols</label>
                <input
                  type="text"
                  placeholder="RELIANCE, TCS, HDFCBANK"
                  className="input-glass w-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button className="flex-1 btn-primary">Create</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default StrategiesPage
