import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Copy,
  Download
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { settingsService, walletService } from '@/services/api'
import wsService from '@/services/websocket'
import { Transaction } from '@/types'
import { setBalance } from '@/store/slices/walletSlice'
import toast from 'react-hot-toast'
import { WithdrawalModal, UnholdAccountModal } from '@/components/withdrawal'
import { DepositModal } from '@/components/deposit'

type TransactionType = 'all' | 'deposit' | 'withdrawal' | 'trade'

const WalletPage = () => {
  const dispatch = useAppDispatch()
  const { balance } = useAppSelector((state) => state.wallet)
  const { user } = useAppSelector((state) => state.auth)
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null)
  const [filterType, setFilterType] = useState<TransactionType>('all')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  
  // WhatsApp number from server
  const [whatsappNumber, setWhatsappNumber] = useState('919876543210')
  
  // Selected transaction for viewing failure reason
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  
  // Failed transaction being retried
  const [retryTransaction, setRetryTransaction] = useState<Transaction | null>(null)
  
  // Unhold account modal
  const [showUnholdModal, setShowUnholdModal] = useState(false)
  const [hasPendingUnholdRequest, setHasPendingUnholdRequest] = useState(false)
  const [showBlockedActionModal, setShowBlockedActionModal] = useState(false)

  // Fetch WhatsApp number from server
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const whatsappData = await settingsService.getWhatsappNumber()
        if (whatsappData?.whatsappNumber) {
          setWhatsappNumber(whatsappData.whatsappNumber)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }

    fetchSettings()
  }, [])

  const checkUnholdStatus = async () => {
    try {
      const status = await walletService.getUnholdStatus()
      setHasPendingUnholdRequest(status.hasPendingUnholdRequest)
    } catch (error) {
      console.error('Failed to check unhold status:', error)
    }
  }

  const refreshWalletData = async () => {
    try {
      setLoadingTransactions(true)
      const [balanceData, transactionData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions()
      ])
      dispatch(setBalance(balanceData as { available: number; blocked: number; invested: number; total: number }))
      setTransactions(transactionData || [])
      
      // Check unhold status
      await checkUnholdStatus()
    } catch (error) {
      console.error('Failed to refresh wallet data:', error)
      setTransactions([])
    } finally {
      setLoadingTransactions(false)
    }
  }

  // Fetch balance + transactions from server
  useEffect(() => {
    refreshWalletData()
    checkUnholdStatus()
  }, [])

  // Listen for withdrawal and deposit status updates via WebSocket
  useEffect(() => {
    // Ensure WebSocket is connected
    wsService.connect()
    
    // Function to setup listeners
    const setupListeners = () => {
      const socket = (wsService as any).socket
      console.log('🔌 WebSocket status:', socket ? 'exists' : 'null', 'connected:', socket?.connected, 'user:', user?.id)
      
      if (!socket || !user?.id) {
        console.log('⏳ Socket not ready, retrying in 1 second...')
        return null
      }
      
      const handleStatusUpdate = (data: { userId: string; status: string; refundAmount?: number; withdrawalId?: string; newBalance?: number }) => {
        console.log('💰 Wallet page received WebSocket update:', data)
        console.log('Current user ID:', user.id)
        
        if (data.userId === user.id) {
          console.log('✅ User ID matches, updating wallet...')
          
          // If newBalance is provided, update it immediately in Redux
          if (data.newBalance !== undefined) {
            console.log(`💵 Immediately updating balance to: ${data.newBalance}`)
            const currentBalance = balance
            dispatch(setBalance({
              available: data.newBalance - (currentBalance?.blocked || 0),
              blocked: currentBalance?.blocked || 0,
              invested: currentBalance?.invested || 0,
              total: data.newBalance
            }))
          }
          
          // Refresh transaction history and balance from server
          setTimeout(() => {
            console.log('🔄 Refreshing wallet data from server...')
            refreshWalletData()
          }, 500) // Small delay to ensure backend has updated
          
          // Show toast notification
          if (data.status === 'failed' && data.refundAmount) {
            toast.error(`Withdrawal failed! NPR ${data.refundAmount.toLocaleString()} refunded to your wallet`, {
              duration: 5000,
              icon: '🔄',
              style: {
                background: '#1a1b23',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }
            })
          } else if (data.status === 'completed') {
            toast.success('Withdrawal completed successfully!', {
              duration: 3000,
              icon: '✅'
            })
          } else if (data.status === 'rejected') {
            toast.error('Withdrawal rejected by admin', {
              duration: 4000,
              icon: '❌'
            })
          }
        } else {
          console.log('❌ User ID does not match')
        }
      }
      
      socket.on('withdrawalStatusUpdate', handleStatusUpdate)
      console.log('🎧 WebSocket listener registered for withdrawalStatusUpdate')
      
      // Listen for deposit status updates
      const handleDepositStatusUpdate = (data: { userId: string; status: string; amount?: number; newBalance?: number; rejectionReason?: string }) => {
        console.log('💵 Deposit status update received:', data)
        if (data.userId === user.id) {
          console.log('✅ Deposit status update for current user')
          
          // If newBalance is provided, update it immediately in Redux
          if (data.newBalance !== undefined) {
            const currentBalance = balance
            dispatch(setBalance({
              available: data.newBalance - (currentBalance?.blocked || 0),
              blocked: currentBalance?.blocked || 0,
              invested: currentBalance?.invested || 0,
              total: data.newBalance
            }))
          }
          
          // Refresh transaction history
          setTimeout(() => {
            refreshWalletData()
          }, 500)
          
          // Show toast notification
          if (data.status === 'approved') {
            toast.success(`Deposit of NPR ${data.amount?.toLocaleString()} approved!`, {
              duration: 4000,
              icon: '✅',
              style: {
                background: '#1a1b23',
                color: '#fff',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }
            })
          } else if (data.status === 'rejected') {
            toast.error(`Deposit rejected: ${data.rejectionReason || 'No reason provided'}`, {
              duration: 5000,
              icon: '❌',
              style: {
                background: '#1a1b23',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }
            })
          }
        }
      }
      
      socket.on('depositStatusUpdate', handleDepositStatusUpdate)
      console.log('🎧 WebSocket listener registered for depositStatusUpdate')
      
      // Listen for account status updates (unhold approval)
      const handleAccountStatusUpdate = (data: { userId: string; status: string }) => {
        console.log('🔓 Account status update received:', data)
        if (data.userId === user.id && data.status === 'active') {
          toast.success('Your account has been reactivated! You can now make deposits and withdrawals.', {
            duration: 6000,
            icon: '✅',
            style: {
              background: '#1a1b23',
              color: '#fff',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }
          })
          // Refresh wallet data and unhold status
          refreshWalletData()
          checkUnholdStatus()
        }
      }
      
      socket.on('accountStatusUpdate', handleAccountStatusUpdate)
      console.log('🎧 WebSocket listener registered for accountStatusUpdate')
      
      return () => {
        console.log('🔇 Removing WebSocket listeners')
        socket.off('withdrawalStatusUpdate', handleStatusUpdate)
        socket.off('depositStatusUpdate', handleDepositStatusUpdate)
        socket.off('accountStatusUpdate', handleAccountStatusUpdate)
      }
    }
    
    // Try to setup listeners immediately
    let cleanup = setupListeners()
    
    // If socket wasn't ready, retry after a delay
    let retryInterval: NodeJS.Timeout | null = null
    if (!cleanup) {
      retryInterval = setInterval(() => {
        cleanup = setupListeners()
        if (cleanup && retryInterval) {
          clearInterval(retryInterval)
        }
      }, 1000)
    }
    
    return () => {
      if (cleanup) cleanup()
      if (retryInterval) clearInterval(retryInterval)
    }
  }, [user?.id])

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true
    if (filterType === 'deposit') return t.type === 'deposit' || t.type === 'bonus'
    if (filterType === 'withdrawal') return t.type === 'withdrawal'
    if (filterType === 'trade') return t.type === 'trade'
    return true
  })

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/20'
      case 'pending': return 'text-warning bg-warning/20'
      case 'processing': return 'text-blue-400 bg-blue-500/20'
      case 'held': return 'text-purple-400 bg-purple-500/20'
      case 'on_hold': return 'text-orange-400 bg-orange-500/20'
      case 'failed': return 'text-danger bg-danger/20'
      case 'cancelled': return 'text-gray-400 bg-white/5'
    }
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'pending':
      case 'processing':
      case 'held': return <Clock className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'bonus':
        return <ArrowDownRight className="w-5 h-5 text-emerald-400" />
      case 'withdrawal':
      case 'fee':
      case 'commission':
        return <ArrowUpRight className="w-5 h-5 text-danger" />
      case 'trade': 
        return <ArrowDownRight className="w-5 h-5 text-blue-400" />
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-gray-400">Manage your funds and view transaction history</p>
      </motion.div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Available Balance</p>
              <p className="text-3xl font-bold text-white">NPR {balance.available.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3 flex-col">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (hasPendingUnholdRequest) {
                    setShowBlockedActionModal(true)
                  } else {
                    setActiveModal('deposit')
                  }
                }}
                className={`flex-1 btn-primary flex items-center justify-center gap-2 ${hasPendingUnholdRequest ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Plus className="w-5 h-5" />
                Deposit
              </button>
              <button
                onClick={() => {
                  if (hasPendingUnholdRequest) {
                    setShowBlockedActionModal(true)
                  } else {
                    setActiveModal('withdraw')
                  }
                }}
                className={`flex-1 btn-secondary flex items-center justify-center gap-2 ${hasPendingUnholdRequest ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Minus className="w-5 h-5" />
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Margin Used</p>
          <p className="text-2xl font-bold text-white mb-1">NPR {balance.blocked.toLocaleString()}</p>
          <div className="w-full h-2 bg-[#12131a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-warning rounded-full"
              style={{ width: `${(balance.blocked / balance.total) * 100}%` }}
            />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            {((balance.blocked / balance.total) * 100).toFixed(1)}% of total balance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <p className="text-2xl font-bold text-white mb-4">NPR {balance.total.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Invested:</span>
            <span className="text-purple-400 font-medium">₹{balance.invested.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <div className="p-4 lg:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">Transaction History</h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {(['all', 'deposit', 'withdrawal', 'trade'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                    filterType === type
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-white/10">
          {loadingTransactions ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 lg:px-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'deposit' || transaction.type === 'bonus'
                        ? 'bg-emerald-500/20'
                        : 'bg-danger/20'
                    }`}>
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                        {transaction.reference && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {transaction.reference}
                              <button className="hover:text-white transition-colors">
                                <Copy className="w-3 h-3" />
                              </button>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`font-bold ${
                        transaction.type === 'deposit' || transaction.type === 'bonus'
                          ? 'text-emerald-400'
                          : 'text-danger'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'bonus' ? '+' : '-'}
                        NPR {transaction.amount.toLocaleString()}
                      </p>
                      <span 
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(transaction.status)}`}
                        onClick={() => {
                          if (transaction.status === 'failed' && transaction.type === 'withdrawal') {
                            setSelectedTransaction(transaction)
                          }
                        }}
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status}
                      </span>
                    </div>
                    {(transaction.type === 'withdrawal' && transaction.status === 'failed' && (transaction as any).description?.includes('Due Bank Electronic Charge')) ? (
                      <button
                        onClick={() => {
                          setRetryTransaction(transaction)
                          setActiveModal('withdraw')
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Pay and Withdraw
                      </button>
                    ) : null}
                    {(transaction.type === 'withdrawal' && (transaction as any).status === 'on_hold') ? (
                      <button
                        onClick={() => setShowUnholdModal(true)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-medium transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Unhold Account
                      </button>
                    ) : null}
                    {transaction.type === 'withdrawal' && transaction.status === 'completed' && (transaction as any).paymentProofPdf && (
                      <button
                        onClick={() => {
                          const pdfWindow = window.open()
                          if (pdfWindow) {
                            pdfWindow.document.write(`<iframe width='100%' height='100%' src='${(transaction as any).paymentProofPdf}'></iframe>`)
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">No transactions found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Deposit Modal - New Component */}
      <DepositModal
        isOpen={activeModal === 'deposit'}
        onClose={() => {
          setActiveModal(null)
        }}
        userId={user?.id || ''}
        onSuccess={refreshWalletData}
      />

      {/* Withdraw Modal - New Component */}
      <WithdrawalModal
        isOpen={activeModal === 'withdraw'}
        onClose={() => {
          setActiveModal(null)
          setRetryTransaction(null)
        }}
        balance={balance.available}
        whatsappNumber={whatsappNumber}
        userId={user?.id || ''}
        retryTransaction={retryTransaction}
      />

      {/* Failure Reason Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Transaction Failed</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-semibold mb-1">Failure Reason</p>
                      <p className="text-gray-300 text-sm">
                        {(selectedTransaction as any).failureReason || 'Due Bank Electronic Charge'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white font-medium">NPR {selectedTransaction.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-danger font-medium">Failed</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-400 font-semibold mb-1">Amount Refunded</p>
                      <p className="text-gray-300 text-sm">
                        The full amount including charges has been refunded to your wallet.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTransaction(null)
                    setActiveModal('withdraw')
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Try Withdraw Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unhold Account Modal */}
      <UnholdAccountModal
        isOpen={showUnholdModal}
        onClose={() => setShowUnholdModal(false)}
        balance={typeof balance === 'number' ? balance : balance.total}
        userId={user?.id || ''}
        onSuccess={refreshWalletData}
      />

      {/* Blocked Action Modal */}
      <AnimatePresence>
        {showBlockedActionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBlockedActionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center justify-center py-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30"
                >
                  <Clock className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white text-center mb-2"
                >
                  Action Blocked
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-300 text-center mb-6 max-w-xs"
                >
                  We are working on your account unhold request. Please wait for admin approval.
                </motion.p>

                <div className="w-full p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6">
                  <p className="text-orange-400 text-sm text-center">
                    ⏱️ Your deposit and withdrawal functions are temporarily blocked while we process your unhold request.
                  </p>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setShowBlockedActionModal(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                >
                  OK, Got It
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WalletPage
