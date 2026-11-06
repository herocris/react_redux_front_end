import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L, { type HeatLatLngTuple } from 'leaflet';
import 'leaflet.heat';

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export const HeatmapLayer = ({ points }: { points: HeatmapPoint[] }) => {
  const map = useMap();

  useEffect(() => {
    const validPoints = points.filter(({ lat, lng }) => Number.isFinite(lat) && Number.isFinite(lng));
    const coordinates: HeatLatLngTuple[] = validPoints.map(({ lat, lng, intensity }) => [lat, lng, intensity]);
    const layer = L.heatLayer(coordinates, {
      // Regional maps need full intensity before the tile layer's street-level zoom.
      maxZoom: 10,
      max: 1,
      radius: 25,
      blur: 20,
      minOpacity: 0.3,
      gradient: {
        0.2: '#2563eb',
        0.4: '#06b6d4',
        0.6: '#22c55e',
        0.8: '#facc15',
        1: '#ef4444',
      },
    }).addTo(map);

    if (validPoints.length > 0) {
      map.fitBounds(L.latLngBounds(validPoints.map(({ lat, lng }) => [lat, lng])));
    }

    return () => { map.removeLayer(layer); };
  }, [map, points]);

  return null;
};
