import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Bell,
  Share2,
  Clock,
  Info,
  ChevronDown,
  Minus,
  Plus,
  RefreshCw,
  Activity
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Rectangle } from 'recharts'

interface ChartDataPoint {
  time: string
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  close: number
  volume: string
  avgVolume: string
  marketCap: string
  pe: number
  dividend: number
  week52High: number
  week52Low: number
  bid: number
  ask: number
  bidSize: number
  askSize: number
}

interface OrderBookEntry {
  price: number
  quantity: number
  orders: number
}

// Stock configurations for different symbols
const stockConfigs: Record<string, { name: string; basePrice: number; volatility: number }> = {
  'RELIANCE': { name: 'Reliance Industries Ltd', basePrice: 2456.50, volatility: 0.002 },
  'TCS': { name: 'Tata Consultancy Services', basePrice: 3567.80, volatility: 0.0015 },
  'INFY': { name: 'Infosys Ltd', basePrice: 1489.55, volatility: 0.0018 },
  'HDFCBANK': { name: 'HDFC Bank Ltd', basePrice: 1623.40, volatility: 0.0012 },
  'ICICIBANK': { name: 'ICICI Bank Ltd', basePrice: 987.25, volatility: 0.0016 },
  'SBIN': { name: 'State Bank of India', basePrice: 623.15, volatility: 0.002 },
  'BHARTIARTL': { name: 'Bharti Airtel Ltd', basePrice: 1156.80, volatility: 0.0014 },
  'WIPRO': { name: 'Wipro Ltd', basePrice: 456.70, volatility: 0.0017 },
  'TATAMOTORS': { name: 'Tata Motors Ltd', basePrice: 789.45, volatility: 0.0025 },
  'AXISBANK': { name: 'Axis Bank Ltd', basePrice: 1045.30, volatility: 0.0015 },
}

const TradePage = () => {
  const { symbol } = useParams()
  const dispatch = useAppDispatch()
  const { balance } = useAppSelector((state) => state.wallet)
  
  // Get stock config FIRST before any other hooks
  const currentSymbol = symbol || 'RELIANCE'
  const initialStockConfig = stockConfigs[currentSymbol] || stockConfigs['RELIANCE']

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'sl' | 'slm'>('market')
  const [productType, setProductType] = useState<'intraday' | 'delivery'>('intraday')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState(0)
  const [stopLoss, setStopLoss] = useState(0)
  const [takeProfit, setTakeProfit] = useState(0)
  const [chartPeriod, setChartPeriod] = useState('1D')
  const [chartType, setChartType] = useState('line')
  const [isLive, setIsLive] = useState(true)

  // Real-time stock data state
  const basePrice = initialStockConfig.basePrice
  const [stockData, setStockData] = useState<StockData>({
    symbol: currentSymbol,
    name: initialStockConfig.name,
    price: basePrice,
    change: 0,
    changePercent: 0,
    open: basePrice * 0.995,
    high: basePrice * 1.01,
    low: basePrice * 0.99,
    close: basePrice * 0.995,
    volume: '0',
    avgVolume: '10.2M',
    marketCap: '16.5T',
    pe: 28.5,
    dividend: 0.38,
    week52High: basePrice * 1.15,
    week52Low: basePrice * 0.85,
    bid: basePrice - 1,
    ask: basePrice + 1,
    bidSize: 1250,
    askSize: 980
  })

  // Real-time chart data state
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: []
  })

  // Refs for tracking
  const lastPriceRef = useRef(basePrice)
  const volumeAccumulatorRef = useRef(0)
  const tickCountRef = useRef(0)

  // Format time for chart
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, [])

  // Initialize chart data
  useEffect(() => {
    try {
      const config = stockConfigs[currentSymbol] || stockConfigs['RELIANCE']
      const initialData: ChartDataPoint[] = []
      let currentPrice = config.basePrice
      const now = new Date()
      
      // Helper function for generating price movement (local to avoid dependency)
      const genPrice = (price: number, volatility: number) => {
        const randomFactor = (Math.random() - 0.5) * 2
        const trend = Math.sin(Date.now() / 50000) * 0.3
        const movement = price * volatility * (randomFactor + trend * 0.5)
        return Math.max(price * 0.9, Math.min(price * 1.1, price + movement))
      }
      
      // Generate 30 initial data points
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 2000) // Every 2 seconds
        currentPrice = genPrice(currentPrice, config.volatility)
        const open = currentPrice * (0.999 + Math.random() * 0.002)
        const close = currentPrice
        const high = Math.max(open, close) * (1 + Math.random() * 0.002)
        const low = Math.min(open, close) * (1 - Math.random() * 0.002)
        
        initialData.push({
          time: formatTime(time),
          price: parseFloat(currentPrice.toFixed(2)),
          open: parseFloat(open.toFixed(2)),
          high: parseFloat(high.toFixed(2)),
          low: parseFloat(low.toFixed(2)),
          close: parseFloat(close.toFixed(2)),
          volume: Math.floor(50000 + Math.random() * 200000)
        })
      }
      
      setChartData(initialData)
      lastPriceRef.current = currentPrice
      
      // Initialize stock data
      const openPrice = initialData[0]?.price || config.basePrice
      setStockData(prev => ({
        ...prev,
        symbol: currentSymbol,
      name: config.name,
      price: currentPrice,
      open: openPrice,
      high: Math.max(...initialData.map(d => d.high)),
      low: Math.min(...initialData.map(d => d.low)),
      close: openPrice,
      change: parseFloat((currentPrice - openPrice).toFixed(2)),
      changePercent: parseFloat((((currentPrice - openPrice) / openPrice) * 100).toFixed(2)),
      bid: parseFloat((currentPrice - 1).toFixed(2)),
      ask: parseFloat((currentPrice + 1).toFixed(2))
    }))
    
    // Generate initial order book
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []
    for (let i = 0; i < 5; i++) {
      bids.push({
        price: parseFloat((currentPrice - (i + 1) * 0.5 - Math.random() * 0.5).toFixed(2)),
        quantity: Math.floor(500 + Math.random() * 3000),
        orders: Math.floor(3 + Math.random() * 15)
      })
      asks.push({
        price: parseFloat((currentPrice + (i + 1) * 0.5 + Math.random() * 0.5).toFixed(2)),
        quantity: Math.floor(500 + Math.random() * 3000),
        orders: Math.floor(3 + Math.random() * 15)
      })
    }
    setOrderBook({ bids, asks })
    } catch (error) {
      console.error('Error initializing chart data:', error)
    }
  }, [currentSymbol, formatTime])

  // Real-time price updates
  useEffect(() => {
    if (!isLive) return

    const config = stockConfigs[currentSymbol] || stockConfigs['RELIANCE']
    
    const interval = setInterval(() => {
      // Generate price movement inline
      const randomFactor = (Math.random() - 0.5) * 2
      const trend = Math.sin(Date.now() / 50000) * 0.3
      const movement = lastPriceRef.current * config.volatility * (randomFactor + trend * 0.5)
      const newPrice = Math.max(lastPriceRef.current * 0.9, Math.min(lastPriceRef.current * 1.1, lastPriceRef.current + movement))
      
      lastPriceRef.current = newPrice
      tickCountRef.current++
      volumeAccumulatorRef.current += Math.floor(10000 + Math.random() * 50000)

      // Update stock data
      setStockData(prev => {
        const newHigh = Math.max(prev.high, newPrice)
        const newLow = Math.min(prev.low, newPrice)
        const change = newPrice - prev.open
        const changePercent = (change / prev.open) * 100
        
        return {
          ...prev,
          price: parseFloat(newPrice.toFixed(2)),
          high: parseFloat(newHigh.toFixed(2)),
          low: parseFloat(newLow.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          bid: parseFloat((newPrice - 0.5 - Math.random() * 1).toFixed(2)),
          ask: parseFloat((newPrice + 0.5 + Math.random() * 1).toFixed(2)),
          bidSize: Math.floor(500 + Math.random() * 2000),
          askSize: Math.floor(500 + Math.random() * 2000),
          volume: (volumeAccumulatorRef.current / 1000000).toFixed(2) + 'M'
        }
      })

      // Update chart data every 2 seconds (every 4 ticks at 500ms)
      if (tickCountRef.current % 4 === 0) {
        setChartData(prev => {
          const now = new Date()
          const lastPoint = prev[prev.length - 1]
          const open = lastPoint ? lastPoint.close : newPrice
          const close = newPrice
          const high = Math.max(open, close) * (1 + Math.random() * 0.001)
          const low = Math.min(open, close) * (1 - Math.random() * 0.001)
          
          const newPoint: ChartDataPoint = {
            time: formatTime(now),
            price: parseFloat(newPrice.toFixed(2)),
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: Math.floor(50000 + Math.random() * 200000)
          }
          
          // Keep last 50 data points
          const newData = [...prev.slice(-49), newPoint]
          return newData
        })
      }

      // Update order book every 2 ticks
      if (tickCountRef.current % 2 === 0) {
        const bids: OrderBookEntry[] = []
        const asks: OrderBookEntry[] = []
        for (let i = 0; i < 5; i++) {
          bids.push({
            price: parseFloat((newPrice - (i + 1) * 0.5 - Math.random() * 0.5).toFixed(2)),
            quantity: Math.floor(500 + Math.random() * 3000),
            orders: Math.floor(3 + Math.random() * 15)
          })
          asks.push({
            price: parseFloat((newPrice + (i + 1) * 0.5 + Math.random() * 0.5).toFixed(2)),
            quantity: Math.floor(500 + Math.random() * 3000),
            orders: Math.floor(3 + Math.random() * 15)
          })
        }
        setOrderBook({ bids, asks })
      }
    }, 500) // Update every 500ms for smooth animation

    return () => clearInterval(interval)
  }, [isLive, currentSymbol, formatTime])

  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL']
  const orderTypes = [
    { id: 'market', label: 'Market', desc: 'Execute at current price' },
    { id: 'limit', label: 'Limit', desc: 'Set your target price' },
    { id: 'sl', label: 'SL', desc: 'Stop loss with limit' },
    { id: 'slm', label: 'SL-M', desc: 'Stop loss market' },
  ]

  const estimatedCost = quantity * (price || stockData.price)
  const brokerage = estimatedCost * 0.0003 // 0.03%

  useEffect(() => {
    setPrice(stockData.price)
    setStopLoss(parseFloat((stockData.price * 0.98).toFixed(2)))
    setTakeProfit(parseFloat((stockData.price * 1.02).toFixed(2)))
  }, [stockData.price])

  const handlePlaceOrder = () => {
    console.log({
      symbol: stockData.symbol,
      type: activeTab.toUpperCase(),
      orderType,
      productType,
      quantity,
      price: orderType === 'market' ? 'MARKET' : price,
      stopLoss,
      takeProfit
    })
    // Dispatch order action
  }

  // Safety check
  if (!stockData || !stockData.symbol) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stock Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 lg:p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-lg">
              {stockData.symbol.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{stockData.symbol}</h1>
                <span className="px-2 py-1 rounded-lg bg-glass text-text-secondary text-xs">NSE</span>
                {/* Live Indicator */}
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                    isLive
                      ? 'bg-success/20 text-success'
                      : 'bg-glass text-text-secondary hover:bg-glass-hover'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-text-secondary'}`} />
                  {isLive ? 'LIVE' : 'PAUSED'}
                </button>
              </div>
              <p className="text-text-secondary">{stockData.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-glass hover:bg-glass-hover transition-colors text-text-secondary hover:text-warning">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-glass hover:bg-glass-hover transition-colors text-text-secondary hover:text-accent-blue">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-glass hover:bg-glass-hover transition-colors text-text-secondary hover:text-accent-blue">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <motion.p
              key={stockData.price}
              initial={{ scale: 1.05, color: stockData.change >= 0 ? '#22C55E' : '#EF4444' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              transition={{ duration: 0.3 }}
              className="text-4xl font-bold"
            >
              ₹{stockData.price.toLocaleString()}
            </motion.p>
            <p className={`text-lg flex items-center gap-2 ${stockData.changePercent >= 0 ? 'text-success' : 'text-danger'}`}>
              {stockData.changePercent >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({Math.abs(stockData.changePercent).toFixed(2)}%)
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-text-secondary">Open</span>
              <span className="text-white ml-2">₹{stockData.open.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-text-secondary">High</span>
              <span className="text-success ml-2">₹{stockData.high.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-text-secondary">Low</span>
              <span className="text-danger ml-2">₹{stockData.low.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-text-secondary">Vol</span>
              <span className="text-white ml-2">{stockData.volume}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Chart */}
          <div className="glass-card p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      chartPeriod === period
                        ? 'bg-accent-blue text-white'
                        : 'text-text-secondary hover:bg-glass-hover hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['line', 'candle', 'area'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                      chartType === type
                        ? 'bg-glass-hover text-white'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-72 lg:h-96">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-secondary">
                  Loading chart data...
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    />
                    <YAxis 
                      domain={['dataMin - 20', 'dataMax + 20']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      orientation="right"
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(14, 20, 27, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={stockData.changePercent >= 0 ? '#22C55E' : '#EF4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                ) : chartType === 'candle' ? (
                  <ComposedChart data={chartData}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    />
                    <YAxis 
                      domain={['dataMin - 20', 'dataMax + 20']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      orientation="right"
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(14, 20, 27, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
                    />
                    <Bar
                      dataKey="close"
                      fill="#22C55E"
                      stroke="#22C55E"
                    />
                  </ComposedChart>
                ) : (
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stockData.changePercent >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={stockData.changePercent >= 0 ? '#22C55E' : '#EF4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    />
                    <YAxis 
                      domain={['dataMin - 20', 'dataMax + 20']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      orientation="right"
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(14, 20, 27, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                      }}
                      labelStyle={{ color: '#9CA3AF' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={stockData.changePercent >= 0 ? '#22C55E' : '#EF4444'}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#priceGradient)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
              )}
            </div>

            {/* Volume Chart */}
            <div className="h-20 mt-4">
              {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <Bar dataKey="volume" fill="rgba(59, 130, 246, 0.5)" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Order Book & Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Book */}
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold mb-4">Order Book</h3>
              <div className="space-y-2">
                {/* Asks (Sell orders) */}
                <div className="space-y-1">
                  {[...orderBook.asks].reverse().map((ask, i) => (
                    <div key={i} className="relative">
                      <div 
                        className="absolute inset-y-0 right-0 bg-danger/10 rounded"
                        style={{ width: `${(ask.quantity / 3200) * 100}%` }}
                      />
                      <div className="relative flex justify-between px-2 py-1 text-sm">
                        <span className="text-danger">₹{ask.price.toFixed(2)}</span>
                        <span className="text-text-secondary">{ask.quantity}</span>
                        <span className="text-text-secondary">{ask.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Spread */}
                <div className="py-2 border-y border-glass-border text-center">
                  <span className="text-text-secondary text-sm">Spread: </span>
                  <span className="text-white font-medium">₹{(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}</span>
                </div>

                {/* Bids (Buy orders) */}
                <div className="space-y-1">
                  {orderBook.bids.map((bid, i) => (
                    <div key={i} className="relative">
                      <div 
                        className="absolute inset-y-0 left-0 bg-success/10 rounded"
                        style={{ width: `${(bid.quantity / 3200) * 100}%` }}
                      />
                      <div className="relative flex justify-between px-2 py-1 text-sm">
                        <span className="text-success">₹{bid.price.toFixed(2)}</span>
                        <span className="text-text-secondary">{bid.quantity}</span>
                        <span className="text-text-secondary">{bid.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stock Details */}
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold mb-4">Stock Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Market Cap</span>
                  <span className="text-white">₹{stockData.marketCap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">P/E Ratio</span>
                  <span className="text-white">{stockData.pe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Dividend %</span>
                  <span className="text-white">{stockData.dividend}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Avg Volume</span>
                  <span className="text-white">{stockData.avgVolume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">52W High</span>
                  <span className="text-success">₹{stockData.week52High}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">52W Low</span>
                  <span className="text-danger">₹{stockData.week52Low}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Prev Close</span>
                  <span className="text-white">₹{stockData.close}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Today's Range</span>
                  <span className="text-white">₹{stockData.low} - ₹{stockData.high}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 lg:p-6 h-fit lg:sticky lg:top-4"
        >
          {/* Buy/Sell Tabs */}
          <div className="flex rounded-xl bg-glass-secondary p-1 mb-6">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'buy'
                  ? 'bg-success text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'sell'
                  ? 'bg-danger text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Product Type */}
          <div className="mb-4">
            <label className="text-text-secondary text-sm mb-2 block">Product Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setProductType('intraday')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  productType === 'intraday'
                    ? 'bg-accent-blue text-white'
                    : 'bg-glass text-text-secondary hover:text-white'
                }`}
              >
                Intraday
              </button>
              <button
                onClick={() => setProductType('delivery')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  productType === 'delivery'
                    ? 'bg-accent-blue text-white'
                    : 'bg-glass text-text-secondary hover:text-white'
                }`}
              >
                Delivery
              </button>
            </div>
          </div>

          {/* Order Type */}
          <div className="mb-4">
            <label className="text-text-secondary text-sm mb-2 block">Order Type</label>
            <div className="grid grid-cols-4 gap-2">
              {orderTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setOrderType(type.id as any)}
                  className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                    orderType === type.id
                      ? 'bg-glass-hover text-white ring-1 ring-accent-blue'
                      : 'bg-glass text-text-secondary hover:text-white'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="text-text-secondary text-sm mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 input-glass text-center text-lg font-bold"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-glass flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price (for limit orders) */}
          {orderType !== 'market' && (
            <div className="mb-4">
              <label className="text-text-secondary text-sm mb-2 block">
                {orderType === 'limit' ? 'Limit Price' : 'Trigger Price'}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="input-glass pl-8 w-full"
                  step="0.05"
                />
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <div className="mb-6 p-4 rounded-xl bg-glass-secondary space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">Stop Loss</span>
                <Info className="w-3.5 h-3.5 text-text-secondary" />
              </div>
              <input
                type="number"
                value={stopLoss.toFixed(2)}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-white text-sm text-right"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">Take Profit</span>
                <Info className="w-3.5 h-3.5 text-text-secondary" />
              </div>
              <input
                type="number"
                value={takeProfit.toFixed(2)}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-white text-sm text-right"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Est. Cost</span>
              <span className="text-white font-medium">₹{estimatedCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Brokerage (est.)</span>
              <span className="text-white">₹{brokerage.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-glass-border">
              <span className="text-text-secondary">Available Balance</span>
              <span className="text-white font-medium">₹{balance.available.toLocaleString()}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              activeTab === 'buy'
                ? 'bg-success hover:bg-success/90 text-white'
                : 'bg-danger hover:bg-danger/90 text-white'
            }`}
          >
            {activeTab === 'buy' ? 'Buy' : 'Sell'} {stockData.symbol}
          </button>

          <p className="text-text-secondary text-xs text-center mt-3">
            Paper trading mode - No real money involved
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default TradePage
