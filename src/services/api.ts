import axios from 'axios'
import { 
  LoginCredentials, 
  SignupData, 
  User, 
  Instrument, 
  Order, 
  Holding,
  Transaction,
  SupportTicket,
  PriceAlert
} from '@/types'

const API_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth Services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  signup: async (data: SignupData): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/signup', data)
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { oldPassword, newPassword })
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  verifyOtp: async (email: string, otp: string): Promise<void> => {
    await api.post('/auth/verify-otp', { email, otp })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password })
  },
}

// Market Services
export const marketService = {
  getInstruments: async (): Promise<Instrument[]> => {
    const response = await api.get('/market/instruments')
    return response.data
  },

  getInstrument: async (symbol: string): Promise<Instrument> => {
    const response = await api.get(`/market/instruments/${symbol}`)
    return response.data
  },

  searchInstruments: async (query: string): Promise<Instrument[]> => {
    const response = await api.get(`/market/search?q=${query}`)
    return response.data
  },

  getCandles: async (symbol: string, timeframe: string): Promise<unknown[]> => {
    const response = await api.get(`/market/candles/${symbol}?timeframe=${timeframe}`)
    return response.data
  },

  getOrderBook: async (symbol: string): Promise<unknown> => {
    const response = await api.get(`/market/orderbook/${symbol}`)
    return response.data
  },
}

// Order Services
export const orderService = {
  placeOrder: async (order: Partial<Order>): Promise<Order> => {
    const response = await api.post('/orders', order)
    return response.data
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders')
    return response.data
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },

  modifyOrder: async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}`, updates)
    return response.data
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await api.delete(`/orders/${orderId}`)
  },

  getTrades: async (): Promise<unknown[]> => {
    const response = await api.get('/orders/trades')
    return response.data
  },
}

// Portfolio Services
export const portfolioService = {
  getHoldings: async (): Promise<Holding[]> => {
    const response = await api.get('/portfolio/holdings')
    return response.data
  },

  getPositions: async (): Promise<unknown[]> => {
    const response = await api.get('/portfolio/positions')
    return response.data
  },

  getSummary: async (): Promise<unknown> => {
    const response = await api.get('/portfolio/summary')
    return response.data
  },
}

// Wallet Services
export const walletService = {
  getBalance: async (): Promise<unknown> => {
    const response = await api.get('/wallet/balance')
    return response.data
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/wallet/transactions')
    return response.data
  },

  requestDeposit: async (amount: number, method: string, discountCode?: string): Promise<{ balance: number; finalAmount: number }> => {
    const response = await api.post('/wallet/deposit', { amount, method, discountCode })
    return response.data
  },

  deposit: async (amount: number, method: string, discountCode?: string, paymentProof?: { utrNumber: string; screenshot: string }): Promise<{ balance: number; finalAmount: number; depositId?: string; status?: string }> => {
    const response = await api.post('/wallet/deposit', { amount, method, discountCode, paymentProof })
    return response.data
  },

  requestWithdrawal: async (amount: number, bankDetails: unknown): Promise<any> => {
    const response = await api.post('/wallet/withdraw', { amount, ...bankDetails })
    return response.data
  },

  submitPaymentProof: async (withdrawalId: string, paymentProof: { utrNumber: string; serverCharge: number; screenshot?: string }): Promise<any> => {
    const response = await api.post(`/wallet/withdraw/${withdrawalId}/payment-proof`, { paymentProof })
    return response.data
  },

  getWithdrawalStatus: async (userId: string): Promise<unknown> => {
    const response = await api.get(`/wallet/withdrawal-status/${userId}`)
    return response.data
  },

  contactSupportForWithdrawal: async (withdrawalId: string, message: string): Promise<void> => {
    await api.post('/wallet/withdrawal-support', { withdrawalId, message })
  },

  unholdAccount: async (): Promise<void> => {
    const response = await api.post('/wallet/unhold-account')
    return response.data
  },

  getUnholdStatus: async (): Promise<{ hasPendingUnholdRequest: boolean; unholdRequest: any }> => {
    const response = await api.get('/wallet/unhold-status')
    return response.data
  },

  submitUnholdPaymentProof: async (data: { utrNumber: string; unholdCharge: number; screenshot: string }): Promise<any> => {
    const response = await api.post('/wallet/unhold-payment-proof', data)
    return response.data
  },
}

// Support Services
export const supportService = {
  getTickets: async (): Promise<SupportTicket[]> => {
    const response = await api.get('/support/tickets')
    return response.data
  },

  createTicket: async (data: Partial<SupportTicket>): Promise<SupportTicket> => {
    const response = await api.post('/support/tickets', data)
    return response.data
  },

  getTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await api.get(`/support/tickets/${ticketId}`)
    return response.data
  },

  addMessage: async (ticketId: string, message: string): Promise<void> => {
    await api.post(`/support/tickets/${ticketId}/messages`, { message })
  },

  closeTicket: async (ticketId: string): Promise<void> => {
    await api.put(`/support/tickets/${ticketId}/close`)
  },
}

// Alert Services
export const alertService = {
  getAlerts: async (): Promise<PriceAlert[]> => {
    const response = await api.get('/alerts')
    return response.data
  },

  createAlert: async (data: Partial<PriceAlert>): Promise<PriceAlert> => {
    const response = await api.post('/alerts', data)
    return response.data
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    await api.delete(`/alerts/${alertId}`)
  },

  toggleAlert: async (alertId: string): Promise<void> => {
    await api.put(`/alerts/${alertId}/toggle`)
  },
}

// KYC Services
export const kycService = {
  getKycStatus: async (): Promise<unknown> => {
    const response = await api.get('/kyc/status')
    return response.data
  },

  submitKyc: async (data: unknown): Promise<void> => {
    await api.post('/kyc/submit', data)
  },

  uploadDocument: async (type: string, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('type', type)
    const response = await api.post('/kyc/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.url
  },
}

// Admin Services
export const adminService = {
  getStats: async (): Promise<unknown> => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/admin/users')
    return response.data
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${userId}`, updates)
    return response.data
  },

  getKycRequests: async (): Promise<unknown[]> => {
    const response = await api.get('/admin/kyc-requests')
    return response.data
  },

  approveKyc: async (kycId: string): Promise<void> => {
    await api.post(`/admin/kyc/${kycId}/approve`)
  },

  rejectKyc: async (kycId: string, reason: string): Promise<void> => {
    await api.post(`/admin/kyc/${kycId}/reject`, { reason })
  },

  getDeposits: async (): Promise<unknown[]> => {
    const response = await api.get('/admin/deposits')
    return response.data
  },

  approveDeposit: async (depositId: string): Promise<void> => {
    await api.post(`/admin/deposits/${depositId}/approve`)
  },

  rejectDeposit: async (depositId: string, reason: string): Promise<void> => {
    await api.post(`/admin/deposits/${depositId}/reject`, { reason })
  },

  getWithdrawals: async (): Promise<unknown[]> => {
    const response = await api.get('/admin/withdrawals')
    return response.data
  },

  approveWithdrawal: async (withdrawalId: string, transactionRef: string): Promise<void> => {
    await api.post(`/admin/withdrawals/${withdrawalId}/approve`, { transactionRef })
  },

  rejectWithdrawal: async (withdrawalId: string, reason: string): Promise<void> => {
    await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { reason })
  },

  holdWithdrawal: async (withdrawalId: string): Promise<void> => {
    await api.post(`/admin/withdrawals/${withdrawalId}/hold`)
  },

  startProcessingWithdrawal: async (withdrawalId: string, duration: number): Promise<void> => {
    await api.post(`/admin/withdrawals/${withdrawalId}/start-processing`, { duration })
  },

  failWithdrawalWithReason: async (withdrawalId: string, reason: string): Promise<void> => {
    await api.post(`/admin/withdrawals/${withdrawalId}/fail`, { reason })
  },

  uploadPaymentProof: async (withdrawalId: string, paymentProofPdf: string): Promise<void> => {
    await api.post(`/admin/withdrawals/${withdrawalId}/upload-proof`, { paymentProofPdf })
  },

  unblockWithdrawalButton: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/unblock-withdrawal`)
  },

  getUnholdRequests: async (): Promise<unknown[]> => {
    const response = await api.get('/admin/unhold-requests')
    return response.data
  },

  approveUnholdRequest: async (requestId: string): Promise<void> => {
    await api.post(`/admin/unhold-requests/${requestId}/approve`)
  },

  rejectUnholdRequest: async (requestId: string, reason: string): Promise<void> => {
    await api.post(`/admin/unhold-requests/${requestId}/reject`, { reason })
  },

  getSupportTickets: async (): Promise<unknown[]> => {
    const response = await api.get('/admin/support-tickets')
    return response.data
  },

  replyToTicket: async (ticketId: string, message: string): Promise<void> => {
    await api.post(`/admin/support-tickets/${ticketId}/reply`, { message })
  },

  closeTicket: async (ticketId: string): Promise<void> => {
    await api.put(`/admin/support-tickets/${ticketId}/close`)
  },

  // Settings endpoints
  getSettings: async (): Promise<unknown> => {
    const response = await api.get('/admin/settings')
    return response.data
  },

  updateWithdrawalCharges: async (charges: unknown): Promise<void> => {
    await api.put('/admin/settings/withdrawal-charges', { charges })
  },

  updateWhatsappNumber: async (whatsappNumber: string): Promise<void> => {
    await api.put('/admin/settings/whatsapp', { whatsappNumber })
  },

  updatePaymentQrCode: async (paymentQrCode: string): Promise<void> => {
    await api.put('/admin/settings/payment-qr', { paymentQrCode })
  },

  updateBankDetails: async (bankDetails: { bankName: string; accountName: string; accountNumber: string; ifscCode: string; branch: string }): Promise<void> => {
    await api.put('/admin/settings/bank-details', { bankDetails })
  },
}

// Settings Service (public - for users to fetch charges)
export const settingsService = {
  getWithdrawalCharges: async (): Promise<unknown> => {
    const response = await api.get('/settings/withdrawal-charges')
    return response.data
  },

  getWhatsappNumber: async (): Promise<{ whatsappNumber: string }> => {
    const response = await api.get('/settings/whatsapp')
    return response.data
  },

  getPaymentQrCode: async (): Promise<{ paymentQrCode: string }> => {
    const response = await api.get('/settings/payment-qr')
    return response.data
  },

  getBankDetails: async (): Promise<{ bankDetails: { bankName: string; accountName: string; accountNumber: string; ifscCode: string; branch: string } }> => {
    const response = await api.get('/settings/bank-details')
    return response.data
  },
}

export default api
