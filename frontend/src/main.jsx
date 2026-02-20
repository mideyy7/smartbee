import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

// Note: StrictMode removed to prevent Leaflet double-mount issues in dev
createRoot(document.getElementById('root')).render(<App />)
