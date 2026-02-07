import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  Menu, 
  Bell, 
  Search, 
  User,
  Settings,
  LogOut,
  Wallet,
  HelpCircle
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppDispatch } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const DashboardNavbar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isSearchOpen])

  const handleLogout = async () => {
    await signOut()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 h-16 bg-[#12131a]/90 backdrop-blur-xl border-b border-white/10">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-bold text-white">TradeX</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search markets, stocks, crypto..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#12131a]/80 rounded-xl text-sm text-white placeholder:text-gray-500 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>

          {/* Balance Display */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#12131a]/80 border border-white/10">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-white">
              ₹{(profile?.balance || 0).toLocaleString()}
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm">
                {profile?.name?.[0] || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-white">
                  {profile?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400">{profile?.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-[#12131a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-xl"
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <p className="text-sm font-medium text-white">
                      {profile?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">{profile?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </Link>

                  <Link
                    to="/wallet"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Wallet</span>
                  </Link>

                  <Link
                    to="/support"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Support</span>
                  </Link>

                  <div className="my-2 h-px bg-white/10"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-danger hover:bg-danger/10 w-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 p-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search markets, stocks, crypto..."
                className="w-full pl-10 pr-4 py-3 bg-[#12131a]/80 rounded-xl text-sm text-white placeholder:text-gray-500 border border-white/10 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default DashboardNavbar
