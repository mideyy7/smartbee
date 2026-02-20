import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'

const MANCHESTER_CENTER = [53.4808, -2.2426]

const BUS_STOPS = [
  { pos: [53.4779, -2.2323], name: 'Piccadilly', delay: '+8 min', status: 'late', route: '43, 111' },
  { pos: [53.4786, -2.2491], name: 'Deansgate', delay: '+12 min', status: 'late', route: '15, 86' },
  { pos: [53.4450, -2.2753], name: 'Chorlton', delay: '+5 min', status: 'delayed', route: '85, 86' },
  { pos: [53.4424, -2.2175], name: 'Fallowfield', delay: '+15 min', status: 'late', route: '42, 142' },
  { pos: [53.4715, -2.2992], name: 'Salford Quays', delay: '+3 min', status: 'delayed', route: '50, M50' },
  { pos: [53.3658, -2.2723], name: 'Manchester Airport', delay: '+20 min', status: 'late', route: '43' },
  { pos: [53.4840, -2.2338], name: 'Northern Quarter', delay: 'On time', status: 'ontime', route: '8, 9' },
  { pos: [53.4815, -2.2221], name: 'Ancoats', delay: '+4 min', status: 'delayed', route: '53, 216' },
]

const STATUS_COLORS = {
  late: '#ef4444',
  delayed: '#f97316',
  ontime: '#22c55e',
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100)
  }, [map])
  return null
}

export default function ManchesterMap({ interactive = false, zoom = 12, className = '' }) {
  return (
    <MapContainer
      center={MANCHESTER_CENTER}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      keyboard={interactive}
      touchZoom={interactive}
      className={className}
    >
      <MapResizer />
      {/* CartoDB Voyager — light colorful tiles, no API key */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
      />
      {BUS_STOPS.filter(s => s.status !== 'ontime').map((stop, i) => (
        <CircleMarker
          key={`pulse-${i}`}
          center={stop.pos}
          radius={18}
          fillColor={STATUS_COLORS[stop.status]}
          fillOpacity={0.15}
          color={STATUS_COLORS[stop.status]}
          weight={1.5}
          opacity={0.4}
        />
      ))}
      {BUS_STOPS.map((stop, i) => (
        <CircleMarker
          key={i}
          center={stop.pos}
          radius={8}
          fillColor={STATUS_COLORS[stop.status]}
          fillOpacity={1}
          color="white"
          weight={2.5}
        >
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{stop.name}</div>
              <div style={{ color: stop.status === 'ontime' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                {stop.delay}
              </div>
              <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>Routes: {stop.route}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}

export { MANCHESTER_CENTER, BUS_STOPS, STATUS_COLORS }
