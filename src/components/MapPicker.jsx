import { MapPin, LocateFixed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Marker, Popup, TileLayer, MapContainer, useMap, useMapEvents } from 'react-leaflet'

function LocationMarker({ position, onPositionChange }) {
  const map = useMap()

  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng
      onPositionChange({ latitude: lat, longitude: lng })
      map.flyTo([lat, lng], map.getZoom())
    }
  })

  return (
    <Marker position={[position.latitude, position.longitude]} draggable eventHandlers={{
      dragend(event) {
        const { lat, lng } = event.target.getLatLng()
        onPositionChange({ latitude: lat, longitude: lng })
      }
    }}>
      <Popup>Selected location</Popup>
    </Marker>
  )
}

export default function MapPicker({ latitude, longitude, address, onPositionChange, onAddressChange }) {
  const [position, setPosition] = useState({
    latitude: latitude || 12.9141,
    longitude: longitude || 74.8560
  })

  useEffect(() => {
    setPosition({ latitude, longitude })
  }, [latitude, longitude])

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (geoPosition) => {
        const nextPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude
        }
        setPosition(nextPosition)
        onPositionChange(nextPosition)
      },
      () => {
        alert('Location access was denied. Please choose a point on the map manually.')
      },
      { enableHighAccuracy: true }
    )
  }

  const handlePositionChange = (nextPosition) => {
    setPosition(nextPosition)
    onPositionChange(nextPosition)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">Location</label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          Use my current location
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={[position.latitude, position.longitude]} zoom={14} className="h-72 w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
        </MapContainer>
      </div>

      <label className="block text-sm font-medium text-slate-700" htmlFor="address">
        Address
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <input
          id="address"
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Enter a nearby landmark or street address"
        />
      </div>
    </div>
  )
}
