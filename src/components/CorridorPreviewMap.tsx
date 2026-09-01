import React, { useEffect, useRef, useState } from 'react';
import * as maplibreglNS from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { chokepointMarkers } from '../data/vesselTrackingData';
import { buildRoute, getRouteChokepoints } from '../utils/routeCalc';
import { LngLat } from '../data/seaRoutes';

// maplibre-gl ships as a CJS-style module hung off `default`; resolve defensively once
// (see Tactical2DView.tsx for the same pattern and why it's needed).
const maplibregl: typeof import('maplibre-gl') =
  (maplibreglNS as unknown as { default?: typeof import('maplibre-gl') }).default ?? maplibreglNS;

const BASEMAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

interface CorridorPreviewMapProps {
  loadingPort: string;
  dischargePort: string;
}

export const CorridorPreviewMap: React.FC<CorridorPreviewMapProps> = ({ loadingPort, dischargePort }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selectedStraitId, setSelectedStraitId] = useState<string | null>(null);

  // Recomputed whenever the analysed route changes — the real curated path (never a straight
  // line across land) for whichever origin/destination the user actually configured, plus
  // whichever named chokepoints that specific corridor transits.
  const route = buildRoute(loadingPort, dischargePort);
  const straitIds = getRouteChokepoints(loadingPort, dischargePort);
  const straits = straitIds
    .map(id => chokepointMarkers.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);
  const originCoord = route[0];
  const destCoord = route[route.length - 1];

  const fitToRoute = (map: maplibregl.Map, animate: boolean) => {
    const lngs = route.map(p => p[0]);
    const lats = route.map(p => p[1]);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];
    map.fitBounds(bounds, { padding: 48, duration: animate ? 1000 : 0, maxZoom: 5.5 });
  };

  // Mount the map once (guarded against a second Map instance racing over the same
  // container — see Tactical2DView.tsx for the fuller explanation)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: [(originCoord[0] + destCoord[0]) / 2, (originCoord[1] + destCoord[1]) / 2],
      zoom: 2,
      attributionControl: { compact: true },
      interactive: true
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    map.on('load', () => {
      setMapReady(true);
      fitToRoute(map, false);
    });

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the route line + markers whenever the corridor (or selection) changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    setSelectedStraitId(null);
    fitToRoute(map, true);

    const routeData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route } }]
    };

    const existingSource = map.getSource('preview-route') as maplibregl.GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(routeData);
    } else {
      map.addSource('preview-route', { type: 'geojson', data: routeData });
      map.addLayer({
        id: 'preview-route-line',
        type: 'line',
        source: 'preview-route',
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': '#BC412B', 'line-width': 2.5, 'line-dasharray': [2, 1.5], 'line-opacity': 0.85 }
      });
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    [{ coord: originCoord, color: '#BC412B' }, { coord: destCoord, color: '#243E56' }].forEach(({ coord, color }) => {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>`;
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(coord as [number, number]).addTo(map);
      markersRef.current.push(marker);
    });

    straits.forEach(cp => {
      const el = document.createElement('div');
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
          <div style="width:10px; height:10px; background:#F59E0B; border:1.5px solid #fff; transform:rotate(45deg);"></div>
        </div>
      `;
      el.addEventListener('click', () => focusStrait(cp.id));
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([cp.lng, cp.lat]).addTo(map);
      markersRef.current.push(marker);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, loadingPort, dischargePort]);

  // Restyle just the selected chokepoint marker (no route/marker rebuild needed)
  useEffect(() => {
    straits.forEach((cp, i) => {
      const marker = markersRef.current[2 + i]; // 0,1 are origin/dest markers
      if (!marker) return;
      const isSelected = selectedStraitId === cp.id;
      const el = marker.getElement();
      el.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
          <div style="width:${isSelected ? 14 : 10}px; height:${isSelected ? 14 : 10}px; background:${isSelected ? '#FF2A4D' : '#F59E0B'}; border:1.5px solid #fff; transform:rotate(45deg); ${isSelected ? 'animation: marlin-strait-pulse 1.1s ease-in-out infinite;' : ''}"></div>
          ${isSelected ? `<span style="font-size:9px;font-weight:bold;color:#FF6B6B;font-family:monospace;white-space:nowrap;text-shadow:0 1px 3px #000;">${cp.name.split(' (')[0]}</span>` : ''}
        </div>
      `;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStraitId]);

  const focusStrait = (id: string) => {
    setSelectedStraitId(id);
    const cp = straits.find(c => c.id === id);
    if (cp && mapRef.current) {
      mapRef.current.flyTo({ center: [cp.lng, cp.lat], zoom: 5, duration: 1000 });
    }
  };

  const resetView = () => {
    setSelectedStraitId(null);
    if (mapRef.current) fitToRoute(mapRef.current, true);
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
      <style>{`
        @keyframes marlin-strait-pulse {
          0%, 100% { transform: rotate(45deg) scale(1); opacity: 1; }
          50% { transform: rotate(45deg) scale(1.35); opacity: 0.6; }
        }
      `}</style>

      {/* Strait selector strip */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={resetView}
          className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-mono-data font-bold border transition-colors cursor-pointer ${
            !selectedStraitId ? 'bg-[#BC412B] text-white border-[#BC412B]' : 'bg-[#0A141E]/85 text-[#8E9B97] border-[#1E354B] hover:text-white'
          }`}
        >
          Full Corridor
        </button>
        {straits.map(cp => (
          <button
            key={cp.id}
            onClick={() => focusStrait(cp.id)}
            className={`shrink-0 px-2.5 py-1 rounded text-[10px] font-mono-data font-bold border transition-colors cursor-pointer whitespace-nowrap ${
              selectedStraitId === cp.id ? 'bg-[#BC412B] text-white border-[#BC412B]' : 'bg-[#0A141E]/85 text-[#8E9B97] border-[#1E354B] hover:text-white'
            }`}
          >
            {cp.name.split(' (')[0]}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
