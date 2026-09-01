import React, { useState } from 'react';
import { usePortAlerts } from '../context/PortAlertContext';
import { PortAlertNotification, PortAlertType, AlertSeverity } from '../types';
import { portIntelligenceData } from '../data/maritimeData';

interface PortAlertCenterDrawerProps {
  onNavigateToPort?: (portId: string) => void;
}

export const PortAlertCenterDrawer: React.FC<PortAlertCenterDrawerProps> = ({ onNavigateToPort }) => {
  const {
    isAlertCenterOpen,
    closeAlertCenter,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    deleteNotification,
    soundEnabled,
    toggleSound,
    openSubscriptionModal,
    subscriptions,
    triggerPredefinedScenario,
    simulatePortAlert
  } = usePortAlerts();

  const [filterTab, setFilterTab] = useState<'ALL' | 'SUBSCRIBED' | 'CRITICAL' | 'UNREAD'>('ALL');
  const [selectedAlertType, setSelectedAlertType] = useState<string>('ALL');

  if (!isAlertCenterOpen) return null;

  const filteredNotifications = notifications.filter(item => {
    // Filter by tab
    if (filterTab === 'SUBSCRIBED') {
      const sub = subscriptions[item.portId];
      if (!sub || !sub.isSubscribed) return false;
    }
    if (filterTab === 'CRITICAL' && item.severity !== 'CRITICAL') return false;
    if (filterTab === 'UNREAD' && item.isRead) return false;

    // Filter by alert type
    if (selectedAlertType !== 'ALL' && item.type !== selectedAlertType) return false;

    return true;
  });

  const handleInspect = (portId: string, alertId: string) => {
    markAsRead(alertId);
    if (onNavigateToPort) {
      onNavigateToPort(portId);
    }
    closeAlertCenter();
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-[#BC412B]/15 text-[#BC412B] dark:text-[#E05A42] border-[#BC412B]/30';
      case 'WARNING':
        return 'bg-[#D97706]/15 text-[#D97706] dark:text-[#F59E0B] border-[#D97706]/30';
      default:
        return 'bg-[#3B82F6]/15 text-[#3B82F6] dark:text-[#60A5FA] border-[#3B82F6]/30';
    }
  };

  const getTypeIcon = (type: PortAlertType) => {
    switch (type) {
      case 'PORT_CLOSURE':
        return 'block';
      case 'TURNAROUND_SURGE':
        return 'speed';
      case 'WEATHER_CYCLONE':
        return 'cyclone';
      case 'CRANE_OUTAGE':
        return 'precision_manufacturing';
      case 'DRAFT_RESTRICTION':
        return 'waves';
      case 'CONGESTION_LOGJAM':
        return 'anchor';
      case 'DRAFT_COMPLIANCE_CHANGE':
        return 'straighten';
      case 'DEMURRAGE_ESCALATION':
        return 'trending_up';
      case 'CHOKEPOINT_PROXIMITY':
        return 'directions_boat';
      default:
        return 'warning';
    }
  };

  const subscribedPortsCount = Object.values(subscriptions).filter(s => s.isSubscribed).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="absolute inset-y-0 right-0 max-w-2xl w-full bg-[#FFFFFF] dark:bg-[#0E1722] shadow-2xl border-l border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col transition-all text-[#1A1A1A] dark:text-[#E8ECE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center justify-between bg-[#F9F7F2] dark:bg-[#0B1117]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#BC412B]/10 dark:bg-[#BC412B]/20 flex items-center justify-center text-[#BC412B] dark:text-[#E05A42]">
              <span className="material-symbols-outlined text-[24px]">notifications_active</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#E8ECE9]">
                  Port Alert Center
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-data font-bold bg-[#BC412B] text-white">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B645C] dark:text-[#8E9B97] font-serif-body italic">
                Active push telemetry for turnaround anomalies &amp; terminal closures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Alert audio sound enabled' : 'Alert audio sound muted'}
              className={`p-2 rounded-lg border transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                soundEnabled 
                  ? 'bg-white dark:bg-[#16202C] border-[#DDD8CE] dark:border-[#1F2E3E] text-[#2D5A43] dark:text-[#3EB58A]' 
                  : 'bg-[#EDE8DE] dark:bg-[#121B26] border-[#DDD8CE] dark:border-[#1F2E3E] text-[#7A7268]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span className="hidden sm:inline font-mono-data text-[11px]">{soundEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={closeAlertCenter}
              className="p-2 rounded-lg text-[#7A7268] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Subscriptions Overview Banner */}
        <div className="p-4 bg-[#F4F0E8] dark:bg-[#121D2A] border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono-data">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">
              hub
            </span>
            <span className="font-semibold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Monitoring <strong className="text-[#BC412B] dark:text-[#E05A42]">{subscribedPortsCount}</strong> of {portIntelligenceData.length + 5} Ports
            </span>
          </div>

          <button
            onClick={() => {
              closeAlertCenter();
              openSubscriptionModal();
            }}
            className="px-3 py-1.5 rounded bg-white dark:bg-[#16202C] hover:bg-[#BC412B] hover:text-white dark:hover:bg-[#BC412B] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data font-bold transition-all cursor-pointer flex items-center gap-1.5 text-[11px] shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Configure Subscriptions &amp; Thresholds</span>
          </button>
        </div>

        {/* Real-time Push Simulator Quick Presets */}
        <div className="px-5 py-3 bg-[#EDE8DE]/60 dark:bg-[#101820]/90 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] font-mono-data shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BC412B] animate-ping" />
            Simulate Event:
          </span>
          <button
            onClick={() => triggerPredefinedScenario('paradip_closure')}
            className="px-2.5 py-1 rounded text-[11px] font-mono-data bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#BC412B] dark:text-[#E05A42] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Paradip Swell Closure
          </button>
          <button
            onClick={() => triggerPredefinedScenario('visakhapatnam_spike')}
            className="px-2.5 py-1 rounded text-[11px] font-mono-data bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#1A1A1A] dark:text-[#E8ECE9] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Vizag +70% Turnaround Spike
          </button>
          <button
            onClick={() => triggerPredefinedScenario('haldia_draft')}
            className="px-2.5 py-1 rounded text-[11px] font-mono-data bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#1A1A1A] dark:text-[#E8ECE9] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Haldia 9.2m Draft Cut
          </button>
          <button
            onClick={() => triggerPredefinedScenario('cyclone_evacuation')}
            className="px-2.5 py-1 rounded text-[11px] font-mono-data bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-[#BC412B] dark:text-[#E05A42] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Cyclone Alert Evacuation
          </button>
        </div>

        {/* Filter Navigation & Bulk Actions */}
        <div className="p-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-wrap items-center justify-between gap-3">
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 text-xs font-mono-data">
            {(['ALL', 'SUBSCRIBED', 'CRITICAL', 'UNREAD'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  filterTab === tab
                    ? 'bg-[#BC412B] text-white shadow-xs'
                    : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                }`}
              >
                {tab === 'ALL' && `All Alerts (${notifications.length})`}
                {tab === 'SUBSCRIBED' && 'Subscribed Only'}
                {tab === 'CRITICAL' && 'Critical Closures'}
                {tab === 'UNREAD' && `Unread (${unreadCount})`}
              </button>
            ))}
          </div>

          {/* Bulk Controls */}
          <div className="flex items-center gap-2 text-xs font-mono-data">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[#6B645C] dark:text-[#8E9B97] hover:text-[#BC412B] dark:hover:text-[#E05A42] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">done_all</span>
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-[#7A7268] hover:text-[#BC412B] dark:hover:text-[#E05A42] transition-colors cursor-pointer text-[11px]"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Alerts List Scrollable View */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3 text-[#7A7268] dark:text-[#8E9B97]">
              <span className="material-symbols-outlined text-[48px] text-[#DDD8CE] dark:text-[#1F2E3E]">
                notifications_paused
              </span>
              <p className="font-editorial text-lg text-[#1A1A1A] dark:text-[#E8ECE9]">
                No Port Alerts Match Current Filter
              </p>
              <p className="text-xs font-serif-body max-w-sm">
                All monitored ports are operating within normal turnaround tolerances. Use the simulation buttons above to test push alerts.
              </p>
              <button
                onClick={() => triggerPredefinedScenario('paradip_closure')}
                className="mt-2 px-4 py-2 rounded bg-[#BC412B] text-white text-xs font-mono-data font-bold shadow-xs cursor-pointer"
              >
                Simulate Paradip Closure Alert
              </button>
            </div>
          ) : (
            filteredNotifications.map((alert) => {
              const isSubscribed = subscriptions[alert.portId]?.isSubscribed ?? false;

              return (
                <div
                  key={alert.id}
                  className={`p-4 sm:p-5 rounded-lg border transition-all flex flex-col gap-3 relative ${
                    !alert.isRead
                      ? 'bg-[#FFFDF9] dark:bg-[#14202D] border-[#BC412B]/60 shadow-md ring-1 ring-[#BC412B]/20'
                      : 'bg-white dark:bg-[#101820] border-[#DDD8CE] dark:border-[#1F2E3E]'
                  }`}
                >
                  {/* Top Bar: Port, Type, Time, Read Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#BC412B] dark:text-[#E05A42]">
                          anchor
                        </span>
                        {alert.portName}
                      </span>

                      {/* Severity Pill */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data font-bold border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>

                      {/* Type Pill */}
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono-data bg-[#EDE8DE] dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">{getTypeIcon(alert.type)}</span>
                        {alert.type.replace('_', ' ')}
                      </span>

                      {isSubscribed && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono-data font-bold rounded bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A]">
                          🔔 Subscribed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[#7A7268] text-xs font-mono-data shrink-0">
                      <span>{alert.timestamp}</span>
                      <button
                        onClick={() => deleteNotification(alert.id)}
                        className="hover:text-[#BC412B] dark:hover:text-[#E05A42] transition-colors cursor-pointer p-1"
                        title="Delete Alert"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Title & Message */}
                  <div>
                    <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9] leading-snug">
                      {alert.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A433A] dark:text-[#B0BCB6] font-serif-body mt-1.5 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  {/* Metric Chips & Telemetry Delta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs font-mono-data">
                    {alert.metrics.turnaroundDelta && (
                      <div>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block uppercase">Turnaround Delta</span>
                        <span className="font-bold text-[#BC412B] dark:text-[#E05A42] text-sm">
                          {alert.metrics.turnaroundDelta}
                        </span>
                      </div>
                    )}

                    {alert.metrics.currentTurnaround && (
                      <div>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block uppercase">Active Turnaround</span>
                        <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] text-sm">
                          {alert.metrics.currentTurnaround}
                        </span>
                      </div>
                    )}

                    {alert.metrics.closureEstimatedDuration ? (
                      <div>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block uppercase">Closure Horizon</span>
                        <span className="font-bold text-[#D97706] text-xs">
                          {alert.metrics.closureEstimatedDuration}
                        </span>
                      </div>
                    ) : alert.metrics.demurrageRiskImpact ? (
                      <div>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block uppercase">Demurrage Risk</span>
                        <span className="font-bold text-[#BC412B] dark:text-[#E05A42] text-xs">
                          {alert.metrics.demurrageRiskImpact}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] block uppercase">Affected Vessels</span>
                        <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] text-sm">
                          {alert.metrics.affectedVesselsCount || 12} Vessels Queue
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recommendation Box */}
                  {alert.actionRecommendation && (
                    <div className="p-2.5 rounded bg-[#2D5A43]/10 dark:bg-[#2D5A43]/15 border border-[#2D5A43]/20 text-[11px] text-[#2D5A43] dark:text-[#3EB58A] flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                        lightbulb
                      </span>
                      <span className="font-serif-body font-medium">
                        {alert.actionRecommendation}
                      </span>
                    </div>
                  )}

                  {/* Source & Actions Row */}
                  <div className="pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center justify-between gap-3 text-xs">
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data truncate">
                      Source: {alert.source}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="px-2.5 py-1 rounded text-xs font-mono-data text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] hover:bg-[#EDE8DE] dark:hover:bg-[#16202C] transition-colors cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        onClick={() => handleInspect(alert.portId, alert.id)}
                        className="px-3 py-1.5 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-mono-data font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <span>Inspect Port</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
