import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  CreditCard,
  Building2,
  FileText,
  Upload,
  Check,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Camera,
  Eye
} from 'lucide-react'

type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted'

interface KycStep {
  id: string
  title: string
  description: string
  status: KycStatus
  icon: React.ElementType
}

const KycPage = () => {
  const [activeStep, setActiveStep] = useState<string | null>(null)
  const [panNumber, setPanNumber] = useState('')
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [ifscCode, setIfscCode] = useState('')

  const kycSteps: KycStep[] = [
    {
      id: 'pan',
      title: 'PAN Verification',
      description: 'Verify your PAN card for trading',
      status: 'verified',
      icon: CreditCard
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Verification',
      description: 'Link your Aadhaar for identity proof',
      status: 'pending',
      icon: User
    },
    {
      id: 'bank',
      title: 'Bank Account',
      description: 'Add your bank account for withdrawals',
      status: 'not_submitted',
      icon: Building2
    },
    {
      id: 'documents',
      title: 'Additional Documents',
      description: 'Upload address proof and signature',
      status: 'not_submitted',
      icon: FileText
    }
  ]

  const getStatusColor = (status: KycStatus) => {
    switch (status) {
      case 'verified': return 'text-emerald-400 bg-emerald-500/20'
      case 'pending': return 'text-warning bg-warning/20'
      case 'rejected': return 'text-danger bg-danger/20'
      case 'not_submitted': return 'text-gray-400 bg-white/5'
    }
  }

  const getStatusIcon = (status: KycStatus) => {
    switch (status) {
      case 'verified': return <Check className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'not_submitted': return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusText = (status: KycStatus) => {
    switch (status) {
      case 'verified': return 'Verified'
      case 'pending': return 'Under Review'
      case 'rejected': return 'Rejected'
      case 'not_submitted': return 'Not Submitted'
    }
  }

  const completedSteps = kycSteps.filter(s => s.status === 'verified').length
  const totalSteps = kycSteps.length
  const progress = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">KYC Verification</h1>
        <p className="text-gray-400">Complete your verification to unlock all features</p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Verification Status</h2>
              <p className="text-gray-400">{completedSteps} of {totalSteps} steps completed</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{Math.round(progress)}%</p>
            <p className="text-gray-400 text-sm">Complete</p>
          </div>
        </div>
        <div className="w-full h-3 bg-[#12131a] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
          />
        </div>
        {progress < 100 && (
          <p className="text-warning text-sm mt-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Complete all steps to enable deposits and withdrawals
          </p>
        )}
      </motion.div>

      {/* KYC Steps */}
      <div className="grid gap-4">
        {kycSteps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              className="w-full p-4 lg:p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  step.status === 'verified' ? 'bg-emerald-500/20' :
                  step.status === 'pending' ? 'bg-warning/20' :
                  'bg-white/5'
                }`}>
                  <step.icon className={`w-6 h-6 ${
                    step.status === 'verified' ? 'text-emerald-400' :
                    step.status === 'pending' ? 'text-warning' :
                    'text-gray-400'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{step.title}</p>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${getStatusColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                  {getStatusText(step.status)}
                </span>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeStep === step.id ? 'rotate-90' : ''}`} />
              </div>
            </button>

            {/* Expanded Content */}
            {activeStep === step.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/10 p-6"
              >
                {step.id === 'pan' && (
                  <div className="space-y-4">
                    {step.status === 'verified' ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <Check className="w-6 h-6 text-emerald-400" />
                          <div>
                            <p className="text-white font-medium">PAN Verified Successfully</p>
                            <p className="text-gray-400 text-sm">PAN: ABCDE1234F</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-gray-400 text-sm mb-2 block">PAN Number</label>
                          <input
                            type="text"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className="input-glass w-full uppercase"
                          />
                        </div>
                        <button className="btn-primary">Verify PAN</button>
                      </>
                    )}
                  </div>
                )}

                {step.id === 'aadhaar' && (
                  <div className="space-y-4">
                    {step.status === 'pending' && (
                      <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                        <div className="flex items-center gap-3">
                          <Clock className="w-6 h-6 text-warning" />
                          <div>
                            <p className="text-white font-medium">Verification in Progress</p>
                            <p className="text-gray-400 text-sm">Your Aadhaar is being verified. This may take 24-48 hours.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">Aadhaar Number</label>
                      <input
                        type="text"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234 5678 9012"
                        maxLength={12}
                        className="input-glass w-full"
                        disabled={step.status === 'pending'}
                      />
                    </div>
                    {step.status !== 'pending' && (
                      <button className="btn-primary">Submit for Verification</button>
                    )}
                  </div>
                )}

                {step.id === 'bank' && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Account Number</label>
                        <input
                          type="text"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          placeholder="Enter account number"
                          className="input-glass w-full"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Confirm Account Number</label>
                        <input
                          type="text"
                          placeholder="Re-enter account number"
                          className="input-glass w-full"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">IFSC Code</label>
                        <input
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          placeholder="HDFC0001234"
                          className="input-glass w-full uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Account Holder Name</label>
                        <input
                          type="text"
                          placeholder="As per bank records"
                          className="input-glass w-full"
                        />
                      </div>
                    </div>
                    <button className="btn-primary">Verify Bank Account</button>
                  </div>
                )}

                {step.id === 'documents' && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-gray-400 text-sm mb-3 block">Upload Address Proof</label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">Click to upload or drag and drop</p>
                        <p className="text-gray-400 text-sm">Utility bill, Bank statement, or Passport (Max 5MB)</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-3 block">Upload Signature</label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">Click to capture or upload</p>
                        <p className="text-gray-400 text-sm">Clear signature on white paper (Max 2MB)</p>
                      </div>
                    </div>
                    <button className="btn-primary">Submit Documents</button>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-white font-semibold mb-4">Need Help?</h3>
        <p className="text-gray-400 mb-4">
          If you're facing any issues with KYC verification, our support team is here to help.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary">Contact Support</button>
          <button className="btn-secondary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View KYC Guidelines
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default KycPage
