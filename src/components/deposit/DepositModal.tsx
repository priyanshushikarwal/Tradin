import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  QrCode,
  Building2,
  Copy,
  Loader2,
  Shield,
  Clock,
  XCircle
} from 'lucide-react'
import { walletService, settingsService } from '@/services/api'
import { wsService } from '@/services/websocket'
import toast from 'react-hot-toast'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSuccess: () => void
}

type DepositStep = 'amount' | 'payment' | 'upload_proof' | 'processing' | 'success' | 'failed'

interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
  ifscCode: string
  branch: string
}

const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: 'State Bank of India',
  accountName: 'TradeX Technologies Pvt Ltd',
  accountNumber: '1234567890123456',
  ifscCode: 'SBIN0001234',
  branch: 'Mumbai Main Branch'
}

const DepositModal = ({ isOpen, onClose, userId, onSuccess }: DepositModalProps) => {
  const navigate = useNavigate()
  const [step, setStep] = useState<DepositStep>('amount')
  const [amount, setAmount] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [utrNumber, setUtrNumber] = useState('')
  const [paymentQrCode, setPaymentQrCode] = useState<string | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [bankDetails, setBankDetails] = useState<BankDetails>(DEFAULT_BANK_DETAILS)

  // Fetch QR code and bank details from server
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoadingQr(true)
      try {
        // Fetch QR code
        const qrResponse = await settingsService.getPaymentQrCode()
        if (qrResponse.paymentQrCode) {
          setPaymentQrCode(qrResponse.paymentQrCode)
        }
        
        // Fetch bank details
        const bankResponse = await settingsService.getBankDetails()
        if (bankResponse.bankDetails) {
          setBankDetails(bankResponse.bankDetails)
        }
      } catch (error) {
        console.log('Failed to fetch settings')
      } finally {
        setIsLoadingQr(false)
      }
    }
    
    if (isOpen) {
      fetchSettings()
    }
  }, [isOpen])

  // Listen for deposit status updates
  useEffect(() => {
    if (!isOpen || step !== 'processing') return

    // Ensure WebSocket is connected
    wsService.connect()
    
    const socket = (wsService as any).socket
    if (!socket) return
    
    const handleDepositStatusUpdate = (data: { userId: string; status: string; amount?: number; rejectionReason?: string }) => {
      console.log('💵 Deposit status update in modal:', data)
      if (data.userId === userId) {
        if (data.status === 'approved') {
          setStep('success')
          toast.success(`Deposit of NPR ${data.amount?.toLocaleString()} approved!`)
          
          // Redirect after 5 seconds
          setTimeout(() => {
            onSuccess()
            resetModal()
            navigate('/wallet')
          }, 5000)
        } else if (data.status === 'rejected') {
          setRejectionReason(data.rejectionReason || 'No reason provided')
          setStep('failed')
          toast.error(`Deposit rejected: ${data.rejectionReason || 'No reason provided'}`)
          
          // Redirect after 5 seconds
          setTimeout(() => {
            resetModal()
            navigate('/wallet')
          }, 5000)
        }
      }
    }

    socket.on('depositStatusUpdate', handleDepositStatusUpdate)

    return () => {
      socket.off('depositStatusUpdate', handleDepositStatusUpdate)
    }
  }, [isOpen, step, userId, navigate, onSuccess])

  // Prevent back button and refresh during processing
  useEffect(() => {
    if (step === 'processing' || step === 'success' || step === 'failed') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = 'Your deposit is being processed. Are you sure you want to leave?'
        return e.returnValue
      }

      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault()
        window.history.pushState(null, '', window.location.pathname)
        toast.error('Please wait while your deposit is being processed')
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)
      window.history.pushState(null, '', window.location.pathname)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [step])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const handleContinueToProof = () => {
    setStep('upload_proof')
  }

  const handleSubmitDeposit = async () => {
    if (!screenshot) {
      toast.error('Please upload payment screenshot')
      return
    }
    if (!utrNumber.trim()) {
      toast.error('Please enter UTR/Transaction number')
      return
    }

    try {
      setStep('processing')
      
      // Convert screenshot to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Screenshot = reader.result as string
          
          // Submit deposit request to server
          await walletService.deposit(parseFloat(amount), 'upi', '', {
            utrNumber,
            screenshot: base64Screenshot
          })
          
          // Stay in processing step until admin approves/rejects
        } catch (error: any) {
          console.error('Deposit submission error:', error)
          setStep('upload_proof')
          toast.error(error.response?.data?.message || 'Failed to submit deposit')
        }
      }
      reader.readAsDataURL(screenshot)
      
    } catch (error: any) {
      console.error('Deposit submission error:', error)
      setStep('upload_proof')
      toast.error('Failed to submit deposit')
    }
  }

  const resetModal = useCallback(() => {
    setStep('amount')
    setAmount('')
    setScreenshot(null)
    setScreenshotPreview(null)
    setUtrNumber('')
    setRejectionReason('')
    onClose()
  }, [onClose])

  const handleClose = () => {
    if (step === 'processing') {
      toast.error('Please wait while your deposit is being processed')
      return
    }
    resetModal()
  }

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 25000]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => step !== 'processing' && step !== 'success' && step !== 'failed' ? handleClose() : undefined}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Amount Step */}
          {step === 'amount' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Deposit Funds</h2>
                    <p className="text-gray-400 text-sm">Add money to your wallet</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-400 text-sm font-medium">256-bit SSL Encrypted & Secure</p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Enter Amount (NPR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">NPR</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="100"
                    className="w-full pl-14 pr-4 py-4 bg-[#12131a] rounded-xl border border-white/10 text-white text-2xl font-bold placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-2">Minimum deposit: NPR 100</p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Quick Select</label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className={`py-3 rounded-xl border transition-all ${
                        amount === quickAmount.toString()
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-emerald-500/50'
                      }`}
                    >
                      ₹{quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const depositAmount = parseFloat(amount)
                  if (!depositAmount || depositAmount < 100) {
                    toast.error('Minimum deposit amount is NPR 100')
                    return
                  }
                  setStep('payment')
                }}
                disabled={!amount || parseFloat(amount) < 100}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue to Payment
              </motion.button>

              <p className="text-gray-500 text-xs text-center">
                By depositing, you agree to our Terms of Service
              </p>
            </div>
          )}

          {/* Payment Step - Show QR and Bank Details */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Complete Payment</h2>
                <button
                  onClick={() => setStep('amount')}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount to Pay */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-gray-400 text-sm mb-1">Amount to Deposit</p>
                <p className="text-3xl font-bold text-emerald-400">NPR {parseFloat(amount).toLocaleString()}</p>
              </div>

              {/* QR Code Section */}
              <div className="p-4 rounded-xl bg-[#12131a] border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold">Scan & Pay</h3>
                </div>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  {isLoadingQr ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                  ) : paymentQrCode ? (
                    <img 
                      src={paymentQrCode} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex flex-col items-center justify-center">
                      <QrCode className="w-20 h-20 text-purple-600 mb-2" />
                      <p className="text-purple-600 text-xs text-center px-4">QR not configured</p>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-xs text-center mt-2">
                  Scan with any UPI app (PhonePe, GPay, Paytm)
                </p>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-gray-500 text-sm">OR</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              {/* Bank Details */}
              <div className="p-4 rounded-xl bg-[#12131a] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold">Bank Transfer</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-gray-500 text-xs">Bank Name</p>
                      <p className="text-white text-sm font-medium">{bankDetails.bankName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-gray-500 text-xs">Account Name</p>
                      <p className="text-white text-sm font-medium">{bankDetails.accountName}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-gray-500 text-xs">Account Number</p>
                      <p className="text-white text-sm font-medium font-mono">{bankDetails.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                    <div>
                      <p className="text-gray-500 text-xs">IFSC Code</p>
                      <p className="text-white text-sm font-medium font-mono">{bankDetails.ifscCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.ifscCode, 'IFSC code')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-xs">
                    After payment, click "Continue" to upload your payment screenshot for verification.
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinueToProof}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold text-lg transition-all"
              >
                I've Completed Payment - Continue
              </motion.button>

              <button
                onClick={() => setStep('amount')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Upload Proof Step */}
          {step === 'upload_proof' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Upload Payment Proof</h2>
                <button
                  onClick={() => setStep('payment')}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Info */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="text-emerald-400 font-bold text-lg">NPR {parseFloat(amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Upload Screenshot */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block font-medium">
                  Payment Screenshot *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="deposit-screenshot-upload"
                  />
                  <label
                    htmlFor="deposit-screenshot-upload"
                    className="flex flex-col items-center justify-center p-6 rounded-xl bg-[#12131a] border-2 border-dashed border-white/20 hover:border-emerald-500/50 cursor-pointer transition-colors"
                  >
                    {screenshotPreview ? (
                      <div className="relative w-full">
                        <img
                          src={screenshotPreview}
                          alt="Payment screenshot"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            setScreenshot(null)
                            setScreenshotPreview(null)
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-500 mb-2" />
                        <p className="text-white font-medium">Click to upload screenshot</p>
                        <p className="text-gray-500 text-sm mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* UTR Number Input */}
              <div>
                <label className="text-gray-400 text-sm mb-2 block font-medium">
                  UTR / Transaction Number *
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR number"
                  className="w-full px-4 py-3 bg-[#12131a] rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Find UTR in your payment app's transaction history
                </p>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitDeposit}
                disabled={!screenshot || !utrNumber.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Submit Deposit Request
              </motion.button>

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-6">
              <motion.div
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-12 h-12 text-purple-400" />
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Your Deposit</h3>
                <p className="text-gray-400">
                  We're verifying your payment. This usually takes a few minutes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#12131a] border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-emerald-400 font-bold">NPR {parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">UTR:</span>
                  <span className="text-white font-mono">{utrNumber}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Clock className="w-5 h-5" />
                <p className="text-sm">Please wait, do not close this window</p>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-xs text-left">
                    Do not refresh or close this page. Your deposit will be automatically credited once verified by our team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="py-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Deposit Successful!
                </motion.h3>
                <p className="text-gray-400">
                  NPR {parseFloat(amount).toLocaleString()} has been added to your wallet
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400 font-medium">
                  Your funds are now available for trading
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Redirecting to wallet in 5 seconds...</p>
              </div>
            </div>
          )}

          {/* Failed Step */}
          {step === 'failed' && (
            <div className="py-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"
              >
                <XCircle className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Deposit Failed
                </motion.h3>
                <p className="text-gray-400">
                  Your deposit request was not approved
                </p>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 font-medium text-sm">
                  Reason: {rejectionReason}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Redirecting to wallet in 5 seconds...</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DepositModal
