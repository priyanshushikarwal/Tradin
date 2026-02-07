import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  CreditCard,
  Building2,
  Download,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Copy,
  RefreshCw,
  Loader2,
  X
} from 'lucide-react'
import { adminService } from '@/services/api'
import toast from 'react-hot-toast'

interface Deposit {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  amount: number
  method: string
  transactionId?: string
  upiId?: string
  utrNumber?: string
  bankName?: string
  accountNumber?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  proofUrl?: string
  screenshot?: string
}

const AdminDepositsPage = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchDeposits = async () => {
    setLoading(true)
    try {
      const data = await adminService.getDeposits()
      setDeposits(data as Deposit[])
    } catch (error) {
      console.error('Failed to fetch deposits:', error)
      toast.error('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeposits()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            Approved
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
        return null
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'upi':
        return <IndianRupee className="w-4 h-4" />
      case 'bank':
      case 'bank transfer':
      case 'neft':
        return <Building2 className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const handleApprove = (deposit: Deposit) => {
    setSelectedDeposit(deposit)
    setShowApproveModal(true)
  }

  const handleReject = (deposit: Deposit) => {
    setSelectedDeposit(deposit)
    setShowRejectModal(true)
  }

  const handleViewDetails = (deposit: Deposit) => {
    setSelectedDeposit(deposit)
    setShowDetailsModal(true)
  }

  const confirmApprove = async () => {
    if (!selectedDeposit) return
    setProcessing(true)
    try {
      await adminService.approveDeposit(selectedDeposit.id)
      toast.success(`Deposit of ₹${selectedDeposit.amount.toLocaleString()} approved!`)
      setShowApproveModal(false)
      setSelectedDeposit(null)
      fetchDeposits()
    } catch (error) {
      console.error('Failed to approve deposit:', error)
      toast.error('Failed to approve deposit')
    } finally {
      setProcessing(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedDeposit) return
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setProcessing(true)
    try {
      await adminService.rejectDeposit(selectedDeposit.id, rejectionReason)
      toast.success('Deposit rejected')
      setShowRejectModal(false)
      setSelectedDeposit(null)
      setRejectionReason('')
      fetchDeposits()
    } catch (error) {
      console.error('Failed to reject deposit:', error)
      toast.error('Failed to reject deposit')
    } finally {
      setProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredDeposits = deposits.filter(deposit => {
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      deposit.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.userId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalPending = deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0)
  const pendingCount = deposits.filter(d => d.status === 'pending').length
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage)
  const paginatedDeposits = filteredDeposits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading deposits...</p>
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
          <h1 className="text-2xl font-bold text-white">Deposit Requests</h1>
          <p className="text-gray-400">Review and approve deposit requests</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDeposits}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/20">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-xl font-bold text-white">{pendingCount}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/20">
              <IndianRupee className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending Amount</p>
              <p className="text-xl font-bold text-white">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-xl font-bold text-white">{deposits.filter(d => d.status === 'approved').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-danger/20">
              <XCircle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-xl font-bold text-white">{deposits.filter(d => d.status === 'rejected').length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID or User ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#12131a] rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Deposits Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {filteredDeposits.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowDownCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No deposits found</p>
            <p className="text-gray-400 text-sm">
              {statusFilter === 'pending' 
                ? 'No pending deposit requests' 
                : 'No deposits match your filters'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">ID</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Method</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{deposit.id}</span>
                          <button 
                            onClick={() => copyToClipboard(deposit.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-400 text-sm">{deposit.userId}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-bold">₹{deposit.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(deposit.method)}
                          <span className="text-white text-sm capitalize">{deposit.method}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(deposit.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(deposit.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(deposit)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {deposit.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(deposit)}
                                className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(deposit)}
                                className="p-2 rounded-lg bg-danger/20 hover:bg-danger/30 text-danger transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDeposits.length)} of {filteredDeposits.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white text-sm px-3">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Approve Deposit</h2>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-lg font-bold text-center">
                    ₹{selectedDeposit.amount.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Deposit ID:</span>
                    <span className="text-white font-mono">{selectedDeposit.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white">{selectedDeposit.userId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Method:</span>
                    <span className="text-white capitalize">{selectedDeposit.method}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-warning text-sm">
                    This will add ₹{selectedDeposit.amount.toLocaleString()} to the user's balance.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApprove}
                    disabled={processing}
                    className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-500/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Reject Deposit</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                  <p className="text-danger text-lg font-bold text-center">
                    ₹{selectedDeposit.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#12131a] rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={processing || !rejectionReason.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-danger hover:bg-danger/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Deposit Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#12131a] text-center">
                  <p className="text-gray-400 text-sm mb-1">Amount</p>
                  <p className="text-2xl font-bold text-emerald-400">₹{selectedDeposit.amount.toLocaleString()}</p>
                </div>

                {/* Payment Screenshot */}
                {(selectedDeposit.screenshot || selectedDeposit.proofUrl) && (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-sm font-medium">Payment Proof</p>
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={selectedDeposit.screenshot || selectedDeposit.proofUrl}
                        alt="Payment proof"
                        className="w-full h-auto max-h-64 object-contain bg-[#12131a]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deposit ID</span>
                    <span className="text-white font-mono">{selectedDeposit.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID</span>
                    <span className="text-white">{selectedDeposit.userId}</span>
                  </div>
                  {selectedDeposit.userName && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">User Name</span>
                      <span className="text-white">{selectedDeposit.userName}</span>
                    </div>
                  )}
                  {selectedDeposit.userEmail && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-white">{selectedDeposit.userEmail}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Method</span>
                    <span className="text-white capitalize">{selectedDeposit.method}</span>
                  </div>
                  {selectedDeposit.utrNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">UTR Number</span>
                      <span className="text-white font-mono text-sm">{selectedDeposit.utrNumber}</span>
                    </div>
                  )}
                  {selectedDeposit.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction ID</span>
                      <span className="text-white font-mono text-sm">{selectedDeposit.transactionId}</span>
                    </div>
                  )}
                  {selectedDeposit.upiId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">UPI ID</span>
                      <span className="text-white">{selectedDeposit.upiId}</span>
                    </div>
                  )}
                  {selectedDeposit.bankName && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bank</span>
                      <span className="text-white">{selectedDeposit.bankName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted</span>
                    <span className="text-white">{formatDate(selectedDeposit.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    {getStatusBadge(selectedDeposit.status)}
                  </div>
                </div>

                {/* Action buttons for pending deposits */}
                {selectedDeposit.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleApprove(selectedDeposit)
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleReject(selectedDeposit)
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-danger hover:bg-danger/80 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDepositsPage
