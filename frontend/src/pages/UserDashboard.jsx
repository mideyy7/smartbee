import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, Zap, Star, Bus, ArrowRight,
  Leaf, DollarSign, RefreshCw, ChevronDown, Search, RotateCcw,
} from 'lucide-react'
import ManchesterMap from '../components/ManchesterMap'

// ─── Constants ────────────────────────────────────────────────────────────────
const MANCHESTER_STOPS = [
  'Piccadilly', 'Deansgate', 'Chorlton', 'Fallowfield',
  'Salford Quays', 'Manchester Airport', 'Northern Quarter', 'Ancoats',
]

// ─── Offline mock data (used when backend is unreachable) ─────────────────────
const MOCK_ARRIVALS = {
  piccadilly: { stop: 'Piccadilly', arrivals: [
    { route: '43', destination: 'Chorlton', due_minutes: 2, status: 'ontime', delay_minutes: null, platform: '3' },
    { route: '111', destination: 'Manchester Airport', due_minutes: 5, status: 'late', delay_minutes: 8, platform: '1' },
    { route: '53', destination: 'Ancoats Loop', due_minutes: 8, status: 'ontime', delay_minutes: null, platform: '2' },
    { route: '42', destination: 'Fallowfield', due_minutes: 11, status: 'delayed', delay_minutes: 3, platform: '4' },
    { route: '9', destination: 'Northern Quarter', due_minutes: 14, status: 'ontime', delay_minutes: null, platform: '5' },
  ]},
  deansgate: { stop: 'Deansgate', arrivals: [
    { route: '15', destination: 'Salford Quays', due_minutes: 3, status: 'late', delay_minutes: 12, platform: '1' },
    { route: '86', destination: 'Chorlton', due_minutes: 6, status: 'delayed', delay_minutes: 4, platform: '2' },
    { route: '50', destination: 'Salford Exchange', due_minutes: 9, status: 'ontime', delay_minutes: null, platform: '3' },
    { route: '8', destination: 'Northern Quarter', due_minutes: 13, status: 'ontime', delay_minutes: null, platform: '1' },
  ]},
  chorlton: { stop: 'Chorlton', arrivals: [
    { route: '85', destination: 'Piccadilly', due_minutes: 4, status: 'delayed', delay_minutes: 5, platform: '1' },
    { route: '86', destination: 'Deansgate', due_minutes: 7, status: 'ontime', delay_minutes: null, platform: '2' },
    { route: '23', destination: 'Didsbury', due_minutes: 10, status: 'ontime', delay_minutes: null, platform: '1' },
  ]},
  fallowfield: { stop: 'Fallowfield', arrivals: [
    { route: '42', destination: 'Piccadilly', due_minutes: 1, status: 'late', delay_minutes: 15, platform: '2' },
    { route: '142', destination: 'City Centre', due_minutes: 6, status: 'ontime', delay_minutes: null, platform: '1' },
    { route: '43', destination: 'Manchester Airport', due_minutes: 14, status: 'delayed', delay_minutes: 6, platform: '3' },
  ]},
  'salford quays': { stop: 'Salford Quays', arrivals: [
    { route: '50', destination: 'Piccadilly', due_minutes: 3, status: 'delayed', delay_minutes: 3, platform: '1' },
    { route: 'M50', destination: 'MediaCity', due_minutes: 5, status: 'ontime', delay_minutes: null, platform: '2' },
    { route: '100', destination: 'Deansgate', due_minutes: 8, status: 'ontime', delay_minutes: null, platform: '1' },
  ]},
  'manchester airport': { stop: 'Manchester Airport', arrivals: [
    { route: '43', destination: 'Piccadilly', due_minutes: 2, status: 'late', delay_minutes: 20, platform: 'T2' },
    { route: 'A1', destination: 'City Centre Express', due_minutes: 7, status: 'delayed', delay_minutes: 8, platform: 'T1' },
    { route: '199', destination: 'Wythenshawe', due_minutes: 12, status: 'ontime', delay_minutes: null, platform: 'T2' },
  ]},
  'northern quarter': { stop: 'Northern Quarter', arrivals: [
    { route: '8', destination: 'Piccadilly', due_minutes: 0, status: 'ontime', delay_minutes: null, platform: '1' },
    { route: '9', destination: 'Deansgate', due_minutes: 4, status: 'ontime', delay_minutes: null, platform: '2' },
    { route: '216', destination: 'Ancoats', due_minutes: 9, status: 'ontime', delay_minutes: null, platform: '1' },
  ]},
  ancoats: { stop: 'Ancoats', arrivals: [
    { route: '53', destination: 'Piccadilly', due_minutes: 5, status: 'delayed', delay_minutes: 4, platform: '1' },
    { route: '216', destination: 'Northern Quarter', due_minutes: 8, status: 'ontime', delay_minutes: null, platform: '2' },
    { route: '61', destination: 'City Centre', due_minutes: 11, status: 'ontime', delay_minutes: null, platform: '1' },
  ]},
}

function getMockArrivals(stop) {
  const key = stop.toLowerCase()
  return MOCK_ARRIVALS[key] ?? MOCK_ARRIVALS['piccadilly']
}

function getMockRoutes(origin, destination) {
  const mins = Math.floor(Math.random() * 20) + 18
  return {
    origin, destination,
    departure_time: new Date(Date.now() + 120000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    options: [
      { type: 'fastest', duration_minutes: mins, legs: [`Board route 42 at ${origin}`, `Alight at ${destination}`], summary: 'Direct service, minimal stops.', cost_gbp: 2.50, changes: 0, co2_grams: 48 },
      { type: 'cheapest', duration_minutes: mins + 8, legs: [`Board route 86 at ${origin}`, `Change at Piccadilly`, `Board route 43 to ${destination}`], summary: 'Via city centre — lower fare with day saver.', cost_gbp: 1.80, changes: 1, co2_grams: 52 },
      { type: 'orbital', duration_minutes: mins + 14, legs: [`Board Orbital Express at ${origin}`, `Scenic route via Salford Quays`, `Arrive ${destination}`], summary: 'SmartBee orbital — avoids Oxford Rd congestion.', cost_gbp: 2.20, changes: 0, co2_grams: 41 },
    ],
  }
}

const ROUTE_CARD_CONFIG = {
  fastest: { emoji: '⚡', label: 'Fastest', accent: 'border-yellow-400/30 bg-yellow-500/5', badge: 'bg-bee-yellow text-black' },
  cheapest: { emoji: '💸', label: 'Cheapest', accent: 'border-green-400/30 bg-green-500/5', badge: 'bg-green-400 text-black' },
  orbital: { emoji: '🛤️', label: 'Orbital', accent: 'border-blue-400/30 bg-blue-500/5', badge: 'bg-blue-400 text-black' },
}

const STATUS_STYLE = {
  late: { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  ontime: { text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  delayed: { text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useArrivals(stop) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetch_ = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8000/api/arrivals?stop=${stop.toLowerCase()}`)
      const json = await res.json()
      setData(json)
    } catch {
      // Backend offline — fall back to mock data so demo always works
      setData(getMockArrivals(stop))
    } finally {
      setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setLoading(false)
    }
  }

  useEffect(() => { fetch_() }, [stop])
  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(fetch_, 30000)
    return () => clearInterval(id)
  }, [stop])

  return { data, loading, refresh: fetch_, lastUpdated }
}

function useRoutes(origin, destination, trigger) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!trigger || !origin || !destination || origin === destination) return
    const go = async () => {
      setLoading(true)
      setData(null)
      try {
        const res = await fetch(
          `http://localhost:8000/api/routes?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
        )
        const json = await res.json()
        setData(json)
      } catch {
        // Backend offline — fall back to mock routes so demo always works
        setData(getMockRoutes(origin, destination))
      } finally {
        setLoading(false)
      }
    }
    go()
  }, [trigger])

  return { data, loading }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StopSelect({ label, value, onChange, exclude }) {
  return (
    <div className="relative">
      <label className="text-white/35 text-xs uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full glass rounded-xl pl-9 pr-8 py-3 text-white text-sm outline-none appearance-none cursor-pointer border border-white/5 focus:border-bee-yellow/40 focus:border transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {MANCHESTER_STOPS.filter((s) => s !== exclude).map((s) => (
            <option key={s} value={s} style={{ background: '#0A0A14', color: 'white' }}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
      </div>
    </div>
  )
}

function RouteCard({ option, index }) {
  const cfg = ROUTE_CARD_CONFIG[option.type] || ROUTE_CARD_CONFIG.fastest
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className={`glass border ${cfg.accent} rounded-2xl p-5 cursor-pointer`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.emoji}</span>
          <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.label.toUpperCase()}
          </span>
        </div>
        <div className="text-right">
          <div className="text-white font-black text-xl">{option.duration_minutes} min</div>
        </div>
      </div>

      {/* Journey legs */}
      <div className="space-y-1 mb-4">
        {option.legs.map((leg, i) => (
          <div key={i} className="flex items-start gap-2 text-white/55 text-xs">
            <div className="w-1 h-1 rounded-full bg-white/30 mt-1.5 flex-shrink-0" />
            {leg}
          </div>
        ))}
      </div>

      {/* Summary */}
      <p className="text-white/40 text-xs italic mb-4 leading-relaxed">{option.summary}</p>

      {/* Stats row */}
      <div className="flex gap-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-bee-yellow" />
          <span className="text-white text-sm font-bold">£{option.cost_gbp.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white/50 text-xs">{option.changes} change{option.changes !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Leaf className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400/70 text-xs">{option.co2_grams}g CO₂</span>
        </div>
      </div>
    </motion.div>
  )
}

function ArrivalRow({ arr, index }) {
  const s = STATUS_STYLE[arr.status] || STATUS_STYLE.delayed
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-0"
    >
      {/* Route pill */}
      <div className="glass-yellow rounded-lg px-2.5 py-1 text-bee-yellow font-black text-sm min-w-[2.8rem] text-center flex-shrink-0">
        {arr.route}
      </div>

      {/* Destination + stop */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate">{arr.destination}</div>
        <div className="flex items-center gap-1 mt-0.5">
          {arr.platform && (
            <span className="text-white/25 text-xs">Plat {arr.platform}</span>
          )}
        </div>
      </div>

      {/* Due + status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {arr.delay_minutes && (
          <span className="text-red-400 text-xs font-medium">+{arr.delay_minutes}m</span>
        )}
        <div className={`px-2.5 py-1 rounded-full border text-xs font-bold ${s.bg} ${s.text}`}>
          {arr.due_minutes === 0 ? 'Due' : `${arr.due_minutes} min`}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UserDashboard({ onGoToRewards }) {
  const [arrivalStop, setArrivalStop] = useState('Piccadilly')
  const [routeOrigin, setRouteOrigin] = useState('Piccadilly')
  const [routeDest, setRouteDest] = useState('Chorlton')
  const [searchTrigger, setSearchTrigger] = useState(1) // start at 1 → auto-triggers on mount
  const [hasSearched, setHasSearched] = useState(true)  // pre-shown

  const { data: arrivals, loading: arrivalsLoading, refresh, lastUpdated } = useArrivals(arrivalStop)
  const { data: routes, loading: routesLoading } = useRoutes(routeOrigin, routeDest, searchTrigger)

  const handleSearch = () => {
    setHasSearched(true)
    setSearchTrigger((n) => n + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#050508] pt-24 pb-10 px-4 md:px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
            Bee Network 🐝
          </h1>
          <p className="text-white/35 text-sm">Live transport intelligence · Greater Manchester</p>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* LEFT: Route Planner (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Route Planner card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                <Search className="w-4 h-4 text-bee-yellow" />
                Route Planner
              </h2>

              <div className="space-y-3 mb-4">
                <StopSelect label="From" value={routeOrigin} onChange={setRouteOrigin} exclude={routeDest} />
                {/* Swap button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => { setRouteOrigin(routeDest); setRouteDest(routeOrigin) }}
                    className="glass rounded-full p-2 hover:bg-white/8 transition-colors"
                    title="Swap stops"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-white/40 rotate-90" />
                  </button>
                </div>
                <StopSelect label="To" value={routeDest} onChange={setRouteDest} exclude={routeOrigin} />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={routesLoading || routeOrigin === routeDest}
                className="w-full bg-bee-yellow text-black font-black text-sm py-3.5 rounded-xl hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {routesLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Finding routes…
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Find Routes
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Route Results */}
            <AnimatePresence>
              {routesLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="glass rounded-2xl p-5 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-white/5 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </motion.div>
              )}

              {routes && !routesLoading && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between px-1">
                    <p className="text-white/35 text-xs">
                      {routes.origin} → {routes.destination} · {routes.departure_time}
                    </p>
                    <span className="text-bee-yellow text-xs font-semibold">{routes.options.length} options</span>
                  </div>
                  {routes.options.map((opt, i) => (
                    <RouteCard key={opt.type} option={opt} index={i} />
                  ))}
                </motion.div>
              )}

              {!hasSearched && !routesLoading && (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass rounded-2xl p-5 text-center"
                >
                  <div className="text-3xl mb-2">🗺️</div>
                  <p className="text-white/35 text-sm">
                    Choose a start and destination, then tap <strong className="text-white/60">Find Routes</strong> to see Fastest, Cheapest, and Orbital options.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Rewards / Streak card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-yellow rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-bee-yellow" />
                  <span className="text-white font-bold text-base">Your Rewards</span>
                </div>
                <span className="text-2xl font-black text-bee-yellow">🔥 7</span>
              </div>
              <p className="text-white/35 text-xs mb-4">7-day streak · 480 Bee Points</p>

              {/* Progress ring */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <motion.circle
                      cx="32" cy="32" r="26" fill="none" stroke="#FFD100" strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="163"
                      initial={{ strokeDashoffset: 163 }}
                      animate={{ strokeDashoffset: 49 }}
                      transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-bee-yellow font-black text-sm">70%</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/60 text-xs leading-relaxed">
                    30 more points to unlock <span className="text-bee-yellow font-semibold">Free Journey</span> reward
                  </p>
                  <motion.button
                    whileHover={{ x: 2 }}
                    onClick={onGoToRewards}
                    className="flex items-center gap-1 text-bee-yellow text-xs font-semibold mt-2 hover:underline"
                  >
                    View all rewards <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Map + Arrivals (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Live Map */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl overflow-hidden"
              style={{ height: 300 }}
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/60 text-xs font-medium">Live Manchester Network</span>
                </div>
                <div className="flex gap-3 text-xs text-white/25">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Late</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" /> Minor</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> On time</span>
                </div>
              </div>
              <div style={{ height: 'calc(100% - 40px)', isolation: 'isolate' }}>
                <ManchesterMap interactive={true} zoom={12} />
              </div>
            </motion.div>

            {/* Arrivals board */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl overflow-hidden flex-1"
            >
              {/* Arrivals header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-bee-yellow" />
                  <span className="text-white font-bold text-sm">Live Arrivals</span>
                </div>

                {/* Stop selector */}
                <div className="flex items-center gap-3">
                  <select
                    value={arrivalStop}
                    onChange={(e) => setArrivalStop(e.target.value)}
                    className="glass rounded-lg px-3 py-1.5 text-white/70 text-xs outline-none appearance-none cursor-pointer border border-white/5"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    {MANCHESTER_STOPS.map((s) => (
                      <option key={s} value={s} style={{ background: '#0A0A14', color: 'white' }}>{s}</option>
                    ))}
                  </select>

                  <button
                    onClick={refresh}
                    title="Refresh"
                    className="glass rounded-lg p-1.5 hover:bg-white/8 transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 text-white/40 ${arrivalsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Updated timestamp */}
              {lastUpdated && (
                <div className="px-5 py-1.5 bg-white/[0.01] border-b border-white/[0.03]">
                  <span className="text-white/20 text-xs flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Updated {lastUpdated}
                  </span>
                </div>
              )}

              {/* Rows */}
              {arrivalsLoading ? (
                <div className="p-5 space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-7 w-10 bg-white/5 rounded-lg" />
                      <div className="flex-1 h-7 bg-white/5 rounded-lg" />
                      <div className="h-7 w-14 bg-white/5 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : arrivals ? (
                <AnimatePresence>
                  {arrivals.arrivals.map((arr, i) => (
                    <ArrivalRow key={`${arr.route}-${i}`} arr={arr} index={i} />
                  ))}
                </AnimatePresence>
              ) : null}

              <div className="px-5 py-2.5 border-t border-white/[0.03]">
                <p className="text-white/20 text-xs">Auto-refreshes every 30s · SmartBee live data</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
