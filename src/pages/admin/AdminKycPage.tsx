import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { adminService } from '@/services/api'
import toast from 'react-hot-toast'

interface KycRequest {
  id: string
  oderId?: string
  userId: string
  documentType: string
  documentNumber: string
  documentUrl?: string
  status: string
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
}

const AdminKycPage = () => {
  const [requests, setRequests] = useState<KycRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const data = await adminService.getKycRequests()
      setRequests(data as KycRequest[])
    } catch (error) {
      console.error('Failed to fetch KYC requests:', error)
      toast.error('Failed to load KYC requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsSubmitting(true)
    try {
      await adminService.approveKyc(selectedRequest.id)
      toast.success('KYC request approved successfully')
      setShowApproveModal(false)
      setSelectedRequest(null)
      fetchRequests()
    } catch (error) {
      console.error('Failed to approve KYC:', error)
      toast.error('Failed to approve KYC request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setIsSubmitting(true)
    try {
      await adminService.rejectKyc(selectedRequest.id, rejectionReason)
      toast.success('KYC request rejected')
      setShowRejectModal(false)
      setSelectedRequest(null)
      setRejectionReason('')
      fetchRequests()
    } catch (error) {
      console.error('Failed to reject KYC:', error)
      toast.error('Failed to reject KYC request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            Approved
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchQuery === '' ||
      req.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.documentNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading KYC requests...</p>
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
          <h1 className="text-2xl font-bold text-white">KYC Requests</h1>
          <p className="text-gray-400">Review and manage KYC verifications</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
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
            <div className="p-3 rounded-xl bg-purple-500/20">
              <FileCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Requests</p>
              <p className="text-xl font-bold text-white">{requests.length}</p>
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
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Approved</p>
              <p className="text-xl font-bold text-white">{approvedCount}</p>
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
              <p className="text-xl font-bold text-white">{rejectedCount}</p>
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
              placeholder="Search by ID, User ID, or Document Number..."
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

      {/* Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No KYC requests found</p>
            <p className="text-gray-400 text-sm">
              {requests.length === 0 
                ? 'No users have submitted KYC documents yet'
                : 'No requests match your search criteria'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Request ID</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Document</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Submitted</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map((request) => (
                    <tr key={request.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-white text-sm">{request.id}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-bold">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="text-white text-sm">{request.userId}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white text-sm">{request.documentType || 'N/A'}</p>
                          <p className="text-gray-400 text-xs">{request.documentNumber || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(request.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.submittedAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowDetailsModal(true)
                            }}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setShowApproveModal(true)
                                }}
                                className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setShowRejectModal(true)
                                }}
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length}
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

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRequest && (
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
                <h2 className="text-xl font-bold text-white">KYC Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Request ID</span>
                  <span className="text-white font-mono text-sm">{selectedRequest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-white">{selectedRequest.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Document Type</span>
                  <span className="text-white">{selectedRequest.documentType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Document Number</span>
                  <span className="text-white">{selectedRequest.documentNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submitted At</span>
                  <span className="text-white">{formatDate(selectedRequest.submittedAt)}</span>
                </div>
                {selectedRequest.reviewedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reviewed At</span>
                    <span className="text-white">{formatDate(selectedRequest.reviewedAt)}</span>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="p-3 rounded-xl bg-danger/20 border border-danger/30">
                    <p className="text-danger text-sm font-medium mb-1">Rejection Reason:</p>
                    <p className="text-white text-sm">{selectedRequest.rejectionReason}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors mt-4"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selectedRequest && (
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
                <h2 className="text-xl font-bold text-white">Approve KYC</h2>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-6">
                <p className="text-white text-sm">
                  Are you sure you want to approve the KYC request for user <span className="font-bold">{selectedRequest.userId}</span>?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-500/90 text-white transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
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
                <h2 className="text-xl font-bold text-white">Reject KYC</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/30">
                  <p className="text-white text-sm">
                    You are about to reject the KYC request for user <span className="font-bold">{selectedRequest.userId}</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="w-full px-4 py-3 bg-[#12131a] rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-danger resize-none h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false)
                      setRejectionReason('')
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting || !rejectionReason.trim()}
                    className="flex-1 px-4 py-3 rounded-xl bg-danger hover:bg-danger/90 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
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
    </div>
  )
}

export default AdminKycPage
