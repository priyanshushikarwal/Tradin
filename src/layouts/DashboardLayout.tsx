import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import DashboardNavbar from '@/components/navigation/DashboardNavbar'
import DashboardSidebar from '@/components/navigation/DashboardSidebar'
import MobileBottomNav from '@/components/navigation/MobileBottomNav'
import { wsService } from '@/services/websocket'
import { setBalance } from '@/store/slices/walletSlice'

const DashboardLayout = () => {
  const dispatch = useAppDispatch()
  const { isSidebarOpen } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Sync wallet balance from user's server balance
    if (user && user.balance !== undefined && user.balance !== null) {
      const balanceNum = typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance
      if (!isNaN(balanceNum)) {
        dispatch(setBalance({
          total: balanceNum,
          available: balanceNum,
          blocked: 0,
          invested: 0,
        }))
      }
    }
  }, [user, dispatch])

  useEffect(() => {
    // Connect to WebSocket for live prices
    wsService.connect()
    
    return () => {
      wsService.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Top Navbar */}
      <DashboardNavbar />

      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <div className={`hidden lg:block ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-64px)] pb-20 lg:pb-6 transition-all duration-300
          ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}
        >
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}

export default DashboardLayout
