import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import marketReducer from './slices/marketSlice'
import portfolioReducer from './slices/portfolioSlice'
import walletReducer from './slices/walletSlice'
import ordersReducer from './slices/ordersSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    wallet: walletReducer,
    orders: ordersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
