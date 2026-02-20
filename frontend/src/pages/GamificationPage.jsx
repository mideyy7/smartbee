import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Star, Zap, Flame, Leaf, Lock, CheckCircle2,
  Trophy, Calendar, ArrowRight, Gift, ChevronRight,
} from 'lucide-react'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const USER_STATS = {
  points: 480,
  level: 'Bronze Bee',
  nextLevel: 'Silver Bee',
  pointsToNextLevel: 1000,
  streak: 7,
  bestStreak: 12,
  journeysThisMonth: 34,
  co2SavedKg: 8.2,
}

const NEXT_REWARD = { title: 'Free Journey', points: 500, icon: '🎟️' }

const WEEKLY_ACTIVITY = [
  { day: 'M', used: true, journeys: 2 },
  { day: 'T', used: true, journeys: 3 },
  { day: 'W', used: true, journeys: 1 },
  { day: 'T', used: true, journeys: 2 },
  { day: 'F', used: true, journeys: 3 },
  { day: 'S', used: true, journeys: 1 },
  { day: 'S', used: true, journeys: 2 },
]

const REWARDS = [
  { id: 1, icon: '☕', title: 'Free Coffee', partner: 'Caffè Nero', points: 200, status: 'unlocked', claimed: true },
  { id: 2, icon: '🏷️', title: '20% Off Journey', partner: 'Bee Network', points: 300, status: 'unlocked', claimed: false },
  { id: 3, icon: '🎟️', title: 'Free Journey', partner: 'Bee Network', points: 500, status: 'almost', claimed: false },
  { id: 4, icon: '🎬', title: 'Cinema Ticket', partner: 'Odeon Printworks', points: 750, status: 'locked', claimed: false },
  { id: 5, icon: '🚀', title: 'Priority Boarding', partner: 'Bee Network', points: 1000, status: 'locked', claimed: false },
  { id: 6, icon: '🎵', title: 'Spotify Premium', partner: 'Spotify', points: 1500, status: 'locked', claimed: false },
]

const BADGES = [
  { icon: '🌅', title: 'Early Bird', desc: 'Caught 5 buses before 8am', earned: true, date: '14 Feb' },
  { icon: '🔥', title: 'On Fire', desc: '7-day streak achieved', earned: true, date: 'Today' },
  { icon: '🌍', title: 'Eco Warrior', desc: '50 bus journeys completed', earned: true, date: '10 Feb' },
  { icon: '⚡', title: 'Speed Runner', desc: 'Use fastest route 10 times', earned: false, date: null },
  { icon: '🛤️', title: 'Orbital Pioneer', desc: 'Try a SmartBee orbital route', earned: false, date: null },
  { icon: '🐝', title: 'Bee Champion', desc: 'Reach Gold Bee level', earned: false, date: null },
]

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(end, isInView, duration = 1600) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isInView) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, isInView, duration])
  return count
}

// ─── SVG Progress Ring ────────────────────────────────────────────────────────
const RING_R = 72
const RING_C = 2 * Math.PI * RING_R // ≈ 452.4

function ProgressRing({ value, max, isInView }) {
  const pct = Math.min(value / max, 1)
  const displayCount = useCountUp(value, isInView)
  const offset = RING_C * (1 - pct)

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer glow layer */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: isInView ? '0 0 50px rgba(255,209,0,0.2)' : 'none', transition: 'box-shadow 1.5s ease' }}
      />
      <svg width="200" height="200" className="-rotate-90">
        {/* Track */}
        <circle cx="100" cy="100" r={RING_R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {/* Fill */}
        <motion.circle
          cx="100" cy="100" r={RING_R}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          initial={{ strokeDashoffset: RING_C }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD100" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-gradient-yellow tabular-nums">{displayCount}</span>
        <span className="text-white/40 text-xs mt-0.5">/ {max} pts</span>
        <span className="text-bee-yellow text-xs font-semibold mt-1">{NEXT_REWARD.icon} {NEXT_REWARD.title}</span>
      </div>
    </div>
  )
}

// ─── Stat chips ───────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, value, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="glass rounded-2xl px-5 py-4 flex items-center gap-3"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="text-white font-black text-xl leading-none">{value}</div>
        <div className="text-white/35 text-xs mt-0.5">{label}</div>
      </div>
    </motion.div>
  )
}

// ─── Reward card ──────────────────────────────────────────────────────────────
const REWARD_STYLES = {
  unlocked: { border: 'border-green-500/25', glow: '0 0 20px rgba(34,197,94,0.15)', badge: 'bg-green-500/15 text-green-400 border border-green-500/20' },
  almost:   { border: 'border-bee-yellow/30', glow: '0 0 25px rgba(255,209,0,0.2)', badge: 'bg-bee-yellow/10 text-bee-yellow border border-bee-yellow/25' },
  locked:   { border: 'border-white/5', glow: 'none', badge: 'bg-white/5 text-white/30 border border-white/10' },
}

function RewardCard({ reward, index }) {
  const [claimed, setClaimed] = useState(reward.claimed)
  const s = REWARD_STYLES[reward.status]
  const pct = Math.min((USER_STATS.points / reward.points) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.45 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass border ${s.border} rounded-2xl p-5 relative overflow-hidden`}
      style={{ boxShadow: s.glow }}
    >
      {/* Locked overlay */}
      {reward.status === 'locked' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl">
          <div className="glass rounded-full p-2">
            <Lock className="w-4 h-4 text-white/20" />
          </div>
        </div>
      )}

      <div className={reward.status === 'locked' ? 'opacity-35' : ''}>
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl">{reward.icon}</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${s.badge}`}>
            {reward.points} pts
          </span>
        </div>
        <div className="text-white font-bold text-base mb-0.5">{reward.title}</div>
        <div className="text-white/35 text-xs mb-3">{reward.partner}</div>

        {/* Progress bar for "almost" */}
        {reward.status === 'almost' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/40">{USER_STATS.points} pts</span>
              <span className="text-bee-yellow font-semibold">{reward.points - USER_STATS.points} to go</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-bee-yellow to-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        {reward.status === 'unlocked' && !claimed && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setClaimed(true)}
            className="w-full bg-green-500 text-white font-bold text-xs py-2 rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <Gift className="w-3.5 h-3.5" />
            Claim Reward
          </motion.button>
        )}
        {reward.status === 'unlocked' && claimed && (
          <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Claimed
          </div>
        )}
        {reward.status === 'almost' && (
          <div className="text-bee-yellow text-xs font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Almost there!
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Badge card ───────────────────────────────────────────────────────────────
function BadgeCard({ badge, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index, duration: 0.4, type: 'spring', bounce: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass border rounded-2xl p-4 text-center relative ${
        badge.earned ? 'border-bee-yellow/20' : 'border-white/5'
      }`}
      style={{ boxShadow: badge.earned ? '0 0 16px rgba(255,209,0,0.12)' : 'none' }}
    >
      {!badge.earned && (
        <div className="absolute top-2 right-2">
          <Lock className="w-3 h-3 text-white/15" />
        </div>
      )}
      <div className={`text-4xl mb-2.5 ${badge.earned ? '' : 'opacity-30 grayscale'}`}>
        {badge.icon}
      </div>
      <div className={`font-bold text-sm mb-1 ${badge.earned ? 'text-white' : 'text-white/25'}`}>
        {badge.title}
      </div>
      <div className={`text-xs leading-relaxed ${badge.earned ? 'text-white/45' : 'text-white/20'}`}>
        {badge.desc}
      </div>
      {badge.earned && badge.date && (
        <div className="mt-2.5 text-bee-yellow/60 text-xs font-medium">{badge.date}</div>
      )}
    </motion.div>
  )
}

// ─── Weekly calendar strip ────────────────────────────────────────────────────
function WeekCalendar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="flex gap-2">
      {WEEKLY_ACTIVITY.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
          transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-1.5 flex-1"
        >
          <div
            className={`w-full rounded-lg ${d.used ? 'bg-bee-yellow' : 'bg-white/5'}`}
            style={{ height: `${Math.max(12, d.journeys * 10)}px` }}
          />
          <span className="text-white/30 text-xs">{d.day}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Level progress bar ───────────────────────────────────────────────────────
function LevelBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const pct = (USER_STATS.points / USER_STATS.pointsToNextLevel) * 100

  return (
    <div ref={ref}>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-white/50 font-semibold">{USER_STATS.level}</span>
        <span className="text-bee-yellow font-semibold">{USER_STATS.nextLevel}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #FFD100, #FF8C00)' }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : {}}
          transition={{ delay: 0.4, duration: 1.2, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1.5">
        <span className="text-white/25">{USER_STATS.points} pts</span>
        <span className="text-white/25">{USER_STATS.pointsToNextLevel} pts</span>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GamificationPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#050508] pt-24 pb-12 px-4 md:px-6"
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-bee-yellow" />
            <span className="text-bee-yellow text-xs font-semibold tracking-[0.3em] uppercase">Bee Rewards</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Your Progress</h1>
          <p className="text-white/35 text-sm mt-0.5">Keep riding, keep earning. Manchester's best commuter loyalty programme.</p>
        </motion.div>

        {/* ── Top stat chips ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatChip icon={Star} value="480" label="Bee Points" color="bg-bee-yellow/10 text-bee-yellow" delay={0.05} />
          <StatChip icon={Flame} value="🔥 7" label="Day streak" color="bg-orange-500/10 text-orange-400" delay={0.1} />
          <StatChip icon={Calendar} value="34" label="Journeys this month" color="bg-blue-500/10 text-blue-400" delay={0.15} />
          <StatChip icon={Leaf} value="8.2 kg" label="CO₂ saved" color="bg-green-500/10 text-green-400" delay={0.2} />
        </div>

        {/* ── Hero section: ring + streak + level ── */}
        <div ref={heroRef} className="grid md:grid-cols-3 gap-5 mb-8">

          {/* Big progress ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="glass border border-bee-yellow/15 rounded-2xl p-6 flex flex-col items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(255,209,0,0.08)' }}
          >
            <p className="text-white/35 text-xs uppercase tracking-wider mb-5">Next reward</p>
            <ProgressRing value={USER_STATS.points} max={NEXT_REWARD.points} isInView={heroInView} />
            <p className="text-white/30 text-xs mt-5 text-center">
              Earn <span className="text-bee-yellow font-semibold">20 more points</span> to unlock your free journey
            </p>
          </motion.div>

          {/* Streak card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="glass border border-orange-500/15 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/35 text-xs uppercase tracking-wider mb-1">Current streak</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{USER_STATS.streak}</span>
                  <span className="text-3xl">🔥</span>
                </div>
                <p className="text-white/35 text-xs mt-1">days in a row</p>
              </div>
              <div className="text-right">
                <p className="text-white/25 text-xs">Best streak</p>
                <p className="text-orange-400 font-black text-2xl">{USER_STATS.bestStreak}</p>
              </div>
            </div>

            {/* Weekly activity bars */}
            <div className="mb-4">
              <p className="text-white/25 text-xs mb-2 uppercase tracking-wider">This week</p>
              <WeekCalendar />
            </div>

            {/* Streak freeze */}
            <div className="glass-yellow rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-lg">🧊</span>
              <div>
                <div className="text-bee-yellow text-xs font-bold">Streak Freeze active</div>
                <div className="text-white/35 text-xs">Protects your streak for 1 missed day</div>
              </div>
            </div>
          </motion.div>

          {/* Level card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass border border-purple-500/15 rounded-2xl p-6 flex flex-col"
          >
            <p className="text-white/35 text-xs uppercase tracking-wider mb-4">Your level</p>

            {/* Level badge */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-bee-yellow/20 flex items-center justify-center text-3xl">
                🐝
              </div>
              <div>
                <div className="text-white font-black text-xl">{USER_STATS.level}</div>
                <div className="text-white/35 text-xs mt-0.5">Commuter · Level 3</div>
              </div>
            </div>

            <LevelBar />

            <div className="mt-4 space-y-2">
              {[
                { perk: '🎟️ Early access to new routes', unlocked: true },
                { perk: '☕ Partner discount unlocked', unlocked: true },
                { perk: '⚡ Priority dispute resolution', unlocked: false },
              ].map((p, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs ${p.unlocked ? 'text-white/55' : 'text-white/20'}`}>
                  {p.unlocked
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    : <Lock className="w-3.5 h-3.5 flex-shrink-0" />}
                  {p.perk}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-4">
              <p className="text-white/25 text-xs">
                Reach <span className="text-purple-400 font-semibold">Silver Bee</span> for exclusive perks
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Rewards panel ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-black text-xl flex items-center gap-2">
              <Gift className="w-5 h-5 text-bee-yellow" />
              Available Rewards
            </h2>
            <span className="text-white/25 text-xs">2 unlocked · 1 almost ready · 3 locked</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REWARDS.map((r, i) => (
              <RewardCard key={r.id} reward={r} index={i} />
            ))}
          </div>
        </section>

        {/* ── Achievement badges ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-black text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-bee-yellow" />
              Achievement Badges
            </h2>
            <span className="text-white/25 text-xs">3 earned · 3 to unlock</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BADGES.map((b, i) => (
              <BadgeCard key={i} badge={b} index={i} />
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  )
}
