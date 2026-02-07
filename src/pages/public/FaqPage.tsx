import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown, Search, ArrowRight } from 'lucide-react'

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      category: 'Getting Started',
      faqs: [
        {
          question: 'What is TradeX?',
          answer: 'TradeX is a paper trading platform that allows you to practice trading with virtual funds. It simulates real market conditions without risking real money, making it perfect for learning and improving your trading skills.',
        },
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is simple. Click on "Sign Up", enter your email or phone number, create a password, and verify your account. You\'ll receive ₹500 NPR demo balance instantly upon signup.',
        },
        {
          question: 'Is TradeX free to use?',
          answer: 'Yes, TradeX offers a free plan that includes basic features, ₹500 NPR demo balance, and access to all markets. We also offer Pro and Enterprise plans for advanced features.',
        },
        {
          question: 'What is demo balance?',
          answer: 'Demo balance is virtual money that you can use to practice trading. It works exactly like real money in the platform but has no actual monetary value. You receive ₹500 NPR demo balance when you sign up.',
        },
      ],
    },
    {
      category: 'Trading',
      faqs: [
        {
          question: 'What markets can I trade?',
          answer: 'TradeX offers paper trading across multiple asset classes including stocks, indices, commodities, forex, and cryptocurrencies. All trades are simulated using live market data.',
        },
        {
          question: 'What order types are supported?',
          answer: 'We support market orders, limit orders, stop-loss orders, take-profit orders, and advanced order types like bracket orders and GTT (Good Till Triggered) orders.',
        },
        {
          question: 'How does the commission work?',
          answer: 'TradeX charges a 5% commission only on profitable trades. If your trade results in a loss, no commission is charged. This fee is deducted automatically when you close a profitable position.',
        },
        {
          question: 'Can I trade with real money?',
          answer: 'Currently, TradeX is a paper trading platform only. We do not support real money trading. Our platform is designed for learning and practice purposes.',
        },
      ],
    },
    {
      category: 'Deposits & Withdrawals',
      faqs: [
        {
          question: 'How can I add more demo balance?',
          answer: 'To add more demo balance, you need to submit a deposit request through the Wallet section. Our support team will review and approve your request within 24-48 hours.',
        },
        {
          question: 'Can I withdraw my demo balance?',
          answer: 'Demo balance can be withdrawn after support approval. Submit a withdrawal request through the Wallet section, and our team will process it. Withdrawal requests are subject to our terms and conditions.',
        },
        {
          question: 'How long do deposits/withdrawals take?',
          answer: 'Deposit and withdrawal requests are typically processed within 24-48 business hours after submission. You will receive notifications about the status of your request.',
        },
        {
          question: 'Are there any fees for deposits/withdrawals?',
          answer: 'Deposits are free. Withdrawals have a processing fee of ₹25 per request. This fee is deducted from the withdrawal amount.',
        },
      ],
    },
    {
      category: 'Account & Security',
      faqs: [
        {
          question: 'How do I complete KYC?',
          answer: 'To complete KYC, go to Profile > KYC and submit your PAN card, Aadhaar card, and bank account details. Our team will verify your documents within 24-48 hours.',
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we use bank-grade security measures including SSL encryption, 2FA, and secure data storage. We comply with data protection regulations and never share your information with third parties.',
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your registered email, and follow the instructions sent to your email to reset your password.',
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can request account deletion by contacting our support team. Please note that this action is irreversible and all your data will be permanently deleted.',
        },
      ],
    },
  ]

  const allFaqs = faqCategories.flatMap((category, catIndex) =>
    category.faqs.map((faq, faqIndex) => ({
      ...faq,
      category: category.category,
      index: catIndex * 100 + faqIndex,
    }))
  )

  const filteredFaqs = searchQuery
    ? allFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null

  return (
    <div className="py-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Frequently Asked
            <span className="text-gradient"> Questions</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Find answers to common questions about TradeX.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-12"
            />
          </div>
        </motion.div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {searchQuery ? (
          // Search Results
          <div className="space-y-4">
            {filteredFaqs && filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <motion.div
                  key={faq.index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === faq.index ? null : faq.index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div>
                      <span className="text-purple-400 text-xs font-medium mb-1 block">
                        {faq.category}
                      </span>
                      <span className="text-white font-medium">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        openIndex === faq.index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openIndex === faq.index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-gray-400">{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No results found for "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-purple-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        ) : (
          // Categories
          <div className="space-y-12">
            {faqCategories.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xl font-bold text-white mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const index = catIndex * 100 + faqIndex
                    return (
                      <div key={index} className="glass-card">
                        <button
                          onClick={() => setOpenIndex(openIndex === index ? null : index)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left"
                        >
                          <span className="text-white font-medium">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                              openIndex === index ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {openIndex === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4 text-gray-400">{faq.answer}</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-[#12131a]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-gray-400 mb-6">
            Our support team is here to help you 24/7.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Contact Support
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default FaqPage
