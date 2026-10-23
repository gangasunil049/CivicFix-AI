import { divIcon } from 'leaflet'
import { Marker, Popup, TileLayer, MapContainer } from 'react-leaflet'

const priorityColors = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#f97316',
  Critical: '#ef4444'
}

const customIcon = (level) =>
  divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:${priorityColors[level] || '#64748b'};border:2px solid white;box-shadow:0 4px 10px rgba(15,23,42,0.22)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  })

export default function ComplaintMap({ complaints, center, zoom = 12 }) {
  const initialCenter = center || [12.875, 74.845]

  return (
    <div className="h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={initialCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {complaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.latitude, complaint.longitude]}
            icon={customIcon(complaint.ai?.priority_level || 'Medium')}
          >
            <Popup>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">{complaint.issue_type}</div>
                <div className="text-xs text-slate-600">{complaint.address}</div>
                <div className="text-xs text-slate-500">{complaint.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
