import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import FeaturesPage from './pages/public/FeaturesPage'
import HowItWorksPage from './pages/public/HowItWorksPage'
import PricingPage from './pages/public/PricingPage'
import FaqPage from './pages/public/FaqPage'
import ContactPage from './pages/public/ContactPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'

// Protected Pages
import DashboardPage from './pages/dashboard/DashboardPage'
import MarketsPage from './pages/dashboard/MarketsPage'
import TradePage from './pages/dashboard/TradePage'
import PortfolioPage from './pages/dashboard/PortfolioPage'
import WalletPage from './pages/dashboard/WalletPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import KycPage from './pages/dashboard/KycPage'
import SupportPage from './pages/dashboard/SupportPage'
import AlertsPage from './pages/dashboard/AlertsPage'
import StrategiesPage from './pages/dashboard/StrategiesPage'
import LearnPage from './pages/dashboard/LearnPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminKycPage from './pages/admin/AdminKycPage'
import AdminDepositsPage from './pages/admin/AdminDepositsPage'
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminSupportPage from './pages/admin/AdminSupportPage'

// Components
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/trade/:symbol" element={<TradePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/kyc" element={<KycPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/strategies" element={<StrategiesPage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/kyc" element={<AdminKycPage />} />
        <Route path="/admin/deposits" element={<AdminDepositsPage />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/support" element={<AdminSupportPage />} />
      </Route>
    </Routes>
  )
}

export default App
