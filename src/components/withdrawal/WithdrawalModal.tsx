import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  QrCode,
  XCircle,
  MessageCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { withdrawalService, settingsService, storageService } from '@/services/supabaseService'
import { supabase } from '@/lib/supabase'

interface WithdrawalModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  whatsappNumber: string
  userId: string
  onSuccess: () => void
}

type WithdrawalStep = 'form' | 'loading' | 'bank_details' | 'success' | 'failed'

const WithdrawalModal = ({ 
  isOpen, 
  onClose, 
  balance, 
  whatsappNumber, 
  userId,
  onSuccess 
}: WithdrawalModalProps) => {
  const [step, setStep] = useState<WithdrawalStep>('form')
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [loading, setLoading] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [currentWithdrawal, setCurrentWithdrawal] = useState<any>(null)
  const [withdrawalCharges, setWithdrawalCharges] = useState(50) // Default ₹50
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch withdrawal charges from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getAll()
        if (settings?.withdrawal_charges) {
          setWithdrawalCharges(parseFloat(settings.withdrawal_charges))
        }
      } catch (error) {
        console.log('Using default withdrawal charges')
      }
    }

    if (isOpen) {
      fetchSettings()
    }
  }, [isOpen])

  const numAmount = parseFloat(amount) || 0
  const netAmount = numAmount - withdrawalCharges

  const validateForm = () => {
    if (!amount || numAmount <= 0) {
      toast.error('Please enter a valid amount')
      return false
    }
    if (numAmount > balance) {
      toast.error(`Insufficient balance`)
      return false
    }
    if (withdrawalCharges >= numAmount) {
      toast.error(`Amount must be greater than withdrawal charge (₹${withdrawalCharges})`)
      return false
    }
    if (!bankName.trim()) {
      toast.error('Bank name is required')
      return false
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      toast.error('Valid account number is required')
      return false
    }
    if (!ifscCode.trim() || ifscCode.length !== 11) {
      toast.error('IFSC code must be 11 characters')
      return false
    }
    if (!accountHolderName.trim()) {
      toast.error('Account holder name is required')
      return false
    }
    return true
  }

  const handleRequestWithdrawal = async () => {
    if (!validateForm()) return

    setLoading(true)
    setStep('loading')

    try {
      console.log('Creating withdrawal request:', {
        userId,
        numAmount,
        netAmount,
        withdrawalCharges,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName
      })

      const withdrawal = await withdrawalService.create(
        userId,
        numAmount,
        netAmount,
        withdrawalCharges,
        {
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          account_holder_name: accountHolderName
        }
      )

      setCurrentWithdrawal(withdrawal)
      toast.success('Withdrawal request submitted successfully!')
      
      // Wait for admin approval - start polling
      setStep('bank_details')
      startPolling(withdrawal.id)
      
    } catch (error: any) {
      console.error('Withdrawal error:', error)
      setStep('failed')
      setFailureReason(error.message || 'Failed to submit withdrawal request')
      setLoading(false)
    }
  }

  const startPolling = (withdrawalId: string) => {
    // Poll every 5 seconds for status updates
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('id', withdrawalId)
          .single()

        if (error) throw error

        console.log('Withdrawal status:', data.status)

        if (data.status === 'completed') {
          toast.success('Withdrawal approved and processed!')
          setStep('success')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          setTimeout(() => {
            resetModal()
            onSuccess()
          }, 3000)
        } else if (data.status === 'rejected') {
          setStep('failed')
          setFailureReason(data.admin_note || 'Withdrawal request was rejected')
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 5000)
  }

  const resetModal = () => {
    setAmount('')
    setBankName('')
    setAccountNumber('')
    setIfscCode('')
    setAccountHolderName('')
    setStep('form')
    setCurrentWithdrawal(null)
    setFailureReason('')
    setLoading(false)
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => (step === 'form') ? resetModal() : undefined}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-card p-6 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Form Step */}
          {step === 'form' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Withdraw Funds</h2>
                <button
                  onClick={resetModal}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Balance Display */}
                <div className="p-4 rounded-xl bg-[#12131a]">
                  <p className="text-gray-400 text-sm mb-1">Available Balance</p>
                  <p className="text-2xl font-bold text-white">₹{balance.toLocaleString()}</p>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      max={balance}
                      className="input-glass pl-8 text-2xl font-bold w-full"
                    />
                  </div>
                  {amount && (
                    <p className="text-xs text-gray-400 mt-1">
                      Net Amount: ₹{netAmount.toFixed(2)} (Charge: ₹{withdrawalCharges})
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setAmount(Math.floor(balance * (pct / 100)).toString())}
                      className="flex-1 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* Bank Details */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Bank Name *</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., HDFC Bank"
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Account Number *</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Your bank account number"
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">IFSC Code *</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g., HDFC0001234"
                    maxLength={11}
                    className="input-glass w-full"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Account Holder Name *</label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Your full name"
                    className="input-glass w-full"
                  />
                </div>

                <button
                  onClick={handleRequestWithdrawal}
                  disabled={!amount || loading}
                  className="w-full btn-primary py-4 text-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            </>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <div className="py-12">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  className="w-24 h-24 rounded-full border-4 border-purple-500/30 border-t-purple-500 mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <motion.p
                  className="text-white font-medium text-lg"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Processing...
                </motion.p>
              </div>
            </div>
          )}

          {/* Waiting for Approval Step */}
          {step === 'bank_details' && (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30"
                >
                  <motion.div
                    className="w-24 h-24 rounded-full border-4 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Waiting for Admin
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-center mb-6 max-w-xs"
                >
                  Your withdrawal request has been submitted. Please wait while admin processes your request.
                </motion.p>

                <div className="w-full p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-6">
                  <p className="text-orange-400 text-sm text-center">
                    Amount: ₹{numAmount.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs text-center mt-2">
                    Status: Waiting for Admin Approval
                  </p>
                </div>

                <div className="flex gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-orange-500"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>

                <button
                  onClick={resetModal}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30"
                >
                  <CheckCircle className="w-16 h-16 text-white" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Withdrawal Successful!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-center mb-6 max-w-xs"
                >
                  Your withdrawal request has been approved and processed.
                </motion.p>

                <div className="w-full p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
                  <p className="text-blue-400 text-sm text-center font-semibold mb-2">
                    💰 Amount Processed
                  </p>
                  <p className="text-white text-lg text-center font-bold">
                    ₹{numAmount.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs text-center mt-3">
                    ⏱️ It may take 2-3 business days for the amount to appear in your bank account
                  </p>
                </div>

                <button
                  onClick={resetModal}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Failed Step */}
          {step === 'failed' && (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30"
                >
                  <XCircle className="w-16 h-16 text-white" />
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Withdrawal Failed
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-center mb-6 max-w-xs"
                >
                  {failureReason}
                </motion.p>

                <div className="w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                  <p className="text-green-400 text-sm text-center font-semibold mb-2">
                    ✓ Full Refund Processed
                  </p>
                  <p className="text-white text-lg text-center font-bold">
                    ₹{numAmount.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs text-center mt-2">
                    The amount has been refunded to your wallet
                  </p>
                </div>

                <button
                  onClick={resetModal}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WithdrawalModal
