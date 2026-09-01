import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ViewMode, AnalysisInput } from '../types';
import { Recommendation } from '../utils/recommendationEngine';

interface CharteringRecommendationViewProps {
  onNavigate: (view: ViewMode) => void;
  onSaveAnalysis: () => void;
  onExport: () => void;
  analysisInput: AnalysisInput;
  recommendation: Recommendation;
  distanceNM: number;
}

// Animates a number counting up to `target` whenever it changes — used for the headline
// savings figure so a new recommendation visibly lands instead of just snapping in.
function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 }
};

export const CharteringRecommendationView: React.FC<CharteringRecommendationViewProps> = ({
  onNavigate,
  onSaveAnalysis,
  onExport,
  analysisInput,
  recommendation,
  distanceNM
}) => {
  const [demurrageDays, setDemurrageDays] = useState<number>(3);
  // Defaults to the actually-recommended vessel's real demurrage clause rate instead of a
  // generic Panamax guess — Capesize/Newcastlemax clauses run well above the old $18,500
  // default (and above the old $35,000 slider ceiling, which this also fixes).
  const [demurrageRatePerDay, setDemurrageRatePerDay] = useState<number>(recommendation.recommendedVessel.demurrageCostPerDayUSD);

  const totalDemurrageExposure = demurrageDays * demurrageRatePerDay;
  const animatedSavings = useCountUp(recommendation.projectedSavingsUSD);

  const {
    action,
    confidencePct,
    marketTrendPct,
    optimalWindowLabel,
    recommendedVessel,
    recommendedStructureLabel,
    targetRateLowUSD,
    targetRateHighUSD,
    rateAdvantageUSD,
    projectedSavingsUSD,
    strategyComparisonRows,
    rationale
  } = recommendation;

  const voyageCount = Math.max(1, Math.ceil(analysisInput.quantityMT / recommendedVessel.maxSafeParcelParadipMT));
  const isWait = action === 'WAIT';

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Advisory</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">
          {analysisInput.loadingPort} → {analysisInput.dischargePort} Chartering Memo
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold">
            Executive Decision Memorandum
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Chartering Recommendation
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Corridor: {analysisInput.loadingPort} → {analysisInput.dischargePort} ({distanceNM.toLocaleString()} NM) · Commodity: {analysisInput.cargoType} · Volume: {analysisInput.quantityMT.toLocaleString()} MT
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSaveAnalysis}
            className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] hover:border-[#BC412B] dark:hover:border-[#E05A42] text-[#1A1A1A] dark:text-[#E8ECE9] hover:text-[#BC412B] dark:hover:text-[#E05A42] text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
            <span>Save to Portfolio</span>
          </button>
          <button
            onClick={onExport}
            className="bg-[#BC412B] hover:bg-[#A33621] text-white text-xs uppercase tracking-wider font-semibold py-2.5 px-4 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Export Official Memo</span>
          </button>
        </div>
      </div>

      {/* Main Core Recommendation Hero Card - Editorial style */}
      <motion.div
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={{ duration: 0.45 }}
        className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] border-l-6 rounded-lg p-6 sm:p-8 relative overflow-hidden shadow-sm"
        style={{ borderLeftColor: isWait ? '#BC412B' : '#2D5A43' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-[#7A7268] dark:text-[#8E9B97] font-bold">
                Algorithmic Synthesis
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#16202C] text-[#BC412B] dark:text-[#E05A42] text-[11px] font-mono-data font-bold border border-[#DDD8CE] dark:border-[#1F2E3E]">
                {confidencePct}% Model Confidence
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
                className="px-6 py-2 rounded text-white shadow-sm"
                style={{ backgroundColor: isWait ? '#BC412B' : '#2D5A43' }}
              >
                <span className="font-editorial text-3xl sm:text-4xl font-extrabold tracking-wider">
                  {action}
                </span>
              </motion.div>
              <div>
                <span className="text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9] block font-editorial">
                  Action: {isWait ? 'HOLD FIXTURE' : 'FIX NOW'}
                </span>
                <span className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
                  Optimal fixture window projected {optimalWindowLabel}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#333333] dark:text-[#C5D0CB] mt-2 max-w-2xl font-serif-body leading-relaxed">
              {rationale.split(new RegExp(`(${Math.abs(marketTrendPct).toFixed(1)}%)`)).map((part, i) =>
                part === `${Math.abs(marketTrendPct).toFixed(1)}%`
                  ? <span key={i} className="text-[#BC412B] dark:text-[#E05A42] font-bold">{part}</span>
                  : <React.Fragment key={i}>{part}</React.Fragment>
              )}
            </p>
          </div>

          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-5 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-2 w-full md:w-64">
            <span className="text-[10px] uppercase font-bold text-[#7A7268] dark:text-[#8E9B97] tracking-widest">
              Projected Rate Advantage
            </span>
            <div className="text-3xl font-extrabold text-[#BC412B] dark:text-[#E05A42] font-mono-data">
              {rateAdvantageUSD >= 0 ? '+' : ''}{rateAdvantageUSD.toFixed(2)} / MT
            </div>
            <span className="text-xs text-[#555555] dark:text-[#A3B1AB] font-serif-body">
              Est. total net savings of <span className="text-[#1A1A1A] dark:text-[#E8ECE9] font-bold font-mono-data">${animatedSavings.toLocaleString()}</span> on {analysisInput.quantityMT.toLocaleString()} MT procurement parcel.
            </span>
          </div>
        </div>
      </motion.div>

      {/* Two Column Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Execution Strategy */}
        <motion.div
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-4 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px]">assignment</span>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Execution Strategy
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Recommended Structure</span>
              <span className="font-bold text-[#BC412B] dark:text-[#E05A42] font-editorial text-sm">{recommendedStructureLabel}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Target Freight Rate</span>
              <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">${targetRateLowUSD.toFixed(2)} – ${targetRateHighUSD.toFixed(2)} / MT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Estimated Total Savings</span>
              <span className="font-mono-data font-bold text-[#2D5A43] dark:text-[#3EB58A]">${projectedSavingsUSD.toLocaleString()} vs spot</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Exposure Management</span>
              <span className="text-[#1A1A1A] dark:text-[#E8ECE9] font-medium">Hedges corridor rate volatility risk</span>
            </div>
          </div>
        </motion.div>

        {/* Route & Vessel Logistics */}
        <motion.div
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 flex flex-col gap-4 shadow-sm"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[20px]">directions_boat</span>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Route &amp; Vessel Logistics
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Recommended Vessel Class</span>
              <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-editorial text-sm">{recommendedVessel.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Parcel Split</span>
              <span className="font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">{voyageCount} × up to {recommendedVessel.maxSafeParcelParadipMT.toLocaleString()} MT</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Discharge Port Berth</span>
              <span className="text-[#1A1A1A] dark:text-[#E8ECE9] font-medium">{analysisInput.dischargePort} — {recommendedVessel.berthAllocation}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#6B645C] dark:text-[#8E9B97] font-medium">Vessel Laden Draft</span>
              <span className="font-mono-data text-[#BC412B] dark:text-[#E05A42] font-bold">
                {recommendedVessel.ladenDraftM}m{recommendedVessel.lighteringRequiredParadip ? ' (lightering required)' : ' (direct berth)'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Demurrage & Laytime Calculator */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DDD8CE] dark:border-[#1F2E3E] gap-2">
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42]">timer</span>
              <span>{analysisInput.dischargePort} Port Laytime &amp; Demurrage Calculator</span>
            </h3>
            <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
              Simulate anchorage wait times and demurrage rate impacts on landed cargo economics
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] block uppercase font-mono-data">Demurrage Exposure:</span>
            <span className="text-lg font-bold font-mono-data text-[#BC412B] dark:text-[#E05A42]">${totalDemurrageExposure.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-medium">
              <span>Simulated Anchorage Wait Days:</span>
              <span className="font-mono-data font-bold text-[#BC412B] dark:text-[#E05A42]">{demurrageDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="1"
              value={demurrageDays}
              onChange={(e) => setDemurrageDays(Number(e.target.value))}
              className="w-full accent-[#BC412B] cursor-pointer h-2 bg-[#EDE8DE] dark:bg-[#1F2E3E] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-1">
              <span>0 Days (Express Berth)</span>
              <span>7 Days (Peak Monsoonal Queue)</span>
              <span>14 Days (Severe)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-medium">
              <span>Daily Demurrage Clause Rate:</span>
              <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">${demurrageRatePerDay.toLocaleString()} / day</span>
            </div>
            <input
              type="range"
              min="15000"
              max="45000"
              step="500"
              value={demurrageRatePerDay}
              onChange={(e) => setDemurrageRatePerDay(Number(e.target.value))}
              className="w-full accent-[#BC412B] cursor-pointer h-2 bg-[#EDE8DE] dark:bg-[#1F2E3E] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-1">
              <span>$16,000 (Handysize)</span>
              <span>$24,000 (Panamax Standard)</span>
              <span>$42,000 (Newcastlemax)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Comparison Table */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C]">
          <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
            Strategic Comparison: Spot vs. {recommendedStructureLabel} vs. Long COA
          </h3>
          <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
            Financial and operational performance evaluation for {analysisInput.quantityMT.toLocaleString()} MT procurement parcel
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/70 dark:bg-[#1C2834]/70 text-[10px] font-bold text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider">
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4">Immediate Spot Fixture</th>
                <th className="py-3 px-4 text-[#BC412B] dark:text-[#E05A42]">{recommendedStructureLabel} (RECOMMENDED)</th>
                <th className="py-3 px-4">Annual COA Commitment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E]">
              {strategyComparisonRows.map((row) => (
                <tr key={row.label} className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C]">
                  <td className="py-3.5 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{row.label}</td>
                  <td className="py-3.5 px-4 font-mono-data text-[#555555] dark:text-[#A3B1AB]">{row.spotValue}</td>
                  <td className="py-3.5 px-4 font-mono-data font-bold text-[#2D5A43] dark:text-[#3EB58A]">{row.recommendedValue}</td>
                  <td className="py-3.5 px-4 font-mono-data text-[#555555] dark:text-[#A3B1AB]">{row.coaValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#F4F0E8] dark:bg-[#16202C] border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-wrap justify-between items-center gap-4">
          <button
            onClick={() => onNavigate('vessels')}
            className="text-xs text-[#BC412B] dark:text-[#E05A42] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Review Vessel Compatibility Matrix</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>

          <button
            onClick={() => onNavigate('new-analysis')}
            className="text-xs text-[#6B645C] dark:text-[#A3B1AB] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9] flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>Modify Analysis Parameters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
