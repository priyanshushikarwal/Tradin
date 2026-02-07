import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users,
  FileCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  IndianRupee
} from 'lucide-react'
import { adminService } from '@/services/api'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalUsers: number
  kycPending: number
  pendingDeposits: number
  pendingDepositsAmount: number
  pendingWithdrawals: number
  pendingWithdrawalsAmount: number
}

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    kycPending: 0,
    pendingDeposits: 0,
    pendingDepositsAmount: 0,
    pendingWithdrawals: 0,
    pendingWithdrawalsAmount: 0
  })
  const [recentDeposits, setRecentDeposits] = useState<any[]>([])
  const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [users, kycRequests, deposits, withdrawals] = await Promise.all([
        adminService.getUsers(),
        adminService.getKycRequests(),
        adminService.getDeposits(),
        adminService.getWithdrawals()
      ])

      const usersArray = users as any[]
      const kycArray = kycRequests as any[]
      const depositsArray = deposits as any[]
      const withdrawalsArray = withdrawals as any[]

      // Calculate stats
      const pendingDeposits = depositsArray.filter((d: any) => d.status === 'pending')
      const pendingWithdrawals = withdrawalsArray.filter((w: any) => w.status === 'pending')

      setStats({
        totalUsers: usersArray.length,
        kycPending: kycArray.filter((k: any) => k.status === 'pending').length,
        pendingDeposits: pendingDeposits.length,
        pendingDepositsAmount: pendingDeposits.reduce((sum: number, d: any) => sum + (d.amount || 0), 0),
        pendingWithdrawals: pendingWithdrawals.length,
        pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum: number, w: any) => sum + (w.amount || 0), 0)
      })

      // Get recent items (last 5)
      setRecentDeposits(depositsArray.slice(-5).reverse())
      setRecentWithdrawals(withdrawalsArray.slice(-5).reverse())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/20 text-success text-xs">
            <CheckCircle className="w-3 h-3" />
            {status === 'approved' ? 'Approved' : 'Completed'}
          </span>
        )
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-danger/20 text-danger text-xs">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
            {status}
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Overview of platform activity</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors w-fit"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
          <Link to="/admin/users" className="flex items-center gap-2 text-purple-400 text-sm mt-4 hover:underline">
            View all users <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/20">
              <FileCheck className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">KYC Pending</p>
              <p className="text-2xl font-bold text-white">{stats.kycPending}</p>
            </div>
          </div>
          <Link to="/admin/kyc" className="flex items-center gap-2 text-warning text-sm mt-4 hover:underline">
            Review KYC <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <ArrowDownCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Deposits</p>
              <p className="text-2xl font-bold text-white">₹{stats.pendingDepositsAmount.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">{stats.pendingDeposits} requests</p>
            </div>
          </div>
          <Link to="/admin/deposits" className="flex items-center gap-2 text-emerald-400 text-sm mt-4 hover:underline">
            Manage deposits <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-danger/20">
              <ArrowUpCircle className="w-6 h-6 text-danger" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Withdrawals</p>
              <p className="text-2xl font-bold text-white">₹{stats.pendingWithdrawalsAmount.toLocaleString()}</p>
              <p className="text-gray-400 text-xs">{stats.pendingWithdrawals} requests</p>
            </div>
          </div>
          <Link to="/admin/withdrawals" className="flex items-center gap-2 text-danger text-sm mt-4 hover:underline">
            Manage withdrawals <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deposits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
              Recent Deposits
            </h2>
            <Link to="/admin/deposits" className="text-purple-400 text-sm hover:underline">
              View all
            </Link>
          </div>

          {recentDeposits.length === 0 ? (
            <div className="text-center py-8">
              <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">No deposit requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#12131a] hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">₹{(deposit.amount || 0).toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{deposit.userId}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(deposit.status)}
                    <p className="text-gray-400 text-xs mt-1">{formatDate(deposit.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Withdrawals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-danger" />
              Recent Withdrawals
            </h2>
            <Link to="/admin/withdrawals" className="text-purple-400 text-sm hover:underline">
              View all
            </Link>
          </div>

          {recentWithdrawals.length === 0 ? (
            <div className="text-center py-8">
              <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#12131a] hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">₹{(withdrawal.amount || 0).toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">{withdrawal.userId}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(withdrawal.status)}
                    <p className="text-gray-400 text-xs mt-1">{formatDate(withdrawal.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-4 rounded-xl bg-[#12131a] hover:bg-white/10 border border-white/10 transition-colors text-center"
          >
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-white text-sm">Manage Users</p>
          </Link>
          <Link
            to="/admin/kyc"
            className="p-4 rounded-xl bg-[#12131a] hover:bg-white/10 border border-white/10 transition-colors text-center"
          >
            <FileCheck className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-white text-sm">Review KYC</p>
          </Link>
          <Link
            to="/admin/deposits"
            className="p-4 rounded-xl bg-[#12131a] hover:bg-white/10 border border-white/10 transition-colors text-center"
          >
            <ArrowDownCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-white text-sm">Deposits</p>
          </Link>
          <Link
            to="/admin/withdrawals"
            className="p-4 rounded-xl bg-[#12131a] hover:bg-white/10 border border-white/10 transition-colors text-center"
          >
            <ArrowUpCircle className="w-8 h-8 text-danger mx-auto mb-2" />
            <p className="text-white text-sm">Withdrawals</p>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboardPage
