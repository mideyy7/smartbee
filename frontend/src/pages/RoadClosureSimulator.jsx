import { useState, useEffect } from 'react'
import { AnimatePresence} from 'framer-motion'
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap } from 'react-leaflet'
import { AlertTriangle, Navigation, Clock, Users, ChevronRight, RotateCcw } from 'lucide-react'

const MANCHESTER_CENTER = [53.4808, -2.2426]

// Road definitions: path coordinates + affected stops
const ROADS = [
  {
    id: 'oxford_road',
    label: 'Oxford Road',
    path: [[53.4780, -2.2371], [53.4720, -2.2340], [53.4650, -2.2303], [53.4580, -2.2285]],
    diversion: [[53.4780, -2.2371], [53.4760, -2.2500], [53.4680, -2.2480], [53.4580, -2.2285]],
    affectedStops: [[53.4720, -2.2340], [53.4650, -2.2303]],
    affectedRoutes: ['42', '142', '111', '43'],
  },
  {
    id: 'princess_street',
    label: 'Princess Street',
    path: [[53.4790, -2.2400], [53.4782, -2.2355], [53.4775, -2.2300]],
    diversion: [[53.4790, -2.2400], [53.4810, -2.2360], [53.4800, -2.2310], [53.4775, -2.2300]],
    affectedStops: [[53.4782, -2.2355]],
    affectedRoutes: ['15', '86', '8'],
  },
  {
    id: 'deansgate',
    label: 'Deansgate',
    path: [[53.4820, -2.2491], [53.4800, -2.2491], [53.4770, -2.2491], [53.4740, -2.2491]],
    diversion: [[53.4820, -2.2491], [53.4820, -2.2400], [53.4740, -2.2380], [53.4740, -2.2491]],
    affectedStops: [[53.4786, -2.2491]],
    affectedRoutes: ['15', '86', '50'],
  },
  {
    id: 'wilmslow_road',
    label: 'Wilmslow Road',
    path: [[53.4450, -2.2175], [53.4380, -2.2140], [53.4300, -2.2100]],
    diversion: [[53.4450, -2.2175], [53.4450, -2.2280], [53.4320, -2.2250], [53.4300, -2.2100]],
    affectedStops: [[53.4424, -2.2175]],
    affectedRoutes: ['42', '142'],
  },
]

const DURATIONS = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 8, label: '8 hours' },
]

// Mock impact data (mirrors backend road_closure.py)
const MOCK_IMPACTS = {
  oxford_road: {
    1: { passengerCount: 140, affectedRoutes: [{ route: '42', extra: 8, alt: '142 via Moss Side' }, { route: '142', extra: 6, alt: '43 via Hulme' }, { route: '111', extra: 11, alt: 'Metrolink + 86' }], action: 'Activate bus bridge on Hathersage Road', severity: 'high' },
    2: { passengerCount: 220, affectedRoutes: [{ route: '42', extra: 12, alt: '142 via Moss Side' }, { route: '142', extra: 9, alt: '43 via Hulme' }, { route: '111', extra: 14, alt: 'Metrolink + 86' }, { route: '43', extra: 7, alt: 'Orbital via Rusholme' }], action: 'Deploy extra buses on Hathersage Rd + notify Metrolink', severity: 'high' },
    4: { passengerCount: 180, affectedRoutes: [{ route: '42', extra: 18, alt: '142 via Moss Side' }, { route: '142', extra: 14, alt: '43 via Hulme' }, { route: '111', extra: 20, alt: 'Metrolink + 86' }, { route: '43', extra: 11, alt: 'Orbital via Rusholme' }], action: 'Major corridor diversion — coordinate with TfGM', severity: 'critical' },
    8: { passengerCount: 140, affectedRoutes: [{ route: '42', extra: 22, alt: '142 via Moss Side' }, { route: '142', extra: 18, alt: '43 via Hulme' }, { route: '111', extra: 25, alt: 'Metrolink + 86' }, { route: '43', extra: 15, alt: 'Orbital via Rusholme' }], action: 'Full network replan — engage emergency protocol', severity: 'critical' },
  },
  princess_street: {
    1: { passengerCount: 120, affectedRoutes: [{ route: '15', extra: 5, alt: 'Mosley St bypass' }, { route: '86', extra: 4, alt: 'Portland St' }], action: 'Minor diversion via Mosley Street', severity: 'medium' },
    2: { passengerCount: 210, affectedRoutes: [{ route: '15', extra: 8, alt: 'Mosley St bypass' }, { route: '86', extra: 7, alt: 'Portland St' }, { route: '8', extra: 6, alt: 'Sackville St' }], action: 'Divert via Mosley St and update displays', severity: 'medium' },
    4: { passengerCount: 440, affectedRoutes: [{ route: '15', extra: 11, alt: 'Mosley St bypass' }, { route: '86', extra: 10, alt: 'Portland St' }, { route: '8', extra: 9, alt: 'Sackville St' }], action: 'Coordinate with city centre traffic management', severity: 'high' },
    8: { passengerCount: 820, affectedRoutes: [{ route: '15', extra: 14, alt: 'Mosley St bypass' }, { route: '86', extra: 13, alt: 'Portland St' }, { route: '8', extra: 12, alt: 'Sackville St' }], action: 'Deploy real-time passenger info on all stops', severity: 'high' },
  },
  deansgate: {
    1: { passengerCount: 280, affectedRoutes: [{ route: '15', extra: 7, alt: 'Peter St bypass' }, { route: '86', extra: 9, alt: 'Castlefield loop' }, { route: '50', extra: 5, alt: 'Quays tram' }], action: 'Redirect via Peter Street corridor', severity: 'high' },
    2: { passengerCount: 510, affectedRoutes: [{ route: '15', extra: 10, alt: 'Peter St bypass' }, { route: '86', extra: 13, alt: 'Castlefield loop' }, { route: '50', extra: 8, alt: 'Quays tram' }], action: 'Activate Metrolink overflow + bus bridge', severity: 'high' },
    4: { passengerCount: 980, affectedRoutes: [{ route: '15', extra: 15, alt: 'Peter St bypass' }, { route: '86', extra: 18, alt: 'Castlefield loop' }, { route: '50', extra: 12, alt: 'Quays tram' }], action: 'Full Deansgate corridor emergency plan', severity: 'critical' },
    8: { passengerCount: 1860, affectedRoutes: [{ route: '15', extra: 19, alt: 'Peter St bypass' }, { route: '86', extra: 22, alt: 'Castlefield loop' }, { route: '50', extra: 16, alt: 'Quays tram' }], action: 'TfGM regional coordination required', severity: 'critical' },
  },
  wilmslow_road: {
    1: { passengerCount: 90, affectedRoutes: [{ route: '42', extra: 6, alt: '142 express' }, { route: '142', extra: 4, alt: 'via Burton Road' }], action: 'Minor diversion — update stops digitally', severity: 'low' },
    2: { passengerCount: 170, affectedRoutes: [{ route: '42', extra: 9, alt: '142 express' }, { route: '142', extra: 7, alt: 'via Burton Road' }], action: 'Activate alternative routing app alerts', severity: 'medium' },
    4: { passengerCount: 340, affectedRoutes: [{ route: '42', extra: 13, alt: '142 express' }, { route: '142', extra: 11, alt: 'via Burton Road' }], action: 'South Manchester diversion — coordinate with Didsbury services', severity: 'medium' },
    8: { passengerCount: 620, affectedRoutes: [{ route: '42', extra: 17, alt: '142 express' }, { route: '142', extra: 14, alt: 'via Burton Road' }], action: 'Deploy passenger information team at Fallowfield hub', severity: 'high' },
  },
}

const SEVERITY_STYLES = {
  low: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', dot: 'bg-blue-400', label: 'Low Impact' },
  medium: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', dot: 'bg-amber-400', label: 'Moderate' },
  high: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-300', dot: 'bg-orange-400', label: 'High Impact' },
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300', dot: 'bg-red-400', label: 'Critical' },
}

function SimMapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 120)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function SimulatorMap({ selectedRoad, simResult }) {
  const road = ROADS.find(r => r.id === selectedRoad)

  return (
    <MapContainer
      center={MANCHESTER_CENTER}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl
      dragging
      scrollWheelZoom={false}
    >
      <SimMapResizer />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; OSM &copy; CARTO'
        maxZoom={19}
      />

      {/* Closed road — thick red */}
      {road && simResult && (
        <Polyline
          positions={road.path}
          pathOptions={{ color: '#ef4444', weight: 6, opacity: 0.85, dashArray: null }}
        />
      )}

      {/* Diversion route — blue dashed */}
      {road && simResult && (
        <Polyline
          positions={road.diversion}
          pathOptions={{ color: '#60a5fa', weight: 4, opacity: 0.7, dashArray: '10, 8' }}
        />
      )}

      {/* Affected stop markers */}
      {road && simResult && road.affectedStops.map((pos, i) => (
        <CircleMarker
          key={`aff-glow-${i}`}
          center={pos}
          radius={22}
          fillColor="#f97316"
          fillOpacity={0.15}
          color="#f97316"
          weight={1}
          opacity={0.3}
        />
      ))}
      {road && simResult && road.affectedStops.map((pos, i) => (
        <CircleMarker
          key={`aff-${i}`}
          center={pos}
          radius={9}
          fillColor="#f97316"
          fillOpacity={1}
          color="white"
          weight={2.5}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: '#ea580c' }}>⚠ Affected Stop</div>
              <div style={{ color: '#dc2626', fontWeight: 600 }}>Diversion active</div>
              <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>Routes: {road.affectedRoutes.join(', ')}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Idle state: show all Manchester stops faintly */}
      {!simResult && (
        <>
          {[
            [53.4779, -2.2323], [53.4786, -2.2491], [53.4450, -2.2753],
            [53.4424, -2.2175], [53.4715, -2.2992], [53.4840, -2.2338],
          ].map((pos, i) => (
            <CircleMarker
              key={`idle-${i}`}
              center={pos}
              radius={7}
              fillColor="#6b7280"
              fillOpacity={0.5}
              color="white"
              weight={2}
            />
          ))}
        </>
      )}
    </MapContainer>
  )
}

export default function RoadClosureSimulator() {
  const [selectedRoad, setSelectedRoad] = useState('oxford_road')
  const [duration, setDuration] = useState(2)
  const [simResult, setSimResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    setSimResult(null)

    // Simulate API call delay
    await new Promise(r => setTimeout(r, 900))

    // HACKATHON: use mock data. PRODUCTION: POST /api/road-closure-impact
    const impact = MOCK_IMPACTS[selectedRoad]?.[duration]
    setSimResult(impact)
    setLoading(false)
  }

  const handleReset = () => {
    setSimResult(null)
  }

  const severity = simResult ? SEVERITY_STYLES[simResult.severity] : null
  const selectedRoadLabel = ROADS.find(r => r.id === selectedRoad)?.label

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[600px]">

      {/* Left: Control panel + results */}
      <div className="flex flex-col gap-4 w-full lg:w-80 flex-shrink-0">

        {/* Control Panel */}
        <div className="glass-strong rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold text-sm">Closure Parameters</span>
          </div>

          {/* Road selector */}
          <div>
            <label className="text-white/40 text-xs font-medium mb-2 block">Road / Corridor</label>
            <div className="grid grid-cols-1 gap-1.5">
              {ROADS.map(road => (
                <button
                  key={road.id}
                  onClick={() => { setSelectedRoad(road.id); setSimResult(null) }}
                  className={`text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    selectedRoad === road.id
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'glass border-white/0 text-white/50 hover:text-white/70 hover:border-white/10'
                  }`}
                >
                  {road.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration selector */}
          <div>
            <label className="text-white/40 text-xs font-medium mb-2 block">Closure Duration</label>
            <div className="grid grid-cols-2 gap-1.5">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => { setDuration(d.value); setSimResult(null) }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    duration === d.value
                      ? 'bg-bee-yellow/15 border-bee-yellow/40 text-bee-yellow'
                      : 'glass border-white/0 text-white/50 hover:text-white/70'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulate button */}
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-black transition-all duration-300 bg-bee-yellow text-black hover:opacity-90 disabled:opacity-50 shadow-[0_0_20px_rgba(255,209,0,0.25)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Running simulation…
              </span>
            ) : 'Run Simulation'}
          </button>

          {simResult && (
            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {simResult && (
            <motion.div
              key="sim-result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              className="glass-strong rounded-2xl p-5 space-y-4"
            >
              {/* Severity banner */}
              <div className={`rounded-xl px-3.5 py-2.5 border ${severity.bg} ${severity.border} flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${severity.dot} animate-pulse`} />
                <span className={`text-xs font-black ${severity.text}`}>{severity.label}</span>
                <span className="text-white/30 text-xs ml-auto">{selectedRoadLabel}</span>
              </div>

              {/* Passenger count */}
              <div className="flex items-center gap-3 glass rounded-xl px-3.5 py-3">
                <Users className="w-4 h-4 text-white/40" />
                <div>
                  <div className="text-white font-black text-lg leading-none">
                    {simResult.passengerCount.toLocaleString()}
                  </div>
                  <div className="text-white/35 text-xs mt-0.5">passengers affected</div>
                </div>
              </div>

              {/* Affected routes */}
              <div>
                <div className="text-white/40 text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3" /> Affected Routes
                </div>
                <div className="space-y-2">
                  {simResult.affectedRoutes.map((r, i) => (
                    <motion.div
                      key={r.route}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="glass rounded-xl px-3.5 py-2.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-bee-yellow font-black text-xs bg-bee-yellow/10 px-2 py-0.5 rounded-full">
                          Route {r.route}
                        </span>
                        <div className="flex items-center gap-1 text-orange-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-bold">+{r.extra} min</span>
                        </div>
                      </div>
                      <div className="text-white/35 text-xs flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-white/25" />
                        {r.alt}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommended action */}
              <div className="glass-yellow rounded-xl px-3.5 py-3">
                <div className="text-bee-yellow text-xs font-black mb-1">AI Recommendation</div>
                <div className="text-white/70 text-xs leading-relaxed">{simResult.action}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Map */}
      <div className="flex-1 glass-strong rounded-2xl overflow-hidden min-h-[400px] lg:min-h-0 relative">
        <SimulatorMap selectedRoad={selectedRoad} simResult={simResult} />

        {/* Map legend */}
        <div className="absolute bottom-3 left-3 z-[1000] glass rounded-xl px-3 py-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-red-500 rounded-full" />
            <span className="text-white/50 text-xs">Closed road</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t-2 border-dashed border-blue-400" />
            <span className="text-white/50 text-xs">Diversion route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mx-auto" style={{ marginLeft: 2 }} />
            <span className="text-white/50 text-xs">Affected stops</span>
          </div>
        </div>

        {/* Idle hint */}
        {!simResult && !loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
            <div className="glass rounded-2xl px-6 py-4 text-center">
              <div className="text-3xl mb-2">🚧</div>
              <div className="text-white font-bold text-sm">Configure & Run Simulation</div>
              <div className="text-white/35 text-xs mt-1">Select a road and duration, then click Run</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
