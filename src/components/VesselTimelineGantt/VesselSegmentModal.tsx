import React, { useState } from 'react';
import { TimelineSegment, segmentTypeStyles } from '../../data/vesselScheduleData';

interface VesselSegmentModalProps {
  segment: TimelineSegment | null;
  onClose: () => void;
  onUpdateSegment: (updatedSegment: TimelineSegment) => void;
  onDeleteSegment?: (segmentId: string) => void;
}

export const VesselSegmentModal: React.FC<VesselSegmentModalProps> = ({
  segment,
  onClose,
  onUpdateSegment,
  onDeleteSegment
}) => {
  if (!segment) return null;

  const style = segmentTypeStyles[segment.type] || segmentTypeStyles.LADEN_VOYAGE;
  const isMaintenance = segment.type.startsWith('MAINTENANCE');
  const isVoyage = segment.type === 'LADEN_VOYAGE' || segment.type === 'BALLAST_VOYAGE';
  const isPortOp = segment.type === 'PORT_LOADING' || segment.type === 'PORT_DISCHARGE' || segment.type === 'PORT_ANCHORAGE';

  // State for interactive schedule adjustment simulation
  const [shiftDays, setShiftDays] = useState<number>(0);
  const [simulatedStartDate, setSimulatedStartDate] = useState<string>(segment.startDate);
  const [simulatedEndDate, setSimulatedEndDate] = useState<string>(segment.endDate);
  const [activeTab, setActiveTab] = useState<'overview' | 'reschedule' | 'technical'>('overview');
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  const handleShiftChange = (delta: number) => {
    setShiftDays(delta);
    
    // Parse current start and end
    const start = new Date(segment.startDate);
    const end = new Date(segment.endDate);
    
    start.setDate(start.getDate() + delta);
    end.setDate(end.getDate() + delta);
    
    const format = (d: Date) => d.toISOString().split('T')[0];
    setSimulatedStartDate(format(start));
    setSimulatedEndDate(format(end));
  };

  const handleApplyReschedule = () => {
    const updated: TimelineSegment = {
      ...segment,
      startDate: simulatedStartDate,
      endDate: simulatedEndDate,
      status: shiftDays !== 0 ? 'SCHEDULED' : segment.status,
      operationalNotes: shiftDays !== 0 
        ? `${segment.operationalNotes || ''} (Simulated reschedule: shifted by ${shiftDays > 0 ? '+' : ''}${shiftDays} days)`
        : segment.operationalNotes
    };
    onUpdateSegment(updated);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#1A1A1A] dark:text-[#E8ECE9]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.barBg} shadow-sm flex-shrink-0`}>
              <span className="material-symbols-outlined text-white text-[22px]">{style.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono-data uppercase tracking-wider text-[#BC412B] dark:text-[#E05A42]">
                  {segment.vesselName}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono-data ${style.badgeBg} ${style.badgeText}`}>
                  {style.label}
                </span>
                {segment.status === 'IN_PROGRESS' && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[10px] font-bold font-mono-data animate-pulse">
                    CURRENTLY ACTIVE
                  </span>
                )}
                {segment.hasConflictWarning && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 rounded text-[10px] font-bold font-mono-data flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">warning</span>
                    RESTRICTION DETECTED
                  </span>
                )}
              </div>
              <h2 className="font-editorial text-lg sm:text-xl font-bold mt-0.5 text-[#1A1A1A] dark:text-[#E8ECE9]">
                {segment.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A7268] dark:text-[#8E9B97] hover:bg-[#EDE8DE] dark:hover:bg-[#1F2E3E] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#DDD8CE] dark:border-[#1F2E3E] px-5 bg-white dark:bg-[#101820] text-xs font-mono-data">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#BC412B] dark:border-[#E05A42] text-[#BC412B] dark:text-[#E05A42]'
                : 'border-transparent text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Segment Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('reschedule')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reschedule'
                ? 'border-[#BC412B] dark:border-[#E05A42] text-[#BC412B] dark:text-[#E05A42]'
                : 'border-transparent text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Schedule Shift Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('technical')}
            className={`py-3 px-4 border-b-2 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'technical'
                ? 'border-[#BC412B] dark:border-[#E05A42] text-[#BC412B] dark:text-[#E05A42]'
                : 'border-transparent text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">engineering</span>
            <span>{isMaintenance ? 'Work Scope & Survey' : 'Voyage & Port Specs'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5 text-sm">
          {/* Conflict Warning Box if any */}
          {segment.hasConflictWarning && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg flex items-start gap-3 text-rose-900 dark:text-rose-200">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-xl flex-shrink-0 mt-0.5">report</span>
              <div className="text-xs">
                <span className="font-bold block uppercase tracking-wide mb-0.5">Operational Constraint / Penalty Warning</span>
                <p className="font-serif-body leading-relaxed">{segment.conflictDetails}</p>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Timing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-data">
                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Start Date</span>
                  <span className="font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">{segment.startDate}</span>
                </div>

                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">End Date</span>
                  <span className="font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">{segment.endDate}</span>
                </div>

                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Duration</span>
                  <span className="font-bold text-sm text-[#BC412B] dark:text-[#E05A42] mt-0.5 block">{segment.durationDays} Days</span>
                </div>

                <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-bold text-xs truncate text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block" title={segment.locationName}>
                    {segment.locationName}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-[#141E28] p-4 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                <span className="text-xs font-bold font-mono-data text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider block mb-1.5">
                  Operational Description
                </span>
                <p className="text-xs sm:text-sm text-[#333333] dark:text-[#D5DDD8] font-serif-body leading-relaxed">
                  {segment.description}
                </p>
                {segment.operationalNotes && (
                  <p className="text-xs text-[#6B645C] dark:text-[#9FB1AA] font-serif-body italic mt-2 pt-2 border-t border-[#DDD8CE]/60 dark:border-[#1F2E3E]/60">
                    <span className="font-bold not-italic font-mono-data mr-1">Log Note:</span>
                    {segment.operationalNotes}
                  </p>
                )}
              </div>

              {/* Key Indicators depending on segment type */}
              {isVoyage && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {segment.cargoType && (
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Cargo Parcel</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">{segment.cargoType}</span>
                      {segment.cargoQuantityMT && (
                        <span className="text-[11px] font-mono-data text-[#BC412B] dark:text-[#E05A42]">
                          {segment.cargoQuantityMT.toLocaleString()} MT
                        </span>
                      )}
                    </div>
                  )}

                  {segment.avgSpeedKts && (
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Speed Profile</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-0.5 block">
                        {segment.avgSpeedKts} kts ({segment.speedMode || 'STANDARD'})
                      </span>
                      {segment.estimatedDistanceNM && (
                        <span className="text-[11px] font-mono-data text-[#6B645C] dark:text-[#A3B1AB]">
                          {segment.estimatedDistanceNM.toLocaleString()} NM Total
                        </span>
                      )}
                    </div>
                  )}

                  {segment.bunkerConsumptionMT && (
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Bunker Fuel Burn</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-0.5 block">
                        {segment.bunkerConsumptionMT} MT VLSFO
                      </span>
                      <span className="text-[11px] text-[#2D5A43] dark:text-[#3EB58A]">
                        ~{(segment.bunkerConsumptionMT / segment.durationDays).toFixed(1)} MT/day
                      </span>
                    </div>
                  )}
                </div>
              )}

              {isMaintenance && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {segment.shipyardName && (
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Shipyard / Facility</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">{segment.shipyardName}</span>
                      {segment.drydockNumber && (
                        <span className="text-[11px] font-mono-data text-[#6B645C] dark:text-[#A3B1AB]">{segment.drydockNumber}</span>
                      )}
                    </div>
                  )}

                  {segment.maintenanceBudgetUSD && (
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Maintenance CapEx</span>
                      <span className="font-bold text-[#BC412B] dark:text-[#E05A42] font-mono-data mt-0.5 block">
                        ${segment.maintenanceBudgetUSD.toLocaleString()} USD
                      </span>
                      <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97]">
                        Off-hire: {segment.offHireDays || segment.durationDays} days
                      </span>
                    </div>
                  )}

                  {segment.classSurveyor && (
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Class Society</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mt-0.5 block">
                        {segment.classSurveyor}
                      </span>
                      {segment.ciiEfficiencyGainPct && (
                        <span className="text-[11px] text-[#2D5A43] dark:text-[#3EB58A] font-bold">
                          +{segment.ciiEfficiencyGainPct}% CII Fuel Efficiency
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: RESCHEDULE SIMULATOR */}
          {activeTab === 'reschedule' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-[#EDE8DE]/60 dark:bg-[#16202C]/60 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
                <h4 className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mb-1">
                  Interactive Schedule Shift Simulator
                </h4>
                <p className="text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
                  Adjust the departure or drydock start date using the timeline offset slider. The system dynamically validates against subsequent laycan windows, charterparty cancellation dates, and shipyard dock bookings.
                </p>
              </div>

              <div className="bg-white dark:bg-[#141E28] p-5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">
                    Schedule Offset (Days):
                  </span>
                  <span className={`px-3 py-1 rounded font-mono-data font-bold text-sm ${
                    shiftDays === 0 
                      ? 'bg-neutral-200 dark:bg-neutral-800 text-[#1A1A1A] dark:text-[#E8ECE9]'
                      : shiftDays > 0 
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' 
                      : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {shiftDays > 0 ? `+${shiftDays}` : shiftDays} Days {shiftDays === 0 && '(Original Schedule)'}
                  </span>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleShiftChange(Math.max(-7, shiftDays - 1))}
                    className="p-1.5 rounded bg-[#EDE8DE] dark:bg-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data font-bold hover:bg-[#DDD8CE] transition-colors cursor-pointer text-xs"
                  >
                    -1 Day
                  </button>

                  <input
                    type="range"
                    min="-7"
                    max="7"
                    step="1"
                    value={shiftDays}
                    onChange={(e) => handleShiftChange(Number(e.target.value))}
                    className="flex-1 accent-[#BC412B] cursor-pointer"
                  />

                  <button
                    onClick={() => handleShiftChange(Math.min(7, shiftDays + 1))}
                    className="p-1.5 rounded bg-[#EDE8DE] dark:bg-[#1F2E3E] text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data font-bold hover:bg-[#DDD8CE] transition-colors cursor-pointer text-xs"
                  >
                    +1 Day
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#DDD8CE]/60 dark:border-[#1F2E3E]/60 text-xs font-mono-data">
                  <button onClick={() => handleShiftChange(-3)} className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1F2E3E] hover:text-[#BC412B] cursor-pointer">
                    -3 Days (Advance)
                  </button>
                  <button onClick={() => handleShiftChange(0)} className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1F2E3E] hover:text-[#BC412B] cursor-pointer">
                    Reset (0d)
                  </button>
                  <button onClick={() => handleShiftChange(2)} className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1F2E3E] hover:text-[#BC412B] cursor-pointer">
                    +2 Days (Delay)
                  </button>
                  <button onClick={() => handleShiftChange(5)} className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1F2E3E] hover:text-[#BC412B] cursor-pointer">
                    +5 Days (Slip)
                  </button>
                </div>
              </div>

              {/* Comparison Box */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono-data">
                <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                  <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Current Plan</span>
                  <div className="mt-1 text-[#1A1A1A] dark:text-[#E8ECE9]">
                    <div>Start: <span className="font-bold">{segment.startDate}</span></div>
                    <div>End: <span className="font-bold">{segment.endDate}</span></div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-300 dark:border-emerald-800">
                  <span className="text-emerald-800 dark:text-emerald-400 text-[10px] uppercase font-bold block">Simulated Schedule</span>
                  <div className="mt-1 text-emerald-950 dark:text-emerald-200">
                    <div>Start: <span className="font-bold">{simulatedStartDate}</span></div>
                    <div>End: <span className="font-bold">{simulatedEndDate}</span></div>
                  </div>
                </div>
              </div>

              {/* Conflict Analysis on Shift */}
              {segment.laycanWindow && (
                <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
                  <span className="font-bold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9] block mb-1">
                    Charterparty Laycan Check:
                  </span>
                  <p className="text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
                    Designated Laycan: <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{segment.laycanWindow.start} to {segment.laycanWindow.end}</span>.
                    {new Date(simulatedEndDate) > new Date(segment.laycanWindow.end) ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold block mt-1">
                        ⚠️ WARNING: Simulated arrival ({simulatedEndDate}) breaches laycan cancellation date ({segment.laycanWindow.end}). Demurrage or charter cancellation risk!
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                        ✓ COMPLIANT: Arrival ({simulatedEndDate}) comfortably falls within contractual laycan.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TECHNICAL & WORK SCOPE */}
          {activeTab === 'technical' && (
            <div className="flex flex-col gap-4 text-xs">
              {isMaintenance ? (
                <>
                  <div className="p-4 bg-white dark:bg-[#141E28] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                    <span className="text-xs font-bold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9] uppercase tracking-wider block mb-3">
                      Detailed Work Scope &amp; Maintenance Checklist
                    </span>
                    {segment.workScope && segment.workScope.length > 0 ? (
                      <ul className="space-y-2">
                        {segment.workScope.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-[#333333] dark:text-[#D5DDD8] font-serif-body">
                            <span className="material-symbols-outlined text-[#2D5A43] dark:text-[#3EB58A] text-[16px] flex-shrink-0 mt-0.5">
                              check_circle
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#7A7268] dark:text-[#8E9B97] italic font-serif-body">Standard preventative maintenance routine.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">Statutory Mandate</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5 block">
                        {segment.isClassMandated ? 'IMO Class Special Survey Required' : 'Owner Preventative Work'}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F4F0E8] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E]">
                      <span className="text-[#7A7268] dark:text-[#8E9B97] text-[10px] uppercase font-bold block">CII Rating Forecast</span>
                      <span className="font-bold text-[#2D5A43] dark:text-[#3EB58A] mt-0.5 block">
                        {segment.ciiEfficiencyGainPct ? `+${segment.ciiEfficiencyGainPct}% Fuel Efficiency (Maintains Rating B)` : 'Neutral'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-white dark:bg-[#141E28] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-3">
                  <span className="text-xs font-bold font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9] uppercase tracking-wider block">
                    Voyage Nautical &amp; Commercial Particulars
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Origin / Departure</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{segment.originPort || 'Newcastle'}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Destination / Terminal</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{segment.destinationPort || 'Paradip'}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Corridor / Track</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{segment.corridorOrYard || 'Standard Track'}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7268] dark:text-[#8E9B97] block text-[10px] uppercase font-bold">Laden Operating Draft</span>
                      <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{segment.draftLadenM ? `${segment.draftLadenM}m` : 'Ballast Draft'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex items-center justify-between gap-3">
          <div>
            {isSavedNotice && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono-data">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Schedule updated successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-white dark:bg-[#101820] text-xs font-mono-data text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'reschedule' && shiftDays !== 0 && (
              <button
                onClick={handleApplyReschedule}
                className="px-4 py-2 rounded-lg bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Apply New Schedule</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
