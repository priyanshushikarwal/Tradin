import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WalletBalance, Transaction } from '@/types'

interface WalletState {
  balance: WalletBalance
  transactions: Transaction[]
  isLoading: boolean
  pendingDeposits: number
  pendingWithdrawals: number
  withdrawalBlocked: boolean
  currentWithdrawalRequest: string | null
}

const initialState: WalletState = {
  balance: {
    total: 0, // NPR 0 initial balance
    available: 0,
    blocked: 0,
    invested: 0,
  },
  transactions: [],
  isLoading: false,
  pendingDeposits: 0,
  pendingWithdrawals: 0,
  withdrawalBlocked: false,
  currentWithdrawalRequest: null,
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<WalletBalance>) => {
      state.balance = action.payload
    },
    updateBalance: (state, action: PayloadAction<Partial<WalletBalance>>) => {
      state.balance = { ...state.balance, ...action.payload }
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<{ id: string; updates: Partial<Transaction> }>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload.updates }
      }
    },
    deductBalance: (state, action: PayloadAction<number>) => {
      state.balance.available -= action.payload
      state.balance.invested += action.payload
    },
    addToBalance: (state, action: PayloadAction<number>) => {
      state.balance.available += action.payload
      state.balance.total += action.payload
    },
    blockAmount: (state, action: PayloadAction<number>) => {
      state.balance.available -= action.payload
      state.balance.blocked += action.payload
    },
    unblockAmount: (state, action: PayloadAction<number>) => {
      state.balance.blocked -= action.payload
      state.balance.available += action.payload
    },
    setPendingDeposits: (state, action: PayloadAction<number>) => {
      state.pendingDeposits = action.payload
    },
    setPendingWithdrawals: (state, action: PayloadAction<number>) => {
      state.pendingWithdrawals = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    blockWithdrawal: (state) => {
      state.withdrawalBlocked = true
    },
    unblockWithdrawal: (state) => {
      state.withdrawalBlocked = false
    },
    setCurrentWithdrawalRequest: (state, action: PayloadAction<string | null>) => {
      state.currentWithdrawalRequest = action.payload
    },
  },
})

export const {
  setBalance,
  updateBalance,
  setTransactions,
  addTransaction,
  updateTransaction,
  deductBalance,
  addToBalance,
  blockAmount,
  unblockAmount,
  setPendingDeposits,
  setPendingWithdrawals,
  setLoading,
  blockWithdrawal,
  unblockWithdrawal,
  setCurrentWithdrawalRequest,
} = walletSlice.actions

export default walletSlice.reducer
