import { motion } from 'framer-motion'
import { User, Building2, Trophy, LayoutDashboard } from 'lucide-react'

export default function Navbar({ mode, setMode, view, setView }) {
  const isRewards = view === 'rewards'

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass-strong rounded-2xl px-5 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <button
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl">🐝</span>
          <div className="hidden sm:block">
            <span className="text-white font-black text-base tracking-tight">SmartBee</span>
            <span className="text-white/25 text-xs ml-2">Manchester</span>
          </div>
        </button>

        {/* Centre: mode + nav tabs */}
        <div className="flex items-center gap-2">
          {/* USER/GOV toggle */}
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            <button
              onClick={() => { setMode('user'); setView('dashboard') }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                mode === 'user' && !isRewards
                  ? 'bg-bee-yellow text-black shadow-[0_0_12px_rgba(255,209,0,0.35)]'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">User</span>
            </button>
            <button
              onClick={() => { setMode('gov'); setView('dashboard') }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                mode === 'gov'
                  ? 'bg-bee-yellow text-black shadow-[0_0_12px_rgba(255,209,0,0.35)]'
                  : 'text-white/45 hover:text-white/70'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Government</span>
            </button>
          </div>

          {/* Rewards tab — only show for user mode */}
          {mode === 'user' && (
            <button
              onClick={() => setView('rewards')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 glass ${
                isRewards
                  ? 'border border-bee-yellow/30 text-bee-yellow'
                  : 'text-white/35 hover:text-white/65 border border-transparent'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rewards</span>
              {/* Points badge */}
              <span className="bg-bee-yellow/15 text-bee-yellow rounded-full px-1.5 py-0.5 text-xs font-black ml-0.5 hidden md:inline">
                480
              </span>
            </button>
          )}
        </div>

        {/* Right: live status */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/30 text-xs hidden sm:inline">Live</span>
        </div>
      </div>
    </motion.nav>
  )
}
