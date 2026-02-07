import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  Tag,
  XCircle,
  Filter,
  ArrowRight
} from 'lucide-react'

const AdminSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [replyText, setReplyText] = useState('')

  const tickets = [
    {
      id: 'TKT-1234',
      userId: 'USR-4521',
      userName: 'Rahul Sharma',
      email: 'rahul.sharma@email.com',
      subject: 'Unable to withdraw funds',
      category: 'Withdrawal',
      priority: 'high',
      status: 'open',
      createdAt: '2024-03-15 10:30 AM',
      lastUpdated: '2024-03-15 11:45 AM',
      messages: [
        { id: '1', sender: 'user', text: 'I have been trying to withdraw my funds for 2 days but the request keeps getting stuck.', time: '10:30 AM' },
        { id: '2', sender: 'admin', text: 'Hi Rahul, I apologize for the inconvenience. Let me check your withdrawal request.', time: '10:45 AM' },
        { id: '3', sender: 'user', text: 'Please help, I need the money urgently.', time: '11:45 AM' }
      ]
    },
    {
      id: 'TKT-1235',
      userId: 'USR-4522',
      userName: 'Priya Patel',
      email: 'priya.patel@email.com',
      subject: 'KYC verification pending for too long',
      category: 'KYC',
      priority: 'medium',
      status: 'open',
      createdAt: '2024-03-15 09:15 AM',
      lastUpdated: '2024-03-15 09:15 AM',
      messages: [
        { id: '1', sender: 'user', text: 'My KYC has been pending for 5 days. When will it be approved?', time: '09:15 AM' }
      ]
    },
    {
      id: 'TKT-1236',
      userId: 'USR-4523',
      userName: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      subject: 'Order execution issue',
      category: 'Trading',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2024-03-14 03:45 PM',
      lastUpdated: '2024-03-15 10:00 AM',
      assignedTo: 'Support Agent 1',
      messages: [
        { id: '1', sender: 'user', text: 'My buy order was executed at a different price than what was shown.', time: '03:45 PM' },
        { id: '2', sender: 'admin', text: 'Hi Amit, we are investigating this issue. Can you provide the order ID?', time: '04:00 PM' },
        { id: '3', sender: 'user', text: 'Order ID: ORD-789456', time: '04:15 PM' }
      ]
    },
    {
      id: 'TKT-1237',
      userId: 'USR-4524',
      userName: 'Sneha Gupta',
      email: 'sneha.gupta@email.com',
      subject: 'How to enable 2FA?',
      category: 'Account',
      priority: 'low',
      status: 'resolved',
      createdAt: '2024-03-13 11:00 AM',
      lastUpdated: '2024-03-13 02:00 PM',
      resolvedAt: '2024-03-13 02:00 PM',
      messages: [
        { id: '1', sender: 'user', text: 'I want to enable 2FA for my account. How do I do that?', time: '11:00 AM' },
        { id: '2', sender: 'admin', text: 'Hi Sneha, you can enable 2FA from Settings > Security > Two-Factor Authentication. Click on Enable and follow the steps.', time: '11:30 AM' },
        { id: '3', sender: 'user', text: 'Thank you! It worked.', time: '02:00 PM' }
      ]
    },
    {
      id: 'TKT-1238',
      userId: 'USR-4525',
      userName: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      subject: 'App crashing on mobile',
      category: 'Technical',
      priority: 'medium',
      status: 'open',
      createdAt: '2024-03-15 08:00 AM',
      lastUpdated: '2024-03-15 08:00 AM',
      messages: [
        { id: '1', sender: 'user', text: 'The app keeps crashing when I try to open the portfolio page on my Android phone.', time: '08:00 AM' }
      ]
    }
  ]

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-danger/20 text-danger text-xs">
            <AlertCircle className="w-3 h-3" />
            High
          </span>
        )
      case 'medium':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs">
            <Clock className="w-3 h-3" />
            Medium
          </span>
        )
      case 'low':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            Low
          </span>
        )
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs">
            <Clock className="w-3 h-3" />
            Open
          </span>
        )
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">
            <MessageSquare className="w-3 h-3" />
            In Progress
          </span>
        )
      case 'resolved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        )
      case 'closed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-400/20 text-gray-400 text-xs">
            <XCircle className="w-3 h-3" />
            Closed
          </span>
        )
      default:
        return null
    }
  }

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket)
    setShowTicketModal(true)
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return
    console.log('Sending reply:', replyText)
    setReplyText('')
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    return matchesStatus && matchesPriority
  })

  const openCount = tickets.filter(t => t.status === 'open').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length
  const highPriorityCount = tickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-gray-400">Manage and respond to support tickets</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{openCount}</p>
              <p className="text-gray-400 text-sm">Open Tickets</p>
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
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inProgressCount}</p>
              <p className="text-gray-400 text-sm">In Progress</p>
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
            <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{highPriorityCount}</p>
              <p className="text-gray-400 text-sm">High Priority</p>
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
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">2.5h</p>
              <p className="text-gray-400 text-sm">Avg Response Time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket ID, subject, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-danger/50"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {['all', 'open', 'in_progress', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    statusFilter === status
                      ? 'bg-danger text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-danger/50"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Tickets Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-gray-400 font-medium">Ticket</th>
                <th className="p-4 text-left text-gray-400 font-medium hidden md:table-cell">User</th>
                <th className="p-4 text-left text-gray-400 font-medium hidden lg:table-cell">Category</th>
                <th className="p-4 text-left text-gray-400 font-medium">Priority</th>
                <th className="p-4 text-left text-gray-400 font-medium">Status</th>
                <th className="p-4 text-left text-gray-400 font-medium hidden xl:table-cell">Last Updated</th>
                <th className="p-4 text-right text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleViewTicket(ticket)}
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{ticket.id}</p>
                      <p className="text-gray-400 text-sm truncate max-w-xs">{ticket.subject}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs">
                        {ticket.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-white text-sm">{ticket.userName}</p>
                        <p className="text-gray-400 text-xs">{ticket.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-xs">
                      <Tag className="w-3 h-3" />
                      {ticket.category}
                    </span>
                  </td>
                  <td className="p-4">{getPriorityBadge(ticket.priority)}</td>
                  <td className="p-4">{getStatusBadge(ticket.status)}</td>
                  <td className="p-4 hidden xl:table-cell">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-3 h-3" />
                      {ticket.lastUpdated}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewTicket(ticket)
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger hover:bg-danger/80 text-white text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            Showing 1-5 of 34 tickets
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-danger text-white text-sm">1</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">2</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white text-sm transition-colors">3</button>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTicketModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">{selectedTicket.id}</h2>
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <p className="text-gray-400 text-sm mt-1">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-danger to-accent-purple flex items-center justify-center text-white font-bold">
                  {selectedTicket.userName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedTicket.userName}</p>
                  <p className="text-gray-400 text-sm">{selectedTicket.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Created</p>
                  <p className="text-white text-sm">{selectedTicket.createdAt}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket.messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${
                      message.sender === 'admin'
                        ? 'bg-danger text-white'
                        : 'bg-white/5 border border-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'admin' ? 'text-white/70' : 'text-gray-400'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-danger/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="px-4 py-3 rounded-xl bg-danger hover:bg-danger/80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition-colors">
                    Mark as Resolved
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-colors">
                    Assign to Agent
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:text-white hover:bg-white/10 transition-colors">
                    Change Priority
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default AdminSupportPage
