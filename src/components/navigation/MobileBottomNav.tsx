import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Briefcase,
  Wallet,
  MoreHorizontal
} from 'lucide-react'
import { useState } from 'react'

const MobileBottomNav = () => {
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: TrendingUp, label: 'Markets', path: '/markets' },
    { icon: LineChart, label: 'Trade', path: '/trade' },
    { icon: Briefcase, label: 'Portfolio', path: '/portfolio' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
  ]

  return (
    <nav className="lg:hidden mobile-nav">
      <div className="flex items-center justify-around py-2 px-2">
        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center py-2 px-3 rounded-xl transition-all"
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive ? 'bg-purple-400/20' : ''
              }`}>
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-purple-400' : 'text-gray-400'
                }`} />
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-colors ${
                isActive ? 'text-purple-400' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-12 h-0.5 bg-purple-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
