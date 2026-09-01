import React, { useState, useMemo, useRef } from 'react';
import { 
  initialFleetSchedules, 
  VesselFleetSchedule, 
  TimelineSegment, 
  SegmentType, 
  segmentTypeStyles 
} from '../../data/vesselScheduleData';
import { VesselSegmentModal } from './VesselSegmentModal';
import { AddScheduleModal } from './AddScheduleModal';

interface VesselTimelineGanttProps {
  onSelectVesselClass?: (vesselClass: string) => void;
}

export type TimeHorizon = '30d' | '60d' | '90d' | '180d';

export const VesselTimelineGantt: React.FC<VesselTimelineGanttProps> = () => {
  const [fleetSchedules, setFleetSchedules] = useState<VesselFleetSchedule[]>(initialFleetSchedules);
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('60d');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSegment, setSelectedSegment] = useState<TimelineSegment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [hoveredSegment, setHoveredSegment] = useState<TimelineSegment | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reference "Today" date for the simulation: Aug 30, 2026
  const TODAY = useMemo(() => new Date('2026-08-30T00:00:00Z'), []);

  // Compute Horizon Start and End dates based on selection
  const { startDate, endDate, totalDays, dayColumns } = useMemo(() => {
    let daysBefore = 15;
    let daysAfter = 45;

    if (timeHorizon === '30d') {
      daysBefore = 10;
      daysAfter = 20;
    } else if (timeHorizon === '60d') {
      daysBefore = 15;
      daysAfter = 45;
    } else if (timeHorizon === '90d') {
      daysBefore = 20;
      daysAfter = 70;
    } else if (timeHorizon === '180d') {
      daysBefore = 30;
      daysAfter = 150;
    }

    const start = new Date(TODAY);
    start.setDate(start.getDate() - daysBefore);

    const end = new Date(TODAY);
    end.setDate(end.getDate() + daysAfter);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const total = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Generate array of day objects
    const columns: Array<{ date: Date; dateStr: string; isToday: boolean; isWeekend: boolean; dayNum: number; monthName: string }> = [];
    for (let i = 0; i < total; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const isToday = d.toISOString().split('T')[0] === TODAY.toISOString().split('T')[0];
      const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
      columns.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isToday,
        isWeekend,
        dayNum: d.getUTCDate(),
        monthName: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
      });
    }

    return {
      startDate: start,
      endDate: end,
      totalDays: total,
      dayColumns: columns
    };
  }, [TODAY, timeHorizon]);

  // Calculate timeline position (left % and width %) for a given segment
  const getSegmentPosition = (segStart: string, segEnd: string) => {
    const s = new Date(segStart + 'T00:00:00Z');
    const e = new Date(segEnd + 'T23:59:59Z');

    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    const totalMs = endMs - startMs;

    const segStartMs = Math.max(startMs, s.getTime());
    const segEndMs = Math.min(endMs, e.getTime());

    if (segEndMs < startMs || segStartMs > endMs) {
      return null; // out of view
    }

    const leftPct = ((segStartMs - startMs) / totalMs) * 100;
    const widthPct = Math.max(1.2, ((segEndMs - segStartMs) / totalMs) * 100);

    return { leftPct, widthPct };
  };

  // Today marker offset in percent
  const todayOffsetPct = useMemo(() => {
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    const todayMs = TODAY.getTime();
    return ((todayMs - startMs) / (endMs - startMs)) * 100;
  }, [startDate, endDate, TODAY]);

  // Filter fleet based on class, search query, and segment type
  const filteredFleet = useMemo(() => {
    return fleetSchedules.filter(v => {
      // Class filter
      if (selectedClass !== 'All' && v.vesselClass !== selectedClass) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesShip = v.vesselName.toLowerCase().includes(q) ||
                            v.vesselClass.toLowerCase().includes(q) ||
                            v.ownerOperator.toLowerCase().includes(q);
        const matchesSegment = v.segments.some(s => 
          s.title.toLowerCase().includes(q) ||
          s.locationName.toLowerCase().includes(q) ||
          (s.cargoType && s.cargoType.toLowerCase().includes(q)) ||
          (s.shipyardName && s.shipyardName.toLowerCase().includes(q))
        );
        if (!matchesShip && !matchesSegment) return false;
      }

      // Segment type filter
      if (selectedTypeFilter !== 'All') {
        const hasMatchingSegment = v.segments.some(s => {
          if (selectedTypeFilter === 'MAINTENANCE') {
            return s.type.startsWith('MAINTENANCE');
          }
          if (selectedTypeFilter === 'VOYAGES') {
            return s.type === 'LADEN_VOYAGE' || s.type === 'BALLAST_VOYAGE';
          }
          if (selectedTypeFilter === 'PORTS') {
            return s.type === 'PORT_LOADING' || s.type === 'PORT_DISCHARGE' || s.type === 'PORT_ANCHORAGE';
          }
          return s.type === selectedTypeFilter;
        });
        if (!hasMatchingSegment) return false;
      }

      return true;
    });
  }, [fleetSchedules, selectedClass, searchQuery, selectedTypeFilter]);

  // Aggregate KPI summary metrics
  const kpis = useMemo(() => {
    let totalCargoMT = 0;
    let totalOffHireDays = 0;
    let totalMaintenanceBudget = 0;
    let conflictCount = 0;
    let maintenanceEvents = 0;

    fleetSchedules.forEach(v => {
      v.segments.forEach(s => {
        if (s.cargoQuantityMT && (s.type === 'LADEN_VOYAGE' || s.type === 'PORT_LOADING' || s.type === 'PORT_DISCHARGE')) {
          totalCargoMT += s.cargoQuantityMT;
        }
        if (s.type.startsWith('MAINTENANCE')) {
          maintenanceEvents++;
          if (s.offHireDays) totalOffHireDays += s.offHireDays;
          if (s.maintenanceBudgetUSD) totalMaintenanceBudget += s.maintenanceBudgetUSD;
        }
        if (s.hasConflictWarning) {
          conflictCount++;
        }
      });
    });

    return {
      activeShipsCount: fleetSchedules.length,
      totalCargoMT: Math.round(totalCargoMT / 2), // avoid double count between load & discharge
      totalOffHireDays,
      totalMaintenanceBudget,
      maintenanceEvents,
      conflictCount
    };
  }, [fleetSchedules]);

  // Update a segment in state
  const handleUpdateSegment = (updatedSegment: TimelineSegment) => {
    setFleetSchedules(prev => prev.map(vessel => {
      const vId = vessel.vesselId || vessel.id;
      if (vId === updatedSegment.vesselId) {
        return {
          ...vessel,
          segments: vessel.segments.map(seg => seg.id === updatedSegment.id ? updatedSegment : seg)
        };
      }
      return vessel;
    }));
  };

  // Add a new segment
  const handleAddSegment = (newSegment: TimelineSegment) => {
    setFleetSchedules(prev => prev.map(vessel => {
      const vId = vessel.vesselId || vessel.id;
      if (vId === newSegment.vesselId) {
        return {
          ...vessel,
          segments: [...vessel.segments, newSegment]
        };
      }
      return vessel;
    }));
  };

  // Jump to Today
  const handleJumpToToday = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollWidth = container.scrollWidth;
      const targetScroll = (scrollWidth * (todayOffsetPct / 100)) - (container.clientWidth / 2);
      container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  };

  // Month grouping for the header
  const monthGroups = useMemo(() => {
    const groups: Array<{ name: string; colSpan: number }> = [];
    let currentMonth = '';
    let currentSpan = 0;

    dayColumns.forEach((col) => {
      if (col.monthName !== currentMonth) {
        if (currentMonth !== '') {
          groups.push({ name: currentMonth, colSpan: currentSpan });
        }
        currentMonth = col.monthName;
        currentSpan = 1;
      } else {
        currentSpan++;
      }
    });

    if (currentMonth !== '') {
      groups.push({ name: currentMonth, colSpan: currentSpan });
    }

    return groups;
  }, [dayColumns]);

  return (
    <div className="flex flex-col gap-6 w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">Monitored Bulkers</span>
          <div className="text-xl font-bold font-editorial text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            {kpis.activeShipsCount} <span className="text-xs font-normal font-sans text-[#7A7268] dark:text-[#8E9B97]">Vessels</span>
          </div>
          <span className="text-[11px] text-[#2D5A43] dark:text-[#3EB58A] font-mono-data mt-0.5 block">100% AIS Tracked</span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">Planned Cargo</span>
          <div className="text-xl font-bold font-editorial text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            {(kpis.totalCargoMT / 1000000).toFixed(2)}M <span className="text-xs font-normal font-sans text-[#7A7268] dark:text-[#8E9B97]">MT</span>
          </div>
          <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-mono-data mt-0.5 block">Thermal &amp; Met Coal</span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">Fleet Active Utilization</span>
          <div className="text-xl font-bold font-editorial text-[#2D5A43] dark:text-[#3EB58A] mt-0.5">
            94.2%
          </div>
          <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-0.5 block">Laden + Ballast Legs</span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">Scheduled Off-Hire</span>
          <div className="text-xl font-bold font-editorial text-[#BC412B] dark:text-[#E05A42] mt-0.5">
            {kpis.totalOffHireDays} <span className="text-xs font-normal font-sans text-[#7A7268] dark:text-[#8E9B97]">Days</span>
          </div>
          <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-0.5 block">{kpis.maintenanceEvents} Dock/Overhaul Windows</span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">Maintenance CapEx</span>
          <div className="text-xl font-bold font-editorial text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            ${(kpis.totalMaintenanceBudget / 1000000).toFixed(2)}M
          </div>
          <span className="text-[11px] text-[#2D5A43] dark:text-[#3EB58A] font-mono-data mt-0.5 block">+3.6% Avg CII Boost</span>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-3.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] block font-mono-data">Draft / Port Alerts</span>
          <div className="text-xl font-bold font-editorial text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            <span>{kpis.conflictCount} Warnings</span>
          </div>
          <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-0.5 block">Lightering &amp; Lock Delays</span>
        </div>
      </div>

      {/* Interactive Controls & Filters Bar */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7268] dark:text-[#8E9B97] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ship name, port, shipyard, or cargo..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F9F7F2] dark:bg-[#16202C] text-xs font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9] focus:outline-hidden focus:border-[#BC412B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A7268] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data mr-1">Horizon:</span>
            <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] p-0.5 text-xs font-mono-data">
              {(['30d', '60d', '90d', '180d'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => setTimeHorizon(h)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    timeHorizon === h
                      ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                      : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                  }`}
                >
                  {h.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Jump to Today button */}
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-lg bg-[#EDE8DE] dark:bg-[#16202C] hover:bg-[#DDD8CE] dark:hover:bg-[#1F2E3E] text-xs font-mono-data font-bold text-[#BC412B] dark:text-[#E05A42] flex items-center gap-1 transition-colors cursor-pointer border border-[#DDD8CE] dark:border-[#1F2E3E]"
            >
              <span className="material-symbols-outlined text-[15px]">today</span>
              <span>Jump to Today</span>
            </button>

            {/* Add Schedule Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Plan Window</span>
            </button>
          </div>
        </div>

        {/* Filter Pills (Class + Segment Type) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DDD8CE]/60 dark:border-[#1F2E3E]/60 text-xs">
          {/* Class Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[#7A7268] dark:text-[#8E9B97] font-mono-data mr-1">Class:</span>
            {['All', 'Panamax', 'Capesize', 'Supramax', 'Handysize', 'Kamsarmax', 'Newcastlemax'].map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded text-xs font-mono-data transition-colors cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-[#1A1A1A] dark:bg-white text-white dark:text-[#101820] font-bold'
                    : 'bg-[#EDE8DE]/60 dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>

          {/* Segment Type Filter */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[#7A7268] dark:text-[#8E9B97] font-mono-data mr-1">View:</span>
            {[
              { id: 'All', label: 'All Operations' },
              { id: 'VOYAGES', label: 'Voyages Only' },
              { id: 'PORTS', label: 'Port Calls' },
              { id: 'MAINTENANCE', label: 'Maintenance & Drydocks' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeFilter(type.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono-data transition-colors cursor-pointer ${
                  selectedTypeFilter === type.id
                    ? 'bg-[#BC412B] text-white font-bold'
                    : 'bg-[#EDE8DE]/60 dark:bg-[#16202C] text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono-data text-[#6B645C] dark:text-[#A3B1AB]">
          <span className="font-bold text-[#7A7268] dark:text-[#8E9B97]">Legend:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-600" />
            <span>Laden Voyage</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Ballast Leg</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-600" />
            <span>Port Loading</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-teal-600" />
            <span>Port Discharging</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-600" />
            <span>Drydock &amp; Class Survey</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-cyan-600" />
            <span>Underwater Hull Scrub</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-600" />
            <span>Engine Overhaul / BWTS</span>
          </span>
        </div>
      </div>

      {/* TIMELINE GANTT CANVAS */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg shadow-sm overflow-hidden flex flex-col">
        {/* Timeline Header Info */}
        <div className="p-4 bg-[#F4F0E8] dark:bg-[#16202C] border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">
              view_timeline
            </span>
            <span className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Fleet Voyage &amp; Maintenance Timeline ({totalDays} Days Horizon)
            </span>
          </div>
          <span className="text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic hidden sm:inline">
            Click any segment bar to inspect cargo details, work scope, or simulate laycan shifts
          </span>
        </div>

        {/* Gantt Scrollable Grid */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto relative w-full scrollbar-thin scrollbar-thumb-[#DDD8CE] dark:scrollbar-thumb-[#1F2E3E]"
        >
          <div className="min-w-[980px] flex flex-col">
            {/* 1. TIMELINE DATE HEADER ROW */}
            <div className="flex border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/80 dark:bg-[#16202C]/90 sticky top-0 z-20">
              {/* Frozen Left Ship Name Column Header */}
              <div className="w-64 min-w-[16rem] p-3 border-r border-[#DDD8CE] dark:border-[#1F2E3E] font-mono-data font-bold text-xs text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider bg-[#EDE8DE] dark:bg-[#16202C] flex items-center justify-between">
                <span>Vessel / Particulars</span>
                <span className="text-[10px] font-normal text-[#BC412B] dark:text-[#E05A42]">
                  {filteredFleet.length} Ships
                </span>
              </div>

              {/* Date Columns Header */}
              <div className="flex-1 relative flex flex-col">
                {/* Month Row */}
                <div className="flex border-b border-[#DDD8CE]/60 dark:border-[#1F2E3E]/60 text-[11px] font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  {monthGroups.map((mg, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${(mg.colSpan / totalDays) * 100}%` }}
                      className="py-1 px-2 border-r border-[#DDD8CE]/60 dark:border-[#1F2E3E]/60 truncate"
                    >
                      {mg.name} 2026
                    </div>
                  ))}
                </div>

                {/* Day Numbers & Today marker */}
                <div className="flex text-[10px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
                  {dayColumns.map((col, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${(1 / totalDays) * 100}%` }}
                      className={`py-1 text-center border-r border-[#DDD8CE]/40 dark:border-[#1F2E3E]/40 ${
                        col.isToday
                          ? 'bg-[#BC412B] text-white font-bold'
                          : col.isWeekend
                          ? 'bg-black/5 dark:bg-white/5'
                          : ''
                      }`}
                      title={col.dateStr}
                    >
                      {totalDays <= 60 || idx % 2 === 0 ? col.dayNum : ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. FLEET ROWS */}
            {filteredFleet.length === 0 ? (
              <div className="p-12 text-center text-[#7A7268] dark:text-[#8E9B97] font-serif-body">
                <span className="material-symbols-outlined text-4xl text-[#DDD8CE] dark:text-[#1F2E3E] block mb-2">
                  search_off
                </span>
                No fleet vessels or maintenance windows match the selected filters.
              </div>
            ) : (
              <div className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E] relative">
                {/* Vertical "TODAY" Reference Line */}
                {todayOffsetPct >= 0 && todayOffsetPct <= 100 && (
                  <div
                    style={{ left: `calc(16rem + (100% - 16rem) * ${todayOffsetPct / 100})` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-[#BC412B] dark:bg-[#E05A42] z-10 pointer-events-none shadow-sm"
                  >
                    <div className="sticky top-10 -ml-8 px-2 py-0.5 rounded bg-[#BC412B] text-white text-[9px] font-mono-data font-bold uppercase tracking-wider shadow-md">
                      Today (Aug 30)
                    </div>
                  </div>
                )}

                {filteredFleet.map((vessel) => (
                  <div
                    key={vessel.vesselId}
                    className="flex hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/40 transition-colors group min-h-[76px]"
                  >
                    {/* Left Frozen Column: Vessel Specs */}
                    <div className="w-64 min-w-[16rem] p-3.5 border-r border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#FAFAF8] dark:bg-[#101820] flex flex-col justify-center gap-1 flex-shrink-0 z-10">
                      <div className="flex items-center justify-between">
                        <span className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] truncate">
                          {vessel.vesselName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono-data font-bold bg-[#EDE8DE] dark:bg-[#16202C] text-[#BC412B] dark:text-[#E05A42]">
                          {vessel.vesselClass}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
                        <span>{vessel.dwt.toLocaleString()} DWT</span>
                        <span>•</span>
                        <span>Flag: {vessel.flagCode}</span>
                        <span>•</span>
                        <span>{vessel.builtYear}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${
                          vessel.currentStatus === 'UNDERWAY' ? 'bg-blue-500 animate-pulse' :
                          vessel.currentStatus === 'BERTHED' ? 'bg-emerald-500' :
                          vessel.currentStatus === 'ANCHORAGE' ? 'bg-purple-500' :
                          vessel.currentStatus === 'IN_MAINTENANCE' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        <span className="text-[10px] text-[#444444] dark:text-[#A3B1AB] font-serif-body italic truncate" title={vessel.currentLocationDesc}>
                          {vessel.currentLocationDesc}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Timeline Segment Track */}
                    <div className="flex-1 relative p-2 flex items-center min-h-[76px]">
                      {/* Background Day Vertical Gridlines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {dayColumns.map((col, idx) => (
                          <div
                            key={idx}
                            style={{ width: `${(1 / totalDays) * 100}%` }}
                            className={`border-r border-[#DDD8CE]/30 dark:border-[#1F2E3E]/30 h-full ${
                              col.isWeekend ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Render Segments */}
                      <div className="relative w-full h-11">
                        {vessel.segments.map((segment) => {
                          const pos = getSegmentPosition(segment.startDate, segment.endDate);
                          if (!pos) return null;

                          const style = segmentTypeStyles[segment.type] || segmentTypeStyles.LADEN_VOYAGE;
                          const isWarning = segment.hasConflictWarning;

                          return (
                            <div
                              key={segment.id}
                              onClick={() => setSelectedSegment(segment)}
                              onMouseEnter={(e) => {
                                setHoveredSegment(segment);
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
                              }}
                              onMouseLeave={() => {
                                setHoveredSegment(null);
                                setTooltipPos(null);
                              }}
                              style={{
                                left: `${pos.leftPct}%`,
                                width: `${pos.widthPct}%`,
                                minWidth: '32px'
                              }}
                              className={`absolute top-0 bottom-0 rounded-md border ${style.barBg} ${style.barBorder} cursor-pointer p-1.5 flex items-center justify-between gap-1 shadow-xs hover:shadow-md hover:scale-[1.01] hover:z-20 transition-all overflow-hidden group/bar select-none`}
                            >
                              {/* Left Icon + Text */}
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="material-symbols-outlined text-[15px] flex-shrink-0 text-white drop-shadow-xs">
                                  {style.icon}
                                </span>
                                <div className="truncate">
                                  <span className="text-[11px] font-bold font-mono-data text-white drop-shadow-xs truncate block leading-tight">
                                    {segment.shortLabel || segment.title}
                                  </span>
                                  <span className="text-[9px] text-white/80 font-mono-data truncate block leading-none">
                                    {segment.durationDays}d • {segment.locationName.split('(')[0]}
                                  </span>
                                </div>
                              </div>

                              {/* Warning Indicator */}
                              {isWarning && (
                                <span className="material-symbols-outlined text-amber-300 text-[15px] animate-bounce flex-shrink-0" title="Draft / Laycan Warning">
                                  warning
                                </span>
                              )}

                              {/* Progress Fill if In-Progress */}
                              {segment.status === 'IN_PROGRESS' && segment.progressPct && (
                                <div 
                                  style={{ width: `${segment.progressPct}%` }}
                                  className="absolute bottom-0 left-0 h-1 bg-white/60"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HOVER TOOLTIP */}
      {hoveredSegment && tooltipPos && (
        <div
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          className="fixed z-50 pointer-events-none bg-[#0C1622]/95 backdrop-blur-md text-white border border-[#1E354B] rounded-lg p-3 shadow-2xl max-w-xs text-xs animate-fadeIn font-sans"
        >
          <div className="flex items-center gap-1.5 mb-1 font-mono-data text-[10px] text-[#BC412B] dark:text-[#E05A42] font-bold uppercase">
            <span>{hoveredSegment.vesselName}</span>
            <span>•</span>
            <span>{segmentTypeStyles[hoveredSegment.type]?.label}</span>
          </div>
          <h4 className="font-editorial text-sm font-bold text-white mb-1">
            {hoveredSegment.title}
          </h4>
          <div className="space-y-0.5 text-[11px] text-[#A3B1AB] font-mono-data">
            <div>Schedule: <span className="text-white font-bold">{hoveredSegment.startDate} to {hoveredSegment.endDate}</span> ({hoveredSegment.durationDays} days)</div>
            <div>Location: <span className="text-white">{hoveredSegment.locationName}</span></div>
            {hoveredSegment.cargoType && (
              <div>Cargo: <span className="text-white">{hoveredSegment.cargoType} ({hoveredSegment.cargoQuantityMT?.toLocaleString()} MT)</span></div>
            )}
            {hoveredSegment.shipyardName && (
              <div>Shipyard: <span className="text-white">{hoveredSegment.shipyardName}</span></div>
            )}
            {hoveredSegment.maintenanceBudgetUSD && (
              <div>CapEx Budget: <span className="text-[#3EB58A] font-bold">${hoveredSegment.maintenanceBudgetUSD.toLocaleString()} USD</span></div>
            )}
          </div>
          {hoveredSegment.hasConflictWarning && (
            <div className="mt-1.5 pt-1.5 border-t border-rose-500/40 text-rose-400 text-[10px] font-serif-body">
              ⚠️ {hoveredSegment.conflictDetails}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT INSPECTOR / RESCHEDULE MODAL */}
      {selectedSegment && (
        <VesselSegmentModal
          segment={selectedSegment}
          onClose={() => setSelectedSegment(null)}
          onUpdateSegment={handleUpdateSegment}
        />
      )}

      {/* ADD SCHEDULE WINDOW MODAL */}
      {isAddModalOpen && (
        <AddScheduleModal
          fleet={fleetSchedules}
          onClose={() => setIsAddModalOpen(false)}
          onAddSegment={handleAddSegment}
        />
      )}
    </div>
  );
};
