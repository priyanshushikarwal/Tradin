import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Paperclip,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  ExternalLink
} from 'lucide-react'

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

interface Ticket {
  id: string
  subject: string
  category: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string
  lastUpdate: string
  messages: number
}

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'chat' | 'faq'>('tickets')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')

  const tickets: Ticket[] = [
    {
      id: 'TKT-001234',
      subject: 'Withdrawal not processed after 48 hours',
      category: 'Withdrawal',
      status: 'in_progress',
      priority: 'high',
      createdAt: '2024-01-14',
      lastUpdate: '2 hours ago',
      messages: 5
    },
    {
      id: 'TKT-001232',
      subject: 'KYC verification stuck on pending',
      category: 'KYC',
      status: 'open',
      priority: 'medium',
      createdAt: '2024-01-13',
      lastUpdate: '1 day ago',
      messages: 2
    },
    {
      id: 'TKT-001228',
      subject: 'Order executed at wrong price',
      category: 'Trading',
      status: 'resolved',
      priority: 'urgent',
      createdAt: '2024-01-10',
      lastUpdate: '4 days ago',
      messages: 8
    },
  ]

  const faqCategories = [
    {
      title: 'Getting Started',
      questions: [
        'How do I create an account?',
        'What documents are required for KYC?',
        'How does paper trading work?'
      ]
    },
    {
      title: 'Trading',
      questions: [
        'What order types are available?',
        'How do I place a stop-loss order?',
        'What are the trading hours?'
      ]
    },
    {
      title: 'Deposits & Withdrawals',
      questions: [
        'How do I deposit funds?',
        'Why is my withdrawal pending?',
        'What are the minimum/maximum limits?'
      ]
    }
  ]

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'open': return 'text-purple-400 bg-purple-500/20'
      case 'in_progress': return 'text-warning bg-warning/20'
      case 'resolved': return 'text-emerald-400 bg-emerald-500/20'
      case 'closed': return 'text-gray-400 bg-white/5'
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent': return 'text-danger'
      case 'high': return 'text-warning'
      case 'medium': return 'text-purple-400'
      case 'low': return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Support</h1>
          <p className="text-gray-400">Get help with your account and trades</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          New Ticket
        </button>
      </motion.div>

      {/* Quick Contact Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-medium">Live Chat</p>
            <p className="text-emerald-400 text-sm">Online 24/7</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium">Email Support</p>
            <p className="text-gray-400 text-sm">support@trader.com</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Phone className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <p className="text-white font-medium">Phone Support</p>
            <p className="text-gray-400 text-sm">+91 1800-123-4567</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
      >
        {[
          { id: 'tickets', label: 'My Tickets', icon: FileText },
          { id: 'chat', label: 'Live Chat', icon: MessageCircle },
          { id: 'faq', label: 'FAQ', icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-glass pl-12 w-full"
              />
            </div>
          </div>

          {/* Ticket List */}
          <div className="divide-y divide-white/10">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 lg:px-6 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-sm">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        • {ticket.priority}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-1">{ticket.subject}</p>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <span>{ticket.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ticket.lastUpdate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {ticket.messages} messages
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {tickets.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">No tickets yet</p>
              <p className="text-gray-400 mb-4">Create a ticket to get help from our support team</p>
              <button onClick={() => setShowNewTicket(true)} className="btn-primary">
                Create Ticket
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Live Chat Tab */}
      {activeTab === 'chat' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card h-[500px] flex flex-col"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-bg-primary" />
            </div>
            <div>
              <p className="text-white font-medium">Support Agent</p>
              <p className="text-emerald-400 text-sm">Online</p>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-2xl rounded-bl-none bg-white/5">
                <p className="text-white">Hello! Welcome to TradeFlow support. How can I help you today?</p>
                <p className="text-gray-400 text-xs mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[70%] p-3 rounded-2xl rounded-br-none bg-purple-500">
                <p className="text-white">Hi! I have a question about my withdrawal request.</p>
                <p className="text-white/70 text-xs mt-1">10:31 AM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-2xl rounded-bl-none bg-white/5">
                <p className="text-white">I'd be happy to help you with that. Could you please provide your withdrawal reference number?</p>
                <p className="text-gray-400 text-xs mt-1">10:32 AM</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-3">
              <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 input-glass"
              />
              <button className="btn-primary px-4">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ..."
              className="input-glass pl-12 w-full"
            />
          </div>

          {/* FAQ Categories */}
          {faqCategories.map((category, idx) => (
            <div key={idx} className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">{category.title}</h3>
              </div>
              <div className="divide-y divide-white/10">
                {category.questions.map((question, qIdx) => (
                  <button
                    key={qIdx}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-colors text-left"
                  >
                    <span className="text-gray-400">{question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center">
            <p className="text-gray-400 mb-3">Can't find what you're looking for?</p>
            <button onClick={() => setShowNewTicket(true)} className="btn-primary">
              Contact Support
            </button>
          </div>
        </motion.div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewTicket(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Create New Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Category</label>
                <select className="input-glass w-full">
                  <option>Trading</option>
                  <option>Deposits & Withdrawals</option>
                  <option>KYC Verification</option>
                  <option>Account Settings</option>
                  <option>Technical Issue</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Subject</label>
                <input
                  type="text"
                  placeholder="Brief description of your issue"
                  className="input-glass w-full"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Description</label>
                <textarea
                  rows={4}
                  placeholder="Please provide as much detail as possible..."
                  className="input-glass w-full resize-none"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Attachments (optional)</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-purple-500/50 transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Click to attach files</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewTicket(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button className="flex-1 btn-primary">Submit Ticket</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SupportPage
