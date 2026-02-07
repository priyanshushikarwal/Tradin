import { Outlet } from 'react-router-dom'
import AdminSidebar from '@/components/navigation/AdminSidebar'
import AdminNavbar from '@/components/navigation/AdminNavbar'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg">
      <AdminNavbar />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="hidden lg:block w-64">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-64px)] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
