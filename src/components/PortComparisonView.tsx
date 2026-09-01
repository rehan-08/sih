import React, { useState, useEffect, useMemo } from 'react';
import { portIntelligenceData, simulatePortTick } from '../data/maritimeData';
import { fetchBatchWeather } from '../services/weatherService';
import { PortInfo } from '../types';

interface PortComparisonViewProps {
  onNavigateToPorts?: () => void;
}

const METRIC_ROWS: Array<{
  key: string;
  label: string;
  icon: string;
  getValue: (p: PortInfo) => number | null;
  format: (p: PortInfo) => string;
  better: 'lower' | 'higher' | 'none';
}> = [
  {
    key: 'draft',
    label: 'Max Safe Draft',
    icon: 'straighten',
    getValue: p => p.draftLimitM,
    format: p => `${p.draftLimitM} m`,
    better: 'none'
  },
  {
    key: 'loa',
    label: 'Max LOA',
    icon: 'straighten',
    getValue: p => p.maxLOAM,
    format: p => `${p.maxLOAM} m`,
    better: 'none'
  },
  {
    key: 'berths',
    label: 'Bulk Berths',
    icon: 'dock',
    getValue: p => p.berths,
    format: p => `${p.berths}`,
    better: 'higher'
  },
  {
    key: 'congestion',
    label: 'Congestion Index',
    icon: 'traffic',
    getValue: p => p.congestion?.congestionIndex ?? null,
    format: p => p.congestion ? `${p.congestion.congestionIndex}/100 (${p.congestion.congestionLevel})` : 'N/A',
    better: 'lower'
  },
  {
    key: 'occupancy',
    label: 'Berth Occupancy',
    icon: 'inventory_2',
    getValue: p => p.congestion?.berthOccupancyPct ?? null,
    format: p => p.congestion ? `${p.congestion.berthOccupancyPct}%` : 'N/A',
    better: 'lower'
  },
  {
    key: 'turnaround',
    label: 'Avg Turnaround',
    icon: 'schedule',
    getValue: p => p.turnaround?.avgTurnaroundHours ?? null,
    format: p => p.turnaround ? `${p.turnaround.avgTurnaroundHours}h (${p.turnaround.avgTurnaroundDays}d)` : 'N/A',
    better: 'lower'
  },
  {
    key: 'demurrage',
    label: 'Demurrage Risk',
    icon: 'warning',
    getValue: p => {
      const order = { LOW: 0, MODERATE: 1, HIGH: 2, SEVERE: 3 };
      return p.turnaround ? order[p.turnaround.demurrageRisk] : null;
    },
    format: p => p.turnaround?.demurrageRisk ?? 'N/A',
    better: 'lower'
  },
  {
    key: 'crane',
    label: 'Crane Utilization',
    icon: 'precision_manufacturing',
    getValue: p => p.cranes?.craneUtilizationPct ?? null,
    format: p => p.cranes ? `${p.cranes.craneUtilizationPct}%` : 'N/A',
    better: 'higher'
  },
  {
    key: 'wait',
    label: 'Current Wait Time',
    icon: 'timer',
    getValue: p => p.delays?.currentWaitTimeHours ?? null,
    format: p => p.delays ? `${p.delays.currentWaitTimeHours}h` : 'N/A',
    better: 'lower'
  }
];

export const PortComparisonView: React.FC<PortComparisonViewProps> = ({ onNavigateToPorts }) => {
  const [livePorts, setLivePorts] = useState(portIntelligenceData);
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>(['paradip', 'gangavaram', 'haldia']);
  const [highlightBest, setHighlightBest] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePorts(prev => simulatePortTick(prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refreshWeather = async () => {
      try {
        const coords = portIntelligenceData.map(p => p.coordinates || { lat: 0, lng: 0 });
        const results = await fetchBatchWeather(coords);
        if (cancelled) return;
        setLivePorts(prev => prev.map((port, i) => {
          const w = results[i];
          if (!w || !port.weather) return port;
          return {
            ...port,
            weather: {
              ...port.weather,
              condition: w.condition,
              temperatureC: w.temperatureC,
              windSpeedKnots: w.windSpeedKnots,
              windDirection: `${w.compass} ${Math.round(w.windSpeedKnots)} kts`,
              waveHeightM: w.waveHeightM,
              visibilityNM: w.visibilityNM,
              barometricPressureHpa: w.pressureHpa
            }
          };
        }));
      } catch (e) {
        console.debug('Live weather fetch failed, keeping last known values', e);
      }
    };
    refreshWeather();
    const weatherInterval = setInterval(refreshWeather, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(weatherInterval);
    };
  }, []);

  const togglePort = (id: string) => {
    setSelectedPortIds(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // keep at least 2 for a meaningful comparison
        return prev.filter(p => p !== id);
      }
      if (prev.length >= 4) return prev; // cap at 4 columns
      return [...prev, id];
    });
  };

  const selectedPorts = useMemo(
    () => selectedPortIds.map(id => livePorts.find(p => p.id === id)).filter((p): p is PortInfo => !!p),
    [selectedPortIds, livePorts]
  );

  const bestPortIdByMetric = useMemo(() => {
    const result: Record<string, string | null> = {};
    METRIC_ROWS.forEach(row => {
      if (row.better === 'none') {
        result[row.key] = null;
        return;
      }
      let bestId: string | null = null;
      let bestVal: number | null = null;
      selectedPorts.forEach(p => {
        const v = row.getValue(p);
        if (v === null) return;
        if (bestVal === null || (row.better === 'lower' ? v < bestVal : v > bestVal)) {
          bestVal = v;
          bestId = p.id;
        }
      });
      result[row.key] = bestId;
    });
    return result;
  }, [selectedPorts]);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <button
          onClick={onNavigateToPorts}
          className="hover:text-[#BC412B] dark:hover:text-[#E05A42] hover:underline cursor-pointer"
        >
          Infrastructure Directory
        </button>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">Port-vs-Port Comparison</span>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold font-mono-data">
              Terminal Benchmarking
            </span>
            <span className="px-2 py-0.2 bg-[#2D5A43] text-white text-[10px] font-bold rounded font-mono-data">
              LIVE COMPARATIVE ENGINE
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Port-vs-Port Comparison
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Side-by-side congestion, turnaround, crane, and live weather telemetry across 2-4 terminals
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded px-3 py-2 cursor-pointer shadow-2xs">
          <input
            type="checkbox"
            checked={highlightBest}
            onChange={() => setHighlightBest(v => !v)}
            className="accent-[#BC412B] cursor-pointer"
          />
          Highlight Best Value
        </label>
      </div>

      {/* Port Selector */}
      <div className="bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#BC412B] text-[18px]">anchor</span>
            <span>Select Ports to Compare ({selectedPorts.length} of 4 max)</span>
          </span>
          <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic block">
            Pick 2-4 terminals — live congestion, crane, and weather telemetry updates automatically
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {livePorts.map(port => {
            const isChecked = selectedPortIds.includes(port.id);
            return (
              <div
                key={port.id}
                onClick={() => togglePort(port.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all text-center flex flex-col items-center gap-1 ${
                  isChecked
                    ? 'bg-[#BC412B]/10 border-[#BC412B] dark:bg-[#BC412B]/20'
                    : 'bg-[#F4F0E8] dark:bg-[#16202C] border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B]/50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-[#BC412B] dark:text-[#E05A42]">anchor</span>
                <span className="text-[11px] font-bold font-editorial leading-tight">{port.name}</span>
                <span className="text-[9px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data">{port.country}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <th className="text-left p-3 font-mono-data text-[10px] uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97]">Metric</th>
              {selectedPorts.map(p => (
                <th key={p.id} className="text-left p-3 font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  {p.name}
                  <span className="block text-[10px] font-mono-data font-normal text-[#7A7268] dark:text-[#8E9B97]">{p.country}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRIC_ROWS.map(row => (
              <tr key={row.key} className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] last:border-0">
                <td className="p-3 font-mono-data font-semibold text-[#6B645C] dark:text-[#A3B1AB] flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px] text-[#BC412B]">{row.icon}</span>
                  {row.label}
                </td>
                {selectedPorts.map(p => {
                  const isBest = highlightBest && bestPortIdByMetric[row.key] === p.id;
                  return (
                    <td
                      key={p.id}
                      className={`p-3 font-mono-data ${
                        isBest ? 'bg-[#2D5A43]/10 dark:bg-[#2D5A43]/20 text-[#2D5A43] dark:text-[#3EB58A] font-bold' : 'text-[#1A1A1A] dark:text-[#E8ECE9]'
                      }`}
                    >
                      {row.format(p)}
                      {isBest && <span className="material-symbols-outlined text-[12px] align-middle ml-1">check_circle</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Live weather snapshot row, sourced from Open-Meteo */}
            <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] last:border-0 bg-[#F4F0E8]/50 dark:bg-[#16202C]/50">
              <td className="p-3 font-mono-data font-semibold text-[#6B645C] dark:text-[#A3B1AB] flex items-center gap-1.5 whitespace-nowrap">
                <span className="material-symbols-outlined text-[14px] text-[#2D5A43]">thermostat</span>
                Live Weather
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#2D5A43]/10 text-[#2D5A43] dark:bg-[#2D5A43]/20 dark:text-[#3EB58A] border border-[#2D5A43]/30">
                  Open-Meteo
                </span>
              </td>
              {selectedPorts.map(p => (
                <td key={p.id} className="p-3 font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                  {p.weather ? `${p.weather.temperatureC}°C · ${p.weather.windDirection} · ${p.weather.waveHeightM}m swell` : 'N/A'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
