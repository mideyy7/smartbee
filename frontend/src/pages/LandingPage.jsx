import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ArrowRight, User, Building2,
  RotateCcw, GraduationCap, Leaf, DollarSign,
  Clock, Brain, ShieldCheck,
} from 'lucide-react'
import ManchesterMap from '../components/ManchesterMap'

// ─── Shared variants ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
}

// ─── Counter hook ──────────────────────────────────────────────────────────────
function useCountUp(end, isInView, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isInView) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    const raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [end, isInView, duration])
  return count
}

// ─── SECTION 1: HOOK ──────────────────────────────────────────────────────────
const DELAY_BADGES = [
  { name: 'Piccadilly', delay: '+8 min', color: '#ef4444' },
  { name: 'Fallowfield', delay: '+15 min', color: '#ef4444' },
  { name: 'Chorlton', delay: '+5 min', color: '#f97316' },
  { name: 'Airport', delay: '+20 min', color: '#ef4444' },
]

function HookSection({ onStart }) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Live map background — isolation: isolate prevents Leaflet panes (z200-700)
          from escaping this container and bleeding above the gradient overlay */}
      <div className="absolute inset-0 z-0" style={{ isolation: 'isolate' }}>
        <ManchesterMap interactive={false} zoom={12} />
      </div>

      {/* Dark gradient overlay — heavier at edges, lighter at centre so map breathes */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(5,5,8,0.55) 0%, rgba(5,5,8,0.82) 60%, rgba(5,5,8,0.96) 100%)',
        }}
      />

      {/* Branding — top left */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2"
      >
        <span className="text-xl">🐝</span>
        <span className="text-white/50 text-xs font-semibold tracking-[0.25em] uppercase">SmartBee</span>
      </motion.div>

      {/* LIVE badge — top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute top-6 right-6 z-20 flex items-center gap-2 glass rounded-full px-3 py-1.5"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white/60 text-xs font-medium">LIVE · Manchester</span>
      </motion.div>

      {/* Hero content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-bee-yellow text-xs font-semibold tracking-[0.35em] uppercase mb-6"
        >
          Manchester Transport Intelligence
        </motion.p>

        {/* Two-line headline — each line animates separately */}
        <div className="mb-8 space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight"
          >
            Manchester doesn't have a{' '}
            <span className="text-gradient-yellow">transport</span> problem.
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight"
          >
            It has a{' '}
            <span className="relative inline-block">
              <span className="text-gradient-yellow">reliability</span>
              <motion.span
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-bee-yellow rounded"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
              />
            </span>{' '}problem.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-lg md:text-xl text-white/50 mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Manchester is moving. It’s time it moved on time
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(255,209,0,0.55)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="bg-bee-yellow text-black font-black text-base px-10 py-4 rounded-2xl transition-colors hover:bg-yellow-300"
        >
          ▶ Start the journey
        </motion.button>
      </div>

      {/* 4 delay badges — spaced, not clustered */}
      <div className="absolute bottom-16 left-0 right-0 z-20 flex justify-center gap-3 px-4">
        {DELAY_BADGES.map((stop, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 0.1 }}
            className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: stop.color }} />
            <span className="text-white/55 text-xs hidden sm:inline">{stop.name}</span>
            <span className="text-xs font-semibold" style={{ color: stop.color }}>{stop.delay}</span>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-5 h-5 text-white/20" />
      </motion.div>
    </section>
  )
}

// ─── SECTION 2: WHY IT MATTERS ────────────────────────────────────────────────
const personas = [
  {
    emoji: '👩‍🎓',
    role: 'Student',
    name: 'Aaliya, 19',
    story: 'Misses 9am lectures because the 42 bus from Fallowfield runs 15 min late — every day.',
    impact: '3 lectures missed this month',
    border: 'border-purple-500/20',
    gradient: 'from-purple-500/8',
  },
  {
    emoji: '🧑‍⚕️',
    role: 'NHS Worker',
    name: 'Marcus, 34',
    story: 'Takes 3 buses to reach Wythenshawe Hospital — a 20-minute journey takes 55.',
    impact: '£180/month extra on taxis',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500/8',
  },
  {
    emoji: '🌆',
    role: 'Resident',
    name: 'Salford Quays',
    story: 'MediaCity hub with thousands of workers — no direct bus to Chorlton or Didsbury.',
    impact: 'Forced through city centre daily',
    border: 'border-orange-500/20',
    gradient: 'from-orange-500/8',
  },
]

function WhyItMattersSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center py-20 px-6 bg-[#050508]">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-bee-yellow text-xs font-semibold tracking-[0.35em] uppercase mb-3">
            The Human Cost
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Real people. Real impact.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/45 text-lg max-w-md mx-auto">
            Poor transport isn't just an inconvenience. It shapes life outcomes.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-5 mb-14"
        >
          {personas.map((p, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.1 } } }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className={`glass border ${p.border} rounded-2xl p-6 bg-gradient-to-b ${p.gradient} to-transparent`}
            >
              <div className="text-4xl mb-4">{p.emoji}</div>
              <div className="text-xs text-white/35 uppercase tracking-wider mb-1">{p.role}</div>
              <div className="text-base font-bold text-white mb-3">{p.name}</div>
              <p className="text-white/55 text-sm leading-relaxed mb-4">{p.story}</p>
              <div className="glass-yellow rounded-lg px-3 py-1.5 text-xs font-semibold text-bee-yellow">
                {p.impact}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center text-2xl sm:text-4xl md:text-5xl font-black text-white"
        >
          Transport access{' '}
          <span className="text-gradient-yellow">=</span>
          {' '}access to opportunity.
        </motion.p>
      </div>
    </section>
  )
}

// ─── SECTION 3: THE VISION ─────────────────────────────────────────────────────
const transformations = [
  { from: 'Unreliable', to: 'Predictable', label: 'Arrivals' },
  { from: 'City-centre forced', to: 'Orbital routes', label: 'Routing' },
  { from: 'No insight', to: 'Real-time data', label: 'Operations' },
  { from: 'Expensive', to: 'Accessible', label: 'Cost & access' },
]

function VisionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center py-20 px-6"
      style={{ background: 'linear-gradient(180deg, #050508 0%, #080510 50%, #050508 100%)' }}
    >
      <div className="max-w-4xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, type: 'spring', bounce: 0.35 }}
          className="text-7xl mb-8 inline-block animate-float"
        >
          🐝
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.65 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6"
        >
          Public transport should be the{' '}
          <span className="text-gradient-yellow">first choice</span>{' '}—{' '}
          <span className="text-white/35">not the last resort.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.45 }}
          className="text-white/40 text-lg mb-14 max-w-lg mx-auto"
        >
          The Bee Network has the ambition. SmartBee provides the intelligence.
        </motion.p>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {transformations.map((t, i) => (
            <motion.div key={i} variants={fadeUp} className="glass rounded-xl p-4">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-3">{t.label}</div>
              <div className="space-y-1.5">
                <div className="text-red-400/70 text-sm line-through">{t.from}</div>
                <ArrowRight className="w-3.5 h-3.5 text-bee-yellow mx-auto" />
                <div className="text-bee-yellow text-sm font-semibold">{t.to}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── SECTION 4: THE SOLUTION ──────────────────────────────────────────────────
const features = [
  { icon: Brain, title: 'AI Arrival Predictions', desc: 'ML models trained on Manchester bus patterns predict delays before they happen.', color: 'text-purple-400', bg: 'from-purple-500/8' },
  { icon: RotateCcw, title: 'Orbital Routing', desc: 'Routes connecting suburbs directly, bypassing the city centre.', color: 'text-blue-400', bg: 'from-blue-500/8' },
  { icon: GraduationCap, title: 'Youth Access', desc: 'Gamified rewards and student discounts to make Bee Network the first choice.', color: 'text-green-400', bg: 'from-green-500/8' },
  { icon: ShieldCheck, title: 'Gov Intelligence', desc: 'Real-time dashboard giving TfGM operators live heatmaps and simulations.', color: 'text-bee-yellow', bg: 'from-yellow-500/8' },
]

function SolutionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center py-20 px-6 bg-[#050508]">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="text-white/25 text-sm mb-3 tracking-[0.3em] uppercase"
          >
            Introducing
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.7, type: 'spring', bounce: 0.35 }}
          >
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-none text-gradient-yellow">
              🐝 SmartBee
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="text-white/40 text-lg max-w-md mx-auto mt-4"
          >
            The intelligence layer Manchester's transport network has been waiting for.
          </motion.p>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } } }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`glass border border-white/5 rounded-2xl p-5 bg-gradient-to-b ${f.bg} to-transparent`}
              >
                <Icon className={`w-7 h-7 ${f.color} mb-3`} />
                <h3 className="text-white font-bold text-base mb-2 leading-snug">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── SECTION 5: LIVE METRICS ──────────────────────────────────────────────────
const metrics = [
  { icon: Clock, value: 30, suffix: '%', label: 'Less waiting time', sub: 'Avg delay reduction', color: 'text-bee-yellow', glow: 'rgba(255,209,0,0.25)' },
  { icon: Leaf, value: 47, suffix: '%', label: 'CO₂ reduction', sub: 'vs private car', color: 'text-green-400', glow: 'rgba(34,197,94,0.25)' },
  { icon: GraduationCap, value: 12, suffix: '', label: 'New orbital routes', sub: 'Suburb-to-suburb', color: 'text-blue-400', glow: 'rgba(96,165,250,0.25)' },
  { icon: DollarSign, value: 28, suffix: '%', label: 'Cheaper journeys', sub: 'With SmartBee rewards', color: 'text-purple-400', glow: 'rgba(196,148,255,0.25)' },
]

function MetricCard({ metric, isInView }) {
  const count = useCountUp(metric.value, isInView)
  const Icon = metric.icon
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass border border-white/5 rounded-2xl p-7 text-center"
      style={{ boxShadow: isInView ? `0 0 25px ${metric.glow}` : 'none', transition: 'box-shadow 1.2s ease' }}
    >
      <Icon className={`w-6 h-6 ${metric.color} mx-auto mb-4`} />
      <div className={`text-5xl font-black ${metric.color} mb-2`}>{count}{metric.suffix}</div>
      <div className="text-white font-semibold text-base mb-1">{metric.label}</div>
      <div className="text-white/35 text-xs">{metric.sub}</div>
    </motion.div>
  )
}

function MetricsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      className="min-h-screen flex flex-col items-center justify-center py-20 px-6"
      style={{ background: 'linear-gradient(180deg, #050508 0%, #060510 50%, #050508 100%)' }}
    >
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="text-bee-yellow text-xs font-semibold tracking-[0.35em] uppercase mb-3">
            Projected Impact
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Numbers that matter.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/35 text-base">
            Based on Bee Network ridership data and TfGM modelling.*
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, duration: 0.45 }}
            >
              <MetricCard metric={m} isInView={isInView} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SECTION 6: TOGGLE DEMO ───────────────────────────────────────────────────
const USER_FEATURES = [
  '🗺️ Live arrivals — Piccadilly, Fallowfield, Chorlton',
  '⚡ Route planner: Fastest · Cheapest · Orbital',
  '🏆 Streak rewards & gamification badges',
  '📱 Real-time delay push alerts',
]
const GOV_FEATURES = [
  '🔥 Live demand heatmap overlay',
  '🚧 Road closure impact simulator',
  '📊 Route performance analytics',
  '🤖 AI capacity predictions',
]

function ToggleDemoSection({ onEnterDashboard }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const [activeMode, setActiveMode] = useState('user')

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center py-20 px-6 bg-[#050508]">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-10"
        >
          <motion.p variants={fadeUp} className="text-bee-yellow text-xs font-semibold tracking-[0.35em] uppercase mb-3">
            Live Demo
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            One platform. Two views.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 text-base max-w-sm mx-auto">
            Switch between the citizen experience and the government intelligence layer.
          </motion.p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-strong rounded-2xl p-1.5 flex gap-1.5">
            {[
              { key: 'user', icon: User, label: 'User View' },
              { key: 'gov', icon: Building2, label: 'Government View' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveMode(key)}
                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeMode === key
                    ? 'bg-bee-yellow text-black shadow-[0_0_25px_rgba(255,209,0,0.45)]'
                    : 'text-white/40 hover:text-white/65'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Preview panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMode}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            className={`glass border rounded-2xl p-7 mb-8 ${
              activeMode === 'gov' ? 'border-purple-500/15' : 'border-bee-yellow/15'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className={`w-2.5 h-2.5 rounded-full ${activeMode === 'user' ? 'bg-bee-yellow' : 'bg-purple-400'} animate-pulse`} />
              <span className="text-white font-bold text-base">
                {activeMode === 'user' ? '👤 Citizen Dashboard' : '🏛️ Government Operations Centre'}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {(activeMode === 'user' ? USER_FEATURES : GOV_FEATURES).map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass rounded-xl px-4 py-3 text-sm text-white/65 leading-relaxed"
                >
                  {f}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(255,209,0,0.55)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onEnterDashboard(activeMode)}
            className="bg-bee-yellow text-black font-black text-lg px-12 py-5 rounded-2xl hover:bg-yellow-300 transition-colors inline-flex items-center gap-3"
          >
            Enter {activeMode === 'user' ? 'User' : 'Government'} Dashboard
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-white/20 text-xs mt-4">Interactive demo · No login required</p>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Landing Page Root ─────────────────────────────────────────────────────────
export default function LandingPage({ onEnterDashboard }) {
  const refs = useRef([])
  const scroll = (i) => refs.current[i]?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="bg-[#050508]">
      {[HookSection, WhyItMattersSection, VisionSection, SolutionSection, MetricsSection, ToggleDemoSection].map(
        (Section, i) => (
          <div key={i} ref={(el) => (refs.current[i] = el)}>
            {i === 0 ? (
              <Section onStart={() => scroll(1)} />
            ) : i === 5 ? (
              <Section onEnterDashboard={onEnterDashboard} />
            ) : (
              <Section />
            )}
          </div>
        )
      )}
    </div>
  )
}
