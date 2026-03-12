import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Pin } from '@/lib/supabase';

type MapViewProps = {
  center: [number, number];
  pins: Pin[];
  userLocation: [number, number];
  geofenceRadius: number;
  showGeofence: boolean;
};

const categoryEmoji: Record<string, string> = {
  food: '🍞',
  medical: '🏥',
  rescue: '🚨',
  shelter: '🏠',
};

function createPinIcon(pin: Pin) {
  const color = pin.type === 'need_help' ? '#dc2626' : '#22c55e';
  const emoji = categoryEmoji[pin.category] || '📍';

  return L.divIcon({
    className: 'custom-pin',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div class="pin-pulse" style="position:absolute;width:32px;height:32px;border-radius:50%;background:${color};opacity:0.3;"></div>
        <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 12px ${color}80;border:2px solid ${color};">${emoji}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function MapView({ center, pins, userLocation, geofenceRadius, showGeofence }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    mapRef.current?.setView(center, mapRef.current.getZoom());
  }, [center]);

  // User location marker
  useEffect(() => {
    if (!mapRef.current) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();

    userMarkerRef.current = L.circleMarker(userLocation, {
      radius: 8,
      fillColor: '#3b82f6',
      color: '#1d4ed8',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(mapRef.current).bindPopup('You are here');
  }, [userLocation]);

  // Geofence circle
  useEffect(() => {
    if (!mapRef.current) return;
    if (circleRef.current) circleRef.current.remove();

    if (showGeofence) {
      circleRef.current = L.circle(userLocation, {
        radius: geofenceRadius * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '8 4',
      }).addTo(mapRef.current);
    }
  }, [userLocation, geofenceRadius, showGeofence]);

  // Update pins
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    pins.forEach((pin) => {
      const marker = L.marker([pin.latitude, pin.longitude], { icon: createPinIcon(pin) });
      const timeAgo = getTimeAgo(pin.created_at);
      marker.bindPopup(`
        <div style="font-family:system-ui;color:#e5e7eb;background:#1a1f2e;padding:8px;border-radius:8px;min-width:160px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px;">
            ${pin.type === 'need_help' ? '🔴 Needs Help' : '🟢 Can Help'}
          </div>
          <div style="font-size:12px;text-transform:capitalize;margin-bottom:4px;">
            ${categoryEmoji[pin.category]} ${pin.category}
          </div>
          ${pin.description ? `<div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">${pin.description}</div>` : ''}
          <div style="font-size:10px;color:#6b7280;font-family:monospace;">${timeAgo}</div>
        </div>
      `, { className: 'dark-popup' });
      marker.addTo(markersRef.current!);
    });
  }, [pins]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
