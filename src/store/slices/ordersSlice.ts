import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Order, TradeExecution } from '@/types'

interface OrdersState {
  orders: Order[]
  openOrders: Order[]
  orderHistory: Order[]
  trades: TradeExecution[]
  selectedOrder: Order | null
  isLoading: boolean
  isPlacingOrder: boolean
}

const initialState: OrdersState = {
  orders: [],
  openOrders: [],
  orderHistory: [],
  trades: [],
  selectedOrder: null,
  isLoading: false,
  isPlacingOrder: false,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload
      state.openOrders = action.payload.filter(o => 
        o.status === 'open' || o.status === 'pending' || o.status === 'partially-filled'
      )
      state.orderHistory = action.payload.filter(o => 
        o.status === 'filled' || o.status === 'cancelled' || o.status === 'rejected'
      )
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload)
      if (['open', 'pending', 'partially-filled'].includes(action.payload.status)) {
        state.openOrders.unshift(action.payload)
      } else {
        state.orderHistory.unshift(action.payload)
      }
    },
    updateOrder: (state, action: PayloadAction<{ id: string; updates: Partial<Order> }>) => {
      const updateInArray = (arr: Order[]) => {
        const index = arr.findIndex(o => o.id === action.payload.id)
        if (index !== -1) {
          arr[index] = { ...arr[index], ...action.payload.updates }
        }
        return index
      }
      
      updateInArray(state.orders)
      
      const order = state.orders.find(o => o.id === action.payload.id)
      if (order) {
        // Move between open and history based on status
        if (['filled', 'cancelled', 'rejected'].includes(order.status)) {
          state.openOrders = state.openOrders.filter(o => o.id !== action.payload.id)
          if (!state.orderHistory.find(o => o.id === action.payload.id)) {
            state.orderHistory.unshift(order)
          }
        } else {
          updateInArray(state.openOrders)
        }
      }
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find(o => o.id === action.payload)
      if (order) {
        order.status = 'cancelled'
        order.updatedAt = new Date().toISOString()
        state.openOrders = state.openOrders.filter(o => o.id !== action.payload)
        state.orderHistory.unshift(order)
      }
    },
    setTrades: (state, action: PayloadAction<TradeExecution[]>) => {
      state.trades = action.payload
    },
    addTrade: (state, action: PayloadAction<TradeExecution>) => {
      state.trades.unshift(action.payload)
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setPlacingOrder: (state, action: PayloadAction<boolean>) => {
      state.isPlacingOrder = action.payload
    },
  },
})

export const {
  setOrders,
  addOrder,
  updateOrder,
  cancelOrder,
  setTrades,
  addTrade,
  setSelectedOrder,
  setLoading,
  setPlacingOrder,
} = ordersSlice.actions

export default ordersSlice.reducer
