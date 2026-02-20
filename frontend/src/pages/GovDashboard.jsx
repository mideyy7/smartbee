import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayerGroup } from 'react-leaflet'
import {
  AlertTriangle, TrendingUp, Users, Bus, Activity,
  X, Layers, Clock, AlertCircle, CheckCircle2,
  Zap, Shield, Brain, Map as MapIcon, ChevronRight, Construction,
} from 'lucide-react'
import RoadClosureSimulator from './RoadClosureSimulator'

// ─── Manchester data ──────────────────────────────────────────────────────────
const MANCHESTER_CENTER = [53.4808, -2.2426]

const BUS_STOPS = [
  { pos: [53.4779, -2.2323], name: 'Piccadilly', delay: '+8 min', status: 'late', route: '43, 111' },
  { pos: [53.4786, -2.2491], name: 'Deansgate', delay: '+12 min', status: 'late', route: '15, 86' },
  { pos: [53.4450, -2.2753], name: 'Chorlton', delay: '+5 min', status: 'delayed', route: '85, 86' },
  { pos: [53.4424, -2.2175], name: 'Fallowfield', delay: '+15 min', status: 'late', route: '42, 142' },
  { pos: [53.4715, -2.2992], name: 'Salford Quays', delay: '+3 min', status: 'delayed', route: '50, M50' },
  { pos: [53.3658, -2.2723], name: 'Airport', delay: '+20 min', status: 'late', route: '43' },
  { pos: [53.4840, -2.2338], name: 'Northern Quarter', delay: 'On time', status: 'ontime', route: '8, 9' },
  { pos: [53.4815, -2.2221], name: 'Ancoats', delay: '+4 min', status: 'delayed', route: '53, 216' },
]

const STOP_COLORS = { late: '#ef4444', delayed: '#f97316', ontime: '#22c55e' }

// ─── Heatmap layers config ────────────────────────────────────────────────────
const LAYERS = [
  {
    id: 'demand',
    label: 'Passenger Demand',
    icon: Users,
    desc: 'Tap-on/tap-off density',
    colors: { low: '#60a5fa', high: '#7c3aed' },
    accent: 'text-blue-400',
    activeBg: 'bg-blue-500/15 border-blue-500/25',
  },
  {
    id: 'delay',
    label: 'Delay Severity',
    icon: Clock,
    desc: 'Real-time delay variance',
    colors: { low: '#fbbf24', high: '#dc2626' },
    accent: 'text-red-400',
    activeBg: 'bg-red-500/15 border-red-500/25',
  },
  {
    id: 'crowding',
    label: 'Vehicle Crowding',
    icon: Bus,
    desc: 'APC load factor data',
    colors: { low: '#34d399', high: '#f97316' },
    accent: 'text-orange-400',
    activeBg: 'bg-orange-500/15 border-orange-500/25',
  },
]

// ─── Mock heatmap points ──────────────────────────────────────────────────────
// PRODUCTION: Replace with GET /api/heatmap?metric={layer} response
const MOCK_HEATMAP = {
  demand: [
    { lat: 53.4779, lng: -2.2323, intensity: 0.95 }, // Piccadilly
    { lat: 53.4710, lng: -2.2370, intensity: 0.88 }, // Oxford Rd
    { lat: 53.4424, lng: -2.2175, intensity: 0.91 }, // Fallowfield
    { lat: 53.4786, lng: -2.2491, intensity: 0.72 }, // Deansgate
    { lat: 53.4840, lng: -2.2338, intensity: 0.65 }, // Northern Quarter
    { lat: 53.4715, lng: -2.2992, intensity: 0.58 }, // Salford Quays
    { lat: 53.4815, lng: -2.2221, intensity: 0.60 }, // Ancoats
    { lat: 53.4450, lng: -2.2753, intensity: 0.55 }, // Chorlton
    { lat: 53.4640, lng: -2.2310, intensity: 0.75 }, // Corridor
    { lat: 53.3658, lng: -2.2723, intensity: 0.35 }, // Airport
  ],
  delay: [
    { lat: 53.4779, lng: -2.2323, intensity: 0.80 }, // Piccadilly
    { lat: 53.4710, lng: -2.2370, intensity: 0.95 }, // Oxford Rd — worst
    { lat: 53.4424, lng: -2.2175, intensity: 0.85 }, // Fallowfield
    { lat: 53.3658, lng: -2.2723, intensity: 0.75 }, // Airport
    { lat: 53.4786, lng: -2.2491, intensity: 0.55 }, // Deansgate
    { lat: 53.4815, lng: -2.2221, intensity: 0.40 }, // Ancoats
    { lat: 53.4715, lng: -2.2992, intensity: 0.25 }, // Salford Quays — ok
    { lat: 53.4840, lng: -2.2338, intensity: 0.45 }, // Northern Quarter
  ],
  crowding: [
    { lat: 53.4424, lng: -2.2175, intensity: 0.97 }, // Fallowfield peak
    { lat: 53.4710, lng: -2.2370, intensity: 0.90 }, // Oxford Rd
    { lat: 53.4779, lng: -2.2323, intensity: 0.75 }, // Piccadilly
    { lat: 53.4840, lng: -2.2338, intensity: 0.60 }, // Northern Quarter
    { lat: 53.4786, lng: -2.2491, intensity: 0.50 }, // Deansgate
    { lat: 53.4715, lng: -2.2992, intensity: 0.35 }, // Salford Quays
    { lat: 53.3658, lng: -2.2723, intensity: 0.45 }, // Airport
  ],
}

function intensityColor(layerId, intensity) {
  // Simple 3-stop color mapping per layer
  const maps = {
    demand: intensity > 0.7 ? '#7c3aed' : intensity > 0.4 ? '#6366f1' : '#60a5fa',
    delay:  intensity > 0.7 ? '#dc2626' : intensity > 0.4 ? '#f97316' : '#fbbf24',
    crowding: intensity > 0.7 ? '#f97316' : intensity > 0.4 ? '#fb923c' : '#34d399',
  }
  return maps[layerId] || '#6366f1'
}

// ─── Floating insight cards ───────────────────────────────────────────────────
const INSIGHTS = [
  {
    id: 1,
    priority: 'critical',
    emoji: '🔴',
    title: 'Oxford Road — Critical delay',
    body: 'Routes 42, 111, X57 averaging +12 min. 14,200 passengers affected.',
    action: 'Deploy diversion via Wilmslow Road',
    color: 'border-red-500/30 bg-red-500/8',
    dot: 'bg-red-500',
  },
  {
    id: 2,
    priority: 'high',
    emoji: '🟠',
    title: 'Fallowfield — Overcapacity 9am',
    body: '340% above normal demand inbound. Buses full at pickup point.',
    action: 'Pre-position 3 extra vehicles',
    color: 'border-orange-500/30 bg-orange-500/8',
    dot: 'bg-orange-400',
  },
  {
    id: 3,
    priority: 'ai',
    emoji: '🤖',
    title: 'AI Forecast — 4pm rain surge',
    body: '+15% ridership predicted on Oxford Road & Wilmslow corridors.',
    action: 'Accept AI recommendation',
    color: 'border-purple-500/25 bg-purple-500/6',
    dot: 'bg-purple-400',
  },
]

// ─── Route performance ────────────────────────────────────────────────────────
const ROUTE_PERFORMANCE = [
  { route: '42', corridor: 'Piccadilly → Didsbury', ontime: 55, color: '#ef4444' },
  { route: '111', corridor: 'Piccadilly → Airport', ontime: 45, color: '#ef4444' },
  { route: '43', corridor: 'Piccadilly → Chorlton', ontime: 72, color: '#f97316' },
  { route: '86', corridor: 'Chorlton → Deansgate', ontime: 88, color: '#22c55e' },
  { route: '85', corridor: 'Chorlton → Fallowfield', ontime: 91, color: '#22c55e' },
  { route: '50', corridor: 'Salford → City', ontime: 79, color: '#eab308' },
]

// ─── Active alerts ────────────────────────────────────────────────────────────
const ALERTS = [
  { id: 1, level: 'critical', icon: AlertTriangle, text: 'Bus 111 — 25 min late departing Airport', time: '8:42am', color: 'text-red-400 bg-red-500/8 border-red-500/20' },
  { id: 2, level: 'high', icon: AlertCircle, text: 'Oxford Road signal failure reported by driver', time: '8:38am', color: 'text-orange-400 bg-orange-500/8 border-orange-500/20' },
  { id: 3, level: 'info', icon: Brain, text: 'AI model updated — delay predictions improved 4%', time: '8:15am', color: 'text-purple-400 bg-purple-500/8 border-purple-500/20' },
  { id: 4, level: 'ok', icon: CheckCircle2, text: 'Bus 86 back on schedule after earlier delay', time: '8:10am', color: 'text-green-400 bg-green-500/8 border-green-500/20' },
]

// ─── KPI data ─────────────────────────────────────────────────────────────────
const KPI = [
  { icon: AlertTriangle, label: 'Critical delays', value: '3', sub: 'routes affected', color: 'text-red-400', bg: 'from-red-500/8' },
  { icon: Users, label: 'Demand surge', value: 'Fallowfield', sub: '340% above avg · 9am', color: 'text-orange-400', bg: 'from-orange-500/8' },
  { icon: TrendingUp, label: 'Network on-time', value: '62%', sub: '↓ 8% vs yesterday', color: 'text-bee-yellow', bg: 'from-yellow-500/8' },
  { icon: Bus, label: 'Active vehicles', value: '847', sub: '23 off-route · 12 short-working', color: 'text-blue-400', bg: 'from-blue-500/8' },
]

// ─── Map resize hook ──────────────────────────────────────────────────────────
function MapResizer() {
  const map = useMap()
  useEffect(() => { setTimeout(() => map.invalidateSize(), 150) }, [map])
  return null
}

// ─── Gov Heatmap Map ──────────────────────────────────────────────────────────
function GovHeatmapMap({ activeLayer }) {
  const points = MOCK_HEATMAP[activeLayer] || MOCK_HEATMAP.demand

  return (
    <MapContainer
      center={MANCHESTER_CENTER}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      dragging={true}
      scrollWheelZoom={false}
    >
      <MapResizer />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OSM &copy; CARTO'
        maxZoom={19}
      />

      {/* Heatmap blobs — outer glow rings */}
      {points.map((pt, i) => (
        <CircleMarker
          key={`hglow-${activeLayer}-${i}`}
          center={[pt.lat, pt.lng]}
          radius={Math.round(55 * pt.intensity)}
          fillColor={intensityColor(activeLayer, pt.intensity)}
          fillOpacity={0.12 + 0.1 * pt.intensity}
          color="transparent"
          weight={0}
        />
      ))}

      {/* Heatmap blobs — inner core */}
      {points.map((pt, i) => (
        <CircleMarker
          key={`hcore-${activeLayer}-${i}`}
          center={[pt.lat, pt.lng]}
          radius={Math.round(28 * pt.intensity)}
          fillColor={intensityColor(activeLayer, pt.intensity)}
          fillOpacity={0.28 + 0.15 * pt.intensity}
          color="transparent"
          weight={0}
        />
      ))}

      {/* Bus stop status markers on top */}
      {BUS_STOPS.map((stop, i) => (
        <CircleMarker
          key={`stop-${i}`}
          center={stop.pos}
          radius={7}
          fillColor={STOP_COLORS[stop.status]}
          fillOpacity={1}
          color="white"
          weight={2.5}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{stop.name}</div>
              <div style={{ color: stop.status === 'ontime' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{stop.delay}</div>
              <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>Routes: {stop.route}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

// ─── Floating insight card ────────────────────────────────────────────────────
function InsightCard({ card, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -16, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className={`border ${card.color} rounded-xl p-3.5 max-w-xs pointer-events-auto`}
      style={{ background: 'rgba(10, 10, 20, 0.92)' }}
    >
      <div className="flex items-start gap-2.5">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${card.dot} ${card.priority === 'critical' ? 'animate-pulse' : ''}`} />
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-bold mb-0.5 leading-snug">{card.title}</div>
          <div className="text-white/50 text-xs leading-relaxed mb-2">{card.body}</div>
          <button className="text-bee-yellow text-xs font-semibold flex items-center gap-1 hover:underline">
            <Zap className="w-3 h-3" />
            {card.action}
          </button>
        </div>
        <button
          onClick={() => onDismiss(card.id)}
          className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Layer toggle panel ───────────────────────────────────────────────────────
function LayerTogglePanel({ activeLayer, onChange }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-bee-yellow" />
        <span className="text-white font-bold text-sm">Heatmap Layer</span>
      </div>
      <div className="space-y-2">
        {LAYERS.map((layer) => {
          const Icon = layer.icon
          const isActive = activeLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => onChange(layer.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all duration-250 text-left ${
                isActive
                  ? `${layer.activeBg} ${layer.accent}`
                  : 'border-transparent text-white/40 hover:bg-white/4 hover:text-white/65'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center glass flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-xs">{layer.label}</div>
                <div className={`text-xs mt-0.5 ${isActive ? 'opacity-70' : 'opacity-40'}`}>{layer.desc}</div>
              </div>
              {isActive && (
                <motion.div
                  layoutId="layer-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-current animate-pulse"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Route performance panel ──────────────────────────────────────────────────
function RoutePerformancePanel() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-bee-yellow" />
          <span className="text-white font-bold text-sm">Route Performance</span>
        </div>
        <span className="text-white/25 text-xs">Last 24h</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {ROUTE_PERFORMANCE.map((r, i) => (
          <div key={i} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="glass-yellow rounded px-2 py-0.5 text-bee-yellow font-black text-xs">{r.route}</span>
                <span className="text-white/45 text-xs truncate max-w-[130px]">{r.corridor}</span>
              </div>
              <span className="font-black text-sm flex-shrink-0" style={{ color: r.color }}>{r.ontime}%</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: r.color }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${r.ontime}%` } : {}}
                transition={{ delay: 0.1 * i, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Alerts panel ─────────────────────────────────────────────────────────────
function AlertsPanel() {
  const [alerts, setAlerts] = useState(ALERTS)

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-bee-yellow" />
          <span className="text-white font-bold text-sm">Active Alerts</span>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${alerts.filter(a => a.level === 'critical').length > 0 ? 'text-red-400' : 'text-green-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${alerts.filter(a => a.level === 'critical').length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`} />
          {alerts.filter(a => a.level === 'critical').length} critical
        </span>
      </div>
      <AnimatePresence>
        {alerts.map((alert) => {
          const Icon = alert.icon
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 mx-3 my-2 p-3 rounded-xl border ${alert.color}`}
            >
              <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white/75 text-xs leading-relaxed">{alert.text}</div>
                <div className="text-white/25 text-xs mt-0.5">{alert.time}</div>
              </div>
              <button
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
      {alerts.length === 0 && (
        <div className="py-6 text-center text-white/20 text-xs">
          ✅ All clear — no active alerts
        </div>
      )}
    </div>
  )
}

// ─── Main Government Dashboard ────────────────────────────────────────────────
export default function GovDashboard() {
  const [activeLayer, setActiveLayer] = useState('demand')
  const [insights, setInsights] = useState(INSIGHTS)
  const [activeTab, setActiveTab] = useState('overview')

  const dismissInsight = (id) => setInsights(prev => prev.filter(c => c.id !== id))

  const currentLayerCfg = LAYERS.find(l => l.id === activeLayer)

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
          className="mb-7 flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-semibold uppercase tracking-[0.25em]">Live Operations</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Government Intelligence Centre</h1>
            <p className="text-white/30 text-sm mt-0.5">
              TfGM Network · Greater Manchester ·{' '}
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-yellow rounded-xl px-4 py-2.5 flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-bee-yellow" />
            <span className="text-bee-yellow text-sm font-semibold">System: Monitoring</span>
          </motion.div>
        </motion.div>

        {/* ── Tab bar ── */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'overview', label: 'Network Overview', Icon: MapIcon },
            { id: 'simulator', label: 'Road Closure Simulator', Icon: Construction },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-250 border ${
                activeTab === id
                  ? 'bg-bee-yellow/15 border-bee-yellow/35 text-bee-yellow'
                  : 'glass border-white/0 text-white/40 hover:text-white/65 hover:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>

        {/* ── KPI chips ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {KPI.map((k, i) => {
            const Icon = k.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                whileHover={{ y: -3 }}
                className={`glass border border-white/5 rounded-2xl p-4 bg-gradient-to-b ${k.bg} to-transparent`}
              >
                <Icon className={`w-4 h-4 ${k.color} mb-2.5`} />
                <div className={`text-xl font-black ${k.color} mb-0.5`}>{k.value}</div>
                <div className="text-white text-xs font-semibold mb-0.5">{k.label}</div>
                <div className="text-white/30 text-xs">{k.sub}</div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Main grid: map + sidebar ── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* LEFT: Map with floating cards */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Heatmap map container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl overflow-hidden relative"
              style={{ height: 460 }}
            >
              {/* Map header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] absolute top-0 left-0 right-0 z-[900]"
                style={{ background: 'rgba(10, 10, 20, 0.88)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white/70 text-xs font-medium">Live Network Heatmap</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeLayer}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full glass ${currentLayerCfg?.accent}`}
                    >
                      {currentLayerCfg?.label}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="flex gap-3 text-xs text-white/25">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Delayed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Normal</span>
                </div>
              </div>

              {/* Map */}
              <div className="absolute inset-0 top-[44px]" style={{ isolation: 'isolate' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLayer}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ height: '100%' }}
                  >
                    <GovHeatmapMap activeLayer={activeLayer} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating insight cards — bottom-left overlay */}
              <div
                className="absolute bottom-4 left-4 z-[1000] space-y-2 pointer-events-none"
                style={{ maxWidth: 280 }}
              >
                <AnimatePresence>
                  {insights.map((card) => (
                    <InsightCard key={card.id} card={card} onDismiss={dismissInsight} />
                  ))}
                </AnimatePresence>
                {insights.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl px-4 py-3 pointer-events-auto border border-green-500/20"
                    style={{ background: 'rgba(10, 10, 20, 0.92)' }}
                  >
                    <div className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All insights reviewed
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* AI Prediction Banner */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="glass border border-purple-500/20 rounded-2xl px-5 py-4 flex items-center gap-4 bg-gradient-to-r from-purple-500/5 to-transparent"
            >
              <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white font-semibold text-sm mb-0.5">SmartBee AI Forecast</div>
                <div className="text-white/45 text-xs">Based on today's weather + historical ridership: expect <span className="text-purple-300 font-semibold">+18% demand surge on Oxford Road corridor at 4:30pm</span></div>
              </div>
              <button className="text-purple-400 text-xs font-semibold whitespace-nowrap glass px-3 py-2 rounded-xl hover:bg-white/8 transition-colors flex items-center gap-1">
                View plan <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>

          {/* RIGHT: Sidebar controls */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Layer toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <LayerTogglePanel activeLayer={activeLayer} onChange={setActiveLayer} />
            </motion.div>

            {/* Route performance */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RoutePerformancePanel />
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <AlertsPanel />
            </motion.div>
          </div>
        </div>

        </motion.div>
        )}

        {activeTab === 'simulator' && (
        <motion.div key="simulator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
          <RoadClosureSimulator />
        </motion.div>
        )}

        </AnimatePresence>

      </div>
    </motion.div>
  )
}
