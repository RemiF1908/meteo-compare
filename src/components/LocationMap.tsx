import { useEffect } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { Location } from '../types'

interface LocationMapProps {
  location: Location
  onPick: (latitude: number, longitude: number) => void
  className?: string
}

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:9999px;background:#d64a2f;border:2px solid #fff9f2;box-shadow:0 0 0 2px rgba(214,74,47,.35)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

function MapController({
  latitude,
  longitude,
}: {
  latitude: number
  longitude: number
}) {
  const map = useMap()

  useEffect(() => {
    const currentZoom = map.getZoom()
    map.setView([latitude, longitude], currentZoom < 5 ? 9 : currentZoom)
  }, [latitude, longitude, map])

  return null
}

function ClickHandler({
  onPick,
}: {
  onPick: (latitude: number, longitude: number) => void
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export function LocationMap({
  location,
  onPick,
  className = 'h-64 w-full',
}: LocationMapProps) {
  return (
    <div className={`relative overflow-hidden border border-line ${className}`.trim()}>
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={9}
        scrollWheelZoom={false}
        className="h-full w-full"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={[location.latitude, location.longitude]}
          icon={markerIcon}
        />
        <MapController
          latitude={location.latitude}
          longitude={location.longitude}
        />
        <ClickHandler onPick={onPick} />
      </MapContainer>
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="absolute right-1 bottom-1 z-[500] bg-surface/90 px-1.5 py-0.5 text-[9px] text-muted hover:text-ink"
      >
        © OpenStreetMap
      </a>
    </div>
  )
}
