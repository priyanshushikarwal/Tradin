// User Types
export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  avatar?: string
  role: 'user' | 'admin' | 'support'
  isVerified: boolean
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected'
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
  createdAt: string
  lastLogin?: string
  balance?: number
  withdrawalBlocked?: boolean
}

export interface KycDetails {
  pan: string
  panVerified: boolean
  aadhaar: string
  aadhaarVerified: boolean
  bankAccount: string
  bankIfsc: string
  bankVerified: boolean
  documents: {
    panCard?: string
    aadhaarFront?: string
    aadhaarBack?: string
    bankStatement?: string
  }
}

// Auth Types
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  phone: string
  password: string
  firstName: string
  lastName: string
}

// Market Types
export interface Instrument {
  symbol: string
  name: string
  exchange: string
  type: 'stock' | 'index' | 'commodity' | 'forex' | 'crypto'
  price: number
  previousClose: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  volume: number
  marketCap?: number
  pe?: number
  weekHigh52?: number
  weekLow52?: number
}

export interface PriceUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  timestamp: number
}

export interface OrderBookEntry {
  price: number
  quantity: number
  orders: number
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Order Types
export type OrderSide = 'buy' | 'sell'
export type OrderType = 'market' | 'limit' | 'stop-loss' | 'stop-limit'
export type OrderStatus = 'pending' | 'open' | 'filled' | 'partially-filled' | 'cancelled' | 'rejected'
export type OrderValidity = 'day' | 'ioc' | 'gtc' | 'gtt'

export interface Order {
  id: string
  userId: string
  symbol: string
  instrumentName: string
  side: OrderSide
  type: OrderType
  quantity: number
  filledQuantity: number
  price: number
  triggerPrice?: number
  stopLoss?: number
  takeProfit?: number
  trailingStop?: number
  status: OrderStatus
  validity: OrderValidity
  gttExpiry?: string
  createdAt: string
  updatedAt: string
  filledAt?: string
  averagePrice?: number
  fees: number
}

export interface TradeExecution {
  id: string
  orderId: string
  symbol: string
  side: OrderSide
  quantity: number
  price: number
  fees: number
  timestamp: string
}

// Portfolio Types
export interface Holding {
  symbol: string
  instrumentName: string
  exchange: string
  quantity: number
  averagePrice: number
  currentPrice: number
  investedValue: number
  currentValue: number
  pnl: number
  pnlPercent: number
  dayChange: number
  dayChangePercent: number
}

export interface Position {
  symbol: string
  instrumentName: string
  side: OrderSide
  quantity: number
  averagePrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalPnl: number
  totalPnlPercent: number
  dayPnl: number
  dayPnlPercent: number
  availableMargin: number
  usedMargin: number
}

// Wallet Types
export interface WalletBalance {
  total: number
  available: number
  blocked: number
  invested: number
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'commission' | 'bonus'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'held' | 'on_hold'
  description: string
  reference?: string
  createdAt: string
  completedAt?: string
  processingStartTime?: string
  processingEndTime?: string
  failureReason?: string
  isWithdrawalBlocked?: boolean
  supportTicketId?: string
}

export interface WithdrawalRequest {
  id: string
  userId: string
  amount: number
  bankName?: string
  accountNumber?: string
  ifsc?: string
  accountHolderName?: string
  status: 'pending' | 'processing' | 'held' | 'completed' | 'failed' | 'rejected'
  createdAt: string
  updatedAt: string
  transactionRef?: string
  failureReason?: string
  processingStartTime?: string
  processingEndTime?: string
  processingDuration?: number // in minutes (20-30 min)
  isBlocked?: boolean
  supportTicketId?: string
  attemptCount?: number
}

export interface DepositRequest {
  amount: number
  method: 'bank' | 'upi'
  reference?: string
}

export interface WithdrawalRequest {
  amount: number
  bankAccount: string
  ifsc: string
  accountHolder: string
}

// Support Types
export interface SupportTicket {
  id: string
  userId: string
  subject: string
  category: 'general' | 'technical' | 'deposit' | 'withdrawal' | 'kyc' | 'trading'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  messages: TicketMessage[]
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'user' | 'support' | 'admin'
  message: string
  attachments?: string[]
  createdAt: string
}

// Alert Types
export interface PriceAlert {
  id: string
  userId: string
  symbol: string
  instrumentName: string
  condition: 'above' | 'below' | 'crosses'
  targetPrice: number
  currentPrice: number
  isActive: boolean
  isTriggered: boolean
  triggeredAt?: string
  createdAt: string
}

// Strategy Types
export interface TradingStrategy {
  id: string
  userId: string
  name: string
  description: string
  status: 'active' | 'paused' | 'stopped'
  rules: StrategyRule[]
  performance: StrategyPerformance
  createdAt: string
}

export interface StrategyRule {
  id: string
  condition: string
  action: string
  parameters: Record<string, unknown>
}

export interface StrategyPerformance {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnl: number
  averagePnl: number
  maxDrawdown: number
}

// News Types
export interface NewsArticle {
  id: string
  title: string
  summary: string
  content: string
  source: string
  author: string
  imageUrl?: string
  category: string
  tags: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  publishedAt: string
}

// Calendar Types
export interface EconomicEvent {
  id: string
  title: string
  country: string
  date: string
  time: string
  impact: 'low' | 'medium' | 'high'
  actual?: string
  forecast?: string
  previous?: string
}

export interface EarningsEvent {
  id: string
  symbol: string
  companyName: string
  date: string
  time: 'before-market' | 'after-market'
  epsEstimate?: number
  epsActual?: number
  revenueEstimate?: number
  revenueActual?: number
}

// Admin Types
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  pendingKyc: number
  totalDeposits: number
  totalWithdrawals: number
  totalTrades: number
  totalVolume: number
  totalFees: number
  openTickets: number
}

export interface DepositApproval {
  id: string
  userId: string
  userName: string
  amount: number
  method: string
  reference: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  processedAt?: string
  processedBy?: string
  notes?: string
}

export interface WithdrawalApproval {
  id: string
  userId: string
  userName: string
  amount: number
  bankAccount: string
  ifsc: string
  accountHolder: string
  status: 'pending' | 'approved' | 'rejected' | 'processing'
  createdAt: string
  processedAt?: string
  processedBy?: string
  notes?: string
}

// Chart Types
export interface ChartConfig {
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | '1M'
  chartType: 'candlestick' | 'line' | 'bar' | 'area'
  indicators: string[]
  showVolume: boolean
  showGrid: boolean
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
