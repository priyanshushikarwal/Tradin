import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAppSelector } from '@/store/hooks'
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Briefcase,
  Wallet,
  Settings,
  HelpCircle,
} from 'lucide-react'

const DashboardSidebar = () => {
  const { isSidebarOpen } = useAppSelector((state) => state.ui)

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Markets', path: '/markets' },
    { icon: LineChart, label: 'Trade', path: '/trade' },
    { icon: Briefcase, label: 'Portfolio', path: '/portfolio' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
  ]

  const bottomNavItems = [
    { icon: HelpCircle, label: 'Support', path: '/support' },
    { icon: Settings, label: 'Settings', path: '/profile' },
  ]

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-[#12131a]/90 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full py-4">
        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {!isSidebarOpen && (
                    <div className="absolute left-20 px-3 py-2 bg-[#0a0b0f] border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg z-50">
                      <span className="text-sm font-medium text-white whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-3 my-4 h-px bg-white/10"></div>

        {/* Bottom Navigation */}
        <nav className="px-3 space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-400' : ''}`} />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </div>
    </aside>
  )
}

export default DashboardSidebar
