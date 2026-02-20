import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import UserDashboard from './pages/UserDashboard'
import GovDashboard from './pages/GovDashboard'
import GamificationPage from './pages/GamificationPage'
import Navbar from './components/Navbar'

// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.28 } },
}

export default function App() {
  // 'landing' | 'dashboard' | 'rewards'
  const [view, setView] = useState('landing')
  // 'user' | 'gov'
  const [mode, setMode] = useState('user')

  const handleEnterDashboard = (selectedMode) => {
    setMode(selectedMode)
    setView('dashboard')
  }

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setView('dashboard')
  }

  const showNav = view === 'dashboard' || view === 'rewards'

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Navbar — visible on dashboard and rewards */}
      <AnimatePresence>
        {showNav && (
          <Navbar
            mode={mode}
            setMode={handleModeChange}
            view={view}
            setView={setView}
          />
        )}
      </AnimatePresence>

      {/* Page routing */}
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" {...pageVariants}>
            <LandingPage onEnterDashboard={handleEnterDashboard} />
          </motion.div>
        )}

        {view === 'dashboard' && mode === 'user' && (
          <motion.div key="user-dashboard" {...pageVariants}>
            <UserDashboard onGoToRewards={() => setView('rewards')} />
          </motion.div>
        )}

        {view === 'dashboard' && mode === 'gov' && (
          <motion.div key="gov-dashboard" {...pageVariants}>
            <GovDashboard />
          </motion.div>
        )}

        {view === 'rewards' && (
          <motion.div key="rewards" {...pageVariants}>
            <GamificationPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to pitch + hackathon badge */}
      {showNav && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <span className="glass rounded-full px-2.5 py-1 text-bee-yellow/50 text-xs font-bold tracking-wide hidden sm:inline">
            🐝 Hackathon Demo
          </span>
          <button
            onClick={() => setView('landing')}
            className="glass rounded-full px-4 py-2 text-white/35 text-xs hover:text-white/65 transition-colors"
          >
            ← Back to pitch
          </button>
        </div>
      )}
    </div>
  )
}
