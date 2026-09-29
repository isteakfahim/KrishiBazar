'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Props {
  latitude: number;
  longitude: number;
  farmName: string;
  districtName: string;
  zoom?: number;
}

const emptySubscribe = () => () => {};

export default function FarmMapClient({
  latitude,
  longitude,
  farmName,
  districtName,
  zoom = 11,
}: Props) {
  const isMounted = React.useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted) {
    return (
      <div className="w-full h-64 bg-[var(--tint)]/50 rounded-2xl flex items-center justify-center text-xs text-[var(--muted)] animate-pulse">
        মানচিত্র লোড হচ্ছে...
      </div>
    );
  }

  // Create clean modern green pin icon
  const customIcon = L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: #17553A;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 6px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background-color: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden border border-[var(--card-border)] shadow-inner relative z-0">
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={customIcon}>
          <Popup>
            <div className="text-center font-sans text-xs p-1">
              <strong className="block text-sm text-[var(--green)] font-bold">{farmName}</strong>
              <span className="text-[var(--muted)] text-[11px]">{districtName}</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
