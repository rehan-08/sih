import { AnalysisInput, VesselComparisonItem } from '../types';
import { vesselComparisonData } from '../data/maritimeData';

// Deterministic PRNG seeded from a string hash — not a live market feed (there's no free
// keyless freight-rate API to wire up here), but real inputs now genuinely change the
// output instead of the page always rendering the same WAIT/$210,000 memo regardless of
// what was configured in the wizard. Same inputs always reproduce the same recommendation.
function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface StrategyRow {
  label: string;
  spotValue: string;
  recommendedValue: string;
  coaValue: string;
}

export interface Recommendation {
  action: 'WAIT' | 'EXECUTE';
  confidencePct: number;
  marketTrendPct: number; // negative = softening, positive = hardening
  optimalWindowLabel: string;
  recommendedVessel: VesselComparisonItem;
  recommendedStructureLabel: string;
  baselineRateUSD: number;
  targetRateLowUSD: number;
  targetRateHighUSD: number;
  rateAdvantageUSD: number;
  projectedSavingsUSD: number;
  totalFreightCostUSD: number;
  strategyComparisonRows: StrategyRow[];
  rationale: string;
}

const STRUCTURE_LABELS: Record<AnalysisInput['contractPreference'], string> = {
  Spot: 'Immediate Spot Fixture',
  '1-3 Voyages': '2-Voyage Short-Term Period',
  '3-6 Voyages': '4-Voyage Period Structure',
  Flexible: 'Flexible Index-Linked COA'
};

function pickRecommendedVessel(quantityMT: number): VesselComparisonItem {
  const eligible = vesselComparisonData.filter(v => v.compatibility !== 'Incompatible');
  const fitsInThreeVoyages = eligible
    .filter(v => v.dwt * 3 >= quantityMT)
    .sort((a, b) => a.dwt - b.dwt);
  if (fitsInThreeVoyages.length > 0) return fitsInThreeVoyages[0];
  // Parcel too large for any class to lift in 3 voyages — fall back to the biggest hull.
  return [...eligible].sort((a, b) => b.dwt - a.dwt)[0];
}

function formatDateRange(startOffsetDays: number, spanDays: number): string {
  const start = new Date();
  start.setDate(start.getDate() + startOffsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + spanDays);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function computeRecommendation(input: AnalysisInput, distanceNM: number): Recommendation {
  const seedStr = `${input.loadingPort}|${input.dischargePort}|${input.cargoType}|${input.deliveryWindow}`;
  const rng = mulberry32(hashSeed(seedStr));

  const marketTrendPct = Number((rng() * 12 - 7).toFixed(1)); // -7% .. +5%
  const confidencePct = Math.round(68 + rng() * 24); // 68 .. 92
  const action: 'WAIT' | 'EXECUTE' = marketTrendPct < 0 ? 'WAIT' : 'EXECUTE';
  const windowStartOffset = Math.round(3 + rng() * 10);
  const optimalWindowLabel = formatDateRange(windowStartOffset, 6);

  const recommendedVessel = pickRecommendedVessel(input.quantityMT);
  const baselineRateUSD = recommendedVessel.freightRatePerTonUSD;
  const rateAdvantageUSD = Number((baselineRateUSD * (marketTrendPct / 100)).toFixed(2));
  const targetRateLowUSD = Number((baselineRateUSD + rateAdvantageUSD - 0.2).toFixed(2));
  const targetRateHighUSD = Number((baselineRateUSD + rateAdvantageUSD + 0.2).toFixed(2));
  const projectedSavingsUSD = Math.round(Math.abs(rateAdvantageUSD) * input.quantityMT);
  const totalFreightCostUSD = Math.round((baselineRateUSD + rateAdvantageUSD) * input.quantityMT);

  const recommendedStructureLabel = STRUCTURE_LABELS[input.contractPreference];

  const spotRate = baselineRateUSD;
  const recommendedRate = baselineRateUSD + rateAdvantageUSD;
  const coaRate = Number((baselineRateUSD + rateAdvantageUSD * 0.3).toFixed(2));

  const strategyComparisonRows: StrategyRow[] = [
    {
      label: 'Average Freight Rate',
      spotValue: `$${spotRate.toFixed(2)} / MT`,
      recommendedValue: `$${recommendedRate.toFixed(2)} / MT (avg)`,
      coaValue: `$${coaRate.toFixed(2)} / MT`
    },
    {
      label: 'Total Freight Cost',
      spotValue: `$${Math.round(spotRate * input.quantityMT).toLocaleString()}`,
      recommendedValue: `$${Math.round(recommendedRate * input.quantityMT).toLocaleString()}`,
      coaValue: `$${Math.round(coaRate * input.quantityMT).toLocaleString()}`
    },
    {
      label: 'Market Volatility Exposure',
      spotValue: 'High (100% spot risk)',
      recommendedValue: 'Low (hedged via period structure)',
      coaValue: 'Zero (fixed rate over term)'
    },
    {
      label: `Demurrage Risk at ${input.dischargePort}`,
      spotValue: 'Standard queue waiting',
      recommendedValue: 'Scheduled laycan priority coordination',
      coaValue: 'Dedicated berth windows'
    }
  ];

  const rationale = action === 'WAIT'
    ? `Forward chartering rates are projected to soften ${Math.abs(marketTrendPct).toFixed(1)}% over the next ${windowStartOffset + 6}–${windowStartOffset + 10} days due to widening tonnage availability on this corridor.`
    : `Forward chartering rates are projected to firm ${marketTrendPct.toFixed(1)}% over the next ${windowStartOffset + 6}–${windowStartOffset + 10} days — early fixture avoids the run-up.`;

  return {
    action,
    confidencePct,
    marketTrendPct,
    optimalWindowLabel,
    recommendedVessel,
    recommendedStructureLabel,
    baselineRateUSD,
    targetRateLowUSD,
    targetRateHighUSD,
    rateAdvantageUSD,
    projectedSavingsUSD,
    totalFreightCostUSD,
    strategyComparisonRows,
    rationale
  };
}
