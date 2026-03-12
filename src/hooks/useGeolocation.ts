import { useState, useEffect } from 'react';

type GeoState = {
  latitude: number;
  longitude: number;
  error: string | null;
  loading: boolean;
};

// Default: Mumbai city center
const DEFAULT_LAT = 19.076;
const DEFAULT_LNG = 72.8777;

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LNG,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported', loading: false }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState(s => ({
          ...s,
          error: err.code === 1 ? 'Location access denied. Showing default view.' : err.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return state;
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
