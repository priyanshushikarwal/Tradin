import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  Smartphone,
  Moon,
  Sun,
  Globe,
  Eye,
  EyeOff,
  Camera,
  Check,
  ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const ProfilePage = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    priceAlerts: true,
    orderUpdates: true,
    newsDigest: false,
    marketing: false
  })

  const nameParts = profile?.name?.split(' ') || ['', '']
  const [formData, setFormData] = useState({
    firstName: nameParts[0] || 'John',
    lastName: nameParts.slice(1).join(' ') || 'Doe',
    email: profile?.email || 'john.doe@example.com',
    phone: profile?.phone || '+91 98765 43210',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          {/* Profile Card */}
          <div className="glass-card p-6 mb-6">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold">
                {formData.firstName[0]}{formData.lastName[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white hover:bg-purple-500/80 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white font-semibold text-center">{formData.firstName} {formData.lastName}</p>
            <p className="text-gray-400 text-sm text-center mb-4">{formData.email}</p>
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
              <Check className="w-4 h-4" />
              Verified Account
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Personal Info */}
          {activeTab === 'personal' && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input-glass pl-12 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input-glass pl-12 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-glass pl-12 w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-glass pl-12 w-full"
                    />
                  </div>
                </div>
              </div>
              <button className="btn-primary mt-6">Save Changes</button>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="input-glass pl-12 pr-12 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="input-glass pl-12 w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input-glass pl-12 w-full"
                      />
                    </div>
                  </div>
                </div>
                <button className="btn-primary mt-6">Update Password</button>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Two-Factor Authentication</p>
                      <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                    </div>
                  </div>
                  <button className="btn-secondary">Enable</button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-white font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#12131a]">
                    <div className="flex items-center gap-4">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-white">Chrome on Windows</p>
                        <p className="text-gray-400 text-sm">Mumbai, India • Current session</p>
                      </div>
                    </div>
                    <span className="text-emerald-400 text-sm">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Receive SMS for important updates' },
                  { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified when price targets are hit' },
                  { key: 'orderUpdates', label: 'Order Updates', desc: 'Notifications for order status changes' },
                  { key: 'newsDigest', label: 'News Digest', desc: 'Daily market news summary' },
                  { key: 'marketing', label: 'Marketing Communications', desc: 'Promotional offers and updates' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[#12131a]">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(item.key as keyof typeof notifications)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'bg-emerald-500'
                          : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'translate-x-7'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Display Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#12131a]">
                    <div className="flex items-center gap-4">
                      <Moon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">Dark Mode</p>
                        <p className="text-gray-400 text-sm">Currently enabled</p>
                      </div>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-emerald-500 relative">
                      <span className="absolute top-1 translate-x-7 w-4 h-4 rounded-full bg-white" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#12131a]">
                    <div className="flex items-center gap-4">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">Language</p>
                        <p className="text-gray-400 text-sm">English (India)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 border border-danger/30 bg-danger/5">
                <h3 className="text-danger font-semibold mb-2">Danger Zone</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="btn-secondary text-danger border-danger hover:bg-danger/10">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage
