import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center mb-4"
        >
          <TrendingUp className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-1 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-4 text-gray-400 text-sm"
        >
          Loading TradeX...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default LoadingScreen
