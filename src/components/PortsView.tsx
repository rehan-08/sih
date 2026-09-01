import React, { useState, useEffect } from 'react';
import { portIntelligenceData, simulatePortTick, estimateDailyVesselFlow } from '../data/maritimeData';
import { PortInfo } from '../types';
import { PortDetailSidePanel } from './PortDetailSidePanel';
import { usePortAlerts } from '../context/PortAlertContext';
import { fetchBatchWeather } from '../services/weatherService';

interface PortsViewProps {
  onSelectPortForAnalysis?: (portName: string) => void;
  onNavigateToComparison?: () => void;
}

type CongestionFilter = 'ALL' | 'NORMAL' | 'MODERATE' | 'HIGH';

export const PortsView: React.FC<PortsViewProps> = ({ onSelectPortForAnalysis, onNavigateToComparison }) => {
  const {
    subscriptions,
    toggleSubscription,
    openSubscriptionModal,
    openAlertCenter,
    notifications,
    unreadCount,
    simulatePortAlert,
    triggerPredefinedScenario
  } = usePortAlerts();

  const [selectedPortId, setSelectedPortId] = useState<string>('paradip');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [filterCongestion, setFilterCongestion] = useState<CongestionFilter>('ALL');
  const [onlySubscribed, setOnlySubscribed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePopover, setActivePopover] = useState<{ portId: string; type: 'weather' | 'cranes' | 'delays' | 'congestion' } | null>(null);

  // Live-ticking port telemetry (mirrors the vessel simulation loop in WorldMonitorMap)
  const [livePorts, setLivePorts] = useState(portIntelligenceData);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePorts(prev => simulatePortTick(prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real live weather (Open-Meteo, free/keyless) for every port's fixed coordinates.
  // Port operational metrics (congestion, cranes, delays) stay simulated above.
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

  const selectedPort = livePorts.find((p) => p.id === selectedPortId) || livePorts[0];
  const selectedPortVesselFlow = estimateDailyVesselFlow(selectedPort);
  const selectedPortSub = subscriptions[selectedPort.id];
  const isSelectedPortSubscribed = selectedPortSub?.isSubscribed ?? false;

  // Find active alerts for the selected port
  const selectedPortAlerts = notifications.filter(n => n.portId === selectedPort.id);

  const filteredPorts = livePorts.filter((port) => {
    const matchesSearch =
      port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterCongestion === 'ALL' || port.status === filterCongestion;
    const matchesSubscribed = !onlySubscribed || (subscriptions[port.id]?.isSubscribed ?? false);

    return matchesSearch && matchesFilter && matchesSubscribed;
  });

  const handleOpenSidePanel = (portId?: string) => {
    if (portId) {
      setSelectedPortId(portId);
    }
    setIsSidePanelOpen(true);
  };

  const totalSubscribedPorts = Object.values(subscriptions).filter(s => s.isSubscribed).length;
  const criticalAlertsCount = notifications.filter(n => n.severity === 'CRITICAL').length;

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Infrastructure Directory</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">Ports &amp; Terminals Telemetry</span>
      </div>

      {/* Header & Controls */}
      <div className="pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold">
              Harbor Hydrography, Berthing &amp; Crane Operations
            </span>
            <span className="w-2 h-2 rounded-full bg-[#2D5A43] animate-pulse" />
            <span className="text-[11px] font-mono-data text-[#2D5A43] dark:text-[#3EB58A] font-semibold">
              Live AIS &amp; VTS Telemetry
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Port Logistics &amp; Congestion Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Real-time terminal congestion levels, weather conditions, average turnaround times, crane utilization, and anchorage wait times
          </p>
        </div>

        {/* Global Action to Open Side-Panel & Alert Center */}
        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToComparison && (
            <button
              onClick={onNavigateToComparison}
              className="px-3.5 py-2.5 rounded bg-white dark:bg-[#16202C] hover:bg-[#EDE8DE] dark:hover:bg-[#1F2E3E] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] text-xs font-mono-data font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-[#BC412B] dark:text-[#E05A42]">compare_arrows</span>
              <span>Compare Ports</span>
            </button>
          )}

          <button
            onClick={() => openSubscriptionModal(selectedPort.id)}
            className="px-3.5 py-2.5 rounded bg-white dark:bg-[#16202C] hover:bg-[#EDE8DE] dark:hover:bg-[#1F2E3E] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] text-xs font-mono-data font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#BC412B] dark:text-[#E05A42]">tune</span>
            <span>Alert Subscriptions</span>
          </button>

          <button
            onClick={() => handleOpenSidePanel(selectedPort.id)}
            className="px-4 py-2.5 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">dock_to_left</span>
            <span>Open {selectedPort.name} Telemetry Panel</span>
          </button>
        </div>
      </div>

      {/* Port Alert Subscriptions Overview Bar */}
      <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#BC412B]/10 dark:bg-[#BC412B]/20 flex items-center justify-center text-[#BC412B] dark:text-[#E05A42] shrink-0">
            <span className="material-symbols-outlined text-[20px]">notifications_active</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-sm sm:text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                Port Alert Push Subscription System
              </span>
              <span className="px-2 py-0.2 rounded text-[10px] font-mono-data font-bold bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A]">
                {totalSubscribedPorts} Monitored
              </span>
            </div>
            <p className="text-xs text-[#6B645C] dark:text-[#8E9B97] font-serif-body">
              Receive instant push-style alerts when turnaround times spike &gt;25% or unexpected berth/channel closures occur.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openAlertCenter}
            className="px-3 py-1.5 rounded bg-[#F4F0E8] dark:bg-[#16202C] hover:bg-[#EDE8DE] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#BC412B] dark:text-[#E05A42]">history</span>
            <span>Alert Center ({notifications.length})</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#BC412B] text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => triggerPredefinedScenario('paradip_closure')}
            className="px-3 py-1.5 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-mono-data font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
            title="Simulate a real-time push alert"
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>Test Push Alert</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] dark:bg-[#121B26] p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7268] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search port name, terminal, or draft limitations..."
            className="w-full pl-9 pr-3 py-1.5 rounded bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs focus:outline-hidden focus:border-[#BC412B] text-[#1A1A1A] dark:text-[#E8ECE9] placeholder-[#7A7268]"
          />
        </div>

        {/* Subscribed Only & Congestion Filters */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono-data">
          <button
            onClick={() => setOnlySubscribed(!onlySubscribed)}
            className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              onlySubscribed
                ? 'bg-[#2D5A43] text-white border-[#2D5A43]'
                : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] border-[#DDD8CE] dark:border-[#1F2E3E] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {onlySubscribed ? 'notifications_active' : 'notifications'}
            </span>
            <span>Subscribed Only ({totalSubscribedPorts})</span>
          </button>

          <div className="h-4 w-px bg-[#DDD8CE] dark:bg-[#1F2E3E]" />

          <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97] mr-1">Congestion:</span>
          {(['ALL', 'NORMAL', 'MODERATE', 'HIGH'] as CongestionFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterCongestion(filter)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                filterCongestion === filter
                  ? 'bg-[#BC412B] text-white'
                  : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              {filter === 'ALL' ? 'All Ports' : `${filter} Queue`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Ports List & Deep Dive View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Ports List with Quick Telemetry Chips (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
              Terminals ({filteredPorts.length})
            </span>
            <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
              Click port card to inspect telemetry
            </span>
          </div>

          {filteredPorts.map((port) => {
            const isSelected = selectedPortId === port.id;
            const weather = port.weather;
            const cranes = port.cranes;
            const delays = port.delays;
            const turnaround = port.turnaround;
            const sub = subscriptions[port.id];
            const isSubscribed = sub?.isSubscribed ?? false;
            const portAlerts = notifications.filter(n => n.portId === port.id);
            const hasCriticalAlert = portAlerts.some(n => n.severity === 'CRITICAL');

            return (
              <div
                key={port.id}
                onClick={() => setSelectedPortId(port.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col gap-3 relative group ${
                  isSelected
                    ? 'bg-[#EDE8DE] dark:bg-[#1A2634] border-[#BC412B] shadow-sm'
                    : 'bg-white dark:bg-[#121B26] border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B]/40 hover:bg-[#F4F0E8] dark:hover:bg-[#16202C]'
                }`}
              >
                {/* Port Title, Status & Subscription Action */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px]">
                      anchor
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-editorial font-bold text-base text-[#1A1A1A] dark:text-[#E8ECE9]">
                          {port.name}
                        </span>
                        {port.isOptimal && (
                          <span className="px-1.5 py-0.2 bg-[#2D5A43] text-white text-[9px] font-bold rounded font-mono-data">
                            OPTIMAL
                          </span>
                        )}
                        {hasCriticalAlert && (
                          <span className="px-1.5 py-0.2 bg-[#BC412B] text-white text-[9px] font-bold rounded font-mono-data animate-pulse">
                            ACTIVE ALERT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic block">
                        {port.region} · {port.distanceNM.toLocaleString()} NM
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Subscription Toggle Pill */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubscription(port.id, port.name);
                      }}
                      title={isSubscribed ? 'Alerts active. Click to mute' : 'Muted. Click to subscribe to alerts'}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                        isSubscribed
                          ? 'bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A] border-[#2D5A43]/30 hover:bg-[#2D5A43]/25'
                          : 'bg-[#EDE8DE] dark:bg-[#16202C] text-[#7A7268] border-[#DDD8CE] dark:border-[#1F2E3E] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isSubscribed ? 'notifications_active' : 'notifications_off'}
                      </span>
                      <span>{isSubscribed ? 'Alerts ON' : 'Muted'}</span>
                    </button>

                    <span className={`text-[10px] font-mono-data px-2 py-0.5 rounded font-bold border ${
                      port.status === 'HIGH'
                        ? 'bg-[#BC412B]/10 text-[#BC412B] dark:text-[#E05A42] border-[#BC412B]/30'
                        : port.status === 'MODERATE'
                        ? 'bg-[#8C5E28]/10 text-[#8C5E28] dark:text-[#D4A359] border-[#8C5E28]/30'
                        : 'bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A] border-[#2D5A43]/30'
                    }`}>
                      {port.status} QUEUE
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSidePanel(port.id);
                      }}
                      title="Open full telemetry side panel"
                      className="p-1 rounded text-[#7A7268] hover:text-[#BC412B] hover:bg-[#DDD8CE] dark:hover:bg-[#1F2E3E]"
                    >
                      <span className="material-symbols-outlined text-[16px] block">open_in_new</span>
                    </button>
                  </div>
                </div>

                {/* Primary Telemetry Summary Grid */}
                <div className="grid grid-cols-4 gap-1.5 text-xs pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-[#7A7268] dark:text-[#8E9B97]">
                  {/* Wait Time */}
                  <div className="bg-[#F4F0E8]/70 dark:bg-[#16202C]/70 p-1.5 rounded">
                    <span className="block text-[8px] uppercase font-bold tracking-wider font-mono-data">Wait Time</span>
                    <span className="font-mono-data font-extrabold text-xs text-[#BC412B] dark:text-[#E05A42]">
                      {delays?.currentWaitTimeHours || 14}h
                    </span>
                  </div>

                  {/* Cranes in Use */}
                  <div className="bg-[#F4F0E8]/70 dark:bg-[#16202C]/70 p-1.5 rounded">
                    <span className="block text-[8px] uppercase font-bold tracking-wider font-mono-data">Cranes In Use</span>
                    <span className="font-mono-data font-bold text-xs text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {cranes?.activeCranesInUse || 10}/{cranes?.totalCranes || 14}
                    </span>
                  </div>

                  {/* Turnaround */}
                  <div className="bg-[#F4F0E8]/70 dark:bg-[#16202C]/70 p-1.5 rounded">
                    <span className="block text-[8px] uppercase font-bold tracking-wider font-mono-data">Turnaround</span>
                    <span className="font-mono-data font-bold text-xs text-[#1A1A1A] dark:text-[#E8ECE9]">
                      {turnaround?.avgTurnaroundDays || 1.8}d
                    </span>
                  </div>

                  {/* Weather Condition */}
                  <div className="bg-[#F4F0E8]/70 dark:bg-[#16202C]/70 p-1.5 rounded">
                    <span className="block text-[8px] uppercase font-bold tracking-wider font-mono-data">Weather</span>
                    <span className="font-mono-data font-bold text-xs text-[#243E56] dark:text-[#6494B8]">
                      {weather?.temperatureC || 28}°C · {weather?.waveHeightM || 1.2}m
                    </span>
                  </div>
                </div>

                {/* Quick interactive popover tags */}
                <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono-data">
                  {/* Weather popover trigger */}
                  <div className="relative">
                    <button
                      onMouseEnter={() => setActivePopover({ portId: port.id, type: 'weather' })}
                      onMouseLeave={() => setActivePopover(null)}
                      className="px-2 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">air</span>
                      <span>{weather?.windDirection || '12 kts'}</span>
                    </button>

                    {/* Popover Card on hover */}
                    {activePopover?.portId === port.id && activePopover?.type === 'weather' && (
                      <div className="absolute left-0 bottom-full mb-1 z-30 w-56 p-2.5 rounded-lg bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="font-bold font-editorial text-[#1A1A1A] dark:text-[#E8ECE9] border-b border-[#DDD8CE] dark:border-[#1F2E3E] pb-1 flex justify-between">
                          <span>{port.name} Weather</span>
                          <span className="text-[#BC412B]">{weather?.temperatureC}°C</span>
                        </div>
                        <p className="text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB]">
                          {weather?.condition}
                        </p>
                        <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 text-[#7A7268] dark:text-[#8E9B97]">
                          <div>Wind: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{weather?.windDirection}</strong></div>
                          <div>Swell: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{weather?.waveHeightM}m</strong></div>
                          <div>Tide: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">+{weather?.tideHeightM}m</strong></div>
                          <div>Vis: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{weather?.visibilityNM} NM</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Crane popover trigger */}
                  <div className="relative">
                    <button
                      onMouseEnter={() => setActivePopover({ portId: port.id, type: 'cranes' })}
                      onMouseLeave={() => setActivePopover(null)}
                      className="px-2 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#2D5A43] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">precision_manufacturing</span>
                      <span>{cranes?.craneUtilizationPct || 75}% Active</span>
                    </button>

                    {/* Popover Card on hover */}
                    {activePopover?.portId === port.id && activePopover?.type === 'cranes' && (
                      <div className="absolute left-0 bottom-full mb-1 z-30 w-56 p-2.5 rounded-lg bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="font-bold font-editorial text-[#1A1A1A] dark:text-[#E8ECE9] border-b border-[#DDD8CE] dark:border-[#1F2E3E] pb-1 flex justify-between">
                          <span>Crane Fleet Status</span>
                          <span className="text-[#2D5A43]">{cranes?.activeCranesInUse}/{cranes?.totalCranes} In Use</span>
                        </div>
                        <div className="space-y-1 text-[10px] pt-1 text-[#7A7268] dark:text-[#8E9B97]">
                          <div>• Utilization: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{cranes?.craneUtilizationPct}% Active</strong></div>
                          <div>• Maintenance: <strong className="text-[#BC412B]">{cranes?.cranesUnderMaintenance} Cranes</strong></div>
                          <div>• Capacity: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{cranes?.totalHandlingCapacityTPH.toLocaleString()} TPH</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delay popover trigger */}
                  <div className="relative">
                    <button
                      onMouseEnter={() => setActivePopover({ portId: port.id, type: 'delays' })}
                      onMouseLeave={() => setActivePopover(null)}
                      className="px-2 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#BC412B] flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[12px]">timer</span>
                      <span>Queue: {port.waitingVessels} Bulkers</span>
                    </button>

                    {/* Popover Card on hover */}
                    {activePopover?.portId === port.id && activePopover?.type === 'delays' && (
                      <div className="absolute left-0 bottom-full mb-1 z-30 w-56 p-2.5 rounded-lg bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-xl text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                        <div className="font-bold font-editorial text-[#1A1A1A] dark:text-[#E8ECE9] border-b border-[#DDD8CE] dark:border-[#1F2E3E] pb-1 flex justify-between">
                          <span>Anchorage Delays</span>
                          <span className="text-[#BC412B]">{delays?.currentWaitTimeHours}h Wait</span>
                        </div>
                        <div className="space-y-1 text-[10px] pt-1 text-[#7A7268] dark:text-[#8E9B97]">
                          <div>• Pilotage delay: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{delays?.pilotageDelayHours} hrs</strong></div>
                          <div>• Customs survey: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">{delays?.customsClearanceHours} hrs</strong></div>
                          <div>• Demurrage Risk: <strong className="text-[#BC412B]">{turnaround?.demurrageRisk}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep-dive Telemetry on Selected Port (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-6 shadow-sm flex flex-col gap-6">
            
            {/* Header with Title & CTA */}
            <div className="flex justify-between items-start pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {selectedPort.name} Port
                  </h2>
                  {selectedPort.isOptimal && (
                    <span className="px-2 py-0.5 bg-[#2D5A43] text-white text-[10px] font-bold rounded font-mono-data">
                      OPTIMAL DISCHARGE
                    </span>
                  )}
                  <span className={`text-[10px] font-mono-data px-2 py-0.5 rounded font-bold border ${
                    selectedPort.status === 'HIGH'
                      ? 'bg-[#BC412B]/10 text-[#BC412B] dark:text-[#E05A42] border-[#BC412B]/30'
                      : selectedPort.status === 'MODERATE'
                      ? 'bg-[#8C5E28]/10 text-[#8C5E28] dark:text-[#D4A359] border-[#8C5E28]/30'
                      : 'bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A] border-[#2D5A43]/30'
                  }`}>
                    {selectedPort.status} QUEUE
                  </span>
                </div>
                <span className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                  {selectedPort.region}, {selectedPort.country} · {selectedPort.distanceNM.toLocaleString()} NM Distance
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSubscriptionModal(selectedPort.id)}
                  className="px-3 py-1.5 rounded bg-white dark:bg-[#16202C] hover:bg-[#EDE8DE] text-xs font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] border border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Configure alert thresholds for this port"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#BC412B] dark:text-[#E05A42]">tune</span>
                  <span>Alert Rules</span>
                </button>

                <button
                  onClick={() => handleOpenSidePanel(selectedPort.id)}
                  className="px-3.5 py-1.5 rounded bg-[#EDE8DE] dark:bg-[#1C2834] hover:bg-[#BC412B] hover:text-white text-xs font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] border border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">dock_to_left</span>
                  <span>Side-Panel</span>
                </button>
              </div>
            </div>

            {/* Active Port Alert Banner (if incident present) */}
            {selectedPortAlerts.length > 0 && (
              <div className="p-4 rounded-lg bg-[#BC412B]/10 dark:bg-[#BC412B]/15 border border-[#BC412B]/30 flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono-data font-bold uppercase tracking-wider text-[#BC412B] dark:text-[#E05A42] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Active Port Incident Telemetry</span>
                  </span>
                  <span className="text-[10px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                    {selectedPortAlerts[0].timestamp}
                  </span>
                </div>
                <h4 className="font-editorial font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-[#E8ECE9]">
                  {selectedPortAlerts[0].title}
                </h4>
                <p className="text-xs text-[#4A433A] dark:text-[#B0BCB6] font-serif-body">
                  {selectedPortAlerts[0].message}
                </p>
                {selectedPortAlerts[0].actionRecommendation && (
                  <div className="mt-1 pt-2 border-t border-[#BC412B]/20 text-[11px] font-mono-data text-[#BC412B] dark:text-[#E05A42]">
                    {selectedPortAlerts[0].actionRecommendation}
                  </div>
                )}
              </div>
            )}

            {/* Port Alert Subscription Quick Widget */}
            <div className="p-3.5 rounded-lg bg-[#F9F7F2] dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-data">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px]">
                  {isSelectedPortSubscribed ? 'notifications_active' : 'notifications_off'}
                </span>
                <div>
                  <span className="font-bold block text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Alert Status: {isSelectedPortSubscribed ? 'Subscribed to Push Alerts' : 'Notifications Muted'}
                  </span>
                  <span className="text-[10px] text-[#6B645C] dark:text-[#8E9B97]">
                    Surge Threshold: +{selectedPortSub?.thresholds.turnaroundSurgePct || 25}% | Cap: {selectedPortSub?.thresholds.turnaroundHoursMax || 48}h
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSubscription(selectedPort.id, selectedPort.name)}
                  className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                    isSelectedPortSubscribed
                      ? 'bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A] border border-[#2D5A43]/30 hover:bg-[#2D5A43]/25'
                      : 'bg-[#BC412B] text-white hover:bg-[#A33420]'
                  }`}
                >
                  {isSelectedPortSubscribed ? '✓ Subscribed' : '+ Subscribe to Port'}
                </button>
              </div>
            </div>

            {/* LIVE 5-CORE TELEMETRY SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold font-mono-data">
                  1. Live Port Congestion, Weather &amp; Operations
                </span>
                <span className="text-[11px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                  Updated: {selectedPort.lastTelemetryUpdate || 'Live AIS'}
                </span>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                
                {/* Congestion Level */}
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between items-center text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Congestion Index</span>
                    <span className="material-symbols-outlined text-[14px] text-[#BC412B]">traffic</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-0.5 block">
                    {selectedPort.congestion?.congestionIndex || 68}/100
                  </span>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic block">
                    {selectedPort.congestion?.anchorageVesselsCount || selectedPort.waitingVessels} at anchorage
                  </span>
                </div>

                {/* Cranes in Use */}
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between items-center text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Cranes In Use</span>
                    <span className="material-symbols-outlined text-[14px] text-[#243E56] dark:text-[#6494B8]">precision_manufacturing</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-0.5 block">
                    {selectedPort.cranes?.activeCranesInUse || 12} / {selectedPort.cranes?.totalCranes || 16}
                  </span>
                  <span className="text-[10px] text-[#2D5A43] dark:text-[#3EB58A] font-mono-data font-bold block">
                    {selectedPort.cranes?.craneUtilizationPct || 75}% Active Fleet
                  </span>
                </div>

                {/* Delay and Wait Time */}
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between items-center text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Delay &amp; Wait</span>
                    <span className="material-symbols-outlined text-[14px] text-[#BC412B]">timer</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#BC412B] dark:text-[#E05A42] font-mono-data mt-0.5 block">
                    {selectedPort.delays?.currentWaitTimeHours || 16.5}h
                  </span>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic block">
                    {selectedPort.delays?.waitTimeRange || selectedPort.estDelayHours}
                  </span>
                </div>

                {/* Turnaround Time */}
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between items-center text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Avg Turnaround</span>
                    <span className="material-symbols-outlined text-[14px] text-[#7A7268]">schedule</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-0.5 block">
                    {selectedPort.turnaround?.avgTurnaroundDays || 1.85} Days
                  </span>
                  <span className="text-[10px] text-[#6B645C] dark:text-[#A3B1AB] font-mono-data block">
                    ~{selectedPort.turnaround?.avgTurnaroundHours || 44.5} hrs total
                  </span>
                </div>

                {/* Daily Arrivals */}
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between items-center text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Daily Arrivals</span>
                    <span className="material-symbols-outlined text-[14px] text-[#2D5A43] dark:text-[#3EB58A]">south_west</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#2D5A43] dark:text-[#3EB58A] font-mono-data mt-0.5 block">
                    +{selectedPortVesselFlow.arrivals} / day
                  </span>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic block">
                    Vessels entering port
                  </span>
                </div>

                {/* Daily Departures */}
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <div className="flex justify-between items-center text-[#7A7268] dark:text-[#8E9B97]">
                    <span className="text-[9px] uppercase font-bold tracking-wider">Daily Departures</span>
                    <span className="material-symbols-outlined text-[14px] text-[#8C5E28] dark:text-[#D4A359]">north_east</span>
                  </div>
                  <span className="text-lg font-extrabold text-[#8C5E28] dark:text-[#D4A359] font-mono-data mt-0.5 block">
                    -{selectedPortVesselFlow.departures} / day
                  </span>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic block">
                    Vessels sailing / cleared
                  </span>
                </div>
              </div>
            </div>

            {/* LIVE WEATHER CONDITIONS & TIDE BLOCK */}
            <div className="p-4 rounded-lg bg-[#F9F7F2] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">
                    air
                  </span>
                  <span className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Live Harbor Meteorology &amp; Hydrography
                  </span>
                </div>
                <span className="text-xs font-mono-data font-bold text-[#BC412B] dark:text-[#E05A42]">
                  {selectedPort.weather?.condition || 'Monsoon Squalls'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Ambient Temp</span>
                  <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {selectedPort.weather?.temperatureC || 29}°C
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Wind Vector</span>
                  <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {selectedPort.weather?.windDirection || 'SSW 19 kts'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Swell / Wave</span>
                  <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {selectedPort.weather?.waveHeightM || 2.2} meters
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Tide &amp; Vis</span>
                  <span className="font-mono-data font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                    +{selectedPort.weather?.tideHeightM || 2.8}m ({selectedPort.weather?.visibilityNM || 7.5} NM)
                  </span>
                </div>
              </div>

              {selectedPort.weather?.monsoonAlert && (
                <div className="p-2 rounded bg-[#BC412B]/10 border border-[#BC412B]/30 text-xs text-[#BC412B] dark:text-[#E05A42] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  <span className="font-serif-body italic">{selectedPort.weather.monsoonAlert}</span>
                </div>
              )}
            </div>

            {/* CRANE DEPLOYMENT & DISCHARGE EFFICIENCY */}
            <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2D5A43] dark:text-[#3EB58A] text-[18px]">
                    precision_manufacturing
                  </span>
                  <span className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Quay Cranes &amp; Continuous Unloader Fleet
                  </span>
                </div>
                <span className="text-xs font-mono-data text-[#2D5A43] dark:text-[#3EB58A] font-bold">
                  {selectedPort.cranes?.activeCranesInUse || 12} of {selectedPort.cranes?.totalCranes || 16} Cranes In Use ({selectedPort.cranes?.craneUtilizationPct || 75}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono-data">
                <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#121B26]">
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Active In Use</span>
                  <span className="text-base font-extrabold text-[#2D5A43] dark:text-[#3EB58A]">
                    {selectedPort.cranes?.activeCranesInUse || 12} Cranes
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#121B26]">
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">In Maintenance</span>
                  <span className="text-base font-extrabold text-[#BC412B] dark:text-[#E05A42]">
                    {selectedPort.cranes?.cranesUnderMaintenance || 2} Cranes
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#F4F0E8] dark:bg-[#121B26]">
                  <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] uppercase font-bold block">Discharge Rate</span>
                  <span className="text-base font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    ~{selectedPort.turnaround?.avgDischargeRateMTDay.toLocaleString() || '21,500'} MT/d
                  </span>
                </div>
              </div>

              {/* Sample active cranes */}
              {selectedPort.cranes?.craneList && selectedPort.cranes.craneList.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">
                    Active Berth Unloaders:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPort.cranes.craneList.slice(0, 4).map((crane) => (
                      <div
                        key={crane.id}
                        className="p-2 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F9F7F2] dark:bg-[#121B26] text-xs flex justify-between items-center"
                      >
                        <div>
                          <span className="font-bold font-editorial text-xs text-[#1A1A1A] dark:text-[#E8ECE9] block">
                            {crane.name}
                          </span>
                          <span className="text-[10px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                            {crane.berthAssigned}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono-data font-bold px-1.5 py-0.5 rounded ${
                          crane.status === 'ACTIVE' ? 'bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A]' : 'bg-[#BC412B]/10 text-[#BC412B]'
                        }`}>
                          {crane.status === 'ACTIVE' ? `${crane.capacityTPH} TPH` : crane.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Operational Notes & Guidance */}
            <div className="bg-[#EDE8DE] dark:bg-[#16202C] p-4 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-2">
              <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] uppercase tracking-wider flex items-center gap-1.5 font-editorial">
                <span className="material-symbols-outlined text-[#BC412B] text-[18px]">info</span>
                <span>Operational Intelligence &amp; Berth Guidance</span>
              </span>
              <p className="text-xs text-[#333333] dark:text-[#A3B1AB] font-serif-body italic leading-relaxed">
                {selectedPort.notes}
              </p>
            </div>

            {/* Discharging equipment notes */}
            <div className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body space-y-1.5 pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div>• <strong>Average Turnaround Time:</strong> {selectedPort.turnaround?.avgTurnaroundHours || 44.5} hours (~{selectedPort.turnaround?.avgTurnaroundDays || 1.85} days) vs 30-day baseline</div>
              <div>• <strong>Compulsory Pilotage:</strong> Boarding ~2.5 NM outside fairway buoy (Pilot delay ~{selectedPort.delays?.pilotageDelayHours || 2.5}h)</div>
              <div>• <strong>Demurrage Assessment:</strong> {selectedPort.turnaround?.demurrageRisk || 'MODERATE'} Risk Benchmark (${selectedPort.turnaround?.demurrageCostPerDayUSD.toLocaleString() || '24,000'}/day)</div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
              <button
                onClick={() => handleOpenSidePanel(selectedPort.id)}
                className="text-xs font-mono-data font-bold text-[#BC412B] dark:text-[#E05A42] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Telemetry Side-Panel Drawer</span>
                <span className="material-symbols-outlined text-[16px]">dock_to_left</span>
              </button>

              {onSelectPortForAnalysis && (
                <button
                  onClick={() => onSelectPortForAnalysis(selectedPort.name)}
                  className="px-4 py-2 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Chartering Analysis for {selectedPort.name}</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED SIDE-PANEL / POPOVER COMPONENT */}
      <PortDetailSidePanel
        port={selectedPort}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onSelectPortForAnalysis={onSelectPortForAnalysis}
      />
    </div>
  );
};

