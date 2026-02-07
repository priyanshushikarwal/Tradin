import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  AlertCircle,
  CheckCircle,
  Upload,
  QrCode,
  Loader2
} from 'lucide-react'
import { walletService, settingsService } from '@/services/api'
import toast from 'react-hot-toast'

interface UnholdAccountModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  userId: string
  onSuccess: () => void
}

type UnholdStep = 'info' | 'payment_proof' | 'loading' | 'success'

const UnholdAccountModal = ({ isOpen, onClose, balance, userId: _userId, onSuccess }: UnholdAccountModalProps) => {
  const [step, setStep] = useState<UnholdStep>('info')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [utrNumber, setUtrNumber] = useState('')
  const [paymentQrCode, setPaymentQrCode] = useState<string | null>(null)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  
  // Calculate 18% of wallet balance
  const unholdCharge = balance * 0.18

  // Fetch QR code from server
  useEffect(() => {
    const fetchQrCode = async () => {
      setIsLoadingQr(true)
      try {
        const response = await settingsService.getPaymentQrCode()
        if (response.paymentQrCode) {
          setPaymentQrCode(response.paymentQrCode)
        }
      } catch (error) {
        console.log('No QR code configured')
      } finally {
        setIsLoadingQr(false)
      }
    }
    
    if (isOpen) {
      fetchQrCode()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setStep('info')
      setScreenshot(null)
      setScreenshotPreview(null)
      setUtrNumber('')
    }
  }, [isOpen])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleSubmitPaymentProof = async () => {
    if (!screenshot) {
      toast.error('Please upload payment screenshot')
      return
    }
    if (!utrNumber.trim()) {
      toast.error('Please enter UTR/Transaction number')
      return
    }
    if (!screenshotPreview) {
      toast.error('Screenshot not loaded properly')
      return
    }

    try {
      setStep('loading')
      
      await walletService.submitUnholdPaymentProof({
        utrNumber,
        unholdCharge,
        screenshot: screenshotPreview
      })
      
      setStep('success')
      toast.success('Payment proof submitted successfully!')
      
      // Wait 3 seconds then close and refresh
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)
      
    } catch (error: any) {
      console.error('Payment proof submission error:', error)
      setStep('payment_proof')
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit payment proof'
      toast.error(errorMessage)
    }
  }

  const resetModal = () => {
    setStep('info')
    setScreenshot(null)
    setScreenshotPreview(null)
    setUtrNumber('')
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
        onClick={() => (step === 'info' || step === 'payment_proof') ? resetModal() : undefined}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass-card p-6 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Info Step */}
          {step === 'info' && (
            <div className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Unhold Account</h2>
                <button
                  onClick={resetModal}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <AlertCircle className="w-10 h-10 text-white stroke-[2.5]" />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white text-center mb-2"
              >
                Account Unhold Charge
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-center mb-6"
              >
                To unhold your account, you need to pay an account unhold charge
              </motion.p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-400 text-sm text-center font-medium mb-3">
                    Unhold Charge Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Current Balance:</span>
                      <span className="text-white font-semibold">NPR {balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-orange-500/20">
                      <span className="text-gray-400">Unhold Charge (18%):</span>
                      <span className="text-yellow-400 font-bold text-lg">NPR {unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-semibold text-sm mb-1">Important Notice</p>
                      <p className="text-gray-300 text-xs">
                        After paying the unhold charge, your account will be reactivated and you can continue using all features.
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setStep('payment_proof')}
                  className="w-full btn-primary py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Proceed to Pay
                </motion.button>

                <button
                  onClick={resetModal}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Payment Proof Step */}
          {step === 'payment_proof' && (
            <div className="py-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Payment Proof</h2>
                <button
                  onClick={() => setStep('info')}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-400 text-sm text-center font-medium mb-2">
                    Upload proof of unhold charge payment
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Amount to Pay:</span>
                    <span className="text-yellow-400 font-bold">NPR {unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="p-4 rounded-xl bg-[#12131a] border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Scan QR to Pay</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg flex items-center justify-center">
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
                        <p className="text-purple-600 text-xs text-center px-4">QR code not configured. Contact admin.</p>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs text-center mt-2">
                    {paymentQrCode ? 'Scan this QR code with your payment app' : 'Please contact support for payment details'}
                  </p>
                </div>

                {/* Upload Screenshot */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block font-medium">
                    Upload Payment Screenshot *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="unhold-screenshot-upload"
                    />
                    <label
                      htmlFor="unhold-screenshot-upload"
                      className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#12131a] border-2 border-dashed border-white/20 hover:border-purple-500/50 cursor-pointer transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-400">
                        {screenshot ? screenshot.name : 'Click to upload'}
                      </span>
                    </label>
                  </div>
                  {screenshotPreview && (
                    <div className="mt-2 relative">
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setScreenshot(null)
                          setScreenshotPreview(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
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
                    placeholder="Enter UTR or Transaction ID"
                    className="input-glass w-full"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleSubmitPaymentProof}
                  disabled={!screenshot || !utrNumber.trim()}
                  className="w-full btn-primary py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Payment Proof
                </motion.button>

                <button
                  onClick={() => setStep('info')}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                >
                  Back
                </button>
              </motion.div>
            </div>
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
                  Payment Submitted!
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-400 text-center mb-6 max-w-xs"
                >
                  Your payment proof has been submitted. Admin will review and activate your account shortly.
                </motion.p>

                <div className="w-full p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6">
                  <p className="text-green-400 text-sm text-center font-semibold mb-2">
                    ✓ Payment Proof Submitted
                  </p>
                  <p className="text-white text-lg text-center font-bold">
                    NPR {unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500 text-xs text-center"
                >
                  Closing in 3 seconds...
                </motion.p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UnholdAccountModal
