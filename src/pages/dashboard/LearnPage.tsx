import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Play,
  Clock,
  Award,
  ChevronRight,
  Search,
  Filter,
  Star,
  CheckCircle,
  Lock,
  TrendingUp,
  BarChart2,
  PieChart,
  Zap
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  lessons: number
  progress: number
  thumbnail: string
  instructor: string
  rating: number
  enrolled: number
  isLocked: boolean
}

interface Article {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  date: string
  image: string
}

const LearnPage = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'articles' | 'glossary'>('courses')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const courses: Course[] = [
    {
      id: '1',
      title: 'Stock Market Basics',
      description: 'Learn the fundamentals of stock market investing',
      category: 'Basics',
      level: 'beginner',
      duration: '2h 30m',
      lessons: 12,
      progress: 75,
      thumbnail: '/course-basics.jpg',
      instructor: 'Rajesh Kumar',
      rating: 4.8,
      enrolled: 15420,
      isLocked: false
    },
    {
      id: '2',
      title: 'Technical Analysis Mastery',
      description: 'Master chart patterns and indicators for better trading',
      category: 'Technical',
      level: 'intermediate',
      duration: '4h 15m',
      lessons: 18,
      progress: 30,
      thumbnail: '/course-technical.jpg',
      instructor: 'Priya Sharma',
      rating: 4.7,
      enrolled: 8950,
      isLocked: false
    },
    {
      id: '3',
      title: 'Fundamental Analysis Deep Dive',
      description: 'Analyze financial statements and value stocks',
      category: 'Fundamental',
      level: 'intermediate',
      duration: '3h 45m',
      lessons: 15,
      progress: 0,
      thumbnail: '/course-fundamental.jpg',
      instructor: 'Amit Patel',
      rating: 4.6,
      enrolled: 6230,
      isLocked: false
    },
    {
      id: '4',
      title: 'Options Trading Strategies',
      description: 'Advanced options strategies for consistent profits',
      category: 'Derivatives',
      level: 'advanced',
      duration: '5h 30m',
      lessons: 22,
      progress: 0,
      thumbnail: '/course-options.jpg',
      instructor: 'Vikram Singh',
      rating: 4.9,
      enrolled: 4120,
      isLocked: true
    },
  ]

  const articles: Article[] = [
    {
      id: '1',
      title: 'Understanding P/E Ratio: A Complete Guide',
      excerpt: 'Learn how to use the price-to-earnings ratio to evaluate stocks...',
      category: 'Fundamental Analysis',
      readTime: '8 min',
      date: '2024-01-15',
      image: '/article-pe.jpg'
    },
    {
      id: '2',
      title: 'Top 5 Chart Patterns Every Trader Should Know',
      excerpt: 'Master these essential chart patterns to improve your trading...',
      category: 'Technical Analysis',
      readTime: '12 min',
      date: '2024-01-12',
      image: '/article-patterns.jpg'
    },
    {
      id: '3',
      title: 'Risk Management: The Key to Long-Term Success',
      excerpt: 'Discover proven risk management strategies used by professionals...',
      category: 'Trading Psychology',
      readTime: '10 min',
      date: '2024-01-10',
      image: '/article-risk.jpg'
    },
  ]

  const glossary = [
    { term: 'Bull Market', definition: 'A market condition where prices are rising or expected to rise.' },
    { term: 'Bear Market', definition: 'A market condition where prices are falling or expected to fall.' },
    { term: 'Stop Loss', definition: 'An order to sell a security when it reaches a certain price to limit losses.' },
    { term: 'Market Order', definition: 'An order to buy or sell immediately at the best available price.' },
    { term: 'Limit Order', definition: 'An order to buy or sell at a specific price or better.' },
    { term: 'Dividend', definition: 'A portion of company profits distributed to shareholders.' },
  ]

  const categories = ['all', 'Basics', 'Technical', 'Fundamental', 'Derivatives', 'Psychology']

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner': return 'text-emerald-400 bg-emerald-500/20'
      case 'intermediate': return 'text-warning bg-warning/20'
      case 'advanced': return 'text-danger bg-danger/20'
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Learn Trading</h1>
        <p className="text-gray-400">Educational resources to improve your trading skills</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">4</p>
            <p className="text-gray-400 text-sm">Courses</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">6h</p>
            <p className="text-gray-400 text-sm">Watch Time</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/20 flex items-center justify-center">
            <Award className="w-6 h-6 text-accent-purple" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">2</p>
            <p className="text-gray-400 text-sm">Certificates</p>
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
          { id: 'courses', label: 'Courses', icon: Play },
          { id: 'articles', label: 'Articles', icon: BookOpen },
          { id: 'glossary', label: 'Glossary', icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-blue text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Search & Filter */}
      {activeTab !== 'glossary' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-12 w-full"
            />
          </div>
          {activeTab === 'courses' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-glass-hover text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Courses */}
      {activeTab === 'courses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className={`glass-card overflow-hidden ${course.isLocked ? 'opacity-75' : ''}`}
            >
              <div className="h-40 bg-gradient-to-br from-purple-500/30 to-cyan-400/30 flex items-center justify-center relative">
                {course.category === 'Basics' && <TrendingUp className="w-16 h-16 text-white/50" />}
                {course.category === 'Technical' && <BarChart2 className="w-16 h-16 text-white/50" />}
                {course.category === 'Fundamental' && <PieChart className="w-16 h-16 text-white/50" />}
                {course.category === 'Derivatives' && <Zap className="w-16 h-16 text-white/50" />}
                {course.isLocked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                )}
                {course.progress > 0 && !course.isLocked && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div 
                      className="h-full bg-purple-400"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <span className="text-gray-400 text-sm">{course.category}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="w-4 h-4 fill-current" />
                    {course.rating}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    {course.progress > 0 ? `${course.progress}% complete` : `${course.enrolled.toLocaleString()} enrolled`}
                  </div>
                  <button 
                    className={`${course.isLocked ? 'btn-secondary' : 'btn-primary'} text-sm`}
                    disabled={course.isLocked}
                  >
                    {course.isLocked ? 'Unlock' : course.progress > 0 ? 'Continue' : 'Start'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Articles */}
      {activeTab === 'articles' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {articles.map((article) => (
            <div
              key={article.id}
              className="glass-card p-4 lg:p-6 flex flex-col md:flex-row gap-4 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="w-full md:w-48 h-32 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-400/30 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-12 h-12 text-white/50" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="text-gray-400 text-sm">{article.readTime} read</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{article.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{article.date}</span>
                  <span className="text-purple-400 text-sm flex items-center gap-1">
                    Read More
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Glossary */}
      {activeTab === 'glossary' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search terms..."
              className="input-glass pl-12 w-full"
            />
          </div>
          <div className="glass-card divide-y divide-white/10">
            {glossary.map((item, idx) => (
              <div key={idx} className="p-4 lg:p-6">
                <h3 className="text-white font-bold mb-2">{item.term}</h3>
                <p className="text-gray-400">{item.definition}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default LearnPage
