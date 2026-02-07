import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Save,
  RefreshCw,
  Server,
  Percent,
  Landmark,
  Shield,
  UserX,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageCircle
} from 'lucide-react'
import { adminService } from '@/services/api'
import toast from 'react-hot-toast'

interface WithdrawalCharges {
  serverCharge: { label: string; percentage: number }
  commission: { label: string; percentage: number }
  bankElectCharge: { label: string; percentage: number }
  serverCommissionHolding: { label: string; percentage: number }
  accountClosure: { label: string; percentage: number }
}

interface ChargeConfig {
  id: keyof WithdrawalCharges
  label: string
  percentage: number
  description: string
  icon: React.ElementType
}

const AdminSettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('919876543210')
  
  const [charges, setCharges] = useState<ChargeConfig[]>([
    {
      id: 'serverCharge',
      label: 'Server Charge',
      percentage: 2.5,
      description: 'Server processing and maintenance fee',
      icon: Server
    },
    {
      id: 'commission',
      label: 'Commission',
      percentage: 1.5,
      description: 'Platform commission for transactions',
      icon: Percent
    },
    {
      id: 'bankElectCharge',
      label: 'Bank Elect Charge',
      percentage: 1.0,
      description: 'Bank electronic transfer processing fee',
      icon: Landmark
    },
    {
      id: 'serverCommissionHolding',
      label: 'Server Commission Holding',
      percentage: 2.0,
      description: 'Commission held for server operations',
      icon: Shield
    },
    {
      id: 'accountClosure',
      label: 'Account Closure',
      percentage: 1.0,
      description: 'Account closure processing fee',
      icon: UserX
    }
  ])

  // Fetch current settings from the server
  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const settings = await adminService.getSettings() as { withdrawalCharges: WithdrawalCharges; whatsappNumber: string }
      
      if (settings.withdrawalCharges) {
        setCharges(prev => prev.map(charge => ({
          ...charge,
          percentage: settings.withdrawalCharges[charge.id]?.percentage ?? charge.percentage,
          label: settings.withdrawalCharges[charge.id]?.label ?? charge.label
        })))
      }
      
      if (settings.whatsappNumber) {
        setWhatsappNumber(settings.whatsappNumber)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleChargeChange = (id: keyof WithdrawalCharges, value: number) => {
    setCharges(prev => prev.map(charge => 
      charge.id === id ? { ...charge, percentage: value } : charge
    ))
  }

  const getTotalCharges = () => {
    return charges.reduce((sum, charge) => sum + charge.percentage, 0)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Convert charges array to object format for backend
      const chargesObject: WithdrawalCharges = {
        serverCharge: { label: 'Server Charge', percentage: charges.find(c => c.id === 'serverCharge')?.percentage || 0 },
        commission: { label: 'Commission', percentage: charges.find(c => c.id === 'commission')?.percentage || 0 },
        bankElectCharge: { label: 'Bank Elect Charge', percentage: charges.find(c => c.id === 'bankElectCharge')?.percentage || 0 },
        serverCommissionHolding: { label: 'Server Commission Holding', percentage: charges.find(c => c.id === 'serverCommissionHolding')?.percentage || 0 },
        accountClosure: { label: 'Account Closure', percentage: charges.find(c => c.id === 'accountClosure')?.percentage || 0 }
      }

      // Save both charges and WhatsApp number
      await adminService.updateWithdrawalCharges(chargesObject)
      await adminService.updateWhatsappNumber(whatsappNumber)
      
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    const defaultCharges: ChargeConfig[] = [
      { id: 'serverCharge', label: 'Server Charge', percentage: 2.5, description: 'Server processing and maintenance fee', icon: Server },
      { id: 'commission', label: 'Commission', percentage: 1.5, description: 'Platform commission for transactions', icon: Percent },
      { id: 'bankElectCharge', label: 'Bank Elect Charge', percentage: 1.0, description: 'Bank electronic transfer processing fee', icon: Landmark },
      { id: 'serverCommissionHolding', label: 'Server Commission Holding', percentage: 2.0, description: 'Commission held for server operations', icon: Shield },
      { id: 'accountClosure', label: 'Account Closure', percentage: 1.0, description: 'Account closure processing fee', icon: UserX }
    ]
    
    setCharges(defaultCharges)
    setWhatsappNumber('919876543210')
    toast.success('Settings reset to defaults (click Save to apply)')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400">Configure withdrawal charges and support settings</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-blue hover:bg-accent-blue/90 text-white transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Important: Changes apply immediately</p>
            <p className="text-gray-400 text-sm mt-1">
              When you save these settings, the new charges will apply to all user withdrawals immediately. 
              Users will see the updated charges when they initiate a withdrawal request.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Withdrawal Charges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-warning/20">
            <Settings className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Withdrawal Charges</h2>
            <p className="text-gray-400 text-sm">Configure the charges applied to user withdrawals (refundable)</p>
          </div>
        </div>

        <div className="space-y-4">
          {charges.map((charge) => {
            const IconComponent = charge.icon
            return (
              <div
                key={charge.id}
                className="p-4 rounded-xl bg-[#12131a] hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{charge.label}</p>
                      <p className="text-gray-400 text-sm">{charge.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={charge.percentage}
                      onChange={(e) => handleChargeChange(charge.id, parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-24 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-white text-center focus:outline-none focus:border-purple-500"
                    />
                    <span className="text-gray-400 text-lg">%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total Charges Summary */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-400/20 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Total Withdrawal Charges</p>
              <p className="text-gray-400 text-sm">Sum of all charges deducted from withdrawal amount</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{getTotalCharges().toFixed(1)}%</p>
              <p className="text-gray-400 text-xs">of withdrawal amount</p>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="mt-4 p-4 rounded-xl bg-[#12131a]">
          <p className="text-gray-400 text-sm mb-2">Example: For a ₹10,000 withdrawal</p>
          <div className="space-y-1">
            {charges.map(charge => (
              <div key={charge.id} className="flex justify-between text-sm">
                <span className="text-gray-400">{charge.label}</span>
                <span className="text-white">₹{((10000 * charge.percentage) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 my-2 pt-2 flex justify-between text-sm font-medium">
              <span className="text-white">Total Charges</span>
              <span className="text-danger">₹{((10000 * getTotalCharges()) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-white">Net Amount to User</span>
              <span className="text-emerald-400">₹{(10000 - (10000 * getTotalCharges()) / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* WhatsApp Support Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">WhatsApp Support</h2>
            <p className="text-gray-400 text-sm">Configure support contact number for failed withdrawals</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12131a]">
          <label className="block text-gray-400 text-sm mb-2">
            WhatsApp Number (with country code, no + sign)
          </label>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">+</span>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="919876543210"
              className="flex-1 px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <p className="text-gray-400 text-xs mt-2">
            Example: 919876543210 (91 = India country code, followed by 10-digit mobile number)
          </p>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 rounded-xl bg-[#12131a]">
          <p className="text-gray-400 text-sm mb-2">Support Link Preview:</p>
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hello, I need help with my withdrawal request.`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline break-all"
          >
            https://wa.me/{whatsappNumber}
          </a>
        </div>
      </motion.div>

      {/* Save Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 text-gray-400 text-sm"
      >
        <CheckCircle className="w-4 h-4" />
        <p>Remember to click "Save Changes" to apply your settings</p>
      </motion.div>
    </div>
  )
}

export default AdminSettingsPage
