'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Destination } from '@airlytics/types';
import { VerdictBadge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Fix Leaflet default icon issue in webpack
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

function createPriceIcon(price: number, trend: string) {
  const color = trend === 'BUY' ? '#2bd9a0' : trend === 'RISK' ? '#ff4e6a' : '#f5a623';
  const bg = trend === 'BUY' ? 'rgba(43,217,160,0.15)' : trend === 'RISK' ? 'rgba(255,78,106,0.15)' : 'rgba(245,166,35,0.15)';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background:${bg};
        border:2px solid ${color};
        color:${color};
        padding:3px 7px;
        border-radius:12px;
        font-family:monospace;
        font-weight:700;
        font-size:12px;
        white-space:nowrap;
        backdrop-filter:blur(4px);
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        cursor:pointer;
      ">${price}€</div>`,
    iconAnchor: [30, 12],
  });
}

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

interface Props {
  destinations: Destination[];
  originIata: string;
  originLat?: number;
  originLng?: number;
}

const ORIGIN_COORDS: Record<string, [number, number]> = {
  CMN: [33.4, -7.6], RAK: [31.6, -8.0], RBA: [34.0, -6.7], AGA: [30.3, -9.4],
  TNG: [35.7, -5.8], FEZ: [34.0, -5.0], OUD: [34.8, -1.9],
  CDG: [49.0, 2.5], ORY: [48.7, 2.4], NCE: [43.7, 7.2], MRS: [43.4, 5.2],
  LYS: [45.7, 5.1], TLS: [43.6, 1.4], BOD: [44.8, -0.7], NTE: [47.2, -1.6],
  MAD: [40.5, -3.6], BCN: [41.3, 2.1], LHR: [51.5, -0.5], AMS: [52.3, 4.8],
  FRA: [50.0, 8.6], MUC: [48.4, 11.8], DXB: [25.3, 55.4], IST: [41.0, 28.7],
  JFK: [40.6, -73.8], LAX: [33.9, -118.4], SIN: [1.4, 103.9],
};

export default function FlightMap({ destinations, originIata, originLat, originLng }: Props) {
  useEffect(() => { fixLeafletIcons(); }, []);
  const router = useRouter();

  const [centerLat, centerLng] = ORIGIN_COORDS[originIata] ?? [originLat ?? 20, originLng ?? 10];

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />
        <MapCenter lat={centerLat} lng={centerLng} />

        {destinations.map(dest => (
          <Marker
            key={dest.iata}
            position={[dest.lat, dest.lng]}
            icon={createPriceIcon(dest.price, dest.trend)}
          >
            <Popup
              className="flight-popup"
              closeButton={false}
              maxWidth={200}
            >
              <div style={{
                background: '#1a1f2e',
                border: '1px solid #2a3050',
                borderRadius: 10,
                padding: '12px',
                color: 'white',
                minWidth: 160,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#666', marginBottom: 2 }}>
                      {originIata} → {dest.iata}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{dest.city}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{dest.country}</div>
                  </div>
                  <span style={{ fontSize: 20 }}>{dest.weatherIcon}</span>
                </div>

                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18 }}>
                    {formatPrice(dest.price)}
                  </span>
                  <span style={{ fontSize: 10, color: '#888' }}>A/R</span>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <VerdictBadge trend={dest.trend} size="sm" />
                </div>

                <button
                  onClick={() => router.push(`/predict?from=${originIata}&to=${dest.iata}`)}
                  style={{
                    width: '100%',
                    background: '#3b6fe0',
                    color: 'white',
                    border: 'none',
                    borderRadius: 7,
                    padding: '6px 0',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Voir les vols →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
