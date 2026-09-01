import React, { useState, useMemo } from 'react';
import { Globe3DView } from './WorldMonitorMap/Globe3DView';
import { MapLayerState, WorldMonitorSelection } from './WorldMonitorMap/types';
import { initialTrackedVessels, portMapLocations, chokepointMarkers, monsoonZones } from '../data/vesselTrackingData';
import { useNews } from '../context/NewsContext';
import { usePortAlerts } from '../context/PortAlertContext';

interface LandingPageProps {
  onEnter: () => void;
}

const HERO_LAYERS: MapLayerState = {
  tradeCorridors: true,
  aisFleet: true,
  aisWakeTrails: true,
  portNodes: true,
  chokepoints: true,
  weatherRadar: true,
  graticuleGrid: true,
  autoRotate: true,
  radarSweep: false
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [selectedItem] = useState<WorldMonitorSelection>({ type: null, id: null, data: null });
  const { articles } = useNews();
  const { notifications } = usePortAlerts();

  // Latest headlines + alerts, interleaved, for the live activity ticker
  const tickerItems = useMemo(() => {
    const newsItems = articles.slice(0, 4).map(a => ({ kind: 'news' as const, text: a.title }));
    const alertItems = notifications.slice(0, 3).map(n => ({ kind: 'alert' as const, text: n.title }));
    const merged: Array<{ kind: 'news' | 'alert'; text: string }> = [];
    const max = Math.max(newsItems.length, alertItems.length);
    for (let i = 0; i < max; i++) {
      if (newsItems[i]) merged.push(newsItems[i]);
      if (alertItems[i]) merged.push(alertItems[i]);
    }
    return merged;
  }, [articles, notifications]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#04080D] text-[#E8ECE9] flex flex-col">
      {/* Full-bleed rotating 3D globe hero */}
      <div className="absolute inset-0">
        <Globe3DView
          vessels={initialTrackedVessels}
          ports={portMapLocations}
          chokepoints={chokepointMarkers}
          monsoonZones={monsoonZones}
          selectedItem={selectedItem}
          highlightedChokepointId={null}
          onSelectVessel={() => {}}
          onSelectPort={() => {}}
          onSelectChokepoint={() => {}}
          layers={HERO_LAYERS}
          theme="tactical_dark"
        />
      </div>

      {/* Vignette so overlay text stays legible over the globe */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(4,8,13,0.55) 75%, rgba(4,8,13,0.92) 100%)'
        }}
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#04080D] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#04080D] to-transparent pointer-events-none" />

      {/* Top nav strip */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-[#BC412B] flex items-center justify-center font-editorial font-bold text-white">
            M.
          </div>
          <div className="leading-tight">
            <span className="font-editorial font-bold text-lg tracking-tight block">MARLIN</span>
            <span className="text-[10px] uppercase tracking-widest text-[#8E9B97] block">Maritime Intelligence</span>
          </div>
        </div>
      </header>

      {/* Live activity ticker: latest news + alerts, auto-scrolling */}
      {tickerItems.length > 0 && (
        <div className="relative z-10 border-y border-[#1E354B]/70 bg-[#0A141E]/60 backdrop-blur-sm overflow-hidden py-2">
          <style>{`
            @keyframes marlin-ticker-scroll {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
          <div
            className="flex items-center gap-10 whitespace-nowrap w-max"
            style={{ animation: 'marlin-ticker-scroll 45s linear infinite' }}
          >
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2 text-[11px] font-mono-data text-[#A3B1AB]">
                <span className={`material-symbols-outlined text-[14px] ${item.kind === 'alert' ? 'text-[#F59E0B]' : 'text-[#00F5D4]'}`}>
                  {item.kind === 'alert' ? 'notifications_active' : 'newspaper'}
                </span>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hero copy + CTA, centered lower-third so the globe stays visually dominant */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-end text-center px-6 pb-16 sm:pb-20 gap-8">
        <div className="max-w-2xl flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1E354B] bg-[#0A141E]/70 backdrop-blur-md text-[11px] font-mono-data text-[#00F5D4]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-ping" />
            Live global fleet & port telemetry
          </span>
          <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight">
            India's dry-bulk imports,<br className="hidden sm:block" /> tracked in real time.
          </h1>
          <p className="font-serif-body text-base sm:text-lg text-[#A3B1AB] max-w-xl">
            MARLIN fuses live AIS fleet positions, port congestion telemetry, and chokepoint risk into one
            chartering decision surface for Indian ports sourcing coal, iron ore, and fertilizer from
            Australia, Indonesia, the Gulf, and Africa.
          </p>
        </div>

        {/* Truthful live stat strip, computed from the same datasets driving the dashboard */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {[
            { label: 'Ships Tracked', value: initialTrackedVessels.length, icon: 'directions_boat' },
            { label: 'Ports Monitored', value: portMapLocations.length, icon: 'anchor' },
            { label: 'Chokepoints Watched', value: chokepointMarkers.length, icon: 'warning' }
          ].map(stat => (
            <div
              key={stat.label}
              className="px-4 py-3 rounded-lg border border-[#1E354B] bg-[#0A141E]/70 backdrop-blur-md flex items-center gap-3 min-w-[160px]"
            >
              <span className="material-symbols-outlined text-[#00F5D4] text-[22px]">{stat.icon}</span>
              <div className="text-left">
                <span className="block text-xl font-mono-data font-extrabold">{stat.value}</span>
                <span className="block text-[10px] uppercase tracking-wider text-[#8E9B97]">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onEnter}
          className="mt-2 px-7 py-3.5 rounded bg-[#BC412B] hover:bg-[#A33420] text-white font-editorial font-bold text-base shadow-2xl flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
        >
          <span>Enter Terminal</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </main>
    </div>
  );
};
