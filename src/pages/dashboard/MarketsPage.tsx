import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Grid,
  List,
  ChevronDown,
  Activity
} from 'lucide-react'

interface MarketStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  dayHigh: number
  dayLow: number
  isWatchlisted: boolean
  sector: string
  basePrice: number
  volatility: number
}

interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
  baseValue: number
}

// Initial stock data with base prices
const initialMarketData: MarketStock[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2456.50, change: 0, changePercent: 0, volume: '12.5M', marketCap: '16.5T', dayHigh: 2456.50, dayLow: 2456.50, isWatchlisted: true, sector: 'Energy', basePrice: 2456.50, volatility: 0.002 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3890.75, change: 0, changePercent: 0, volume: '5.2M', marketCap: '14.2T', dayHigh: 3890.75, dayLow: 3890.75, isWatchlisted: true, sector: 'Technology', basePrice: 3890.75, volatility: 0.0015 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1678.25, change: 0, changePercent: 0, volume: '8.7M', marketCap: '9.4T', dayHigh: 1678.25, dayLow: 1678.25, isWatchlisted: false, sector: 'Banking', basePrice: 1678.25, volatility: 0.0012 },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1456.80, change: 0, changePercent: 0, volume: '6.3M', marketCap: '6.0T', dayHigh: 1456.80, dayLow: 1456.80, isWatchlisted: false, sector: 'Technology', basePrice: 1456.80, volatility: 0.0018 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1023.45, change: 0, changePercent: 0, volume: '9.1M', marketCap: '7.1T', dayHigh: 1023.45, dayLow: 1023.45, isWatchlisted: true, sector: 'Banking', basePrice: 1023.45, volatility: 0.0014 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1245.60, change: 0, changePercent: 0, volume: '4.2M', marketCap: '7.4T', dayHigh: 1245.60, dayLow: 1245.60, isWatchlisted: false, sector: 'Telecom', basePrice: 1245.60, volatility: 0.0016 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 628.75, change: 0, changePercent: 0, volume: '15.8M', marketCap: '5.6T', dayHigh: 628.75, dayLow: 628.75, isWatchlisted: false, sector: 'Banking', basePrice: 628.75, volatility: 0.002 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2567.30, change: 0, changePercent: 0, volume: '2.1M', marketCap: '6.0T', dayHigh: 2567.30, dayLow: 2567.30, isWatchlisted: false, sector: 'FMCG', basePrice: 2567.30, volatility: 0.001 },
  { symbol: 'LT', name: 'Larsen & Toubro', price: 3245.00, change: 0, changePercent: 0, volume: '3.5M', marketCap: '4.5T', dayHigh: 3245.00, dayLow: 3245.00, isWatchlisted: false, sector: 'Infrastructure', basePrice: 3245.00, volatility: 0.0015 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 456.25, change: 0, changePercent: 0, volume: '7.8M', marketCap: '2.5T', dayHigh: 456.25, dayLow: 456.25, isWatchlisted: false, sector: 'Technology', basePrice: 456.25, volatility: 0.0017 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 789.45, change: 0, changePercent: 0, volume: '10.2M', marketCap: '2.9T', dayHigh: 789.45, dayLow: 789.45, isWatchlisted: false, sector: 'Auto', basePrice: 789.45, volatility: 0.0025 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', price: 1045.30, change: 0, changePercent: 0, volume: '6.5M', marketCap: '3.2T', dayHigh: 1045.30, dayLow: 1045.30, isWatchlisted: false, sector: 'Banking', basePrice: 1045.30, volatility: 0.0016 },
]

const MarketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [activeTab, setActiveTab] = useState('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [isLive, setIsLive] = useState(true)

  // Real-time market data state
  const [marketData, setMarketData] = useState<MarketStock[]>(initialMarketData)
  const [indices, setIndices] = useState<MarketIndex[]>([
    { name: 'NIFTY 50', value: 22457.25, change: 0, changePercent: 0, baseValue: 22457.25 },
    { name: 'SENSEX', value: 73942.15, change: 0, changePercent: 0, baseValue: 73942.15 },
    { name: 'BANK NIFTY', value: 47892.45, change: 0, changePercent: 0, baseValue: 47892.45 },
    { name: 'NIFTY IT', value: 37456.80, change: 0, changePercent: 0, baseValue: 37456.80 },
  ])

  // Generate random price movement
  const generatePriceMovement = useCallback((currentPrice: number, volatility: number) => {
    const randomFactor = (Math.random() - 0.5) * 2
    const trend = Math.sin(Date.now() / 30000) * 0.3
    const movement = currentPrice * volatility * (randomFactor + trend * 0.3)
    return currentPrice + movement
  }, [])

  // Real-time price updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Update stocks
      setMarketData(prev => prev.map(stock => {
        const newPrice = parseFloat(generatePriceMovement(stock.price, stock.volatility).toFixed(2))
        const change = parseFloat((newPrice - stock.basePrice).toFixed(2))
        const changePercent = parseFloat(((change / stock.basePrice) * 100).toFixed(2))
        const newHigh = Math.max(stock.dayHigh, newPrice)
        const newLow = Math.min(stock.dayLow, newPrice)
        
        return {
          ...stock,
          price: newPrice,
          change,
          changePercent,
          dayHigh: parseFloat(newHigh.toFixed(2)),
          dayLow: parseFloat(newLow.toFixed(2)),
        }
      }))

      // Update indices
      setIndices(prev => prev.map(index => {
        const volatility = 0.0008
        const newValue = parseFloat(generatePriceMovement(index.value, volatility).toFixed(2))
        const change = parseFloat((newValue - index.baseValue).toFixed(2))
        const changePercent = parseFloat(((change / index.baseValue) * 100).toFixed(2))
        
        return {
          ...index,
          value: newValue,
          change,
          changePercent,
        }
      }))
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [isLive, generatePriceMovement])

  const tabs = [
    { id: 'all', label: 'All Stocks' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'active', label: 'Most Active' },
  ]

  const sectors = ['all', 'Technology', 'Banking', 'Energy', 'FMCG', 'Telecom', 'Infrastructure', 'Healthcare', 'Auto']

  const filteredData = marketData.filter((stock) => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stock.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSector = sectorFilter === 'all' || stock.sector === sectorFilter
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'watchlist' ? stock.isWatchlisted :
      activeTab === 'gainers' ? stock.changePercent > 0 :
      activeTab === 'losers' ? stock.changePercent < 0 :
      true
    return matchesSearch && matchesSector && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400">Explore stocks and add them to your watchlist</p>
        </div>
        {/* Live Toggle */}
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isLive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
              : 'bg-gray-700/50 text-gray-400 border border-gray-600'
          }`}
        >
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <Activity className="w-4 h-4" />
          {isLive ? 'LIVE' : 'PAUSED'}
        </button>
      </motion.div>

      {/* Market Indices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {indices.map((index) => (
          <motion.div 
            key={index.name} 
            className="glass-card p-4"
            animate={{ 
              backgroundColor: index.change !== 0 ? 
                (index.changePercent >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)') 
                : 'transparent'
            }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-400 text-sm mb-1">{index.name}</p>
            <motion.p 
              className="text-xl font-bold text-white"
              key={index.value}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {index.value.toLocaleString()}
            </motion.p>
            <p className={`text-sm flex items-center gap-1 ${
              index.changePercent >= 0 ? 'text-emerald-400' : 'text-danger'
            }`}>
              {index.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-10 w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="input-glass appearance-none pr-10 min-w-[140px]"
              >
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? 'All Sectors' : sector}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex bg-[#12131a] rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Stock List / Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {viewMode === 'list' ? (
          <div className="glass-card overflow-hidden">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-gray-400 text-sm font-medium">
              <div className="col-span-3">Stock</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Change</div>
              <div className="col-span-2 text-right">Volume</div>
              <div className="col-span-2 text-right">Day Range</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Stock Rows */}
            <div className="divide-y divide-white/10">
              {filteredData.map((stock) => (
                <Link
                  key={stock.symbol}
                  to={`/trade/${stock.symbol}`}
                  className="grid grid-cols-2 lg:grid-cols-12 gap-4 p-4 hover:bg-white/10 transition-colors items-center"
                >
                  <div className="col-span-2 lg:col-span-3 flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        // Toggle watchlist
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        stock.isWatchlisted ? 'text-warning' : 'text-gray-400 hover:text-warning'
                      }`}
                    >
                      <Star className="w-5 h-5" fill={stock.isWatchlisted ? 'currentColor' : 'none'} />
                    </button>
                    <div>
                      <p className="text-white font-medium">{stock.symbol}</p>
                      <p className="text-gray-400 text-sm hidden lg:block">{stock.name}</p>
                      <p className="text-gray-400 text-xs lg:hidden">{stock.sector}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <motion.p 
                      className="text-white font-medium"
                      key={stock.price}
                      initial={{ scale: 1.08, color: stock.change >= 0 ? '#10b981' : '#ef4444' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.4 }}
                    >
                      ₹{stock.price.toLocaleString()}
                    </motion.p>
                    <p className={`text-sm lg:hidden flex items-center justify-end gap-1 ${
                      stock.changePercent >= 0 ? 'text-emerald-400' : 'text-danger'
                    }`}>
                      {stock.changePercent >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-right">
                    <motion.p 
                      className={`font-medium ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-danger'}`}
                      key={stock.change}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                    </motion.p>
                    <p className={`text-sm ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
                      ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-right">
                    <p className="text-white">{stock.volume}</p>
                    <p className="text-gray-400 text-sm">shares</p>
                  </div>

                  <div className="hidden lg:block col-span-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-danger text-sm">₹{stock.dayLow.toFixed(2)}</span>
                      <div className="w-16 h-1 bg-[#12131a] rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-danger to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: `${stock.dayHigh !== stock.dayLow ? ((stock.price - stock.dayLow) / (stock.dayHigh - stock.dayLow)) * 100 : 50}%`
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-emerald-400 text-sm">₹{stock.dayHigh.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="hidden lg:flex col-span-1 justify-center">
                    <button className="btn-primary text-sm py-2 px-3">
                      Trade
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredData.map((stock) => (
              <Link
                key={stock.symbol}
                to={`/trade/${stock.symbol}`}
                className="glass-card p-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-lg">{stock.symbol}</p>
                    <p className="text-gray-400 text-sm">{stock.name}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      // Toggle watchlist
                    }}
                    className={`p-1 rounded-lg transition-colors ${
                      stock.isWatchlisted ? 'text-warning' : 'text-gray-400 hover:text-warning'
                    }`}
                  >
                    <Star className="w-5 h-5" fill={stock.isWatchlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <motion.p 
                  className="text-2xl font-bold text-white mb-2"
                  key={stock.price}
                  initial={{ scale: 1.08, color: stock.change >= 0 ? '#10b981' : '#ef4444' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  transition={{ duration: 0.4 }}
                >
                  ₹{stock.price.toLocaleString()}
                </motion.p>

                <div className="flex items-center justify-between">
                  <motion.p 
                    className={`text-sm flex items-center gap-1 ${
                      stock.changePercent >= 0 ? 'text-emerald-400' : 'text-danger'
                    }`}
                    key={stock.changePercent}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </motion.p>
                  <span className="text-gray-400 text-xs">{stock.sector}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Volume</span>
                    <span className="text-white">{stock.volume}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredData.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white text-lg font-medium mb-2">No stocks found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MarketsPage
