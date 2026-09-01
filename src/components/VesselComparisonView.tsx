import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import { vesselComparisonData } from '../data/maritimeData';
import { VesselComparisonItem } from '../types';
import { useLiveBunkerPrice } from '../hooks/useLiveBunkerPrice';

interface VesselComparisonViewProps {
  onSelectVesselForAnalysis?: (vesselClass: string) => void;
  onNavigateToOptimization?: () => void;
}

type SpeedMode = 'laden' | 'eco';
type UnitSystem = 'metric' | 'imperial';

export const VesselComparisonView: React.FC<VesselComparisonViewProps> = ({
  onSelectVesselForAnalysis,
  onNavigateToOptimization
}) => {
  // Selected vessel IDs for comparison
  const [selectedVesselIds, setSelectedVesselIds] = useState<string[]>([
    'supramax',
    'ultramax',
    'panamax',
    'capesize'
  ]);

  // View state toggles
  const [highlightBest, setHighlightBest] = useState<boolean>(true);
  const [showDifferencesOnly, setShowDifferencesOnly] = useState<boolean>(false);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('laden');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Live-anchored bunker feed (see src/hooks/useLiveBunkerPrice.ts) — small simulated drift
  // around the last real VLSFO benchmark in freightForecastHistory, same "live tick"
  // convention already used elsewhere in the app for vessel/port telemetry.
  const liveBunker = useLiveBunkerPrice();

  // Scenario Simulator Inputs
  const [voyageDistanceNM, setVoyageDistanceNM] = useState<number>(5612); // Newcastle -> Paradip
  const [bunkerPriceUSD, setBunkerPriceUSD] = useState<number>(() => liveBunker.anchorUSD); // VLSFO $/MT
  const [parcelQuantityMT, setParcelQuantityMT] = useState<number>(180000); // 180K MT benchmark

  // Collapsible section state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    summary: false,
    efficiency: false,
    fuel: false,
    capacity: false,
    dimensions: false,
    economics: false
  });

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Preset selectors
  const applyPreset = (preset: 'recommended' | 'all' | 'compatible' | 'geared' | 'headToHead') => {
    switch (preset) {
      case 'recommended':
        setSelectedVesselIds(['supramax', 'ultramax', 'panamax', 'capesize']);
        break;
      case 'all':
        setSelectedVesselIds(vesselComparisonData.map((v) => v.id));
        break;
      case 'compatible':
        setSelectedVesselIds(
          vesselComparisonData.filter((v) => v.compatibility === 'Compatible').map((v) => v.id)
        );
        break;
      case 'geared':
        setSelectedVesselIds(
          vesselComparisonData.filter((v) => v.hasCranes || v.classType === 'Panamax').map((v) => v.id)
        );
        break;
      case 'headToHead':
        setSelectedVesselIds(['panamax', 'capesize']);
        break;
    }
  };

  const handleToggleVessel = (id: string) => {
    if (selectedVesselIds.includes(id)) {
      if (selectedVesselIds.length <= 1) return; // keep at least 1
      setSelectedVesselIds(selectedVesselIds.filter((vId) => vId !== id));
    } else {
      setSelectedVesselIds([...selectedVesselIds, id]);
    }
  };

  // Selected Vessel Objects
  const selectedVessels: VesselComparisonItem[] = useMemo(() => {
    return vesselComparisonData.filter((v) => selectedVesselIds.includes(v.id));
  }, [selectedVesselIds]);

  // Recalculate dynamic scenario metrics based on simulator
  const calculatedMetrics = useMemo(() => {
    return selectedVessels.map((v) => {
      const currentSpeed = speedMode === 'laden' ? v.ladenSpeedKnots : v.ecoSpeedKnots;
      const currentFuelBurnPerDay =
        speedMode === 'laden' ? v.ladenFuelConsumptionMTDay : v.ecoFuelConsumptionMTDay;

      // Transit Days at current speed
      const steamingDays = voyageDistanceNM / (currentSpeed * 24);
      // Total Port Days (loading in Newcastle ~2.5d + discharging in Paradip)
      const portDays = 2.5 + v.turnaroundDaysParadip;
      const totalDays = steamingDays + portDays;

      // Fuel burn: sea transit + port idle/working
      const seaFuelBurnMT = steamingDays * currentFuelBurnPerDay;
      const portFuelBurnMT = portDays * ((v.portIdleConsumptionMTDay + v.portWorkingConsumptionMTDay) / 2);
      const totalFuelBurnMT = seaFuelBurnMT + portFuelBurnMT;

      // Financials
      const dailyBunkerSpend = currentFuelBurnPerDay * bunkerPriceUSD;
      const totalBunkerBill = totalFuelBurnMT * bunkerPriceUSD;
      const charterHireCost = totalDays * v.dailyTceRateUSD;
      const lighteringTotal = v.lighteringCostPerTonUSD * Math.min(v.dwt, parcelQuantityMT);
      const portDuesEst = (v.grossTonnage * 0.72) + 28000;
      const totalVoyageCost = totalBunkerBill + charterHireCost + lighteringTotal + portDuesEst;

      const cargoLiftingCapacity = Math.min(v.maxSafeParcelParadipMT, v.dwt);
      const effectiveFreightPerTon = totalVoyageCost / cargoLiftingCapacity;
      const bunkerCostPerTon = totalBunkerBill / cargoLiftingCapacity;
      const voyagesToLiftParcel = parcelQuantityMT / cargoLiftingCapacity;

      return {
        id: v.id,
        currentSpeed,
        currentFuelBurnPerDay,
        steamingDays: Number(steamingDays.toFixed(1)),
        totalDays: Number(totalDays.toFixed(1)),
        totalFuelBurnMT: Math.round(totalFuelBurnMT),
        dailyBunkerSpend: Math.round(dailyBunkerSpend),
        totalBunkerBill: Math.round(totalBunkerBill),
        totalVoyageCost: Math.round(totalVoyageCost),
        effectiveFreightPerTon: Number(effectiveFreightPerTon.toFixed(2)),
        bunkerCostPerTon: Number(bunkerCostPerTon.toFixed(2)),
        cargoLiftingCapacity,
        voyagesToLiftParcel: Number(voyagesToLiftParcel.toFixed(1))
      };
    });
  }, [selectedVessels, speedMode, voyageDistanceNM, bunkerPriceUSD, parcelQuantityMT]);

  // Find best values for comparison highlighting
  const bestValues = useMemo(() => {
    if (selectedVessels.length <= 1) return {};

    const calcMap = Object.fromEntries(calculatedMetrics.map((c) => [c.id, c]));

    // Lowest fuel burn at sea
    const minFuelId = selectedVessels.reduce((minId, v) => {
      const burn = speedMode === 'laden' ? v.ladenFuelConsumptionMTDay : v.ecoFuelConsumptionMTDay;
      const currentMinBurn =
        speedMode === 'laden'
          ? (vesselComparisonData.find((x) => x.id === minId)?.ladenFuelConsumptionMTDay || 999)
          : (vesselComparisonData.find((x) => x.id === minId)?.ecoFuelConsumptionMTDay || 999);
      return burn < currentMinBurn ? v.id : minId;
    }, selectedVessels[0]?.id || '');

    // Lowest effective freight rate
    const minFreightId = selectedVessels.reduce((minId, v) => {
      const rate = calcMap[v.id]?.effectiveFreightPerTon ?? v.freightRatePerTonUSD;
      const minRate = calcMap[minId]?.effectiveFreightPerTon ?? 999;
      return rate < minRate ? v.id : minId;
    }, selectedVessels[0]?.id);

    // Highest safe cargo intake at Paradip
    const maxIntakeId = selectedVessels.reduce((maxId, v) => {
      return v.maxSafeParcelParadipMT >
        (vesselComparisonData.find((x) => x.id === maxId)?.maxSafeParcelParadipMT || 0)
        ? v.id
        : maxId;
    }, selectedVessels[0]?.id);

    // Highest Suitability Score
    const maxSuitabilityId = selectedVessels.reduce((maxId, v) => {
      return v.suitabilityScore >
        (vesselComparisonData.find((x) => x.id === maxId)?.suitabilityScore || 0)
        ? v.id
        : maxId;
    }, selectedVessels[0]?.id);

    // Best Transport Efficiency
    const maxEfficiencyId = selectedVessels.reduce((maxId, v) => {
      return v.transportEfficiencyScore >
        (vesselComparisonData.find((x) => x.id === maxId)?.transportEfficiencyScore || 0)
        ? v.id
        : maxId;
    }, selectedVessels[0]?.id);

    // Lowest draft
    const minDraftId = selectedVessels.reduce((minId, v) => {
      return v.ladenDraftM < (vesselComparisonData.find((x) => x.id === minId)?.ladenDraftM || 99)
        ? v.id
        : minId;
    }, selectedVessels[0]?.id);

    // Lowest turnaround days
    const minTurnaroundId = selectedVessels.reduce((minId, v) => {
      return v.turnaroundDaysParadip <
        (vesselComparisonData.find((x) => x.id === minId)?.turnaroundDaysParadip || 99)
        ? v.id
        : minId;
    }, selectedVessels[0]?.id);

    return {
      minFuelId,
      minFreightId,
      maxIntakeId,
      maxSuitabilityId,
      maxEfficiencyId,
      minDraftId,
      minTurnaroundId
    };
  }, [selectedVessels, speedMode, calculatedMetrics]);

  // Multi-axis radar diagram: normalizes 5 heterogeneous metrics (0-100) so classes with very
  // different units (MT/day fuel burn, meters draft, tons intake) plot on one comparable chart.
  const RADAR_PALETTE = ['#BC412B', '#2D5A43', '#243E56', '#8C5E28', '#8B5CF6', '#0EA5E9', '#7A7268'];
  const radarData = useMemo(() => {
    const axes = ['Suitability', 'Transport Efficiency', 'Fuel Efficiency', 'Cargo Intake', 'Draft Flexibility'] as const;
    const burnOf = (v: VesselComparisonItem) => (speedMode === 'laden' ? v.ladenFuelConsumptionMTDay : v.ecoFuelConsumptionMTDay);
    const allBurns = vesselComparisonData.map(burnOf);
    const minBurn = Math.min(...allBurns);
    const maxBurn = Math.max(...allBurns);
    const allDrafts = vesselComparisonData.map((v) => v.ladenDraftM);
    const minDraft = Math.min(...allDrafts);
    const maxDraft = Math.max(...allDrafts);
    const maxIntake = Math.max(...vesselComparisonData.map((v) => v.maxSafeParcelParadipMT));

    return axes.map((axis) => {
      const row: Record<string, string | number> = { axis };
      selectedVessels.forEach((v) => {
        let val = 0;
        switch (axis) {
          case 'Suitability':
            val = v.suitabilityScore;
            break;
          case 'Transport Efficiency':
            val = v.transportEfficiencyScore;
            break;
          case 'Fuel Efficiency':
            val = maxBurn === minBurn ? 100 : 100 - ((burnOf(v) - minBurn) / (maxBurn - minBurn)) * 100;
            break;
          case 'Cargo Intake':
            val = (v.maxSafeParcelParadipMT / maxIntake) * 100;
            break;
          case 'Draft Flexibility':
            val = maxDraft === minDraft ? 100 : 100 - ((v.ladenDraftM - minDraft) / (maxDraft - minDraft)) * 100;
            break;
        }
        row[v.name] = Math.round(val);
      });
      return row;
    });
  }, [selectedVessels, speedMode]);

  // Copy Comparison Memo
  const handleCopyMemo = () => {
    const lines = [
      '========================================================',
      'MARLIN MARITIME INTELLIGENCE - VESSEL COMPARISON MONOGRAPH',
      `Voyage: Newcastle -> Paradip (${voyageDistanceNM.toLocaleString()} NM) | Cargo: ${parcelQuantityMT.toLocaleString()} MT Coal`,
      `Bunker Benchmark: $${bunkerPriceUSD}/MT VLSFO | Steaming Mode: ${speedMode.toUpperCase()}`,
      '========================================================\n'
    ];

    selectedVessels.forEach((v) => {
      const calc = calculatedMetrics.find((c) => c.id === v.id);
      lines.push(`VESSEL: ${v.name} (${v.classType}) - ${v.operationalFit}`);
      lines.push(`  - Suitability Score: ${v.suitabilityScore}/100 | Port Compatibility: ${v.compatibility}`);
      lines.push(`  - DWT: ${v.dwt.toLocaleString()} MT | Max Safe Paradip Intake: ${v.maxSafeParcelParadipMT.toLocaleString()} MT`);
      lines.push(`  - Laden Draft: ${v.ladenDraftM}m (Port Limit: 14.5m) | LOA: ${v.loaM}m | Beam: ${v.beamM}m`);
      lines.push(`  - Fuel Burn (${speedMode}): ${calc?.currentFuelBurnPerDay || v.ladenFuelConsumptionMTDay} MT/day ($${calc?.dailyBunkerSpend.toLocaleString() || v.dailyBunkerCostUSD.toLocaleString()}/day)`);
      lines.push(`  - Voyage Total Fuel: ${calc?.totalFuelBurnMT || v.voyageFuelBurnNewcastleParadipMT} MT ($${calc?.totalBunkerBill.toLocaleString() || 'N/A'})`);
      lines.push(`  - Net Freight Rate: $${calc?.effectiveFreightPerTon || v.freightRatePerTonUSD}/MT (Bunker Share: $${calc?.bunkerCostPerTon || v.bunkerCostPerTonCargoUSD}/MT)`);
      lines.push(`  - Round Voyages for 180K MT: ${calc?.voyagesToLiftParcel || v.voyagesNeededFor180kMT} trips`);
      lines.push(`  - CII Rating: ${v.ciiRating} | EEXI: ${v.eexiValueGramsCO2} gCO2/t-nm | Gearing: ${v.gearing}`);
      lines.push(`  - Lightering at Paradip: ${v.lighteringRequiredParadip ? `YES (+$${v.lighteringCostPerTonUSD}/MT)` : 'NO (Direct Berth)'}`);
      lines.push('--------------------------------------------------------');
    });

    lines.push('\nRECOMMENDATION:');
    lines.push('Panamax 75K remains the optimal chartering class for Newcastle -> Paradip direct discharge.');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <button
          onClick={onNavigateToOptimization}
          className="hover:text-[#BC412B] dark:hover:text-[#E05A42] hover:underline cursor-pointer"
        >
          Fleet Optimization
        </button>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">
          Side-by-Side Vessel Comparison
        </span>
      </div>

      {/* Header & Monograph Title */}
      <div className="pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold font-mono-data">
              Hull Architecture &amp; Hydrodynamic Benchmarking
            </span>
            <span className="px-2 py-0.2 bg-[#2D5A43] text-white text-[10px] font-bold rounded font-mono-data">
              COMPARATIVE ENGINE
            </span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Vessel Class Comparison &amp; Efficiency Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Side-by-side evaluation of dry bulk carrier efficiency, daily fuel burn, bunker economics, draft constraints, and cargo capacity
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {onNavigateToOptimization && (
            <button
              onClick={onNavigateToOptimization}
              className="px-3.5 py-2 rounded bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] text-xs font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px] text-[#BC412B]">grid_view</span>
              <span>Port Suitability Matrix</span>
            </button>
          )}
          <button
            onClick={handleCopyMemo}
            className="px-4 py-2 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copiedNotification ? 'done' : 'content_copy'}
            </span>
            <span>{copiedNotification ? 'Comparison Copied!' : 'Export Comparison Memo'}</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Vessel Selector Chips & Quick Presets */}
      <div className="bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#BC412B] text-[18px]">directions_boat</span>
              <span>Select Vessels for Side-by-Side Comparison ({selectedVessels.length} of {vesselComparisonData.length})</span>
            </span>
            <span className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic block">
              Toggle checkboxes to add or remove hull classes from the comparison table
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap font-mono-data text-xs">
            <span className="text-[10px] text-[#7A7268] uppercase font-bold mr-1">Presets:</span>
            <button
              onClick={() => applyPreset('recommended')}
              className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#1A1A1A] dark:text-[#E8ECE9] hover:bg-[#BC412B] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            >
              Recommended Mix
            </button>
            <button
              onClick={() => applyPreset('compatible')}
              className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#1A1A1A] dark:text-[#E8ECE9] hover:bg-[#2D5A43] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            >
              Paradip Direct Berthing
            </button>
            <button
              onClick={() => applyPreset('geared')}
              className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#1A1A1A] dark:text-[#E8ECE9] hover:bg-[#BC412B] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            >
              Geared vs Panamax
            </button>
            <button
              onClick={() => applyPreset('headToHead')}
              className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#1A1A1A] dark:text-[#E8ECE9] hover:bg-[#BC412B] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            >
              Panamax vs Capesize
            </button>
            <button
              onClick={() => applyPreset('all')}
              className="px-2.5 py-1 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#1A1A1A] dark:text-[#E8ECE9] hover:bg-[#BC412B] hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            >
              All 7 Classes
            </button>
          </div>
        </div>

        {/* Vessel Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {vesselComparisonData.map((vessel, idx) => {
            const isChecked = selectedVesselIds.includes(vessel.id);
            return (
              <motion.div
                key={vessel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => handleToggleVessel(vessel.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isChecked
                    ? 'bg-[#EDE8DE] dark:bg-[#1A2634] border-[#BC412B] shadow-xs'
                    : 'bg-[#F9F7F2] dark:bg-[#16202C] border-[#DDD8CE] dark:border-[#1F2E3E] opacity-65 hover:opacity-100 hover:border-[#7A7268]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-editorial font-bold text-xs sm:text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {vessel.classType}
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="accent-[#BC412B] h-3.5 w-3.5 rounded cursor-pointer mt-0.5"
                  />
                </div>

                <div className="mt-1.5 space-y-0.5 font-mono-data text-[10px]">
                  <span className="text-[#6B645C] dark:text-[#A3B1AB] block">
                    {(vessel.dwt / 1000).toFixed(0)}K DWT · {vessel.ladenDraftM}m draft
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`px-1 rounded font-bold text-[9px] ${
                      vessel.isRecommended
                        ? 'bg-[#BC412B] text-white'
                        : vessel.compatibility === 'Compatible'
                        ? 'bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A]'
                        : 'bg-[#BC412B]/10 text-[#BC412B]'
                    }`}>
                      {vessel.isRecommended ? 'OPTIMAL' : vessel.compatibility === 'Compatible' ? 'DIRECT BERTH' : 'RESTRICTED'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Scenario & Parameter Simulator Bar */}
      <div className="bg-[#F4F0E8] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] text-[20px]">tune</span>
            <h3 className="font-editorial text-sm sm:text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Voyage Economics &amp; Bunker Scenario Simulator
            </h3>
          </div>
          <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-serif-body italic">
            Adjusting parameters dynamically recomputes daily bunker burn, voyage days, and net $/MT freight
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-data">
          {/* Steaming Speed Mode */}
          <div className="p-3 bg-white dark:bg-[#121B26] rounded border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col justify-between">
            <span className="text-[10px] text-[#7A7268] uppercase font-bold tracking-wider block mb-1">
              Steaming Speed Mode
            </span>
            <div className="flex bg-[#EDE8DE] dark:bg-[#1A2634] p-0.5 rounded">
              <button
                onClick={() => setSpeedMode('laden')}
                className={`flex-1 py-1 text-center rounded transition-all font-bold cursor-pointer ${
                  speedMode === 'laden'
                    ? 'bg-[#BC412B] text-white shadow-2xs'
                    : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A]'
                }`}
              >
                Laden (13.5-14.5 kts)
              </button>
              <button
                onClick={() => setSpeedMode('eco')}
                className={`flex-1 py-1 text-center rounded transition-all font-bold cursor-pointer ${
                  speedMode === 'eco'
                    ? 'bg-[#2D5A43] text-white shadow-2xs'
                    : 'text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A]'
                }`}
              >
                Eco-Speed (11.5-12.2 kts)
              </button>
            </div>
          </div>

          {/* Bunker Fuel Price */}
          <div className="p-3 bg-white dark:bg-[#121B26] rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[#7A7268] uppercase font-bold tracking-wider flex items-center gap-1.5">
                VLSFO Bunker Price
                <span className="inline-flex items-center gap-1 px-1.5 py-0.1 rounded bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A] text-[8px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3EB58A] animate-pulse" />
                  LIVE ${liveBunker.priceUSD.toFixed(1)}
                </span>
              </span>
              <span className="font-extrabold text-[#BC412B] dark:text-[#E05A42]">
                ${bunkerPriceUSD}/MT
              </span>
            </div>
            <input
              type="range"
              min="400"
              max="900"
              step="10"
              value={bunkerPriceUSD}
              onChange={(e) => setBunkerPriceUSD(Number(e.target.value))}
              className="w-full accent-[#BC412B] cursor-pointer"
            />
            <div className="flex justify-between items-center text-[9px] text-[#7A7268] mt-0.5">
              <span>$400 (Low)</span>
              <button
                onClick={() => setBunkerPriceUSD(Math.round(liveBunker.priceUSD))}
                className="text-[#BC412B] dark:text-[#E05A42] font-bold hover:underline cursor-pointer"
              >
                Sync to Live
              </button>
              <span>$900 (High)</span>
            </div>
          </div>

          {/* Voyage Corridor Distance */}
          <div className="p-3 bg-white dark:bg-[#121B26] rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[#7A7268] uppercase font-bold tracking-wider">
                Corridor Distance
              </span>
              <span className="font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">
                {voyageDistanceNM.toLocaleString()} NM
              </span>
            </div>
            <div className="flex gap-1">
              {[
                { label: 'Newcastle-PDP', nm: 5612 },
                { label: 'Taboneo-Vizag', nm: 2400 },
                { label: 'Tubarao-Qingdao', nm: 11200 }
              ].map((route) => (
                <button
                  key={route.nm}
                  onClick={() => setVoyageDistanceNM(route.nm)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    voyageDistanceNM === route.nm
                      ? 'bg-[#1A1A1A] dark:bg-[#E8ECE9] text-white dark:text-[#1A1A1A]'
                      : 'bg-[#EDE8DE] dark:bg-[#1A2634] text-[#6B645C] hover:text-[#1A1A1A]'
                  }`}
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Cargo Parcel */}
          <div className="p-3 bg-white dark:bg-[#121B26] rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[#7A7268] uppercase font-bold tracking-wider">
                Total Cargo Parcel
              </span>
              <span className="font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9]">
                {parcelQuantityMT.toLocaleString()} MT
              </span>
            </div>
            <div className="flex gap-1">
              {[65000, 120000, 180000, 240000].map((mt) => (
                <button
                  key={mt}
                  onClick={() => setParcelQuantityMT(mt)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    parcelQuantityMT === mt
                      ? 'bg-[#BC412B] text-white'
                      : 'bg-[#EDE8DE] dark:bg-[#1A2634] text-[#6B645C] hover:text-[#1A1A1A]'
                  }`}
                >
                  {(mt / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Options Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs font-mono-data border-t border-[#DDD8CE] dark:border-[#1F2E3E]">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightBest}
                onChange={(e) => setHighlightBest(e.target.checked)}
                className="accent-[#2D5A43] h-3.5 w-3.5 rounded"
              />
              <span className="text-[#1A1A1A] dark:text-[#E8ECE9] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#2D5A43]" />
                Highlight Best-in-Class Metrics
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDifferencesOnly}
                onChange={(e) => setShowDifferencesOnly(e.target.checked)}
                className="accent-[#BC412B] h-3.5 w-3.5 rounded"
              />
              <span className="text-[#1A1A1A] dark:text-[#E8ECE9] font-medium">
                Hide Identical Attributes
              </span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#7A7268] text-[11px]">Units:</span>
            <div className="flex bg-[#EDE8DE] dark:bg-[#1A2634] p-0.5 rounded">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-2.5 py-0.5 text-[10px] rounded font-bold cursor-pointer ${
                  unitSystem === 'metric'
                    ? 'bg-white dark:bg-[#121B26] text-[#BC412B] shadow-2xs'
                    : 'text-[#7A7268]'
                }`}
              >
                Metric (MT, m)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-2.5 py-0.5 text-[10px] rounded font-bold cursor-pointer ${
                  unitSystem === 'imperial'
                    ? 'bg-white dark:bg-[#121B26] text-[#BC412B] shadow-2xs'
                    : 'text-[#7A7268]'
                }`}
              >
                Imperial (LT, ft)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Graphical Comparison Summary Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric Bar 1: Daily Fuel Burn (MT/day) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-[#121B26] p-4 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#BC412B] text-[16px]">local_gas_station</span>
              <span>Daily Fuel Burn ({speedMode.toUpperCase()})</span>
            </span>
            <span className="text-[10px] font-mono-data text-[#7A7268]">MT / Day</span>
          </div>
          <div className="space-y-2">
            {selectedVessels.map((v) => {
              const burn = speedMode === 'laden' ? v.ladenFuelConsumptionMTDay : v.ecoFuelConsumptionMTDay;
              const maxBurn = 50;
              const pct = (burn / maxBurn) * 100;
              const isBest = highlightBest && bestValues.minFuelId === v.id;
              return (
                <div key={v.id} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-mono-data">
                    <span className="font-semibold text-[#1A1A1A] dark:text-[#E8ECE9]">{v.name}</span>
                    <span className={isBest ? 'text-[#2D5A43] dark:text-[#3EB58A] font-bold' : 'text-[#7A7268]'}>
                      {burn} MT/d {isBest && '★'}
                    </span>
                  </div>
                  <div className="w-full bg-[#EDE8DE] dark:bg-[#1C2834] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isBest ? 'bg-[#2D5A43]' : v.isRecommended ? 'bg-[#BC412B]' : 'bg-[#7A7268]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Metric Bar 2: Max Safe Intake vs Total DWT */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="bg-white dark:bg-[#121B26] p-4 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#2D5A43] text-[16px]">inventory_2</span>
              <span>Safe Intake at Paradip (14.5m Draft)</span>
            </span>
            <span className="text-[10px] font-mono-data text-[#7A7268]">Metric Tons</span>
          </div>
          <div className="space-y-2">
            {selectedVessels.map((v) => {
              const intake = v.maxSafeParcelParadipMT;
              const maxVal = 210000;
              const pct = (intake / maxVal) * 100;
              const isBest = highlightBest && bestValues.maxIntakeId === v.id;
              return (
                <div key={v.id} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-mono-data">
                    <span className="font-semibold text-[#1A1A1A] dark:text-[#E8ECE9]">{v.name}</span>
                    <span className={v.lighteringRequiredParadip ? 'text-[#BC412B] font-bold' : 'text-[#2D5A43] dark:text-[#3EB58A] font-bold'}>
                      {intake.toLocaleString()} MT {v.lighteringRequiredParadip && '(Lightering)'}
                    </span>
                  </div>
                  <div className="w-full bg-[#EDE8DE] dark:bg-[#1C2834] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        v.lighteringRequiredParadip ? 'bg-[#BC412B]/70' : isBest ? 'bg-[#2D5A43]' : 'bg-[#BC412B]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Metric Bar 3: Effective Landed Freight Rate */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="bg-white dark:bg-[#121B26] p-4 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8C5E28] text-[16px]">payments</span>
              <span>Effective Net Freight Rate ($/MT)</span>
            </span>
            <span className="text-[10px] font-mono-data text-[#7A7268]">USD / Ton</span>
          </div>
          <div className="space-y-2">
            {selectedVessels.map((v) => {
              const calc = calculatedMetrics.find((c) => c.id === v.id);
              const rate = calc?.effectiveFreightPerTon || v.freightRatePerTonUSD;
              const maxRate = 25;
              const pct = (rate / maxRate) * 100;
              const isBest = highlightBest && bestValues.minFreightId === v.id;
              return (
                <div key={v.id} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-mono-data">
                    <span className="font-semibold text-[#1A1A1A] dark:text-[#E8ECE9]">{v.name}</span>
                    <span className={isBest ? 'text-[#2D5A43] dark:text-[#3EB58A] font-bold' : 'text-[#BC412B] dark:text-[#E05A42] font-bold'}>
                      ${rate.toFixed(2)}/MT {isBest && '★ BEST'}
                    </span>
                  </div>
                  <div className="w-full bg-[#EDE8DE] dark:bg-[#1C2834] h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isBest ? 'bg-[#2D5A43]' : 'bg-[#BC412B]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Multi-Axis Suitability Radar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="bg-white dark:bg-[#121B26] p-4 sm:p-5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] shadow-sm"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-editorial text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8B5CF6] text-[16px]">radar</span>
            <span>Multi-Axis Suitability Radar</span>
          </span>
          <span className="text-[10px] font-mono-data text-[#7A7268] dark:text-[#8E9B97]">Normalized 0–100 per axis</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="#8E9B97" strokeOpacity={0.3} />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#8E9B97' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {selectedVessels.map((v, i) => (
              <Radar
                key={v.id}
                name={v.name}
                dataKey={v.name}
                stroke={RADAR_PALETTE[i % RADAR_PALETTE.length]}
                fill={RADAR_PALETTE[i % RADAR_PALETTE.length]}
                fillOpacity={0.15}
                strokeWidth={2}
                animationDuration={600}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* COMPREHENSIVE SIDE-BY-SIDE COMPARISON TABLE */}
      <div className="bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg shadow-sm overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[22px]">
              splitscreen
            </span>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                Side-by-Side Vessel Comparison Matrix
              </h3>
              <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                Evaluating {selectedVessels.length} vessel classes across hydrodynamics, bunker burn, cubic parceling, and landed freight
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-data text-[#7A7268] dark:text-[#8E9B97]">
              {selectedVessels.length} vessels selected
            </span>
          </div>
        </div>

        {/* The Scrollable Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header: Selected Vessel Columns */}
            <thead>
              <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/90 dark:bg-[#1A2634]">
                <th className="py-4 px-4 font-editorial font-bold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] min-w-[220px] sticky left-0 bg-[#EDE8DE] dark:bg-[#1A2634] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Metric / Technical Parameter
                </th>

                {selectedVessels.map((vessel) => (
                  <th
                    key={vessel.id}
                    className={`py-4 px-4 min-w-[210px] align-top transition-colors ${
                      vessel.isRecommended
                        ? 'bg-[#BC412B]/10 dark:bg-[#BC412B]/20 border-t-4 border-[#BC412B]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-editorial font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-[#E8ECE9]">
                          {vessel.name}
                        </span>
                        {selectedVessels.length > 1 && (
                          <button
                            onClick={() => handleToggleVessel(vessel.id)}
                            title="Remove vessel from comparison"
                            className="text-[#7A7268] hover:text-[#BC412B] p-0.5 rounded cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono-data font-bold px-2 py-0.5 rounded ${
                          vessel.isRecommended
                            ? 'bg-[#BC412B] text-white shadow-2xs'
                            : vessel.operationalFit === 'Strong fit'
                            ? 'bg-[#2D5A43] text-white'
                            : vessel.operationalFit === 'NOT RECOMMENDED'
                            ? 'bg-[#BC412B]/15 text-[#BC412B] border border-[#BC412B]/30'
                            : 'bg-[#EDE8DE] dark:bg-[#1C2834] text-[#7A7268]'
                        }`}>
                          {vessel.operationalFit}
                        </span>
                        {vessel.isRecommended && (
                          <span className="text-[9px] font-bold font-mono-data text-[#BC412B] dark:text-[#E05A42]">
                            ★ RECOMMENDED
                          </span>
                        )}
                      </div>

                      {/* Quick Charter Analysis CTA */}
                      {onSelectVesselForAnalysis && (
                        <button
                          onClick={() => onSelectVesselForAnalysis(vessel.classType)}
                          className="mt-1 w-full py-1 px-2 rounded bg-white dark:bg-[#121B26] hover:bg-[#BC412B] hover:text-white border border-[#DDD8CE] dark:border-[#1F2E3E] text-[10px] font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <span>Analyze Vessel</span>
                          <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E] font-mono-data">

              {/* ------------------------------------------------------------- */}
              {/* SECTION 1: FLEET & HYDRODYNAMIC OVERVIEW */}
              {/* ------------------------------------------------------------- */}
              <tr
                onClick={() => toggleSection('summary')}
                className="bg-[#F4F0E8] dark:bg-[#16202C] cursor-pointer hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] select-none"
              >
                <td colSpan={selectedVessels.length + 1} className="py-2.5 px-4 sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                      {collapsedSections.summary ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="uppercase tracking-widest text-[11px] text-[#BC412B] dark:text-[#E05A42]">
                      1. Fleet Hydrodynamics &amp; Port Compatibility
                    </span>
                  </div>
                </td>
              </tr>

              {!collapsedSections.summary && (
                <>
                  {/* Suitability Score */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Hydrodynamic Suitability Score
                    </td>
                    {selectedVessels.map((v) => {
                      const isBest = highlightBest && bestValues.maxSuitabilityId === v.id;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-extrabold ${
                              v.suitabilityScore >= 90
                                ? 'text-[#2D5A43] dark:text-[#3EB58A]'
                                : v.suitabilityScore >= 75
                                ? 'text-[#8C5E28] dark:text-[#D4A359]'
                                : 'text-[#BC412B] dark:text-[#E05A42]'
                            }`}>
                              {v.suitabilityScore}/100
                            </span>
                            {isBest && (
                              <span className="px-1.5 py-0.2 bg-[#2D5A43] text-white text-[9px] font-bold rounded">
                                TOP FIT
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Port Berthing Status */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Paradip Berthing Compatibility
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        {v.compatibility === 'Compatible' ? (
                          <span className="inline-flex items-center gap-1 text-[#2D5A43] dark:text-[#3EB58A] font-bold">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>Direct Berth</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#BC412B] dark:text-[#E05A42] font-bold">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            <span>Restricted (Lightering)</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Berth Allocation */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Designated Berth
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-xs font-serif-body text-[#555555] dark:text-[#A3B1AB]">
                        {v.berthAllocation}
                      </td>
                    ))}
                  </tr>

                  {/* Executive Monograph Summary */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Operational Assessment
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[11px] font-serif-body italic text-[#6B645C] dark:text-[#A3B1AB] leading-relaxed">
                        {v.summaryDescription}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION 2: FUEL CONSUMPTION & BUNKER ECONOMICS */}
              {/* ------------------------------------------------------------- */}
              <tr
                onClick={() => toggleSection('fuel')}
                className="bg-[#F4F0E8] dark:bg-[#16202C] cursor-pointer hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] select-none"
              >
                <td colSpan={selectedVessels.length + 1} className="py-2.5 px-4 sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                      {collapsedSections.fuel ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="uppercase tracking-widest text-[11px] text-[#BC412B] dark:text-[#E05A42]">
                      2. Fuel Consumption &amp; Bunker Economics
                    </span>
                  </div>
                </td>
              </tr>

              {!collapsedSections.fuel && (
                <>
                  {/* Daily Fuel Burn at Selected Speed */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/30 dark:bg-[#1A2634]/30">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Active Steaming Fuel Burn ({speedMode.toUpperCase()})
                    </td>
                    {selectedVessels.map((v) => {
                      const burn = speedMode === 'laden' ? v.ladenFuelConsumptionMTDay : v.ecoFuelConsumptionMTDay;
                      const speed = speedMode === 'laden' ? v.ladenSpeedKnots : v.ecoSpeedKnots;
                      const isBest = highlightBest && bestValues.minFuelId === v.id;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-sm font-extrabold ${isBest ? 'text-[#2D5A43] dark:text-[#3EB58A]' : 'text-[#1A1A1A] dark:text-[#E8ECE9]'}`}>
                              {burn} MT/day
                            </span>
                            <span className="text-[10px] text-[#7A7268]">@{speed} kts</span>
                            {isBest && (
                              <span className="px-1.5 py-0.2 bg-[#2D5A43] text-white text-[9px] font-bold rounded">
                                LOWEST
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Laden Design Speed Fuel */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Laden Design Speed Burn (13.5-14.5 kts)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                        {v.ladenFuelConsumptionMTDay} MT/day ({v.ladenSpeedKnots} kts)
                      </td>
                    ))}
                  </tr>

                  {/* Eco Speed Fuel */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Eco-Steaming Speed Burn (11.5-12.2 kts)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#2D5A43] dark:text-[#3EB58A] font-semibold">
                        {v.ecoFuelConsumptionMTDay} MT/day ({v.ecoSpeedKnots} kts)
                      </td>
                    ))}
                  </tr>

                  {/* Ballast Fuel Consumption */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Ballast Leg Fuel Consumption
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                        {v.ballastFuelConsumptionMTDay} MT/day
                      </td>
                    ))}
                  </tr>

                  {/* Port Fuel Consumption (Idle vs Working) */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      In-Port Fuel Consumption (Idle / Discharging)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                        {v.portIdleConsumptionMTDay} MT (Idle) / {v.portWorkingConsumptionMTDay} MT (Gear)
                      </td>
                    ))}
                  </tr>

                  {/* Daily Bunker Cost ($/day) */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Daily Bunker Bill (@ ${bunkerPriceUSD}/MT VLSFO)
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      const dailySpend = calc?.dailyBunkerSpend || v.dailyBunkerCostUSD;
                      return (
                        <td key={v.id} className="py-3 px-4 font-bold text-[#BC412B] dark:text-[#E05A42]">
                          ${dailySpend.toLocaleString()} / day
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Voyage Fuel Burn & Spend */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/20 dark:bg-[#1A2634]/20">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Voyage Total Bunker Burn ({voyageDistanceNM.toLocaleString()} NM)
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      const totalBurn = calc?.totalFuelBurnMT || v.voyageFuelBurnNewcastleParadipMT;
                      const totalBill = calc?.totalBunkerBill || Math.round(v.voyageFuelBurnNewcastleParadipMT * bunkerPriceUSD);
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className="font-extrabold text-sm text-[#1A1A1A] dark:text-[#E8ECE9] block">
                            {totalBurn.toLocaleString()} MT
                          </span>
                          <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97]">
                            ~${totalBill.toLocaleString()} USD
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Bunker Cost Per Cargo Ton */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Bunker Share of Freight ($/MT Cargo)
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      const costPerTon = calc?.bunkerCostPerTon || v.bunkerCostPerTonCargoUSD;
                      return (
                        <td key={v.id} className="py-3 px-4 font-extrabold text-xs text-[#2D5A43] dark:text-[#3EB58A]">
                          ${costPerTon.toFixed(2)} / MT
                        </td>
                      );
                    })}
                  </tr>

                  {/* Scrubber Installation */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      SOx Scrubber Equipped
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        {v.scrubberEquipped ? (
                          <span className="px-2 py-0.5 rounded bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A] font-bold text-[10px]">
                            YES (HSFO Compatible)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#1C2834] text-[#7A7268] text-[10px]">
                            NO (VLSFO Compliant)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION 3: CARGO CAPACITY & HOLD SPECIFICATIONS */}
              {/* ------------------------------------------------------------- */}
              <tr
                onClick={() => toggleSection('capacity')}
                className="bg-[#F4F0E8] dark:bg-[#16202C] cursor-pointer hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] select-none"
              >
                <td colSpan={selectedVessels.length + 1} className="py-2.5 px-4 sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                      {collapsedSections.capacity ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="uppercase tracking-widest text-[11px] text-[#BC412B] dark:text-[#E05A42]">
                      3. Cargo Capacity &amp; Hold Specifications
                    </span>
                  </div>
                </td>
              </tr>

              {!collapsedSections.capacity && (
                <>
                  {/* Deadweight (DWT) */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/20 dark:bg-[#1A2634]/20">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Nominal Deadweight (DWT)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 font-extrabold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                        {unitSystem === 'metric'
                          ? `${v.dwt.toLocaleString()} MT`
                          : `${Math.round(v.dwt * 0.9842).toLocaleString()} LT`}
                      </td>
                    ))}
                  </tr>

                  {/* Max Safe Intake under Paradip 14.5m Limit */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Safe Intake at Paradip (14.5m Draft)
                    </td>
                    {selectedVessels.map((v) => {
                      const isBest = highlightBest && bestValues.maxIntakeId === v.id;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className={`font-extrabold text-xs block ${
                            v.lighteringRequiredParadip ? 'text-[#BC412B] dark:text-[#E05A42]' : 'text-[#2D5A43] dark:text-[#3EB58A]'
                          }`}>
                            {v.maxSafeParcelParadipMT.toLocaleString()} MT
                          </span>
                          <span className="text-[10px] text-[#7A7268]">
                            {v.lighteringRequiredParadip ? 'Draft Exceeded: Needs Lightering' : '100% Direct Inner Berth'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Grain / Bale Cubic Capacity */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Grain Cubic Capacity
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                        {unitSystem === 'metric'
                          ? `${v.grainCubicCapacityM3.toLocaleString()} m³`
                          : `${Math.round(v.grainCubicCapacityM3 * 35.3147).toLocaleString()} cu.ft`}
                      </td>
                    ))}
                  </tr>

                  {/* Cargo Holds & Hatches */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Holds &amp; Hatches Layout
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#1A1A1A] dark:text-[#E8ECE9] font-semibold">
                        {v.holdsAndHatches}
                      </td>
                    ))}
                  </tr>

                  {/* Hatch Dimensions */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Clear Hatch Opening Dimensions
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#7A7268] dark:text-[#8E9B97]">
                        {v.hatchDimensions}
                      </td>
                    ))}
                  </tr>

                  {/* Gearing & Crane SWL */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Cargo Gearing / Crane Hardware
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        <span className={`block font-semibold text-[11px] ${
                          v.hasCranes ? 'text-[#2D5A43] dark:text-[#3EB58A]' : 'text-[#7A7268]'
                        }`}>
                          {v.hasCranes ? 'Geared' : 'Gearless'}
                        </span>
                        <span className="text-[10px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic block">
                          {v.craneCapacityDescription}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Voyages Required to Move Parcel */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/20 dark:bg-[#1A2634]/20">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Voyages to Lift {parcelQuantityMT.toLocaleString()} MT Parcel
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      const trips = calc?.voyagesToLiftParcel || v.voyagesNeededFor180kMT;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className="font-extrabold text-sm text-[#1A1A1A] dark:text-[#E8ECE9]">
                            {trips} Voyages
                          </span>
                          <span className="text-[10px] text-[#7A7268] block">
                            ~{Math.ceil(trips)} Full Load Liftings
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION 4: EFFICIENCY & ENVIRONMENTAL RATINGS */}
              {/* ------------------------------------------------------------- */}
              <tr
                onClick={() => toggleSection('efficiency')}
                className="bg-[#F4F0E8] dark:bg-[#16202C] cursor-pointer hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] select-none"
              >
                <td colSpan={selectedVessels.length + 1} className="py-2.5 px-4 sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                      {collapsedSections.efficiency ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="uppercase tracking-widest text-[11px] text-[#BC412B] dark:text-[#E05A42]">
                      4. Operational Efficiency &amp; Carbon Performance
                    </span>
                  </div>
                </td>
              </tr>

              {!collapsedSections.efficiency && (
                <>
                  {/* CII Carbon Intensity Indicator */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      IMO Carbon Intensity Indicator (CII Rating)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded font-mono-data font-bold text-xs ${
                          v.ciiRating === 'A'
                            ? 'bg-[#2D5A43] text-white'
                            : v.ciiRating === 'B'
                            ? 'bg-[#2D5A43]/20 text-[#2D5A43] dark:text-[#3EB58A]'
                            : 'bg-[#8C5E28]/20 text-[#8C5E28]'
                        }`}>
                          Rating {v.ciiRating}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* EEXI Energy Efficiency Existing Ship Index */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      EEXI Value (g CO₂ / tonne-NM)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                        {v.eexiValueGramsCO2} g CO₂/t-nm
                      </td>
                    ))}
                  </tr>

                  {/* EEDI Compliance Tier */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      EEDI Compliance Phase
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-xs font-serif-body text-[#1A1A1A] dark:text-[#E8ECE9]">
                        {v.eediCompliancePhase}
                      </td>
                    ))}
                  </tr>

                  {/* Tonne-Miles Per Ton Fuel */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/20 dark:bg-[#1A2634]/20">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Tonne-Miles Generated per MT Fuel
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 font-extrabold text-[#2D5A43] dark:text-[#3EB58A]">
                        {v.tonneMilesPerTonFuel.toLocaleString()} T-NM/t
                      </td>
                    ))}
                  </tr>

                  {/* Carbon Tax Exposure */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Estimated Carbon Tax Exposure per Voyage
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#BC412B] dark:text-[#E05A42] font-semibold">
                        ${v.carbonTaxExposureUSD.toLocaleString()} USD
                      </td>
                    ))}
                  </tr>

                  {/* Port Turnaround Days */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Average Port Stay at Paradip
                    </td>
                    {selectedVessels.map((v) => {
                      const isBest = highlightBest && bestValues.minTurnaroundId === v.id;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className={`font-extrabold ${isBest ? 'text-[#2D5A43] dark:text-[#3EB58A]' : 'text-[#1A1A1A] dark:text-[#E8ECE9]'}`}>
                            {v.turnaroundDaysParadip} Days
                          </span>
                          <span className="text-[10px] text-[#7A7268] block">
                            ~{(v.turnaroundDaysParadip * 24).toFixed(0)} hrs
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION 5: NAVIGATIONAL & DIMENSIONAL CONSTRAINTS */}
              {/* ------------------------------------------------------------- */}
              <tr
                onClick={() => toggleSection('dimensions')}
                className="bg-[#F4F0E8] dark:bg-[#16202C] cursor-pointer hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] select-none"
              >
                <td colSpan={selectedVessels.length + 1} className="py-2.5 px-4 sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                      {collapsedSections.dimensions ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="uppercase tracking-widest text-[11px] text-[#BC412B] dark:text-[#E05A42]">
                      5. Navigational Geometry &amp; Draft Constraints
                    </span>
                  </div>
                </td>
              </tr>

              {!collapsedSections.dimensions && (
                <>
                  {/* Fully Laden Draft */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/20 dark:bg-[#1A2634]/20">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Laden Operating Draft (Limit: 14.5m)
                    </td>
                    {selectedVessels.map((v) => {
                      const isExceeded = v.ladenDraftM > 14.5;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className={`font-extrabold text-sm ${
                            isExceeded ? 'text-[#BC412B] dark:text-[#E05A42]' : 'text-[#2D5A43] dark:text-[#3EB58A]'
                          }`}>
                            {v.ladenDraftM}m
                          </span>
                          <span className="text-[10px] text-[#7A7268] block">
                            {isExceeded ? `Exceeds limit by +${(v.ladenDraftM - 14.5).toFixed(1)}m` : 'Safe under 14.5m'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Length Overall (LOA) */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Length Overall (LOA) (Limit: 260m)
                    </td>
                    {selectedVessels.map((v) => {
                      const isExceeded = v.loaM > 260;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className={`font-bold ${isExceeded ? 'text-[#BC412B]' : 'text-[#1A1A1A] dark:text-[#E8ECE9]'}`}>
                            {v.loaM}m
                          </span>
                          {isExceeded && <span className="text-[9px] text-[#BC412B] block">Exceeds 260m Max</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Beam / Breadth */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Beam / Breadth (Limit: 32.5m)
                    </td>
                    {selectedVessels.map((v) => {
                      const isExceeded = v.beamM > 32.5;
                      return (
                        <td key={v.id} className="py-3 px-4">
                          <span className={`font-bold ${isExceeded ? 'text-[#BC412B]' : 'text-[#1A1A1A] dark:text-[#E8ECE9]'}`}>
                            {v.beamM}m
                          </span>
                          {isExceeded && <span className="text-[9px] text-[#BC412B] block">Exceeds 32.5m</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Ballast Draft & Air Draft */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Ballast Draft / Air Draft
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                        Draft: {v.ballastDraftM}m · Air: {v.airDraftM}m
                      </td>
                    ))}
                  </tr>

                  {/* Lightering & Transshipment Surcharge */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Offshore Lightering Surcharge
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4">
                        {v.lighteringRequiredParadip ? (
                          <span className="text-[#BC412B] dark:text-[#E05A42] font-bold">
                            +${v.lighteringCostPerTonUSD.toFixed(2)}/MT Surcharge
                          </span>
                        ) : (
                          <span className="text-[#2D5A43] dark:text-[#3EB58A] font-bold">
                            $0.00 (Zero Lightering)
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                </>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION 6: COMMERCIAL ECONOMICS & FINANCIALS */}
              {/* ------------------------------------------------------------- */}
              <tr
                onClick={() => toggleSection('economics')}
                className="bg-[#F4F0E8] dark:bg-[#16202C] cursor-pointer hover:bg-[#EDE8DE] dark:hover:bg-[#1A2634] font-editorial text-xs font-bold text-[#1A1A1A] dark:text-[#E8ECE9] select-none"
              >
                <td colSpan={selectedVessels.length + 1} className="py-2.5 px-4 sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                      {collapsedSections.economics ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="uppercase tracking-widest text-[11px] text-[#BC412B] dark:text-[#E05A42]">
                      6. Commercial Economics &amp; Landed Freight Benchmarks
                    </span>
                  </div>
                </td>
              </tr>

              {!collapsedSections.economics && (
                <>
                  {/* Effective Landed Freight ($/MT) */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/40 dark:bg-[#1A2634]/40">
                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Effective Freight Rate ($/MT Cargo)
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      const rate = calc?.effectiveFreightPerTon || v.freightRatePerTonUSD;
                      const isBest = highlightBest && bestValues.minFreightId === v.id;
                      return (
                        <td key={v.id} className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-base font-extrabold ${isBest ? 'text-[#2D5A43] dark:text-[#3EB58A]' : 'text-[#BC412B] dark:text-[#E05A42]'}`}>
                              ${rate.toFixed(2)} / MT
                            </span>
                            {isBest && (
                              <span className="px-1.5 py-0.2 bg-[#2D5A43] text-white text-[9px] font-bold rounded">
                                LOWEST
                              </span>
                            )}
                          </div>
                          {v.lighteringRequiredParadip && (
                            <span className="text-[10px] text-[#7A7268] block">
                              Includes +${v.lighteringCostPerTonUSD.toFixed(2)} lightering
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Daily TCE Charter Rate */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Time Charter Equivalent (TCE $/day)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                        ${v.dailyTceRateUSD.toLocaleString()} / day
                      </td>
                    ))}
                  </tr>

                  {/* Total Estimated Voyage Days */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Total Voyage Duration (Steaming + Port)
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      return (
                        <td key={v.id} className="py-3 px-4 text-[#555555] dark:text-[#A3B1AB]">
                          {calc?.totalDays || v.totalVoyageDays} Days ({calc?.steamingDays || 15.8}d sea + {v.turnaroundDaysParadip}d port)
                        </td>
                      );
                    })}
                  </tr>

                  {/* Demurrage Exposure */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-white dark:bg-[#121B26] z-10">
                      Demurrage Risk Exposure ($/day)
                    </td>
                    {selectedVessels.map((v) => (
                      <td key={v.id} className="py-3 px-4 text-[#BC412B] dark:text-[#E05A42] font-semibold">
                        ${v.demurrageCostPerDayUSD.toLocaleString()} / day
                      </td>
                    ))}
                  </tr>

                  {/* Total Estimated Single Voyage Cost */}
                  <tr className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]/60 bg-[#EDE8DE]/20 dark:bg-[#1A2634]/20">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-serif-body sticky left-0 bg-[#F4F0E8] dark:bg-[#16202C] z-10">
                      Estimated Total Single Voyage Cost
                    </td>
                    {selectedVessels.map((v) => {
                      const calc = calculatedMetrics.find((c) => c.id === v.id);
                      const totalCost = calc?.totalVoyageCost || v.totalEstimatedVoyageCostUSD;
                      return (
                        <td key={v.id} className="py-3 px-4 font-extrabold text-xs text-[#1A1A1A] dark:text-[#E8ECE9]">
                          ${totalCost.toLocaleString()} USD
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Actions */}
        <div className="p-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
            * Calculations benchmarked against standard Newcastle (Kooragang) → Paradip corridor with 14.5m draft fairway restrictions.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMemo}
              className="px-3.5 py-1.5 rounded bg-white dark:bg-[#121B26] border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] hover:border-[#BC412B] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#BC412B]">
                {copiedNotification ? 'done' : 'content_copy'}
              </span>
              <span>{copiedNotification ? 'Copied' : 'Copy Table'}</span>
            </button>

            {onNavigateToOptimization && (
              <button
                onClick={onNavigateToOptimization}
                className="px-3.5 py-1.5 rounded bg-[#BC412B] hover:bg-[#A33420] text-white text-xs font-editorial font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <span>View Port Limits &amp; Terminal Details</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
