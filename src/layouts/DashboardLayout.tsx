import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import DashboardNavbar from '@/components/navigation/DashboardNavbar'
import DashboardSidebar from '@/components/navigation/DashboardSidebar'
import MobileBottomNav from '@/components/navigation/MobileBottomNav'

const DashboardLayout = () => {
  const { isSidebarOpen } = useAppSelector((state) => state.ui)

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
