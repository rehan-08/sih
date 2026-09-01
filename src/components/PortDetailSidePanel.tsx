import React, { useState, useMemo } from 'react';
import { PortInfo, CraneItem } from '../types';
import { Sparkline } from './Sparkline';
import { projectTrend } from '../utils/forecast';
import { estimateDailyVesselFlow } from '../data/maritimeData';

interface PortDetailSidePanelProps {
  port: PortInfo;
  isOpen: boolean;
  onClose: () => void;
  onSelectPortForAnalysis?: (portName: string) => void;
}

type TabType = 'overview' | 'congestion' | 'cranes' | 'weather' | 'queue';

export const PortDetailSidePanel: React.FC<PortDetailSidePanelProps> = ({
  port,
  isOpen,
  onClose,
  onSelectPortForAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [hoveredCrane, setHoveredCrane] = useState<CraneItem | null>(null);

  // Project the next 24-48h from live history (6 steps at the ~4-8h cadence the history ticks at).
  // Must run unconditionally (before the `!isOpen` early return below) to satisfy the Rules of Hooks.
  const forecast = useMemo(() => ({
    congestionIndex: port.history ? projectTrend(port.history.congestionIndex, 6, { min: 0, max: 100 }) : [],
    turnaroundHours: port.history ? projectTrend(port.history.turnaroundHours, 6, { min: 0 }) : [],
    waitTimeHours: port.history ? projectTrend(port.history.waitTimeHours, 6, { min: 0 }) : []
  }), [port.history]);

  if (!isOpen) return null;

  const weather = port.weather || {
    condition: 'Moderate Sea Conditions',
    temperatureC: 28,
    windSpeedKnots: 12,
    windDirection: 'SE 12 kts',
    waveHeightM: 1.2,
    visibilityNM: 10,
    tideHeightM: 2.0,
    tideStatus: 'Flood Tide',
    barometricPressureHpa: 1012,
  };

  const congestion = port.congestion || {
    congestionLevel: port.status === 'HIGH' ? 'HIGH' : port.status === 'MODERATE' ? 'MODERATE' : 'LOW',
    congestionIndex: port.status === 'HIGH' ? 85 : port.status === 'MODERATE' ? 65 : 30,
    berthOccupancyPct: port.status === 'HIGH' ? 90 : port.status === 'MODERATE' ? 78 : 45,
    anchorageVesselsCount: port.waitingVessels || 8,
    berthedVesselsCount: port.berths - 2 || 10,
    incomingNext48h: 5,
    trend: port.status === 'HIGH' ? 'Worsening' : 'Stable',
    historicalAverageWaitingVessels: 7.5,
  };

  const turnaround = port.turnaround || {
    avgTurnaroundHours: port.status === 'HIGH' ? 60.0 : port.status === 'MODERATE' ? 45.0 : 25.0,
    avgTurnaroundDays: port.status === 'HIGH' ? 2.5 : port.status === 'MODERATE' ? 1.88 : 1.04,
    historicalNormHours: 35.0,
    avgDischargeRateMTDay: 22000,
    bulkUnloadingEfficiencyPct: 85,
    demurrageRisk: port.status === 'HIGH' ? 'HIGH' : port.status === 'MODERATE' ? 'MODERATE' : 'LOW',
    demurrageCostPerDayUSD: 24000,
    typicalStages: {
      anchorageWaitHours: 15.0,
      pilotageAndMooringHours: 2.5,
      dischargeOperationsHours: 25.0,
      draftSurveyAndClearanceHours: 2.5,
    },
  };

  const cranes = port.cranes || {
    totalCranes: 14,
    activeCranesInUse: 10,
    cranesUnderMaintenance: 2,
    standbyCranes: 2,
    craneUtilizationPct: 71.4,
    avgCranesPerBerth: 2.0,
    totalHandlingCapacityTPH: 14500,
    craneList: [],
  };

  const delays = port.delays || {
    currentWaitTimeHours: port.status === 'HIGH' ? 28.0 : port.status === 'MODERATE' ? 15.0 : 2.0,
    waitTimeRange: port.estDelayHours,
    pilotageDelayHours: 2.0,
    customsClearanceHours: 1.5,
    tidalLockDelayHours: 0.0,
    weatherDelayHours: 2.0,
    projectedDelayTrend: 'Steady',
    waitingVesselsQueue: [],
  };

  const vesselFlow = estimateDailyVesselFlow({ ...port, congestion, turnaround });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleCopySummary = () => {
    const text = `MARLIN PORT DISPATCH - ${port.name.toUpperCase()} PORT (${port.country})
Status: ${port.status} QUEUE | Congestion Index: ${congestion.congestionIndex}/100 (${congestion.congestionLevel})
Anchorage Waiting Vessels: ${congestion.anchorageVesselsCount} | Berthed: ${congestion.berthedVesselsCount}
Daily Vessel Flow: +${vesselFlow.arrivals} arrivals / -${vesselFlow.departures} departures per day
Avg Wait Time: ${delays.currentWaitTimeHours}h (${delays.waitTimeRange})
Avg Turnaround Time: ${turnaround.avgTurnaroundHours}h (${turnaround.avgTurnaroundDays} days) | Discharge Rate: ${turnaround.avgDischargeRateMTDay.toLocaleString()} MT/day
Cranes In Use: ${cranes.activeCranesInUse} of ${cranes.totalCranes} (${cranes.craneUtilizationPct}%)
Weather: ${weather.condition}, ${weather.temperatureC}°C, Wind ${weather.windDirection}, Swell ${weather.waveHeightM}m, Visibility ${weather.visibilityNM} NM
Max Safe Draft: ${port.draftLimitM}m | Max LOA: ${port.maxLOAM}m | Demurrage Risk: ${turnaround.demurrageRisk}
Timestamp: ${new Date().toUTCString()}`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1A1A1A]/60 dark:bg-black/80 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Side-Panel Drawer Container */}
      <div className="w-full max-w-2xl bg-[#F9F7F2] dark:bg-[#0E1620] text-[#1A1A1A] dark:text-[#E8ECE9] h-full shadow-2xl border-l border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Panel Header */}
        <div className="bg-[#FFFFFF] dark:bg-[#121B26] border-b border-[#DDD8CE] dark:border-[#1F2E3E] p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded bg-[#BC412B]/10 dark:bg-[#BC412B]/20 text-[#BC412B] dark:text-[#E05A42] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">anchor</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-editorial text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {port.name} Port
                  </h2>
                  {port.isOptimal && (
                    <span className="px-2 py-0.5 bg-[#2D5A43] text-white text-[10px] font-bold rounded font-mono-data">
                      OPTIMAL WINDOW
                    </span>
                  )}
                  <span className={`text-[10px] font-mono-data px-2 py-0.5 rounded font-bold border ${
                    congestion.congestionLevel === 'CRITICAL' || congestion.congestionLevel === 'HIGH'
                      ? 'bg-[#BC412B]/10 text-[#BC412B] dark:text-[#E05A42] border-[#BC412B]/30'
                      : congestion.congestionLevel === 'MODERATE'
                      ? 'bg-[#8C5E28]/10 text-[#8C5E28] dark:text-[#D4A359] border-[#8C5E28]/30'
                      : 'bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A] border-[#2D5A43]/30'
                  }`}>
                    {congestion.congestionLevel} CONGESTION
                  </span>
                </div>
                <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                  {port.region}, {port.country} · {port.distanceNM.toLocaleString()} NM from Loading Port
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefresh}
                title="Refresh live telemetry sensors"
                className="p-2 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] hover:border-[#BC412B] transition-colors cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[18px] block ${isRefreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
              </button>
              <button
                onClick={handleCopySummary}
                title="Copy Port Telemetry Briefing"
                className="p-2 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] hover:border-[#BC412B] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] block">content_copy</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] text-[#7A7268] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] block">close</span>
              </button>
            </div>
          </div>

          {/* Telemetry live status strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px] font-mono-data">
            <div className="flex items-center gap-2 text-[#7A7268] dark:text-[#8E9B97]">
              <span className="w-2 h-2 rounded-full bg-[#2D5A43] animate-pulse" />
              <span>Telemetry: {port.lastTelemetryUpdate || 'Live Stream Active'}</span>
            </div>
            {copiedNotification && (
              <span className="text-[#2D5A43] dark:text-[#3EB58A] font-bold">
                ✓ Port dispatch memo copied to clipboard!
              </span>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto pt-1 no-scrollbar">
            {[
              { id: 'overview', label: 'Summary', icon: 'dashboard' },
              { id: 'congestion', label: 'Congestion & Delays', icon: 'hourglass_empty' },
              { id: 'cranes', label: `Cranes (${cranes.activeCranesInUse}/${cranes.totalCranes})`, icon: 'precision_manufacturing' },
              { id: 'weather', label: 'Weather & Tide', icon: 'air' },
              { id: 'queue', label: `Queue (${delays.waitingVesselsQueue.length || port.waitingVessels})`, icon: 'view_list' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3 py-1.5 rounded text-xs font-mono-data font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#BC412B] text-white'
                    : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] dark:hover:text-[#E05A42]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Telemetry Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* TAB 1: OVERVIEW SUMMARY */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Primary 4-Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: Live Congestion */}
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#7A7268] dark:text-[#8E9B97] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono-data">Congestion</span>
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">traffic</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {congestion.congestionIndex}/100
                    </span>
                    <span className="block text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB] mt-0.5">
                      {congestion.anchorageVesselsCount} in anchorage
                    </span>
                  </div>
                </div>

                {/* Metric 2: Cranes in Use */}
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#7A7268] dark:text-[#8E9B97] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono-data">Cranes In Use</span>
                    <span className="material-symbols-outlined text-[16px] text-[#243E56] dark:text-[#6494B8]">precision_manufacturing</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {cranes.activeCranesInUse} <span className="text-xs text-[#7A7268] font-normal">/ {cranes.totalCranes}</span>
                    </span>
                    <span className="block text-[11px] font-mono-data font-semibold text-[#2D5A43] dark:text-[#3EB58A] mt-0.5">
                      {cranes.craneUtilizationPct}% Active
                    </span>
                  </div>
                </div>

                {/* Metric 3: Average Wait & Delay */}
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#7A7268] dark:text-[#8E9B97] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono-data">Average Wait</span>
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">timer</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold font-mono-data text-[#BC412B] dark:text-[#E05A42]">
                      {delays.currentWaitTimeHours}h
                    </span>
                    <span className="block text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB] mt-0.5">
                      {delays.waitTimeRange}
                    </span>
                  </div>
                </div>

                {/* Metric 4: Avg Turnaround */}
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#7A7268] dark:text-[#8E9B97] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono-data">Turnaround</span>
                    <span className="material-symbols-outlined text-[16px] text-[#7A7268]">schedule</span>
                  </div>
                  <div>
                    <span className="text-xl font-extrabold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {turnaround.avgTurnaroundDays}d
                    </span>
                    <span className="block text-[11px] font-mono-data text-[#6B645C] dark:text-[#A3B1AB] mt-0.5">
                      ~{turnaround.avgTurnaroundHours} hrs total
                    </span>
                  </div>
                </div>
              </div>

              {/* Live History Trend Card */}
              {port.history && (
                <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#BC412B] text-[18px]">show_chart</span>
                      <h3 className="font-editorial text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                        Live Telemetry Trend
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                      Auto-refreshing every 5s
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                        Congestion Index
                      </span>
                      <Sparkline data={port.history.congestionIndex} forecastData={forecast.congestionIndex} color="#BC412B" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                        Wait Time (hrs)
                      </span>
                      <Sparkline data={port.history.waitTimeHours} forecastData={forecast.waitTimeHours} color="#243E56" />
                    </div>
                  </div>
                  <p className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] italic">
                    Dashed segment = projected next 24-48h trend
                  </p>
                </div>
              )}

              {/* Weather & Hydrography Snapshot Card */}
              <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#BC412B] text-[18px]">thermostat</span>
                    <h3 className="font-editorial text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Harbor Meteorology &amp; Sea State
                    </h3>
                    <span className="text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded bg-[#2D5A43]/10 text-[#2D5A43] dark:bg-[#2D5A43]/20 dark:text-[#3EB58A] border border-[#2D5A43]/30">
                      LIVE · Open-Meteo
                    </span>
                  </div>
                  <span className="text-xs font-mono-data font-semibold text-[#BC412B] dark:text-[#E05A42]">
                    {weather.temperatureC}°C · {weather.condition}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                      Wind Speed &amp; Dir
                    </span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block mt-0.5">
                      {weather.windDirection}
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">({weather.windSpeedKnots} kts)</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                      Swell / Wave Height
                    </span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block mt-0.5">
                      {weather.waveHeightM} meters
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">Outer Roads</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                      Visibility
                    </span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block mt-0.5">
                      {weather.visibilityNM} NM
                    </span>
                    <span className="text-[10px] text-[#2D5A43] dark:text-[#3EB58A]">Clear Fairway</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                      Tidal Status
                    </span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block mt-0.5">
                      +{weather.tideHeightM}m
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">{weather.tideStatus}</span>
                  </div>
                </div>

                {weather.monsoonAlert && (
                  <div className="p-2.5 rounded bg-[#BC412B]/10 border border-[#BC412B]/30 flex items-center gap-2 text-xs text-[#BC412B] dark:text-[#E05A42]">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span className="font-medium font-serif-body">{weather.monsoonAlert}</span>
                  </div>
                )}
              </div>

              {/* Turnaround & Discharging Capacity Section */}
              <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#BC412B] text-[18px]">speed</span>
                    <h3 className="font-editorial text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Discharge Performance &amp; Turnaround Stages
                    </h3>
                  </div>
                  <span className="text-xs font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                    Discharge: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{turnaround.avgDischargeRateMTDay.toLocaleString()} MT/day</strong>
                  </span>
                </div>

                {/* Stage timeline progression */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                    <span>Stage Duration Breakdown</span>
                    <span>Total: {turnaround.avgTurnaroundHours} Hours</span>
                  </div>
                  <div className="w-full h-3 rounded bg-[#EDE8DE] dark:bg-[#1C2834] flex overflow-hidden">
                    <div
                      style={{ width: `${(turnaround.typicalStages.anchorageWaitHours / turnaround.avgTurnaroundHours) * 100}%` }}
                      className="bg-[#BC412B] hover:opacity-90"
                      title={`Anchorage Wait: ${turnaround.typicalStages.anchorageWaitHours}h`}
                    />
                    <div
                      style={{ width: `${(turnaround.typicalStages.pilotageAndMooringHours / turnaround.avgTurnaroundHours) * 100}%` }}
                      className="bg-[#8C5E28] hover:opacity-90"
                      title={`Pilotage & Mooring: ${turnaround.typicalStages.pilotageAndMooringHours}h`}
                    />
                    <div
                      style={{ width: `${(turnaround.typicalStages.dischargeOperationsHours / turnaround.avgTurnaroundHours) * 100}%` }}
                      className="bg-[#2D5A43] hover:opacity-90"
                      title={`Discharge Operations: ${turnaround.typicalStages.dischargeOperationsHours}h`}
                    />
                    <div
                      style={{ width: `${(turnaround.typicalStages.draftSurveyAndClearanceHours / turnaround.avgTurnaroundHours) * 100}%` }}
                      className="bg-[#243E56] hover:opacity-90"
                      title={`Survey & Clearance: ${turnaround.typicalStages.draftSurveyAndClearanceHours}h`}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] font-mono-data">
                    <div className="flex items-center gap-1.5 text-[#BC412B] dark:text-[#E05A42]">
                      <span className="w-2 h-2 rounded-full bg-[#BC412B]" />
                      <span>Wait: {turnaround.typicalStages.anchorageWaitHours}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#8C5E28] dark:text-[#D4A359]">
                      <span className="w-2 h-2 rounded-full bg-[#8C5E28]" />
                      <span>Pilot: {turnaround.typicalStages.pilotageAndMooringHours}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#2D5A43] dark:text-[#3EB58A]">
                      <span className="w-2 h-2 rounded-full bg-[#2D5A43]" />
                      <span>Discharge: {turnaround.typicalStages.dischargeOperationsHours}h</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#243E56] dark:text-[#6494B8]">
                      <span className="w-2 h-2 rounded-full bg-[#243E56]" />
                      <span>Survey: {turnaround.typicalStages.draftSurveyAndClearanceHours}h</span>
                    </div>
                  </div>
                </div>

                {/* Demurrage Risk Indicator */}
                <div className="p-3 rounded bg-[#F4F0E8] dark:bg-[#16202C] flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                      Demurrage Risk Assessment
                    </span>
                    <span className={`font-bold font-mono-data ${
                      turnaround.demurrageRisk === 'SEVERE' || turnaround.demurrageRisk === 'HIGH'
                        ? 'text-[#BC412B] dark:text-[#E05A42]'
                        : turnaround.demurrageRisk === 'MODERATE'
                        ? 'text-[#8C5E28] dark:text-[#D4A359]'
                        : 'text-[#2D5A43] dark:text-[#3EB58A]'
                    }`}>
                      {turnaround.demurrageRisk} RISK (${turnaround.demurrageCostPerDayUSD.toLocaleString()}/day benchmark)
                    </span>
                  </div>
                  <span className="text-right text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB]">
                    Unloading Eff: {turnaround.bulkUnloadingEfficiencyPct}%
                  </span>
                </div>
              </div>

              {/* Hydrographic & Berth Parameters */}
              <div className="p-4 rounded-lg bg-[#EDE8DE] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-2">
                <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] uppercase tracking-wider flex items-center gap-1.5 font-editorial">
                  <span className="material-symbols-outlined text-[#BC412B] text-[18px]">verified</span>
                  <span>Port Hydrographic Limits &amp; Guidance</span>
                </span>
                <p className="text-xs text-[#333333] dark:text-[#A3B1AB] font-serif-body italic leading-relaxed">
                  {port.notes}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
                  <div>
                    <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase block font-semibold">Safe Max Draft</span>
                    <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{port.draftLimitM} m</span>
                  </div>
                  <div>
                    <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase block font-semibold">Max LOA</span>
                    <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{port.maxLOAM} m</span>
                  </div>
                  <div>
                    <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase block font-semibold">Bulk Berths</span>
                    <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{port.berths} Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONGESTION & DELAYS */}
          {activeTab === 'congestion' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Congestion Level & Occupancy Meter */}
              <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#BC412B] dark:text-[#E05A42] block font-mono-data">
                      Anchorage &amp; Fairway Congestion Index
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {congestion.congestionLevel} Congestion State ({congestion.congestionIndex} / 100)
                    </h3>
                  </div>
                  <span className="text-xs font-mono-data font-bold px-2.5 py-1 rounded bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E]">
                    Trend: {congestion.trend}
                  </span>
                </div>

                {port.history && (
                  <div className="pt-1 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] block mb-1">
                      Turnaround Hours (Rolling History + 24-48h Projection)
                    </span>
                    <Sparkline data={port.history.turnaroundHours} forecastData={forecast.turnaroundHours} color="#8C5E28" width={280} height={44} />
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                    <span>Berth Occupancy</span>
                    <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{congestion.berthOccupancyPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#EDE8DE] dark:bg-[#1C2834] overflow-hidden">
                    <div
                      style={{ width: `${congestion.berthOccupancyPct}%` }}
                      className={`h-full rounded-full transition-all ${
                        congestion.berthOccupancyPct > 85 ? 'bg-[#BC412B]' : congestion.berthOccupancyPct > 70 ? 'bg-[#8C5E28]' : 'bg-[#2D5A43]'
                      }`}
                    />
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Waiting at Roads</span>
                    <span className="text-lg font-mono-data font-extrabold text-[#BC412B] dark:text-[#E05A42]">
                      {congestion.anchorageVesselsCount}
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block">Vessels in Queue</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Berthed Vessels</span>
                    <span className="text-lg font-mono-data font-extrabold text-[#243E56] dark:text-[#6494B8]">
                      {congestion.berthedVesselsCount}
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block">Discharging Now</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Next 48h Inbound</span>
                    <span className="text-lg font-mono-data font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      +{congestion.incomingNext48h}
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block">AIS Scheduled</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Daily Arrivals</span>
                    <span className="text-lg font-mono-data font-extrabold text-[#2D5A43] dark:text-[#3EB58A]">
                      +{vesselFlow.arrivals} / day
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block">Entering Port</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#16202C]">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Daily Departures</span>
                    <span className="text-lg font-mono-data font-extrabold text-[#8C5E28] dark:text-[#D4A359]">
                      -{vesselFlow.departures} / day
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block">Sailing / Cleared</span>
                  </div>
                </div>
              </div>

              {/* Delay Drivers Breakdown Card */}
              <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#BC412B] text-[18px]">access_time</span>
                    <h3 className="font-editorial text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Delay Root-Cause Breakdown
                    </h3>
                  </div>
                  <span className="text-xs font-mono-data font-bold text-[#BC412B] dark:text-[#E05A42]">
                    Current Delay: {delays.currentWaitTimeHours} Hours
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono-data mb-1">
                      <span className="text-[#6B645C] dark:text-[#A3B1AB]">Pilotage &amp; Tug Availability Delay</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{delays.pilotageDelayHours} hrs</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EDE8DE] dark:bg-[#1C2834]">
                      <div style={{ width: `${Math.min(100, (delays.pilotageDelayHours / 10) * 100)}%` }} className="h-full bg-[#8C5E28] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono-data mb-1">
                      <span className="text-[#6B645C] dark:text-[#A3B1AB]">Customs, Health &amp; Quarantine Survey</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{delays.customsClearanceHours} hrs</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EDE8DE] dark:bg-[#1C2834]">
                      <div style={{ width: `${Math.min(100, (delays.customsClearanceHours / 10) * 100)}%` }} className="h-full bg-[#243E56] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono-data mb-1">
                      <span className="text-[#6B645C] dark:text-[#A3B1AB]">Tidal Lock / Draft Restriction Stoppages</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{delays.tidalLockDelayHours} hrs</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EDE8DE] dark:bg-[#1C2834]">
                      <div style={{ width: `${Math.min(100, (delays.tidalLockDelayHours / 10) * 100)}%` }} className="h-full bg-[#BC412B] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono-data mb-1">
                      <span className="text-[#6B645C] dark:text-[#A3B1AB]">Monsoon Swell &amp; Weather Buffer</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{delays.weatherDelayHours} hrs</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#EDE8DE] dark:bg-[#1C2834]">
                      <div style={{ width: `${Math.min(100, (delays.weatherDelayHours / 10) * 100)}%` }} className="h-full bg-[#7A7268] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRANES & CARGO HANDLING */}
          {activeTab === 'cranes' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Crane Status KPI Card */}
              <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#243E56] dark:text-[#6494B8] block font-mono-data">
                      Terminal Crane Fleet &amp; Unloader Deployment
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {cranes.activeCranesInUse} of {cranes.totalCranes} Cranes Active ({cranes.craneUtilizationPct}% In Use)
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7268] dark:text-[#8E9B97] block">
                      Total Capacity
                    </span>
                    <span className="text-base font-extrabold font-mono-data text-[#2D5A43] dark:text-[#3EB58A]">
                      {cranes.totalHandlingCapacityTPH.toLocaleString()} TPH
                    </span>
                  </div>
                </div>

                {/* Crane Status Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-data">
                  <div className="p-2.5 rounded bg-[#2D5A43]/10 border border-[#2D5A43]/30 text-[#2D5A43] dark:text-[#3EB58A]">
                    <span className="block text-base font-extrabold">{cranes.activeCranesInUse}</span>
                    <span className="text-[10px] uppercase font-bold">Active in Use</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#BC412B]/10 border border-[#BC412B]/30 text-[#BC412B] dark:text-[#E05A42]">
                    <span className="block text-base font-extrabold">{cranes.cranesUnderMaintenance}</span>
                    <span className="text-[10px] uppercase font-bold">Maintenance</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#7A7268]/10 border border-[#7A7268]/30 text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="block text-base font-extrabold">{cranes.standbyCranes}</span>
                    <span className="text-[10px] uppercase font-bold">Hot Standby</span>
                  </div>
                </div>
              </div>

              {/* Individual Crane Roster */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Quayside Crane &amp; Grab Unloader Roster
                  </h4>
                  <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
                    Avg {cranes.avgCranesPerBerth} cranes/berth
                  </span>
                </div>

                <div className="space-y-2">
                  {cranes.craneList.length > 0 ? (
                    cranes.craneList.map((crane) => (
                      <div
                        key={crane.id}
                        onMouseEnter={() => setHoveredCrane(crane)}
                        onMouseLeave={() => setHoveredCrane(null)}
                        className={`p-3 rounded-lg border text-xs transition-colors flex justify-between items-center ${
                          crane.status === 'ACTIVE'
                            ? 'bg-white dark:bg-[#121B26] border-[#DDD8CE] dark:border-[#1F2E3E]'
                            : crane.status === 'MAINTENANCE'
                            ? 'bg-[#BC412B]/5 dark:bg-[#BC412B]/10 border-[#BC412B]/30'
                            : 'bg-[#F4F0E8] dark:bg-[#16202C] border-[#DDD8CE] dark:border-[#1F2E3E]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${
                            crane.status === 'ACTIVE' ? 'bg-[#2D5A43]' : crane.status === 'MAINTENANCE' ? 'bg-[#BC412B]' : 'bg-[#7A7268]'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-editorial font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                                {crane.name}
                              </span>
                              <span className="text-[10px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                                ({crane.id})
                              </span>
                            </div>
                            <span className="text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB] block">
                              {crane.type} · {crane.berthAssigned}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono-data">
                          <span className={`text-xs font-bold block ${
                            crane.status === 'ACTIVE' ? 'text-[#2D5A43] dark:text-[#3EB58A]' : 'text-[#7A7268] dark:text-[#8E9B97]'
                          }`}>
                            {crane.status === 'ACTIVE' ? `${crane.capacityTPH.toLocaleString()} TPH` : crane.status}
                          </span>
                          <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">
                            Eff: {crane.efficiencyPct}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] text-center text-xs text-[#7A7268]">
                      All mechanized berths equipped with continuous conveyor unloaders.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEATHER & TIDE */}
          {activeTab === 'weather' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#BC412B] dark:text-[#E05A42] block font-mono-data">
                      Live Harbor Environmental Sensors
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {weather.condition}
                    </h3>
                  </div>
                  <span className="text-2xl font-mono-data font-extrabold text-[#BC412B] dark:text-[#E05A42]">
                    {weather.temperatureC}°C
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-[#F4F0E8] dark:bg-[#16202C] space-y-1">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Wind Vectors</span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block">
                      {weather.windDirection}
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">Beaufort Scale 4 (Moderate Breeze)</span>
                  </div>

                  <div className="p-3 rounded bg-[#F4F0E8] dark:bg-[#16202C] space-y-1">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Wave &amp; Swell</span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block">
                      {weather.waveHeightM} m Swell Height
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">Period: 9.5 seconds</span>
                  </div>

                  <div className="p-3 rounded bg-[#F4F0E8] dark:bg-[#16202C] space-y-1">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Tidal Curve</span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block">
                      +{weather.tideHeightM} m ({weather.tideStatus})
                    </span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">Next High Tide in 3.5h</span>
                  </div>

                  <div className="p-3 rounded bg-[#F4F0E8] dark:bg-[#16202C] space-y-1">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Barometer &amp; Vis</span>
                    <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block">
                      {weather.barometricPressureHpa} hPa · {weather.visibilityNM} NM
                    </span>
                    <span className="text-[10px] text-[#2D5A43] dark:text-[#3EB58A]">Safe Fairway Visibility</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WAITING QUEUE ROSTER */}
          {activeTab === 'queue' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-editorial text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Live Anchorage Queue &amp; Berthing Schedule
                  </h3>
                  <span className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                    Vessels currently staged at outer roads awaiting pilot boarding
                  </span>
                </div>
                <span className="text-xs font-mono-data text-[#BC412B] dark:text-[#E05A42] font-bold">
                  {delays.waitingVesselsQueue.length || port.waitingVessels} Vessels
                </span>
              </div>

              <div className="space-y-2.5">
                {delays.waitingVesselsQueue.length > 0 ? (
                  delays.waitingVesselsQueue.map((vessel, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs flex justify-between items-center"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-editorial font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                            {vessel.vesselName}
                          </span>
                          <span className="text-[10px] font-mono-data px-1.5 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB]">
                            {vessel.vesselClass}
                          </span>
                        </div>
                        <p className="text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB]">
                          Cargo: {vessel.cargo} ({vessel.tonnageMT.toLocaleString()} MT) · Staged for {vessel.assignedBerth || 'Berth'}
                        </p>
                      </div>

                      <div className="text-right font-mono-data">
                        <span className="text-xs font-bold text-[#BC412B] dark:text-[#E05A42] block">
                          Waiting: {vessel.waitingSinceHours}h
                        </span>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">
                          ETA Berth: {vessel.etaBerth}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-lg bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] text-center text-xs text-[#7A7268]">
                    No vessels currently exceeding standard queue thresholds. Average wait &lt; 2 hours.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Panel Footer Actions */}
        <div className="bg-[#FFFFFF] dark:bg-[#121B26] border-t border-[#DDD8CE] dark:border-[#1F2E3E] p-4 flex items-center justify-between gap-3">
          <button
            onClick={handleCopySummary}
            className="text-xs font-mono-data font-bold text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Export Telemetry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs font-semibold text-[#1A1A1A] dark:text-[#E8ECE9] hover:bg-[#F4F0E8] dark:hover:bg-[#16202C] cursor-pointer"
            >
              Close
            </button>
            {onSelectPortForAnalysis && (
              <button
                onClick={() => {
                  onSelectPortForAnalysis(port.name);
                  onClose();
                }}
                className="px-4 py-2 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Chartering Analysis</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
