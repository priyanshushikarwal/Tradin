import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit3,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bot,
  ArrowRight,
  ChevronDown,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { updateBalance, addTransaction } from '@/store/slices/walletSlice'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart, Cell, ReferenceLine } from 'recharts'

interface CandleData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface OrderBookEntry {
  price: number
  amount: number
}

interface RunningTrade {
  price: number
  amount: number
  time: string
  type: 'buy' | 'sell'
}

interface ActiveTrade {
  id: string
  type: 'buy' | 'sell'
  amount: number
  entryPrice: number
  duration: number
  startTime: number
  endTime: number
}

interface TradeResult {
  id: string
  type: 'buy' | 'sell'
  amount: number
  profit: number
  entryPrice: number
  exitPrice: number
  result: 'win' | 'loss'
}

// Stock configurations for different symbols
const stockConfigs: Record<string, { name: string; basePrice: number; volatility: number; symbol: string }> = {
  'BTC': { name: 'Bitcoin', basePrice: 26742.00, volatility: 0.003, symbol: 'BTC/USDT' },
  'ETH': { name: 'Ethereum', basePrice: 1856.50, volatility: 0.0025, symbol: 'ETH/USDT' },
  'RELIANCE': { name: 'Reliance Industries', basePrice: 2456.50, volatility: 0.002, symbol: 'RELIANCE/INR' },
  'TCS': { name: 'Tata Consultancy', basePrice: 3567.80, volatility: 0.0015, symbol: 'TCS/INR' },
  'INFY': { name: 'Infosys Ltd', basePrice: 1489.55, volatility: 0.0018, symbol: 'INFY/INR' },
  'HDFCBANK': { name: 'HDFC Bank', basePrice: 1623.40, volatility: 0.0012, symbol: 'HDFCBANK/INR' },
  'ICICIBANK': { name: 'ICICI Bank', basePrice: 987.25, volatility: 0.0016, symbol: 'ICICIBANK/INR' },
  'SBIN': { name: 'State Bank of India', basePrice: 623.15, volatility: 0.002, symbol: 'SBIN/INR' },
  'WIPRO': { name: 'Wipro Ltd', basePrice: 456.70, volatility: 0.0017, symbol: 'WIPRO/INR' },
  'TATAMOTORS': { name: 'Tata Motors', basePrice: 789.45, volatility: 0.0025, symbol: 'TATAMOTORS/INR' },
}

// Duration options
const durationOptions = [
  { label: '5s', value: 5 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
  { label: '2m', value: 120 },
  { label: '5m', value: 300 },
]

const TradePage = () => {
  const { symbol } = useParams<{ symbol: string }>()
  const dispatch = useAppDispatch()
  const { balance } = useAppSelector((state) => state.wallet)
  
  // Get stock config
  const currentSymbol = symbol || 'BTC'
  const stockConfig = stockConfigs[currentSymbol] || stockConfigs['BTC']
  const basePrice = stockConfig.basePrice

  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [chartType, setChartType] = useState<'candle' | 'depth'>('candle')
  const [orderBookTab, setOrderBookTab] = useState<'orderbook' | 'history'>('orderbook')
  const [bottomTab, setBottomTab] = useState<'running' | 'history'>('running')
  const [orderTab, setOrderTab] = useState<'active' | 'history'>('active')
  const [timeFrame, setTimeFrame] = useState('15m')
  const [isLive, setIsLive] = useState(true)

  // Trading state
  const [selectedDuration, setSelectedDuration] = useState(60) // Default 1 minute
  const [tradeAmount, setTradeAmount] = useState('100')
  const [activeTrade, setActiveTrade] = useState<ActiveTrade | null>(null)
  const [tradeTimeRemaining, setTradeTimeRemaining] = useState(0)
  const [tradeResults, setTradeResults] = useState<TradeResult[]>([])
  const [showResultModal, setShowResultModal] = useState(false)
  const [lastResult, setLastResult] = useState<TradeResult | null>(null)

  // Price stats
  const [stats] = useState({
    high24h: basePrice * 1.03,
    low24h: basePrice * 0.97,
    volBTC: 235676768,
    volLuna: 245676768,
  })

  // Current price state
  const [currentPrice, setCurrentPrice] = useState(basePrice)
  const [priceChange, setPriceChange] = useState(0)
  const [displayedBalance, setDisplayedBalance] = useState(balance.available)

  // Chart data state
  const [candleData, setCandleData] = useState<CandleData[]>([])
  
  // Order book state
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: []
  })

  // Running trades
  const [runningTrades, setRunningTrades] = useState<RunningTrade[]>([])

  // Refs for tracking
  const lastPriceRef = useRef(basePrice)
  const tickCountRef = useRef(0)
  const tradeDirectionRef = useRef<'up' | 'down' | null>(null)
  const currentPriceRef = useRef(basePrice)
  
  // Win/Loss ratio tracking (70:30 ratio with natural pattern)
  const tradeStatsRef = useRef({ totalTrades: 0, wins: 0, losses: 0 })
  const predeterminedOutcomeRef = useRef<'win' | 'loss' | null>(null)
  
  // Predetermined pattern for natural looking results
  // Pattern: W, W, L, W, L, W, W, W, L, W, W, L, W, L, W, W, W, L, W, W (repeating ~70% wins)
  const outcomePatternRef = useRef<('win' | 'loss')[]>([
    'win', 'win', 'loss', 'win', 'loss',      // 3W 2L
    'win', 'win', 'win', 'loss', 'win',       // 4W 1L
    'win', 'loss', 'win', 'loss', 'win',      // 3W 2L
    'win', 'win', 'loss', 'win', 'win',       // 4W 1L
  ])
  const patternIndexRef = useRef(0)

  const timeFrames = ['1m', '5m', '15m', '30m', '45m', '1h', '1y', 'All']

  // Keep currentPriceRef in sync
  useEffect(() => {
    currentPriceRef.current = currentPrice
  }, [currentPrice])

  // Animate balance changes
  useEffect(() => {
    const targetBalance = balance.available
    const diff = targetBalance - displayedBalance
    
    if (Math.abs(diff) < 0.01) {
      setDisplayedBalance(targetBalance)
      return
    }

    const step = diff / 20
    const interval = setInterval(() => {
      setDisplayedBalance(prev => {
        const newValue = prev + step
        if ((step > 0 && newValue >= targetBalance) || (step < 0 && newValue <= targetBalance)) {
          return targetBalance
        }
        return newValue
      })
    }, 30)

    return () => clearInterval(interval)
  }, [balance.available, displayedBalance])

  // Generate order book
  const generateOrderBook = useCallback((price: number) => {
    const bids: OrderBookEntry[] = []
    const asks: OrderBookEntry[] = []
    
    for (let i = 0; i < 8; i++) {
      const bidPrice = price - (i + 1) * (price * 0.0001)
      const askPrice = price + (i + 1) * (price * 0.0001)
      
      bids.push({
        price: parseFloat(bidPrice.toFixed(2)),
        amount: parseFloat((Math.random() * 0.5 + 0.001).toFixed(5)),
      })
      asks.push({
        price: parseFloat(askPrice.toFixed(2)),
        amount: parseFloat((Math.random() * 0.5 + 0.001).toFixed(5)),
      })
    }
    
    setOrderBook({ bids, asks: asks.reverse() })
  }, [])

  // Generate running trades
  const generateRunningTrades = useCallback((price: number) => {
    const trades: RunningTrade[] = []
    const now = new Date()
    
    for (let i = 0; i < 8; i++) {
      const tradePrice = price + (Math.random() - 0.5) * price * 0.01
      const time = new Date(now.getTime() - i * 60000 * Math.random() * 10)
      
      trades.push({
        price: parseFloat(tradePrice.toFixed(2)),
        amount: parseFloat((Math.random() * 200 + 50).toFixed(2)),
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        type: Math.random() > 0.5 ? 'buy' : 'sell'
      })
    }
    
    setRunningTrades(trades)
  }, [])

  // Generate initial candle data
  useEffect(() => {
    const initialData: CandleData[] = []
    let price = basePrice * 0.95
    
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.48) * basePrice * 0.008
      const open = price
      price = price + change
      const close = price
      const high = Math.max(open, close) + Math.random() * basePrice * 0.003
      const low = Math.min(open, close) - Math.random() * basePrice * 0.003
      const volume = Math.floor(50000 + Math.random() * 200000)
      
      initialData.push({
        time: `${i}`,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume
      })
    }
    
    setCandleData(initialData)
    lastPriceRef.current = price
    setCurrentPrice(price)
    generateOrderBook(price)
    generateRunningTrades(price)
  }, [basePrice, generateOrderBook, generateRunningTrades])

  // Real-time updates with trade-aware price movement
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      tickCountRef.current++
      
      let randomChange: number
      
      // If there's an active trade, bias the price movement in the user's favor
      if (tradeDirectionRef.current) {
        const bias = tradeDirectionRef.current === 'up' ? 0.7 : 0.3
        randomChange = (Math.random() < bias ? 1 : -1) * Math.random() * stockConfig.volatility * lastPriceRef.current * 2.5
      } else {
        randomChange = (Math.random() - 0.48) * stockConfig.volatility * lastPriceRef.current * 3
      }
      
      const newPrice = lastPriceRef.current + randomChange
      lastPriceRef.current = newPrice
      
      setCurrentPrice(parseFloat(newPrice.toFixed(2)))
      setPriceChange(parseFloat(((newPrice - basePrice) / basePrice * 100).toFixed(2)))

      // Update candle data every 3 ticks
      if (tickCountRef.current % 3 === 0) {
        setCandleData(prev => {
          const lastCandle = prev[prev.length - 1]
          const newCandle: CandleData = {
            time: `${parseInt(lastCandle.time) + 1}`,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice) + Math.random() * basePrice * 0.001,
            low: Math.min(lastCandle.close, newPrice) - Math.random() * basePrice * 0.001,
            close: parseFloat(newPrice.toFixed(2)),
            volume: Math.floor(50000 + Math.random() * 200000)
          }
          return [...prev.slice(-49), newCandle]
        })
      }

      // Update order book every 2 ticks
      if (tickCountRef.current % 2 === 0) {
        generateOrderBook(newPrice)
      }

      // Update running trades occasionally
      if (tickCountRef.current % 5 === 0) {
        setRunningTrades(prev => {
          const newTrade: RunningTrade = {
            price: parseFloat(newPrice.toFixed(2)),
            amount: parseFloat((Math.random() * 200 + 50).toFixed(2)),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            type: Math.random() > 0.5 ? 'buy' : 'sell'
          }
          return [newTrade, ...prev.slice(0, 7)]
        })
      }
    }, 500)

    return () => clearInterval(interval)
  }, [isLive, stockConfig.volatility, basePrice, generateOrderBook])

  // Get next outcome from pattern (natural looking 70:30 ratio)
  const getNextOutcome = useCallback((): 'win' | 'loss' => {
    const pattern = outcomePatternRef.current
    const index = patternIndexRef.current
    
    // Get the outcome from pattern
    const outcome = pattern[index % pattern.length]
    
    // Move to next position
    patternIndexRef.current = (index + 1) % pattern.length
    
    // Add small randomness: 10% chance to flip the outcome for more natural feel
    // But only after the first 2 trades (which are guaranteed wins)
    if (tradeStatsRef.current.totalTrades >= 2 && Math.random() < 0.1) {
      return outcome === 'win' ? 'loss' : 'win'
    }
    
    return outcome
  }, [])

  // Complete trade function
  const completeTrade = useCallback((trade: ActiveTrade) => {
    // Use the predetermined outcome that was set when trade was placed
    const userWins = predeterminedOutcomeRef.current === 'win'
    
    // Calculate exit price based on outcome (make chart match the result)
    let exitPrice: number
    if (userWins) {
      // Price moved in user's favor
      const movement = trade.entryPrice * (0.001 + Math.random() * 0.003)
      exitPrice = trade.type === 'buy' 
        ? trade.entryPrice + movement 
        : trade.entryPrice - movement
    } else {
      // Price moved against user
      const movement = trade.entryPrice * (0.001 + Math.random() * 0.003)
      exitPrice = trade.type === 'buy' 
        ? trade.entryPrice - movement 
        : trade.entryPrice + movement
    }
    
    // Update trade stats
    tradeStatsRef.current.totalTrades++
    if (userWins) {
      tradeStatsRef.current.wins++
    } else {
      tradeStatsRef.current.losses++
    }
    
    // Profit is ~50% of trade amount for wins, lose full amount for losses
    const profitPercent = 0.45 + Math.random() * 0.15 // 45-60% profit
    const profit = userWins ? trade.amount * profitPercent : -trade.amount
    
    const result: TradeResult = {
      id: trade.id,
      type: trade.type,
      amount: trade.amount,
      profit: parseFloat(profit.toFixed(2)),
      entryPrice: trade.entryPrice,
      exitPrice: parseFloat(exitPrice.toFixed(2)),
      result: userWins ? 'win' : 'loss'
    }

    // Update wallet balance
    const newAvailable = balance.available + trade.amount + profit
    const newTotal = balance.total + profit
    
    dispatch(updateBalance({
      available: parseFloat(newAvailable.toFixed(2)),
      total: parseFloat(newTotal.toFixed(2)),
      invested: Math.max(0, balance.invested - trade.amount)
    }))

    // Add transaction
    dispatch(addTransaction({
      id: Date.now().toString(),
      type: userWins ? 'profit' : 'loss',
      amount: Math.abs(profit),
      status: 'completed',
      date: new Date().toISOString(),
      description: `${trade.type.toUpperCase()} ${stockConfig.symbol} - ${userWins ? 'Profit' : 'Loss'}`
    }))

    // Show result
    setLastResult(result)
    setTradeResults(prev => [result, ...prev.slice(0, 9)])
    setShowResultModal(true)
    setActiveTrade(null)
    tradeDirectionRef.current = null

    // Reset predetermined outcome
    predeterminedOutcomeRef.current = null

    // Auto-hide modal after 3 seconds
    setTimeout(() => setShowResultModal(false), 3000)
  }, [balance, dispatch, stockConfig.symbol])

  // Trade countdown timer
  useEffect(() => {
    if (!activeTrade) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, activeTrade.endTime - now)
      setTradeTimeRemaining(remaining)

      if (remaining <= 0) {
        completeTrade(activeTrade)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [activeTrade, completeTrade])

  // Place trade function
  const placeTrade = (type: 'buy' | 'sell') => {
    const amount = parseFloat(tradeAmount)
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid trade amount')
      return
    }
    
    if (amount > balance.available) {
      alert('Insufficient balance')
      return
    }

    if (activeTrade) {
      alert('Please wait for current trade to complete')
      return
    }

    // Deduct from balance
    dispatch(updateBalance({
      available: balance.available - amount,
      invested: balance.invested + amount
    }))

    // Get outcome from natural pattern (70:30 ratio)
    const outcome = getNextOutcome()
    predeterminedOutcomeRef.current = outcome
    const willWin = outcome === 'win'
    
    // Set trade direction for price bias based on predetermined outcome
    // If user will win: bias price in their favor
    // If user will lose: bias price against them
    if (willWin) {
      tradeDirectionRef.current = type === 'buy' ? 'up' : 'down'
    } else {
      tradeDirectionRef.current = type === 'buy' ? 'down' : 'up'
    }

    // Create active trade
    const trade: ActiveTrade = {
      id: Date.now().toString(),
      type,
      amount,
      entryPrice: currentPrice,
      duration: selectedDuration,
      startTime: Date.now(),
      endTime: Date.now() + selectedDuration * 1000
    }

    setActiveTrade(trade)
    setTradeTimeRemaining(selectedDuration * 1000)

    // Add to running trades
    setRunningTrades(prev => [{
      price: currentPrice,
      amount,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
      type
    }, ...prev.slice(0, 7)])

    // Log for debugging (remove in production)
    console.log(`Trade placed: ${type.toUpperCase()} | Outcome: ${willWin ? 'WIN' : 'LOSS'} | Stats: ${tradeStatsRef.current.wins}W/${tradeStatsRef.current.losses}L`)
  }

  // Calculate potential profit
  const potentialProfit = parseFloat(tradeAmount) * 0.5 || 0

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-3 overflow-hidden relative">
      {/* Trade Result Modal */}
      <AnimatePresence>
        {showResultModal && lastResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              className={`glass-card p-8 rounded-2xl text-center ${
                lastResult.result === 'win' ? 'border-2 border-success' : 'border-2 border-danger'
              }`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  lastResult.result === 'win' ? 'bg-emerald-500/20' : 'bg-danger/20'
                }`}
              >
                <CheckCircle className={`w-10 h-10 ${
                  lastResult.result === 'win' ? 'text-emerald-400' : 'text-danger'
                }`} />
              </motion.div>
              <h2 className={`text-2xl font-bold mb-2 ${
                lastResult.result === 'win' ? 'text-emerald-400' : 'text-danger'
              }`}>
                {lastResult.result === 'win' ? 'You Won!' : 'Trade Lost'}
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                {lastResult.result === 'win' ? '+' : ''}{lastResult.profit.toFixed(2)} USDT
              </motion.p>
              <p className="text-gray-400 text-sm">
                Entry: ${lastResult.entryPrice.toLocaleString()} → Exit: ${lastResult.exitPrice.toLocaleString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Trade Overlay */}
      <AnimatePresence>
        {activeTrade && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-40"
          >
            <div className={`glass-card px-6 py-3 rounded-full flex items-center gap-4 border-2 ${
              activeTrade.type === 'buy' ? 'border-emerald-400' : 'border-danger'
            }`}>
              <div className={`p-2 rounded-full ${
                activeTrade.type === 'buy' ? 'bg-emerald-500/20' : 'bg-danger/20'
              }`}>
                {activeTrade.type === 'buy' ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-danger" />
                )}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {activeTrade.type.toUpperCase()} ${activeTrade.amount}
                </p>
                <p className="text-gray-400 text-xs">
                  Entry: ${activeTrade.entryPrice.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <motion.span
                  key={tradeTimeRemaining}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-white font-mono text-lg"
                >
                  {Math.ceil(tradeTimeRemaining / 1000)}s
                </motion.span>
              </div>
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="glass-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
              ₿
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold">{stockConfig.symbol}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-400">24h High</span>
              <p className="text-emerald-400 font-medium">{stats.high24h.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400">24h Low</span>
              <p className="text-danger font-medium">{stats.low24h.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-400">24h Vol</span>
              <p className="text-purple-400 font-medium">{(stats.volBTC / 1000000).toFixed(0)}M</p>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-gray-400 text-xs">Balance</p>
            <motion.p
              key={Math.floor(displayedBalance)}
              className="text-white font-bold text-lg"
            >
              ${displayedBalance.toFixed(2)}
            </motion.p>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left - Order Book */}
        <div className="col-span-2 glass-card flex flex-col min-h-0">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setOrderBookTab('orderbook')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                orderBookTab === 'orderbook' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'
              }`}
            >
              Order Book
            </button>
            <button
              onClick={() => setOrderBookTab('history')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                orderBookTab === 'history' ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'
              }`}
            >
              History
            </button>
          </div>

          <div className="p-2 flex gap-2">
            <button className="p-1.5 rounded bg-white/5">
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1.5 rounded bg-white/5">
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="px-2 pb-1 grid grid-cols-2 text-xs text-gray-400">
            <span>Amount</span>
            <span className="text-right">Price</span>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
            {orderBook.asks.map((ask, i) => (
              <div key={`ask-${i}`} className="grid grid-cols-2 text-xs py-0.5 relative">
                <span className="text-white z-10">{ask.amount.toFixed(5)}</span>
                <span className="text-danger text-right z-10">{ask.price.toLocaleString()}</span>
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-danger/10"
                  style={{ width: `${Math.min(ask.amount * 200, 100)}%` }}
                />
              </div>
            ))}

            <div className="py-2 flex items-center justify-between border-y border-white/10 my-1">
              <motion.span
                key={currentPrice}
                initial={{ color: priceChange >= 0 ? '#10B981' : '#EF4444' }}
                animate={{ color: '#10B981' }}
                className="text-lg font-bold"
              >
                {currentPrice.toLocaleString()}
              </motion.span>
              <span className={`text-xs ${priceChange >= 0 ? 'text-emerald-400' : 'text-danger'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>

            {orderBook.bids.map((bid, i) => (
              <div key={`bid-${i}`} className="grid grid-cols-2 text-xs py-0.5 relative">
                <span className="text-white z-10">{bid.amount.toFixed(5)}</span>
                <span className="text-emerald-400 text-right z-10">{bid.price.toLocaleString()}</span>
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/10"
                  style={{ width: `${Math.min(bid.amount * 200, 100)}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Center - Chart */}
        <div className="col-span-7 glass-card flex flex-col min-h-0">
          <div className="flex items-center justify-between p-2 border-b border-white/10">
            <div className="flex gap-1">
              <button
                onClick={() => setChartType('candle')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  chartType === 'candle' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Candle
              </button>
              <button
                onClick={() => setChartType('depth')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  chartType === 'depth' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Depth
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <Camera className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <Square className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <ZoomOut className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button className="p-1.5 rounded hover:bg-white/5 transition-colors">
                <Edit3 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-white/10 overflow-x-auto">
            {timeFrames.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  timeFrame === tf ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex-1 p-2 min-h-0 relative">
            {/* Trade Direction Indicator */}
            {activeTrade && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`absolute left-4 top-4 z-10 px-3 py-1.5 rounded-lg ${
                  activeTrade.type === 'buy' ? 'bg-emerald-500/20 border border-emerald-400' : 'bg-danger/20 border border-danger'
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeTrade.type === 'buy' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-danger" />
                  )}
                  <span className={`text-sm font-medium ${
                    activeTrade.type === 'buy' ? 'text-emerald-400' : 'text-danger'
                  }`}>
                    {activeTrade.type === 'buy' ? 'CALL' : 'PUT'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Current Price Indicator */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
              <div className={`px-2 py-1 rounded-l text-xs font-bold ${
                priceChange >= 0 ? 'bg-emerald-500 text-white' : 'bg-danger text-white'
              }`}>
                <div>{currentPrice.toLocaleString()}</div>
                <div className="text-[10px] opacity-80">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="75%">
              <ComposedChart data={candleData} margin={{ top: 10, right: 70, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#DC2626" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={{ stroke: '#374151', strokeWidth: 0.5 }}
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  interval={4}
                  tickFormatter={(value, index) => {
                    const baseTime = new Date()
                    baseTime.setMinutes(baseTime.getMinutes() - (50 - parseInt(value)) * 15)
                    return baseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  }}
                />
                <YAxis 
                  domain={['dataMin - 50', 'dataMax + 50']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  orientation="right"
                  tickFormatter={(v) => v.toLocaleString()}
                  width={60}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      const change = data.close - data.open
                      const changePercent = ((change / data.open) * 100).toFixed(2)
                      const isUp = change >= 0
                      const baseTime = new Date()
                      baseTime.setMinutes(baseTime.getMinutes() - (50 - parseInt(data.time)) * 15)
                      
                      return (
                        <div className="bg-[#1a1f2e]/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl min-w-[180px]">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Open</span>
                              <span className={`font-medium ${isUp ? 'text-emerald-400' : 'text-danger'}`}>
                                <span className="text-gray-500 mr-1">{isUp ? '▲' : '▼'}</span>
                                {data.open.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">High</span>
                              <span className="text-emerald-400 font-medium">
                                <span className="text-gray-500 mr-1">▲</span>
                                {data.high.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Low
                              </span>
                              <span className="text-danger font-medium">
                                <span className="text-gray-500 mr-1">▼</span>
                                {data.low.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Close</span>
                              <span className={`font-medium ${isUp ? 'text-emerald-400' : 'text-danger'}`}>
                                <span className="text-gray-500 mr-1">{isUp ? '▲' : '▼'}</span>
                                {data.close.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-gray-700">
                              <span className="text-gray-400 text-sm">Change</span>
                              <span className={`font-medium ${isUp ? 'text-emerald-400' : 'text-danger'}`}>
                                <span className="text-gray-500 mr-1">{isUp ? '▲' : '▼'}</span>
                                {isUp ? '+' : ''}{change.toFixed(0)} ({isUp ? '+' : ''}{changePercent}%)
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Vol</span>
                              <span className="text-emerald-400 font-medium">
                                <span className="text-gray-500 mr-1">▲</span>
                                {(data.volume).toLocaleString()} BTC
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-700 text-gray-500 text-xs text-center">
                            {baseTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {baseTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ stroke: '#4B5563', strokeDasharray: '4 4' }}
                />
                {/* Entry price line when trading */}
                {activeTrade && (
                  <ReferenceLine 
                    y={activeTrade.entryPrice} 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{ 
                      value: `Entry: ${activeTrade.entryPrice.toLocaleString()}`, 
                      position: 'left',
                      fill: '#F59E0B',
                      fontSize: 10
                    }}
                  />
                )}
                <ReferenceLine 
                  y={currentPrice} 
                  stroke={priceChange >= 0 ? '#10B981' : '#EF4444'}
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                />
                <Bar
                  dataKey="high"
                  shape={(props: any) => {
                    const { x, width, payload } = props
                    const isUp = payload.close >= payload.open
                    const color = isUp ? '#10B981' : '#EF4444'
                    const candleWidth = Math.max(width * 0.6, 4)
                    const xPos = x + (width - candleWidth) / 2
                    
                    const yScale = props.height / (props.high - props.low || 1)
                    const chartTop = props.y
                    
                    const highY = chartTop
                    const lowY = chartTop + props.height
                    const openY = chartTop + (payload.high - payload.open) * yScale
                    const closeY = chartTop + (payload.high - payload.close) * yScale
                    
                    const bodyTop = Math.min(openY, closeY)
                    const bodyHeight = Math.max(Math.abs(closeY - openY), 3)

                    return (
                      <g>
                        {/* Wick/Shadow */}
                        <line
                          x1={x + width / 2}
                          y1={highY}
                          x2={x + width / 2}
                          y2={lowY}
                          stroke={color}
                          strokeWidth={1.5}
                        />
                        {/* Candle Body */}
                        <rect
                          x={xPos}
                          y={bodyTop}
                          width={candleWidth}
                          height={bodyHeight}
                          fill={isUp ? '#0D1117' : color}
                          stroke={color}
                          strokeWidth={1.5}
                          rx={1}
                        />
                      </g>
                    )
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height="22%">
              <BarChart data={candleData} margin={{ top: 0, right: 70, left: 0, bottom: 0 }}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                  {candleData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.close >= entry.open ? '#10B981' : '#EF4444'}
                      opacity={0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right - Trading Form */}
        <div className="col-span-3 glass-card flex flex-col min-h-0">
          {/* Buy/Sell Toggle */}
          <div className="flex p-2 gap-2">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'buy'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>UP</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'sell'
                  ? 'bg-danger text-white shadow-lg shadow-danger/25'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="w-4 h-4" />
                <span>DOWN</span>
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Duration Selection */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Duration</label>
              <div className="grid grid-cols-5 gap-1">
                {durationOptions.map((duration) => (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    disabled={!!activeTrade}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedDuration === duration.value
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    } ${activeTrade ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {duration.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Amount</span>
                <span className="text-gray-400">
                  Available: <span className="text-emerald-400">${balance.available.toFixed(2)}</span>
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="input-glass w-full pl-7 pr-16 text-lg font-semibold"
                  disabled={!!activeTrade}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  USDT
                </span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTradeAmount(amount.toString())}
                  className="py-2 rounded-lg bg-white/5 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-colors"
                  disabled={!!activeTrade}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Potential Profit */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Potential Profit</span>
                <span className="text-emerald-400 font-bold text-lg">+${potentialProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Payout</span>
                <span className="text-white">~150%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{durationOptions.find(d => d.value === selectedDuration)?.label}</span>
              </div>
            </div>

            {/* Trade Button */}
            <motion.button
              whileHover={{ scale: activeTrade ? 1 : 1.02 }}
              whileTap={{ scale: activeTrade ? 1 : 0.98 }}
              onClick={() => placeTrade(activeTab)}
              disabled={!!activeTrade}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                activeTrade
                  ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                  : activeTab === 'buy'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 text-white'
                    : 'bg-gradient-to-r from-danger to-rose-400 hover:shadow-lg hover:shadow-danger/25 text-white'
              }`}
            >
              {activeTrade ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Trade in Progress...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {activeTab === 'buy' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  <span>{activeTab === 'buy' ? 'CALL (UP)' : 'PUT (DOWN)'}</span>
                </div>
              )}
            </motion.button>

            <p className="text-gray-400 text-xs text-center">
              {activeTrade 
                ? `Trade ends in ${Math.ceil(tradeTimeRemaining / 1000)}s`
                : 'Paper trading mode - Practice with virtual funds'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-12 gap-3 h-48">
        {/* Running Trade */}
        <div className="col-span-3 glass-card flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="flex gap-4">
              <button
                onClick={() => setBottomTab('running')}
                className={`text-sm font-medium transition-colors ${
                  bottomTab === 'running' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Running trade
              </button>
              <button
                onClick={() => setBottomTab('history')}
                className={`text-sm font-medium transition-colors ${
                  bottomTab === 'history' ? 'text-white' : 'text-gray-400'
                }`}
              >
                History
              </button>
            </div>
            <button className="text-purple-400 text-xs flex items-center gap-1 hover:underline">
              See All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 px-3 py-1.5 text-xs text-gray-400 border-b border-white/10">
              <span>Price</span>
              <span className="text-center">Amount</span>
              <span className="text-right">Time</span>
            </div>
            {runningTrades.map((trade, i) => (
              <div key={i} className="grid grid-cols-3 px-3 py-1 text-xs">
                <span className={trade.type === 'buy' ? 'text-emerald-400' : 'text-danger'}>
                  {trade.price.toLocaleString()}
                </span>
                <span className="text-center text-white">{trade.amount.toFixed(2)}</span>
                <span className="text-right text-gray-400">{trade.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade Results */}
        <div className="col-span-9 glass-card flex flex-col">
          <div className="flex items-center gap-4 px-3 py-2 border-b border-white/10">
            <button
              onClick={() => setOrderTab('active')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                orderTab === 'active' ? 'bg-white/5 text-white' : 'text-gray-400'
              }`}
            >
              Recent Trades
            </button>
            <button
              onClick={() => setOrderTab('history')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                orderTab === 'history' ? 'bg-white/5 text-white' : 'text-gray-400'
              }`}
            >
              All History
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-6 px-3 py-1.5 text-xs text-gray-400 border-b border-white/10">
              <span>Type</span>
              <span className="text-center">Amount</span>
              <span className="text-center">Entry</span>
              <span className="text-center">Exit</span>
              <span className="text-center">P/L</span>
              <span className="text-right">Result</span>
            </div>
            {tradeResults.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
                No trades yet. Start trading!
              </div>
            ) : (
              tradeResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-6 px-3 py-2 text-xs items-center hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    {result.type === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-danger" />
                    )}
                    <span className="text-white uppercase">{result.type}</span>
                  </div>
                  <span className="text-center text-white">${result.amount}</span>
                  <span className="text-center text-gray-400">${result.entryPrice.toLocaleString()}</span>
                  <span className="text-center text-gray-400">${result.exitPrice.toLocaleString()}</span>
                  <span className={`text-center font-medium ${result.result === 'win' ? 'text-emerald-400' : 'text-danger'}`}>
                    {result.profit >= 0 ? '+' : ''}{result.profit.toFixed(2)}
                  </span>
                  <span className={`text-right font-medium ${result.result === 'win' ? 'text-emerald-400' : 'text-danger'}`}>
                    {result.result === 'win' ? '✓ WIN' : '✗ LOSS'}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradePage
