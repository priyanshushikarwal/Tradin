import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  Download,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Copy,
  RefreshCw,
  Loader2,
  X,
  AlertCircle,
  Upload
} from 'lucide-react'
import { withdrawalService } from '@/services/supabaseService'
import toast from 'react-hot-toast'

interface Withdrawal {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  amount: number
  bankName?: string
  accountNumber?: string
  ifsc?: string
  accountHolderName?: string
  status: 'pending' | 'processing' | 'held' | 'completed' | 'rejected' | 'failed'
  createdAt: string
  transactionRef?: string
  balanceDeducted?: boolean
  paymentProof?: {
    utrNumber: string
    serverCharge: number
    screenshot: string | null
  }
}

interface UnholdRequest {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  userBalance?: number
  unholdCharge: number
  utrNumber: string
  screenshot?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [showFailModal, setShowFailModal] = useState(false)
  const [showUploadProofModal, setShowUploadProofModal] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [transactionRef, setTransactionRef] = useState('')
  const [processingDuration, setProcessingDuration] = useState('25')
  const [failureReason, setFailureReason] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  const itemsPerPage = 10
  
  // Unhold requests state
  const [unholdRequests, setUnholdRequests] = useState<UnholdRequest[]>([])
  const [selectedUnholdRequest, setSelectedUnholdRequest] = useState<UnholdRequest | null>(null)
  const [showUnholdApproveModal, setShowUnholdApproveModal] = useState(false)
  const [showUnholdRejectModal, setShowUnholdRejectModal] = useState(false)
  const [showUnholdScreenshotModal, setShowUnholdScreenshotModal] = useState(false)
  const [unholdRejectionReason, setUnholdRejectionReason] = useState('')
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'unhold'>('withdrawals')

  const fetchWithdrawals = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      console.log('Fetching withdrawals from Supabase...')
      const data = await withdrawalService.getAllWithdrawals()
      console.log('Received withdrawals:', data)
      // Map Supabase data to expected format
      const formattedWithdrawals = data.map(w => ({
        id: w.id,
        userId: w.user_id,
        userName: w.profiles?.name || 'Unknown',
        userEmail: w.profiles?.email || 'Unknown',
        amount: w.amount,
        bankName: w.bank_name,
        accountNumber: w.account_number,
        ifsc: w.ifsc_code,
        accountHolderName: w.account_holder_name,
        status: w.status as Withdrawal['status'],
        createdAt: w.created_at,
        transactionRef: w.admin_transaction_ref,
        balanceDeducted: true
      }))
      setWithdrawals(formattedWithdrawals as Withdrawal[])
      if (data.length === 0) {
        console.log('No withdrawals found in database')
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      if (isInitial) toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  const fetchUnholdRequests = async (isInitial = false) => {
    try {
      console.log('Fetching unhold requests...')
      // For now, unhold requests can be empty - we'll implement this later if needed
      setUnholdRequests([])
    } catch (error) {
      console.error('Failed to fetch unhold requests:', error)
      if (isInitial) toast.error('Failed to load unhold requests')
    }
  }

  useEffect(() => {
    fetchWithdrawals(true)
    fetchUnholdRequests(true)
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchWithdrawals(false)
      fetchUnholdRequests(false)
    }, 5000)
    return () => clearInterval(interval)
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
      case 'held':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
            <Clock className="w-3 h-3" />
            Held
          </span>
        )
      case 'processing':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs">
            <Clock className="w-3 h-3 animate-spin" />
            Processing
          </span>
        )
      case 'failed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 text-xs">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            Completed
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

  const handleApprove = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowApproveModal(true)
  }

  const handleReject = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowRejectModal(true)
  }

  const handleHold = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowHoldModal(true)
  }

  const handleStartProcessing = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowProcessingModal(true)
  }

  const handleFailWithdrawal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowFailModal(true)
  }

  const handleViewDetails = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowDetailsModal(true)
  }

  const confirmApprove = async () => {
    if (!selectedWithdrawal) return
    if (!transactionRef.trim()) {
      toast.error('Please enter a transaction reference')
      return
    }
    setProcessing(true)
    try {
      await withdrawalService.approve(selectedWithdrawal.id, selectedWithdrawal.userId, transactionRef)
      toast.success(`Withdrawal of ₹${selectedWithdrawal.amount.toLocaleString()} processed!`)
      setShowApproveModal(false)
      setSelectedWithdrawal(null)
      setTransactionRef('')
      fetchWithdrawals()
    } catch (error) {
      console.error('Failed to approve withdrawal:', error)
      toast.error('Failed to process withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  const confirmReject = async () => {
    if (!selectedWithdrawal) return
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setProcessing(true)
    try {
      await withdrawalService.reject(selectedWithdrawal.id, selectedWithdrawal.amount, selectedWithdrawal.userId, rejectionReason)
      toast.success('Withdrawal rejected')
      setShowRejectModal(false)
      setSelectedWithdrawal(null)
      setRejectionReason('')
      fetchWithdrawals()
    } catch (error) {
      console.error('Failed to reject withdrawal:', error)
      toast.error('Failed to reject withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  const confirmHold = async () => {
    if (!selectedWithdrawal) return
    setProcessing(true)
    try {
      await withdrawalService.hold(selectedWithdrawal.id)
      toast.success('Withdrawal put on hold - User withdrawal button blocked')
      setShowHoldModal(false)
      setSelectedWithdrawal(null)
      fetchWithdrawals()
    } catch (error) {
      console.error('Failed to hold withdrawal:', error)
      toast.error('Failed to hold withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  const confirmStartProcessing = async () => {
    if (!selectedWithdrawal) return
    const duration = parseInt(processingDuration)
    if (isNaN(duration) || duration < 20 || duration > 30) {
      toast.error('Duration must be between 20-30 minutes')
      return
    }
    setProcessing(true)
    try {
      await withdrawalService.startProcessing(selectedWithdrawal.id, duration)
      toast.success(`Processing started - Will complete in ${duration} minutes`)
      setShowProcessingModal(false)
      setSelectedWithdrawal(null)
      setProcessingDuration('25')
      fetchWithdrawals()
    } catch (error) {
      console.error('Failed to start processing:', error)
      toast.error('Failed to start processing')
    } finally {
      setProcessing(false)
    }
  }

  const confirmFail = async () => {
    if (!selectedWithdrawal) return
    if (!failureReason.trim()) {
      toast.error('Please select a failure reason')
      return
    }
    setProcessing(true)
    try {
      await withdrawalService.fail(selectedWithdrawal.id, selectedWithdrawal.amount, selectedWithdrawal.userId, failureReason)
      toast.success('Withdrawal failed - Amount refunded to user wallet')
      setShowFailModal(false)
      setSelectedWithdrawal(null)
      setFailureReason('')
      fetchWithdrawals()
    } catch (error) {
      console.error('Failed to fail withdrawal:', error)
      toast.error('Failed to update withdrawal')
    } finally {
      setProcessing(false)
    }
  }

  const handleUploadProof = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setShowUploadProofModal(true)
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB')
        return
      }
      setPdfFile(file)
    }
  }

  const confirmUploadProof = async () => {
    if (!selectedWithdrawal || !pdfFile) {
      toast.error('Please upload a PDF file')
      return
    }
    setProcessing(true)
    try {
      // Convert PDF to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string
          await withdrawalService.uploadPaymentProof(selectedWithdrawal.id, base64)
          toast.success('Payment proof uploaded successfully')
          setShowUploadProofModal(false)
          setSelectedWithdrawal(null)
          setPdfFile(null)
          fetchWithdrawals()
        } catch (error) {
          console.error('Failed to upload proof:', error)
          toast.error('Failed to upload payment proof')
        } finally {
          setProcessing(false)
        }
      }
      reader.readAsDataURL(pdfFile)
    } catch (error) {
      console.error('Failed to read file:', error)
      toast.error('Failed to read file')
      setProcessing(false)
    }
  }

  // Unhold request handlers
  const handleApproveUnhold = (request: UnholdRequest) => {
    setSelectedUnholdRequest(request)
    setShowUnholdApproveModal(true)
  }

  const handleRejectUnhold = (request: UnholdRequest) => {
    setSelectedUnholdRequest(request)
    setShowUnholdRejectModal(true)
  }

  const confirmApproveUnhold = async () => {
    if (!selectedUnholdRequest) return
    setProcessing(true)
    try {
      // For now, just show success - unhold feature can be implemented later
      toast.success('Unhold request approved - User account reactivated!')
      setShowUnholdApproveModal(false)
      setSelectedUnholdRequest(null)
      fetchUnholdRequests()
      fetchWithdrawals()
    } catch (error) {
      console.error('Failed to approve unhold request:', error)
      toast.error('Failed to approve unhold request')
    } finally {
      setProcessing(false)
    }
  }

  const confirmRejectUnhold = async () => {
    if (!selectedUnholdRequest) return
    if (!unholdRejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setProcessing(true)
    try {
      // For now, just show success - unhold feature can be implemented later
      toast.success('Unhold request rejected - Charge refunded to user')
      setShowUnholdRejectModal(false)
      setSelectedUnholdRequest(null)
      setUnholdRejectionReason('')
      fetchUnholdRequests()
    } catch (error) {
      console.error('Failed to reject unhold request:', error)
      toast.error('Failed to reject unhold request')
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

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      withdrawal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      withdrawal.userId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalPending = withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0)
  const pendingCount = withdrawals.filter(w => w.status === 'pending').length
  const processingCount = withdrawals.filter(w => w.status === 'processing').length
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage)
  const paginatedWithdrawals = filteredWithdrawals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <p className="text-gray-400">Loading withdrawals...</p>
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
          <h1 className="text-2xl font-bold text-white">Withdrawal Management</h1>
          <p className="text-gray-400">Process withdrawal and unhold requests</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              fetchWithdrawals()
              fetchUnholdRequests()
            }}
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

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 border-b border-white/10"
      >
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'withdrawals'
              ? 'text-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Withdrawal Requests
          {activeTab === 'withdrawals' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('unhold')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'unhold'
              ? 'text-orange-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Unhold Requests
          {unholdRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs">
              {unholdRequests.filter(r => r.status === 'pending').length}
            </span>
          )}
          {activeTab === 'unhold' && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"
            />
          )}
        </button>
      </motion.div>

      {/* Withdrawals Tab Content */}
      {activeTab === 'withdrawals' && (
        <>
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
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Clock className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Processing</p>
              <p className="text-xl font-bold text-white">{processingCount}</p>
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
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-xl font-bold text-white">{withdrawals.filter(w => w.status === 'completed').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-danger/20">
              <XCircle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejected</p>
              <p className="text-xl font-bold text-white">{withdrawals.filter(w => w.status === 'rejected').length}</p>
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

          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'processing', 'held', 'completed', 'rejected', 'failed'].map((status) => (
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

      {/* Withdrawals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        {filteredWithdrawals.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowUpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">No withdrawals found</p>
            <p className="text-gray-400 text-sm">
              {statusFilter === 'pending' 
                ? 'No pending withdrawal requests' 
                : 'No withdrawals match your filters'}
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
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Bank Details</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWithdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{withdrawal.id}</span>
                          <button 
                            onClick={() => copyToClipboard(withdrawal.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="text-white text-sm font-medium">{withdrawal.userName || 'Unknown'}</span>
                          <p className="text-gray-400 text-xs">{withdrawal.userEmail || withdrawal.userId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-danger font-bold">₹{withdrawal.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="text-white text-sm">{withdrawal.bankName || 'N/A'}</span>
                            {withdrawal.accountNumber && (
                              <p className="text-gray-400 text-xs">{withdrawal.accountNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(withdrawal.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(withdrawal.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(withdrawal)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStartProcessing(withdrawal)}
                                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                                title="Start Processing"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(withdrawal)}
                                className="p-2 rounded-lg bg-danger/20 hover:bg-danger/30 text-danger transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {withdrawal.status === 'processing' && (
                            <>
                              <button
                                onClick={() => handleApprove(withdrawal)}
                                className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                                title="Complete"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFailWithdrawal(withdrawal)}
                                className="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 transition-colors"
                                title="Fail"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {withdrawal.status === 'completed' && (
                            <button
                              onClick={() => handleUploadProof(withdrawal)}
                              className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                              title="Upload Payment Proof"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length}
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
      </>
      )}

      {/* Unhold Requests Tab Content */}
      {activeTab === 'unhold' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white">Account Unhold Requests</h2>
            <p className="text-gray-400 text-sm mt-1">Review payment proofs and process unhold requests</p>
          </div>

          {unholdRequests.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">No Unhold Requests</p>
              <p className="text-gray-400 text-sm">There are no unhold requests at the moment</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {unholdRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card overflow-hidden ${
                    request.status === 'pending' 
                      ? 'border-l-4 border-l-yellow-500' 
                      : request.status === 'approved' 
                        ? 'border-l-4 border-l-green-500' 
                        : 'border-l-4 border-l-red-500'
                  }`}
                >
                  {/* Header with Request ID and Status */}
                  <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm font-mono">#{request.id}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400 text-sm">{formatDate(request.createdAt)}</span>
                    </div>
                    <div>
                      {request.status === 'pending' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Pending Review
                        </span>
                      )}
                      {request.status === 'approved' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* User Info Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User Details</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                            {(request.userName || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{request.userName || 'Unknown User'}</p>
                            <p className="text-gray-400 text-sm">{request.userEmail || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mt-2 p-3 rounded-lg bg-white/5">
                          <p className="text-gray-400 text-xs mb-1">Current Wallet Balance</p>
                          <p className="text-white font-bold text-xl">NPR {(request.userBalance || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Payment Details Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Details</h4>
                        <div className="space-y-3">
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-yellow-400 text-xs mb-1">Unhold Charge (18%)</p>
                            <p className="text-yellow-400 font-bold text-2xl">NPR {request.unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5">
                            <p className="text-gray-400 text-xs mb-1">UTR / Transaction Number</p>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-mono font-medium">{request.utrNumber}</p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(request.utrNumber)
                                  toast.success('UTR copied!')
                                }}
                                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment Proof & Actions Section */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Proof</h4>
                        {request.screenshot ? (
                          <div 
                            className="relative group cursor-pointer rounded-lg overflow-hidden border border-white/10"
                            onClick={() => {
                              setSelectedUnholdRequest(request)
                              setShowUnholdScreenshotModal(true)
                            }}
                          >
                            <img 
                              src={request.screenshot} 
                              alt="Payment Proof" 
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="flex items-center gap-2 text-white font-medium">
                                <Eye className="w-5 h-5" />
                                View Full Image
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 rounded-lg bg-white/5 border border-dashed border-white/20 text-center">
                            <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No screenshot uploaded</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => handleApproveUnhold(request)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectUnhold(request)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}

                        {request.status === 'rejected' && request.rejectionReason && (
                          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-red-400 text-xs mb-1">Rejection Reason</p>
                            <p className="text-red-300 text-sm">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Approve Modal */}
      <AnimatePresence>
        {showApproveModal && selectedWithdrawal && (
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
                <h2 className="text-xl font-bold text-white">Process Withdrawal</h2>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                  <p className="text-danger text-lg font-bold text-center">
                    ₹{selectedWithdrawal.amount.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Withdrawal ID:</span>
                    <span className="text-white font-mono">{selectedWithdrawal.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white">{selectedWithdrawal.userId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Bank:</span>
                    <span className="text-white">{selectedWithdrawal.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Account:</span>
                    <span className="text-white">{selectedWithdrawal.accountNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">IFSC:</span>
                    <span className="text-white">{selectedWithdrawal.ifsc || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Transaction Reference *</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter bank transaction reference..."
                    className="w-full px-4 py-3 bg-[#12131a] rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-warning text-sm">
                    This will deduct ₹{selectedWithdrawal.amount.toLocaleString()} from the user's balance.
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
                    disabled={processing || !transactionRef.trim()}
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
                        Process
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
        {showRejectModal && selectedWithdrawal && (
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
                <h2 className="text-xl font-bold text-white">Reject Withdrawal</h2>
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
                    ₹{selectedWithdrawal.amount.toLocaleString()}
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
        {showDetailsModal && selectedWithdrawal && (
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
                <h2 className="text-xl font-bold text-white">Withdrawal Details</h2>
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
                  <p className="text-2xl font-bold text-danger">₹{selectedWithdrawal.amount.toLocaleString()}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Withdrawal ID</span>
                    <span className="text-white font-mono">{selectedWithdrawal.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID</span>
                    <span className="text-white">{selectedWithdrawal.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank</span>
                    <span className="text-white">{selectedWithdrawal.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Number</span>
                    <span className="text-white">{selectedWithdrawal.accountNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IFSC Code</span>
                    <span className="text-white">{selectedWithdrawal.ifsc || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Holder</span>
                    <span className="text-white">{selectedWithdrawal.accountHolderName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Requested</span>
                    <span className="text-white">{formatDate(selectedWithdrawal.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    {getStatusBadge(selectedWithdrawal.status)}
                  </div>
                  {selectedWithdrawal.transactionRef && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction Ref</span>
                      <span className="text-white font-mono text-sm">{selectedWithdrawal.transactionRef}</span>
                    </div>
                  )}
                  {selectedWithdrawal.paymentProof?.utrNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">UTR Number</span>
                      <span className="text-white font-mono text-sm">{selectedWithdrawal.paymentProof.utrNumber}</span>
                    </div>
                  )}
                  {selectedWithdrawal.paymentProof?.serverCharge && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Server Charge</span>
                      <span className="text-white">₹{selectedWithdrawal.paymentProof.serverCharge.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {selectedWithdrawal.paymentProof?.screenshot && (
                  <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Payment Proof Screenshot</label>
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#12131a]">
                      <img 
                        src={selectedWithdrawal.paymentProof.screenshot} 
                        alt="Payment Proof" 
                        className="w-full h-auto"
                      />
                    </div>
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

      {/* Start Processing Modal */}
      <AnimatePresence>
        {showProcessingModal && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProcessingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Start Processing</h2>
                <button
                  onClick={() => setShowProcessingModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-lg font-bold text-center">
                    NPR {selectedWithdrawal.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Processing Duration (minutes)</label>
                  <input
                    type="number"
                    value={processingDuration}
                    onChange={(e) => setProcessingDuration(e.target.value)}
                    min="20"
                    max="30"
                    placeholder="25"
                    className="w-full px-4 py-3 bg-[#12131a] rounded-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">Enter between 20-30 minutes</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="text-blue-400 text-sm">
                    This will notify the user that their withdrawal is being processed. The balance has already been deducted.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowProcessingModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStartProcessing}
                    disabled={processing}
                    className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-500/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        Start Processing
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fail Modal */}
      <AnimatePresence>
        {showFailModal && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Fail Withdrawal</h2>
                <button
                  onClick={() => setShowFailModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-400 text-lg font-bold text-center">
                    NPR {selectedWithdrawal.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Failure Reason *</label>
                  <select
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full px-4 py-3 bg-[#12131a] rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Server Charge Pending">Server Charge Pending</option>
                    <option value="Commission Pending">Commission Pending</option>
                    <option value="Bank Elect Charge Pending">Bank Elect Charge Pending</option>
                    <option value="Server Commission Holding">Server Commission Holding</option>
                    <option value="Account Closure Charge">Account Closure Charge</option>
                    <option value="Bank Details Invalid">Bank Details Invalid</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-orange-400 text-sm">
                    This will refund NPR {selectedWithdrawal.amount.toLocaleString()} to the user's wallet.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFailModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmFail}
                    disabled={processing || !failureReason}
                    className="flex-1 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-500/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Failing...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Fail Withdrawal
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Upload Payment Proof Modal */}
        {showUploadProofModal && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadProofModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Payment Proof</h2>
                <button
                  onClick={() => setShowUploadProofModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-purple-400 text-sm text-center mb-1">Withdrawal Amount</p>
                  <p className="text-white text-lg font-bold text-center">
                    NPR {selectedWithdrawal.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Upload PDF Receipt *</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#12131a] border-2 border-dashed border-white/20 hover:border-purple-500/50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-400">
                      {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                    </span>
                  </label>
                  <p className="text-gray-500 text-xs mt-1">Max file size: 5MB</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUploadProofModal(false)
                      setPdfFile(null)
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUploadProof}
                    disabled={processing || !pdfFile}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-500 hover:bg-purple-500/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Proof
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unhold Approve Modal */}
      <AnimatePresence>
        {showUnholdApproveModal && selectedUnholdRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUnholdApproveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Approve Unhold Request</h2>
                <button
                  onClick={() => setShowUnholdApproveModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <p className="text-orange-400 font-semibold">Confirm Approval</p>
                  </div>
                  <p className="text-gray-300 text-sm">
                    User: <span className="text-white font-medium">{selectedUnholdRequest.userName}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Charge Paid: <span className="text-yellow-400 font-bold">NPR {selectedUnholdRequest.unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    This will reactivate the user's account and mark all on_hold transactions as completed.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnholdApproveModal(false)}
                    disabled={processing}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproveUnhold}
                    disabled={processing}
                    className="flex-1 px-4 py-3 rounded-xl bg-success hover:bg-success/90 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

      {/* Unhold Reject Modal */}
      <AnimatePresence>
        {showUnholdRejectModal && selectedUnholdRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUnholdRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Reject Unhold Request</h2>
                <button
                  onClick={() => setShowUnholdRejectModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400 font-semibold">Reject Request</p>
                  </div>
                  <p className="text-gray-300 text-sm">
                    User: <span className="text-white font-medium">{selectedUnholdRequest.userName}</span>
                  </p>
                  <p className="text-gray-300 text-sm">
                    Charge: <span className="text-yellow-400 font-bold">NPR {selectedUnholdRequest.unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </p>
                  <p className="text-gray-300 text-sm mt-2">
                    The unhold charge will be refunded to the user's wallet.
                  </p>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Rejection Reason *</label>
                  <textarea
                    value={unholdRejectionReason}
                    onChange={(e) => setUnholdRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="input-glass w-full min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUnholdRejectModal(false)}
                    disabled={processing}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRejectUnhold}
                    disabled={processing || !unholdRejectionReason.trim()}
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

      {/* Unhold Screenshot Modal */}
      <AnimatePresence>
        {showUnholdScreenshotModal && selectedUnholdRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUnholdScreenshotModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Payment Proof Screenshot</h2>
                <button
                  onClick={() => setShowUnholdScreenshotModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-400">User</p>
                      <p className="text-white font-medium">{selectedUnholdRequest.userName}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Email</p>
                      <p className="text-white font-medium">{selectedUnholdRequest.userEmail}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">UTR Number</p>
                      <p className="text-white font-mono">{selectedUnholdRequest.utrNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Unhold Charge</p>
                      <p className="text-yellow-400 font-bold">NPR {selectedUnholdRequest.unholdCharge.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>

                {selectedUnholdRequest.screenshot ? (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <img 
                      src={selectedUnholdRequest.screenshot} 
                      alt="Payment Proof" 
                      className="w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-xl bg-white/5 border border-white/10">
                    <p className="text-gray-400">No screenshot available</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUnholdScreenshotModal(false)
                      handleRejectUnhold(selectedUnholdRequest)
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-danger/20 hover:bg-danger/30 border border-danger/20 text-danger font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowUnholdScreenshotModal(false)
                      handleApproveUnhold(selectedUnholdRequest)
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-success hover:bg-success/90 text-white font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
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

export default AdminWithdrawalsPage
