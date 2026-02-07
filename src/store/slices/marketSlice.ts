import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Instrument, OrderBook, CandleData, PriceUpdate } from '@/types'

interface MarketState {
  instruments: Instrument[]
  watchlist: string[]
  selectedSymbol: string | null
  orderBook: OrderBook | null
  candleData: CandleData[]
  timeframe: string
  searchQuery: string
  filter: 'all' | 'stocks' | 'indices' | 'commodities' | 'forex' | 'crypto'
  isLoading: boolean
}

const initialState: MarketState = {
  instruments: [],
  watchlist: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'],
  selectedSymbol: null,
  orderBook: null,
  candleData: [],
  timeframe: '1D',
  searchQuery: '',
  filter: 'all',
  isLoading: false,
}

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setInstruments: (state, action: PayloadAction<Instrument[]>) => {
      state.instruments = action.payload
    },
    updatePrice: (state, action: PayloadAction<PriceUpdate>) => {
      const index = state.instruments.findIndex(i => i.symbol === action.payload.symbol)
      if (index !== -1) {
        state.instruments[index] = {
          ...state.instruments[index],
          price: action.payload.price,
          change: action.payload.change,
          changePercent: action.payload.changePercent,
        }
      }
    },
    updatePrices: (state, action: PayloadAction<PriceUpdate[]>) => {
      action.payload.forEach(update => {
        const index = state.instruments.findIndex(i => i.symbol === update.symbol)
        if (index !== -1) {
          state.instruments[index] = {
            ...state.instruments[index],
            price: update.price,
            change: update.change,
            changePercent: update.changePercent,
          }
        }
      })
    },
    setSelectedSymbol: (state, action: PayloadAction<string | null>) => {
      state.selectedSymbol = action.payload
    },
    setOrderBook: (state, action: PayloadAction<OrderBook | null>) => {
      state.orderBook = action.payload
    },
    setCandleData: (state, action: PayloadAction<CandleData[]>) => {
      state.candleData = action.payload
    },
    addCandle: (state, action: PayloadAction<CandleData>) => {
      state.candleData.push(action.payload)
    },
    setTimeframe: (state, action: PayloadAction<string>) => {
      state.timeframe = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilter: (state, action: PayloadAction<MarketState['filter']>) => {
      state.filter = action.payload
    },
    addToWatchlist: (state, action: PayloadAction<string>) => {
      if (!state.watchlist.includes(action.payload)) {
        state.watchlist.push(action.payload)
      }
    },
    removeFromWatchlist: (state, action: PayloadAction<string>) => {
      state.watchlist = state.watchlist.filter(s => s !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  setInstruments,
  updatePrice,
  updatePrices,
  setSelectedSymbol,
  setOrderBook,
  setCandleData,
  addCandle,
  setTimeframe,
  setSearchQuery,
  setFilter,
  addToWatchlist,
  removeFromWatchlist,
  setLoading,
} = marketSlice.actions

export default marketSlice.reducer
