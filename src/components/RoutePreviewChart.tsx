import React, { useMemo } from 'react';
import { getSimplifiedLandRings } from '../utils/geo';
import { LngLat } from '../data/seaRoutes';
import { buildRoute, routeDistanceNM, STEAMING_SPEED_KTS } from '../utils/routeCalc';

interface RoutePreviewChartProps {
  loadingPort: string;
  dischargePort: string;
}

export const RoutePreviewChart: React.FC<RoutePreviewChartProps> = ({ loadingPort, dischargePort }) => {
  const { landPathD, routePathD, originPt, destPt, distanceNM, steamingDays } = useMemo(() => {
    const route = buildRoute(loadingPort, dischargePort);
    const VB_W = 400;
    const VB_H = 200;

    const lngs = route.map(p => p[0]);
    const lats = route.map(p => p[1]);
    const lngSpan = Math.max(...lngs) - Math.min(...lngs) || 10;
    const latSpan = Math.max(...lats) - Math.min(...lats) || 10;
    const lngPad = Math.max(6, lngSpan * 0.12);
    const latPad = Math.max(6, latSpan * 0.18);
    const lngMin = Math.min(...lngs) - lngPad;
    const lngMax = Math.max(...lngs) + lngPad;
    const latMin = Math.min(...lats) - latPad;
    const latMax = Math.max(...lats) + latPad;

    const project = ([lng, lat]: LngLat) => ({
      x: ((lng - lngMin) / (lngMax - lngMin)) * VB_W,
      y: ((latMax - lat) / (latMax - latMin)) * VB_H
    });

    const margin = 8;
    const landPathD = getSimplifiedLandRings()
      .filter(ring => ring.some(([lng, lat]) =>
        lng >= lngMin - margin && lng <= lngMax + margin && lat >= latMin - margin && lat <= latMax + margin
      ))
      .map(ring => {
        const pts = ring.map(pt => project(pt as LngLat));
        return `M ${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')} Z`;
      })
      .join(' ');

    const routePts = route.map(project);
    const routePathD = `M ${routePts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;

    const distanceNM = Math.round(routeDistanceNM(route));
    const steamingDays = Number((distanceNM / (STEAMING_SPEED_KTS * 24)).toFixed(1));

    return {
      landPathD,
      routePathD,
      originPt: routePts[0],
      destPt: routePts[routePts.length - 1],
      distanceNM,
      steamingDays
    };
  }, [loadingPort, dischargePort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-48 w-full bg-[#0A141E] rounded border border-[#DDD8CE] dark:border-[#1F2E3E] relative overflow-hidden">
        <style>{`
          @keyframes rpc-dash-flow { to { stroke-dashoffset: -24; } }
          @keyframes rpc-ping { 0% { r: 4; opacity: 0.55; } 100% { r: 13; opacity: 0; } }
          .rpc-route-line { animation: rpc-dash-flow 1.1s linear infinite; }
          .rpc-ping { animation: rpc-ping 1.8s cubic-bezier(0,0,0.2,1) infinite; }
        `}</style>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="rpc-ocean" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#132538" />
              <stop offset="100%" stopColor="#0A141E" />
            </radialGradient>
          </defs>
          <rect width="400" height="200" fill="url(#rpc-ocean)" />
          {/* Faint lat/long graticule for a chart-like feel */}
          {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
            <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={200} stroke="#1F3348" strokeWidth="0.5" opacity="0.5" />
          ))}
          {[40, 80, 120, 160].map(y => (
            <line key={`h-${y}`} x1={0} y1={y} x2={400} y2={y} stroke="#1F3348" strokeWidth="0.5" opacity="0.5" />
          ))}

          {/* Real coastlines, consistent with the tactical map / globe */}
          <path d={landPathD} fill="#16202C" stroke="#2A4257" strokeWidth="0.6" opacity="0.95" />

          {/* Route track */}
          <path
            d={routePathD}
            fill="none"
            stroke="#BC412B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 4"
            className="rpc-route-line"
            opacity="0.9"
          />

          {/* Destination (Indian discharge port) */}
          {destPt && (
            <g>
              <circle cx={destPt.x} cy={destPt.y} r="4" fill="#243E56" className="rpc-ping" />
              <circle cx={destPt.x} cy={destPt.y} r="4" fill="#5B87AC" stroke="#E8ECE9" strokeWidth="1.2" />
            </g>
          )}
          {/* Origin (loading berth) */}
          {originPt && (
            <g>
              <circle cx={originPt.x} cy={originPt.y} r="4" fill="#BC412B" className="rpc-ping" />
              <circle cx={originPt.x} cy={originPt.y} r="4" fill="#E05A42" stroke="#E8ECE9" strokeWidth="1.2" />
            </g>
          )}

          {/* Vessel icon transiting the live route */}
          <g fill="#FBBF24" stroke="#0A141E" strokeWidth="0.5">
            <path d="M -3.5 3 L 0 -4.5 L 3.5 3 Z">
              <animateMotion dur="9s" repeatCount="indefinite" rotate="auto" path={routePathD} />
            </path>
          </g>
        </svg>

        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-[#0A141E]/80 backdrop-blur-sm border border-[#1F3348] rounded px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3EB58A] animate-pulse" />
          <span className="text-[9px] font-mono-data font-bold text-[#8E9B97] tracking-wide">LIVE ROUTE PLOT</span>
        </div>
      </div>

      <div className="text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2 font-editorial">
        <span>{loadingPort}</span>
        <span className="material-symbols-outlined text-sm text-[#BC412B] dark:text-[#E05A42]">arrow_forward</span>
        <span>{dischargePort}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
        <div>
          <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold tracking-wider">Est. Nautical Distance</span>
          <span className="font-mono-data font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">{distanceNM.toLocaleString()} NM</span>
        </div>
        <div>
          <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold tracking-wider">Est. Steaming Time</span>
          <span className="font-mono-data font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">{steamingDays} Days</span>
        </div>
      </div>
    </div>
  );
};
