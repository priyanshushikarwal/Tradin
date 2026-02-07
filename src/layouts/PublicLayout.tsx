import { Outlet } from 'react-router-dom'
import PublicNavbar from '@/components/navigation/PublicNavbar'
import Footer from '@/components/navigation/Footer'

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
