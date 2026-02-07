import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Volume2
} from 'lucide-react'

interface Alert {
  id: string
  symbol: string
  name: string
  type: 'above' | 'below' | 'percent_up' | 'percent_down'
  targetPrice?: number
  targetPercent?: number
  currentPrice: number
  status: 'active' | 'triggered' | 'expired'
  createdAt: string
  notification: 'push' | 'email' | 'sms' | 'all'
}

const AlertsPage = () => {
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'triggered' | 'all'>('active')
  const [editingAlert, setEditingAlert] = useState<string | null>(null)

  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'above',
    targetPrice: '',
    notification: 'push'
  })

  const alerts: Alert[] = [
    {
      id: '1',
      symbol: 'RELIANCE',
      name: 'Reliance Industries',
      type: 'above',
      targetPrice: 2500,
      currentPrice: 2456.50,
      status: 'active',
      createdAt: '2024-01-15',
      notification: 'push'
    },
    {
      id: '2',
      symbol: 'TCS',
      name: 'Tata Consultancy',
      type: 'below',
      targetPrice: 3800,
      currentPrice: 3890.75,
      status: 'active',
      createdAt: '2024-01-14',
      notification: 'email'
    },
    {
      id: '3',
      symbol: 'HDFCBANK',
      name: 'HDFC Bank',
      type: 'percent_up',
      targetPercent: 5,
      currentPrice: 1678.25,
      status: 'triggered',
      createdAt: '2024-01-10',
      notification: 'all'
    },
    {
      id: '4',
      symbol: 'INFY',
      name: 'Infosys',
      type: 'below',
      targetPrice: 1450,
      currentPrice: 1456.80,
      status: 'active',
      createdAt: '2024-01-12',
      notification: 'push'
    },
  ]

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return alert.status === 'active'
    if (activeTab === 'triggered') return alert.status === 'triggered'
    return true
  })

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'above': return 'Price Above'
      case 'below': return 'Price Below'
      case 'percent_up': return 'Up by %'
      case 'percent_down': return 'Down by %'
    }
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'above':
      case 'percent_up':
        return <ArrowUpRight className="w-4 h-4 text-emerald-400" />
      case 'below':
      case 'percent_down':
        return <ArrowDownRight className="w-4 h-4 text-danger" />
    }
  }

  const popularSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN']

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Price Alerts</h1>
          <p className="text-gray-400">Get notified when prices hit your targets</p>
        </div>
        <button
          onClick={() => setShowCreateAlert(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Create Alert
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-white">{alerts.filter(a => a.status === 'active').length}</p>
          <p className="text-gray-400 text-sm">Active Alerts</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{alerts.filter(a => a.status === 'triggered').length}</p>
          <p className="text-gray-400 text-sm">Triggered Today</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-white">50</p>
          <p className="text-gray-400 text-sm">Max Alerts</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2"
      >
        {(['active', 'triggered', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Alerts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass-card p-4 lg:p-6 ${
                alert.status === 'triggered' ? 'border border-success/30 bg-success/5' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    alert.status === 'triggered' ? 'bg-emerald-500/20' : 'bg-white/5'
                  }`}>
                    {alert.status === 'triggered' ? (
                      <Check className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Bell className="w-6 h-6 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-lg">{alert.symbol}</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        alert.status === 'active' ? 'bg-purple-500/20 text-purple-400' :
                        alert.status === 'triggered' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-white/5 text-gray-400'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{alert.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-2 justify-end">
                      {getAlertIcon(alert.type)}
                      <span className="text-gray-400 text-sm">{getAlertTypeLabel(alert.type)}</span>
                    </div>
                    <p className="text-white font-bold text-xl">
                      {alert.targetPrice ? `₹${alert.targetPrice.toLocaleString()}` : `${alert.targetPercent}%`}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Current: ₹{alert.currentPrice.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {alert.status === 'active' && (
                      <>
                        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl bg-white/5 hover:bg-danger/20 text-gray-400 hover:text-danger transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {alert.status === 'triggered' && (
                      <button className="btn-secondary text-sm">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile details */}
              <div className="mt-4 pt-4 border-t border-white/10 sm:hidden">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-400 text-xs">{getAlertTypeLabel(alert.type)}</p>
                    <p className="text-white font-bold">
                      {alert.targetPrice ? `₹${alert.targetPrice}` : `${alert.targetPercent}%`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Current Price</p>
                    <p className="text-white font-bold">₹{alert.currentPrice}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">No alerts found</p>
            <p className="text-gray-400 mb-4">Create price alerts to stay informed about market movements</p>
            <button onClick={() => setShowCreateAlert(true)} className="btn-primary">
              Create Your First Alert
            </button>
          </div>
        )}
      </motion.div>

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateAlert(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Price Alert</h2>
              <button
                onClick={() => setShowCreateAlert(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Symbol Selection */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Stock Symbol</label>
                <input
                  type="text"
                  placeholder="Search or enter symbol..."
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                  className="input-glass w-full"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularSymbols.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => setNewAlert({...newAlert, symbol})}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        newAlert.symbol === symbol
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert Type */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Alert Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'above', label: 'Price Above', icon: ArrowUpRight },
                    { value: 'below', label: 'Price Below', icon: ArrowDownRight },
                    { value: 'percent_up', label: 'Up by %', icon: TrendingUp },
                    { value: 'percent_down', label: 'Down by %', icon: TrendingDown },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewAlert({...newAlert, type: type.value})}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-colors ${
                        newAlert.type === type.value
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <type.icon className={`w-4 h-4 ${
                        type.value.includes('up') || type.value === 'above' ? 'text-emerald-400' : 'text-danger'
                      }`} />
                      <span className="text-white text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Price/Percent */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">
                  {newAlert.type.includes('percent') ? 'Target Percentage' : 'Target Price'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {newAlert.type.includes('percent') ? '%' : '₹'}
                  </span>
                  <input
                    type="number"
                    placeholder={newAlert.type.includes('percent') ? '5' : '2500'}
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
                    className="input-glass pl-8 w-full"
                  />
                </div>
              </div>

              {/* Notification Method */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Notify via</label>
                <div className="flex gap-2">
                  {['push', 'email', 'sms', 'all'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setNewAlert({...newAlert, notification: method})}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                        newAlert.notification === method
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full btn-primary py-4 font-semibold">
                Create Alert
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AlertsPage
