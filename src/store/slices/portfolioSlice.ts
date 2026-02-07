import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Holding, Position, PortfolioSummary } from '@/types'

interface PortfolioState {
  holdings: Holding[]
  positions: Position[]
  summary: PortfolioSummary
  isLoading: boolean
}

const initialState: PortfolioState = {
  holdings: [],
  positions: [],
  summary: {
    totalInvested: 0,
    currentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    dayPnl: 0,
    dayPnlPercent: 0,
    availableMargin: 500, // Default demo balance
    usedMargin: 0,
  },
  isLoading: false,
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setHoldings: (state, action: PayloadAction<Holding[]>) => {
      state.holdings = action.payload
      // Recalculate summary
      const totalInvested = action.payload.reduce((sum, h) => sum + h.investedValue, 0)
      const currentValue = action.payload.reduce((sum, h) => sum + h.currentValue, 0)
      const dayPnl = action.payload.reduce((sum, h) => sum + h.dayChange * h.quantity, 0)
      
      state.summary.totalInvested = totalInvested
      state.summary.currentValue = currentValue
      state.summary.totalPnl = currentValue - totalInvested
      state.summary.totalPnlPercent = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0
      state.summary.dayPnl = dayPnl
      state.summary.dayPnlPercent = currentValue > 0 ? (dayPnl / currentValue) * 100 : 0
    },
    updateHolding: (state, action: PayloadAction<{ symbol: string; currentPrice: number }>) => {
      const holding = state.holdings.find(h => h.symbol === action.payload.symbol)
      if (holding) {
        const previousPrice = holding.currentPrice
        holding.currentPrice = action.payload.currentPrice
        holding.currentValue = holding.quantity * action.payload.currentPrice
        holding.pnl = holding.currentValue - holding.investedValue
        holding.pnlPercent = (holding.pnl / holding.investedValue) * 100
        holding.dayChange = action.payload.currentPrice - previousPrice
        holding.dayChangePercent = (holding.dayChange / previousPrice) * 100
      }
    },
    setPositions: (state, action: PayloadAction<Position[]>) => {
      state.positions = action.payload
    },
    updateSummary: (state, action: PayloadAction<Partial<PortfolioSummary>>) => {
      state.summary = { ...state.summary, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    addHolding: (state, action: PayloadAction<Holding>) => {
      const existingIndex = state.holdings.findIndex(h => h.symbol === action.payload.symbol)
      if (existingIndex !== -1) {
        // Merge with existing holding
        const existing = state.holdings[existingIndex]
        const totalQuantity = existing.quantity + action.payload.quantity
        const totalInvested = existing.investedValue + action.payload.investedValue
        state.holdings[existingIndex] = {
          ...existing,
          quantity: totalQuantity,
          averagePrice: totalInvested / totalQuantity,
          investedValue: totalInvested,
          currentValue: totalQuantity * action.payload.currentPrice,
          pnl: totalQuantity * action.payload.currentPrice - totalInvested,
          pnlPercent: ((totalQuantity * action.payload.currentPrice - totalInvested) / totalInvested) * 100,
        }
      } else {
        state.holdings.push(action.payload)
      }
    },
    removeHolding: (state, action: PayloadAction<string>) => {
      state.holdings = state.holdings.filter(h => h.symbol !== action.payload)
    },
  },
})

export const {
  setHoldings,
  updateHolding,
  setPositions,
  updateSummary,
  setLoading,
  addHolding,
  removeHolding,
} = portfolioSlice.actions

export default portfolioSlice.reducer
