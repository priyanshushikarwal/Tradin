import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Loader } from 'lucide-react'
import { withdrawalService } from '@/services/supabaseService'
import toast from 'react-hot-toast'

interface WithdrawalFormModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  userId: string
  onSuccess: () => void
}

const WithdrawalFormModal = ({
  isOpen,
  onClose,
  balance,
  userId,
  onSuccess
}: WithdrawalFormModalProps) => {
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const withdrawalCharge = 50 // Fixed charge
  const numAmount = parseFloat(amount) || 0
  const netAmount = numAmount - withdrawalCharge

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!amount || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    if (numAmount > balance) {
      newErrors.amount = 'Insufficient balance'
    }
    if (withdrawalCharge >= numAmount) {
      newErrors.amount = 'Amount must be greater than withdrawal charge (₹50)'
    }
    if (!bankName.trim()) {
      newErrors.bankName = 'Bank name is required'
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      newErrors.accountNumber = 'Valid account number is required'
    }
    if (!ifscCode.trim() || ifscCode.length !== 11) {
      newErrors.ifscCode = 'IFSC code must be 11 characters'
    }
    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      await withdrawalService.create(
        userId,
        numAmount,
        netAmount,
        withdrawalCharge,
        {
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          account_holder_name: accountHolderName
        }
      )

      toast.success(`Withdrawal request submitted! Net amount: ₹${netAmount.toFixed(2)}`)
      setAmount('')
      setBankName('')
      setAccountNumber('')
      setIfscCode('')
      setAccountHolderName('')
      setErrors({})
      onClose()
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">Request Withdrawal</h2>
                <p className="text-sm text-gray-400 mt-1">Transfer funds to your bank account</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                  />
                </div>
                {errors.amount && (
                  <p className="text-danger text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Amount Breakdown */}
              {numAmount > 0 && !errors.amount && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm">
                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Withdrawal Charge:</span>
                    <span>₹{withdrawalCharge}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold border-t border-blue-500/20 pt-2">
                    <span>Net Amount:</span>
                    <span className="text-emerald-400">₹{netAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., State Bank of India"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
                {errors.bankName && (
                  <p className="text-danger text-xs mt-1">{errors.bankName}</p>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter account number"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
                {errors.accountNumber && (
                  <p className="text-danger text-xs mt-1">{errors.accountNumber}</p>
                )}
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 uppercase"
                />
                {errors.ifscCode && (
                  <p className="text-danger text-xs mt-1">{errors.ifscCode}</p>
                )}
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Enter account holder name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                />
                {errors.accountHolderName && (
                  <p className="text-danger text-xs mt-1">{errors.accountHolderName}</p>
                )}
              </div>

              {/* Info Box */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Withdrawals are processed within 24-48 business hours. A charge of ₹{withdrawalCharge} will be deducted.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default WithdrawalFormModal
