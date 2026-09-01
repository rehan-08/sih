import React, { useState } from 'react';
import { usePortAlerts } from '../context/PortAlertContext';
import { PortAlertSubscription } from '../types';
import { portIntelligenceData } from '../data/maritimeData';

const additionalOriginPorts = [
  { id: 'newcastle', name: 'Newcastle', country: 'Australia', region: 'Pacific Load Hub', type: 'Load Terminal', avgTurnaround: '34.0h' },
  { id: 'taboneo', name: 'Taboneo', country: 'Indonesia', region: 'Java Sea Load Hub', type: 'Anchorage Transshipment', avgTurnaround: '42.0h' },
  { id: 'richards_bay', name: 'Richards Bay', country: 'South Africa', region: 'Indian Ocean Load Hub', type: 'Load Terminal', avgTurnaround: '47.0h' },
  { id: 'gladstone', name: 'Gladstone', country: 'Australia', region: 'Pacific Load Hub', type: 'Load Terminal', avgTurnaround: '30.0h' },
  { id: 'singapore', name: 'Singapore Anchorage', country: 'Singapore', region: 'Strait of Malacca', type: 'Bunkering & Hub', avgTurnaround: '16.0h' }
];

export const PortAlertSubscriptionModal: React.FC = () => {
  const {
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    subscriptions,
    toggleSubscription,
    updateSubscription,
    subscribeToAll,
    unsubscribeAll,
    selectedPortForModal,
    simulatePortAlert
  } = usePortAlerts();

  // Combine Indian ports with origin load ports for complete directory
  const allPortsList = [
    ...portIntelligenceData.map(p => ({
      id: p.id,
      name: p.name,
      country: p.country,
      region: p.region,
      type: 'Discharge Terminal',
      avgTurnaround: `${p.turnaround?.avgTurnaroundHours || 40}h`
    })),
    ...additionalOriginPorts
  ];

  const [activePortId, setActivePortId] = useState<string>(selectedPortForModal || 'paradip');
  const [filterRegion, setFilterRegion] = useState<'ALL' | 'INDIA' | 'ORIGIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  if (!isSubscriptionModalOpen) return null;

  const currentSub: PortAlertSubscription = subscriptions[activePortId] || {
    portId: activePortId,
    portName: allPortsList.find(p => p.id === activePortId)?.name || activePortId,
    isSubscribed: false,
    channels: { inAppPush: true, emailDigest: false, soundChime: true, browserBadge: true },
    thresholds: {
      turnaroundSurgePct: 25,
      turnaroundHoursMax: 45,
      alertOnPortClosure: true,
      alertOnMonsoonCyclone: true,
      alertOnCraneOutage: true,
      alertOnDraftRestriction: true,
      alertOnDemurrageRisk: 'ALL'
    },
    notifySeverity: 'ALL',
    createdAt: new Date().toISOString()
  };

  const filteredPorts = allPortsList.filter(port => {
    const matchesSearch = port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          port.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          port.country.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterRegion === 'INDIA') {
      return matchesSearch && port.country === 'India';
    }
    if (filterRegion === 'ORIGIN') {
      return matchesSearch && port.country !== 'India';
    }
    return matchesSearch;
  });

  const handleToggleSub = (portId: string, name: string) => {
    toggleSubscription(portId, name);
  };

  const handleUpdateCurrentSub = (updates: Partial<PortAlertSubscription>) => {
    updateSubscription(activePortId, updates);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  const handleSubscribeAllIndia = () => {
    const indiaIds = portIntelligenceData.map(p => p.id);
    subscribeToAll(indiaIds);
  };

  const handleSubscribeAllOrigins = () => {
    const originIds = additionalOriginPorts.map(p => p.id);
    subscribeToAll(originIds);
  };

  const handleTestPushForCurrentPort = () => {
    const port = allPortsList.find(p => p.id === activePortId);
    simulatePortAlert({
      portId: activePortId,
      portName: port?.name || activePortId,
      type: 'TURNAROUND_SURGE',
      severity: 'CRITICAL',
      title: `Simulated Push Alert: ${port?.name || activePortId} Turnaround Surge (+45%)`,
      message: `Test telemetry trigger: Turnaround increased beyond configured threshold (${currentSub.thresholds.turnaroundSurgePct}% surge threshold). Operational dispatch verified.`,
      metrics: {
        turnaroundDelta: '+18.0 hrs (+45.0%)',
        previousTurnaround: port?.avgTurnaround || '34.0 hrs',
        currentTurnaround: '52.0 hrs',
        affectedBerths: ['Berth #1 Mechanized', 'Berth #2 General'],
        affectedVesselsCount: 14,
        demurrageRiskImpact: 'High Demurrage Risk'
      },
      source: `${port?.name || activePortId} VTS Test Notification System`
    });
  };

  const subscribedCount = Object.values(subscriptions).filter(s => s.isSubscribed).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-[#FFFFFF] dark:bg-[#0E1722] rounded-xl border border-[#DDD8CE] dark:border-[#1F2E3E] max-w-5xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[#1A1A1A] dark:text-[#E8ECE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F9F7F2] dark:bg-[#0B1117] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#BC412B]/10 dark:bg-[#BC412B]/20 flex items-center justify-center text-[#BC412B] dark:text-[#E05A42]">
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
                  Port Alert Subscriptions &amp; Thresholds
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono-data font-bold bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A]">
                  {subscribedCount} Subscribed
                </span>
              </div>
              <p className="text-xs text-[#6B645C] dark:text-[#8E9B97] font-serif-body italic">
                Configure real-time push alert parameters, surge sensitivities, and outage triggers per terminal
              </p>
            </div>
          </div>

          <button
            onClick={closeSubscriptionModal}
            className="p-2 rounded-lg text-[#7A7268] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Quick Batch Action Presets */}
        <div className="p-3 bg-[#F4F0E8] dark:bg-[#121D2A] border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data">
          <div className="flex items-center gap-2">
            <span className="text-[#7A7268] dark:text-[#8E9B97] text-[11px] uppercase font-bold">
              Quick Actions:
            </span>
            <button
              onClick={handleSubscribeAllIndia}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#16202C] hover:bg-[#BC412B] hover:text-white border border-[#DDD8CE] dark:border-[#1F2E3E] transition-colors cursor-pointer font-medium text-[11px]"
            >
              + Subscribe All India Ports
            </button>
            <button
              onClick={handleSubscribeAllOrigins}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#16202C] hover:bg-[#BC412B] hover:text-white border border-[#DDD8CE] dark:border-[#1F2E3E] transition-colors cursor-pointer font-medium text-[11px]"
            >
              + Subscribe All Load Origins
            </button>
          </div>

          <button
            onClick={unsubscribeAll}
            className="text-[#7A7268] hover:text-[#BC412B] dark:hover:text-[#E05A42] transition-colors cursor-pointer text-[11px] underline"
          >
            Mute All Ports
          </button>
        </div>

        {/* Modal Main Content (2 Columns: Port List + Granular Rules Editor) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Ports List Selector (5 cols) */}
          <div className="md:col-span-5 border-r border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col bg-[#F9F7F2]/50 dark:bg-[#0B1117]/50 overflow-hidden">
            {/* Search & Region Filters */}
            <div className="p-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7A7268] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter port name or region..."
                  className="w-full pl-8 pr-2 py-1.5 rounded bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
                />
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono-data">
                {(['ALL', 'INDIA', 'ORIGIN'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRegion(r)}
                    className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer font-bold ${
                      filterRegion === r
                        ? 'bg-[#BC412B] text-white'
                        : 'bg-white dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] border border-[#DDD8CE] dark:border-[#1F2E3E]'
                    }`}
                  >
                    {r === 'ALL' ? 'All' : r === 'INDIA' ? 'India Ports' : 'Load Ports'}
                  </button>
                ))}
              </div>
            </div>

            {/* Ports Scrollable Selector */}
            <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
              {filteredPorts.map((port) => {
                const sub = subscriptions[port.id];
                const isSubbed = sub?.isSubscribed ?? false;
                const isSelected = activePortId === port.id;

                return (
                  <div
                    key={port.id}
                    onClick={() => setActivePortId(port.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#EDE8DE] dark:bg-[#1A2634] border-[#BC412B] shadow-xs'
                        : 'bg-white dark:bg-[#101820] border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B]/40'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data truncate">
                          {port.name}
                        </span>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic truncate">
                          ({port.country})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#6B645C] dark:text-[#8E9B97] font-mono-data">
                        <span>{port.type}</span>
                        <span>•</span>
                        <span>Avg: {port.avgTurnaround}</span>
                      </div>
                    </div>

                    {/* Subscription Toggle Switch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSub(port.id, port.name);
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-mono-data font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                        isSubbed
                          ? 'bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A] border border-[#2D5A43]/30 hover:bg-[#2D5A43]/25'
                          : 'bg-[#EDE8DE] dark:bg-[#16202C] text-[#7A7268] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isSubbed ? 'notifications_active' : 'notifications_off'}
                      </span>
                      <span>{isSubbed ? 'Active' : 'Muted'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Thresholds & Delivery Channels Customizer (7 cols) */}
          <div className="md:col-span-7 p-5 sm:p-6 overflow-y-auto flex flex-col gap-5">
            {/* Active Port Title Bar */}
            <div className="flex items-start justify-between pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-mono-data font-bold">
                  Alert Configuration Rule
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  {currentSub.portName} Terminal
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSub(activePortId, currentSub.portName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-data font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs ${
                    currentSub.isSubscribed
                      ? 'bg-[#2D5A43] text-white hover:bg-[#234634]'
                      : 'bg-[#BC412B] text-white hover:bg-[#A33420]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {currentSub.isSubscribed ? 'notifications_active' : 'notification_add'}
                  </span>
                  <span>{currentSub.isSubscribed ? 'Subscribed (Active)' : 'Subscribe to Port'}</span>
                </button>
              </div>
            </div>

            {saveSuccessNotice && (
              <div className="p-2.5 rounded bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A] text-xs font-mono-data flex items-center gap-2 border border-[#2D5A43]/30 animate-in fade-in">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Threshold configuration updated and saved</span>
              </div>
            )}

            {/* Threshold Sliders */}
            <div className="flex flex-col gap-4 p-4 rounded-lg bg-[#F4F0E8] dark:bg-[#121D2A] border border-[#DDD8CE] dark:border-[#1F2E3E]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                  Turnaround Surge Sensitivity
                </span>
                <span className="text-xs font-mono-data font-extrabold text-[#BC412B] dark:text-[#E05A42]">
                  Alert if surge &gt; +{currentSub.thresholds.turnaroundSurgePct}%
                </span>
              </div>

              {/* Surge Percentage Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-mono-data text-[#6B645C] dark:text-[#8E9B97]">
                  <span>+15% (Sensitive)</span>
                  <span>+30% (Standard)</span>
                  <span>+50%+ (Severe only)</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={currentSub.thresholds.turnaroundSurgePct}
                  onChange={(e) =>
                    handleUpdateCurrentSub({
                      thresholds: {
                        ...currentSub.thresholds,
                        turnaroundSurgePct: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-[#BC412B] cursor-pointer"
                />
              </div>

              {/* Absolute Turnaround Max Hours Slider */}
              <div className="pt-3 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-mono-data">
                  <span className="text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Absolute Turnaround Cap Alert:
                  </span>
                  <span className="font-bold text-[#BC412B] dark:text-[#E05A42]">
                    &gt; {currentSub.thresholds.turnaroundHoursMax} Hours ({ (currentSub.thresholds.turnaroundHoursMax / 24).toFixed(1) } Days)
                  </span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="72"
                  step="4"
                  value={currentSub.thresholds.turnaroundHoursMax}
                  onChange={(e) =>
                    handleUpdateCurrentSub({
                      thresholds: {
                        ...currentSub.thresholds,
                        turnaroundHoursMax: Number(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-[#BC412B] cursor-pointer"
                />
              </div>
            </div>

            {/* Event Triggers Checklist */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-xs uppercase tracking-wider font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                Trigger Alert Types
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Unexpected Port Closure */}
                <label className="p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-start gap-2.5 cursor-pointer hover:border-[#BC412B]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={currentSub.thresholds.alertOnPortClosure}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        thresholds: {
                          ...currentSub.thresholds,
                          alertOnPortClosure: e.target.checked
                        }
                      })
                    }
                    className="mt-0.5 accent-[#BC412B]"
                  />
                  <div>
                    <span className="font-bold block text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Unexpected Closures
                    </span>
                    <span className="text-[11px] text-[#6B645C] dark:text-[#8E9B97] font-serif-body">
                      Emergency fairway halts &amp; berth lockdowns
                    </span>
                  </div>
                </label>

                {/* Monsoon & Cyclone */}
                <label className="p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-start gap-2.5 cursor-pointer hover:border-[#BC412B]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={currentSub.thresholds.alertOnMonsoonCyclone}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        thresholds: {
                          ...currentSub.thresholds,
                          alertOnMonsoonCyclone: e.target.checked
                        }
                      })
                    }
                    className="mt-0.5 accent-[#BC412B]"
                  />
                  <div>
                    <span className="font-bold block text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Cyclone &amp; Swell Alerts
                    </span>
                    <span className="text-[11px] text-[#6B645C] dark:text-[#8E9B97] font-serif-body">
                      High sea waves &gt;2.0m &amp; pilot suspensions
                    </span>
                  </div>
                </label>

                {/* Crane & Unloader Outages */}
                <label className="p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-start gap-2.5 cursor-pointer hover:border-[#BC412B]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={currentSub.thresholds.alertOnCraneOutage}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        thresholds: {
                          ...currentSub.thresholds,
                          alertOnCraneOutage: e.target.checked
                        }
                      })
                    }
                    className="mt-0.5 accent-[#BC412B]"
                  />
                  <div>
                    <span className="font-bold block text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Crane &amp; CSU Outages
                    </span>
                    <span className="text-[11px] text-[#6B645C] dark:text-[#8E9B97] font-serif-body">
                      Mechanized unloader breakdowns &gt;24h
                    </span>
                  </div>
                </label>

                {/* Draft Restrictions */}
                <label className="p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-start gap-2.5 cursor-pointer hover:border-[#BC412B]/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={currentSub.thresholds.alertOnDraftRestriction}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        thresholds: {
                          ...currentSub.thresholds,
                          alertOnDraftRestriction: e.target.checked
                        }
                      })
                    }
                    className="mt-0.5 accent-[#BC412B]"
                  />
                  <div>
                    <span className="font-bold block text-[#1A1A1A] dark:text-[#E8ECE9]">
                      Draft Restrictions
                    </span>
                    <span className="text-[11px] text-[#6B645C] dark:text-[#8E9B97] font-serif-body">
                      Tidal fairway siltation &amp; draft cuts
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Notification Delivery Channels */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-xs uppercase tracking-wider font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                Delivery Channels
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-data">
                <label className="p-2.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSub.channels.inAppPush}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        channels: {
                          ...currentSub.channels,
                          inAppPush: e.target.checked
                        }
                      })
                    }
                    className="accent-[#BC412B]"
                  />
                  <span>In-App Push</span>
                </label>

                <label className="p-2.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSub.channels.soundChime}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        channels: {
                          ...currentSub.channels,
                          soundChime: e.target.checked
                        }
                      })
                    }
                    className="accent-[#BC412B]"
                  />
                  <span>Audio Chime</span>
                </label>

                <label className="p-2.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSub.channels.browserBadge}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        channels: {
                          ...currentSub.channels,
                          browserBadge: e.target.checked
                        }
                      })
                    }
                    className="accent-[#BC412B]"
                  />
                  <span>AIS Badge</span>
                </label>

                <label className="p-2.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSub.channels.emailDigest}
                    onChange={(e) =>
                      handleUpdateCurrentSub({
                        channels: {
                          ...currentSub.channels,
                          emailDigest: e.target.checked
                        }
                      })
                    }
                    className="accent-[#BC412B]"
                  />
                  <span>Email Digest</span>
                </label>
              </div>
            </div>

            {/* Test Trigger Button */}
            <div className="pt-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center justify-between">
              <span className="text-[11px] text-[#6B645C] dark:text-[#8E9B97] font-serif-body italic">
                Verify push banner appearance and audio chime dispatch
              </span>

              <button
                onClick={handleTestPushForCurrentPort}
                className="px-3.5 py-2 rounded bg-white dark:bg-[#16202C] hover:bg-[#EDE8DE] dark:hover:bg-[#1F2E3E] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#BC412B] dark:text-[#E05A42] font-mono-data font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>Send Test Push for {currentSub.portName}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F9F7F2] dark:bg-[#0B1117] flex justify-end gap-3">
          <button
            onClick={closeSubscriptionModal}
            className="px-4 py-2 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-mono-data font-bold cursor-pointer transition-all shadow-xs"
          >
            Save &amp; Return to Monograph
          </button>
        </div>
      </div>
    </div>
  );
};
