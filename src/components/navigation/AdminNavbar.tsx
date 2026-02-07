import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
  AlertCircle
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'

const AdminNavbar = () => {
  const { user } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const notifications = [
    { id: '1', type: 'kyc', message: 'New KYC request from John Doe', time: '5 min ago' },
    { id: '2', type: 'deposit', message: 'Deposit request: ₹50,000', time: '15 min ago' },
    { id: '3', type: 'withdrawal', message: 'Withdrawal request: ₹25,000', time: '1 hour ago' },
    { id: '4', type: 'support', message: 'High priority ticket opened', time: '2 hours ago' },
  ]

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <nav className="h-16 bg-[#0a0b0f] border-b border-white/10 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, transactions..."
            className="w-80 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-danger/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          System Online
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          </button>

          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-12 w-80 glass-card border border-white/10 shadow-xl z-50"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                <span className="text-danger text-xs font-medium">{notifications.length} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 hover:bg-white/10 transition-colors cursor-pointer border-b border-white/10 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        notification.type === 'kyc' ? 'bg-purple-500/20 text-purple-400' :
                        notification.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                        notification.type === 'withdrawal' ? 'bg-warning/20 text-warning' :
                        'bg-danger/20 text-danger'
                      }`}>
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{notification.message}</p>
                        <p className="text-gray-400 text-xs">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <button className="w-full text-center text-purple-400 text-sm hover:underline">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-danger to-warning flex items-center justify-center text-white font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white font-medium text-sm">Admin</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-14 w-48 glass-card border border-white/10 shadow-xl z-50"
            >
              <div className="p-2">
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default AdminNavbar
