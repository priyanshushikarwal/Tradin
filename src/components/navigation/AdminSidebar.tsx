import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Shield,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/authSlice'

const AdminSidebar = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/kyc', icon: Shield, label: 'KYC Requests' },
    { path: '/admin/deposits', icon: ArrowDownCircle, label: 'Deposits' },
    { path: '/admin/withdrawals', icon: ArrowUpCircle, label: 'Withdrawals' },
    { path: '/admin/support', icon: HelpCircle, label: 'Support' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-[#0a0b0f] border-r border-white/10 z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-4">
        {!isCollapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-danger to-warning flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive(item.path)
                ? 'bg-danger text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors mb-2"
        >
          <Wallet className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">User Dashboard</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}

export default AdminSidebar
