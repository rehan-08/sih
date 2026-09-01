import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  AreaChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  freightForecastHistory,
  extendedForecast60d,
  extendedForecast90d,
  multiCorridorBenchmarkData,
  freightCostBreakdownTimeline,
  forwardRateProbabilityDistribution
} from '../data/maritimeData';

export const FreightForecastView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'30d' | '60d' | '90d'>('30d');
  const [activeChartTab, setActiveChartTab] = useState<'forwardCurve' | 'corridors' | 'costBreakdown' | 'distribution'>('forwardCurve');
  const [bunkerSpikePercent, setBunkerSpikePercent] = useState<number>(0);
  const [congestionDelayDays, setCongestionDelayDays] = useState<number>(0);
  const [displayMode, setDisplayMode] = useState<'rate' | 'totalCost'>('rate');
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [showSecondaryMetrics, setShowSecondaryMetrics] = useState<boolean>(false);
  const [activeScenario, setActiveScenario] = useState<string>('baseline');

  const parcelSizeMT = 180000;
  const currentSpotRate = 14.80;

  // Select dataset based on timeframe
  const rawData = timeframe === '30d' 
    ? freightForecastHistory 
    : timeframe === '60d' 
      ? extendedForecast60d 
      : extendedForecast90d;

  // Apply sensitivity adjustments to forecast portion
  const bunkerImpactPerTon = (bunkerSpikePercent / 100) * 1.8;
  const congestionImpactPerTon = congestionDelayDays * 0.22;
  const totalSensitivityDelta = bunkerImpactPerTon + congestionImpactPerTon;

  const chartData = rawData.map((pt) => {
    const isForecast = pt.forecast !== null;
    const adjustedForecast = isForecast ? Number(((pt.forecast ?? 14.2) + totalSensitivityDelta).toFixed(2)) : null;
    const adjustedUpper = isForecast ? Number(((pt.upper ?? 15.5) + totalSensitivityDelta).toFixed(2)) : null;
    const adjustedLower = isForecast ? Number(((pt.lower ?? 13.0) + totalSensitivityDelta).toFixed(2)) : null;

    // Range for Area chart representation of confidence interval
    // Recharts Area can use [lower, upper] or baseline offset
    return {
      ...pt,
      displayRate: displayMode === 'rate' ? pt.rate : (pt.rate !== null ? Number(((pt.rate * parcelSizeMT) / 1000000).toFixed(3)) : null),
      displayForecast: displayMode === 'rate' ? adjustedForecast : (adjustedForecast !== null ? Number(((adjustedForecast * parcelSizeMT) / 1000000).toFixed(3)) : null),
      displayUpper: displayMode === 'rate' ? adjustedUpper : (adjustedUpper !== null ? Number(((adjustedUpper * parcelSizeMT) / 1000000).toFixed(3)) : null),
      displayLower: displayMode === 'rate' ? adjustedLower : (adjustedLower !== null ? Number(((adjustedLower * parcelSizeMT) / 1000000).toFixed(3)) : null),
      // Spread band for area fill
      confidenceBand: isForecast && adjustedUpper !== null && adjustedLower !== null ? [
        displayMode === 'rate' ? adjustedLower : Number(((adjustedLower * parcelSizeMT) / 1000000).toFixed(3)),
        displayMode === 'rate' ? adjustedUpper : Number(((adjustedUpper * parcelSizeMT) / 1000000).toFixed(3))
      ] : null,
      rawForecast: adjustedForecast,
      rawUpper: adjustedUpper,
      rawLower: adjustedLower
    };
  });

  // Calculate key summary statistics
  const forecastPoints = chartData.filter((d) => d.displayForecast !== null);
  const targetEndForecast = forecastPoints[forecastPoints.length - 1]?.rawForecast ?? 13.40;
  const targetEndSavingsPerTon = currentSpotRate - targetEndForecast;
  const totalProjectedSavingsUSD = targetEndSavingsPerTon * parcelSizeMT;

  const handleApplyScenario = (scenario: string) => {
    setActiveScenario(scenario);
    if (scenario === 'baseline') {
      setBunkerSpikePercent(0);
      setCongestionDelayDays(0);
    } else if (scenario === 'monsoon') {
      setBunkerSpikePercent(5);
      setCongestionDelayDays(4);
    } else if (scenario === 'bunkerSpike') {
      setBunkerSpikePercent(25);
      setCongestionDelayDays(1);
    } else if (scenario === 'tonnageSurplus') {
      setBunkerSpikePercent(-10);
      setCongestionDelayDays(0);
    }
  };

  // Custom Tooltip Component for Forward Curve
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    const rateVal = data.rate;
    const forecastVal = data.rawForecast;
    const lowerVal = data.rawLower;
    const upperVal = data.rawUpper;

    return (
      <div className="bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] p-3.5 rounded-lg shadow-xl text-xs font-mono-data min-w-[220px]">
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] text-sm">{data.day}</span>
          <span className="text-[11px] text-[#7A7268] dark:text-[#8E9B97]">{data.date || 'Horizon'}</span>
        </div>

        {rateVal !== null && (
          <div className="flex justify-between items-center py-1">
            <span className="text-[#6B645C] dark:text-[#A3B1AB]">Settled Spot Rate:</span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] text-sm">
              ${rateVal.toFixed(2)}/MT
            </span>
          </div>
        )}

        {forecastVal !== null && (
          <div className="flex justify-between items-center py-1">
            <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">Bayesian Forecast:</span>
            <span className="font-bold text-[#BC412B] dark:text-[#E05A42] text-sm">
              ${forecastVal.toFixed(2)}/MT
            </span>
          </div>
        )}

        {lowerVal !== null && upperVal !== null && (
          <div className="flex justify-between items-center py-1 text-[11px] text-[#7A7268] dark:text-[#8E9B97] bg-[#F4F0E8] dark:bg-[#101820] p-1.5 rounded mt-1">
            <span>95% Confidence:</span>
            <span className="font-semibold">${lowerVal.toFixed(2)} – ${upperVal.toFixed(2)}</span>
          </div>
        )}

        {data.bdi && (
          <div className="flex justify-between items-center pt-1.5 mt-1.5 border-t border-[#DDD8CE]/60 dark:border-[#1F2E3E]/60 text-[10px] text-[#7A7268] dark:text-[#8E9B97]">
            <span>Baltic Dry Index:</span>
            <span className="font-bold">{data.bdi} pts</span>
          </div>
        )}

        <div className="mt-2 pt-1.5 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-[11px] flex justify-between font-bold text-[#2D5A43] dark:text-[#3EB58A]">
          <span>Total 180K MT Parcel:</span>
          <span>
            ${(((forecastVal ?? rateVal ?? 14.8) * parcelSizeMT) / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>
    );
  };

  // Custom Tooltip for Multi-Corridor
  const CustomCorridorTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] p-3 rounded-lg shadow-xl text-xs font-mono-data min-w-[240px]">
        <div className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] pb-1.5 mb-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          Horizon: {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center py-0.5">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              ${Number(entry.value).toFixed(2)}/MT
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Custom Tooltip for Cost Breakdown
  const CustomCostTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const total = payload.reduce((acc: number, cur: any) => acc + (Number(cur.value) || 0), 0);
    return (
      <div className="bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] p-3 rounded-lg shadow-xl text-xs font-mono-data min-w-[240px]">
        <div className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] pb-1.5 mb-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] flex justify-between">
          <span>{label}</span>
          <span className="text-[#BC412B] dark:text-[#E05A42]">Total: ${total.toFixed(2)}/MT</span>
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center py-0.5">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              ${Number(entry.value).toFixed(2)} ({((Number(entry.value) / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Econometrics</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">Forward Curves &amp; Recharts Analytics</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#BC412B] dark:text-[#E05A42] font-bold">
            Forward Curve Econometrics &amp; Market Dynamics
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9] mt-0.5">
            Freight Forecast &amp; Trend Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Primary Corridor: Newcastle (AU) → Paradip (IN) | Vessel: Panamax (70K–85K MT) | Kernel: Gaussian Process &amp; Bayesian VAR
          </p>
        </div>

        {/* Dashboard Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] p-1 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
            <button
              onClick={() => setDisplayMode('rate')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer font-mono-data font-semibold ${
                displayMode === 'rate'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] shadow-sm'
                  : 'text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              Freight Rate ($/MT)
            </button>
            <button
              onClick={() => setDisplayMode('totalCost')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer font-mono-data font-semibold ${
                displayMode === 'totalCost'
                  ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] shadow-sm'
                  : 'text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              Parcel Value ($M)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97]">
              Current Rate (Spot)
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#BC412B]/10 text-[#BC412B] dark:text-[#E05A42]">
              -4.2% (30d)
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data">
              ${currentSpotRate.toFixed(2)}
            </span>
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">/ MT</span>
          </div>
          <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] mt-1 font-serif-body">
            180K MT Parcel Cost: <strong className="font-mono-data text-[#1A1A1A] dark:text-[#E8ECE9]">${((currentSpotRate * parcelSizeMT) / 1000000).toFixed(2)}M</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97]">
              {timeframe.toUpperCase()} Mean Target
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A]">
              SOFTENING
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#2D5A43] dark:text-[#3EB58A] font-mono-data">
              ${targetEndForecast.toFixed(2)}
            </span>
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">/ MT</span>
          </div>
          <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] mt-1 font-serif-body">
            Delta: <strong className="font-mono-data text-[#2D5A43] dark:text-[#3EB58A]">-${targetEndSavingsPerTon.toFixed(2)}/MT</strong> (-9.5%)
          </p>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97]">
              Projected Waiting Savings
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#2D5A43]/15 text-[#2D5A43] dark:text-[#3EB58A]">
              HIGH CONFIDENCE
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#2D5A43] dark:text-[#3EB58A] font-mono-data">
              ${Math.round(totalProjectedSavingsUSD).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] mt-1 font-serif-body">
            By fixing in window: <strong className="text-[#1A1A1A] dark:text-[#E8ECE9]">Sep 15 - Sep 28</strong>
          </p>
        </div>

        <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97]">
              Market Volatility &amp; BDI
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold bg-[#F4F0E8] dark:bg-[#16202C] text-[#7A7268] dark:text-[#8E9B97]">
              BDI: 1,645
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data">
              11.4%
            </span>
            <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">Ann. Vol</span>
          </div>
          <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] mt-1 font-serif-body">
            Downside probability: <strong className="font-mono-data text-[#2D5A43] dark:text-[#3EB58A]">84%</strong>
          </p>
        </div>
      </div>

      {/* Main Charts Dashboard Card */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-6 shadow-sm flex flex-col gap-6">
        {/* Navigation Tabs and Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
          {/* Chart View Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveChartTab('forwardCurve')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono-data font-bold transition-all cursor-pointer ${
                activeChartTab === 'forwardCurve'
                  ? 'bg-[#BC412B] text-white shadow-xs'
                  : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              1. Forward Curve &amp; Confidence Band
            </button>
            <button
              onClick={() => setActiveChartTab('corridors')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono-data font-bold transition-all cursor-pointer ${
                activeChartTab === 'corridors'
                  ? 'bg-[#BC412B] text-white shadow-xs'
                  : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              2. Multi-Corridor Comparison
            </button>
            <button
              onClick={() => setActiveChartTab('costBreakdown')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono-data font-bold transition-all cursor-pointer ${
                activeChartTab === 'costBreakdown'
                  ? 'bg-[#BC412B] text-white shadow-xs'
                  : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              3. Freight Cost Decomposition
            </button>
            <button
              onClick={() => setActiveChartTab('distribution')}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono-data font-bold transition-all cursor-pointer ${
                activeChartTab === 'distribution'
                  ? 'bg-[#BC412B] text-white shadow-xs'
                  : 'bg-[#F4F0E8] dark:bg-[#16202C] text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
              }`}
            >
              4. Probability Distribution
            </button>
          </div>

          {/* Timeframe & Display Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {activeChartTab === 'forwardCurve' && (
              <label className="flex items-center gap-1.5 text-xs text-[#6B645C] dark:text-[#A3B1AB] cursor-pointer font-mono-data">
                <input
                  type="checkbox"
                  checked={showConfidenceBand}
                  onChange={(e) => setShowConfidenceBand(e.target.checked)}
                  className="rounded text-[#BC412B] accent-[#BC412B]"
                />
                <span>95% Confidence Band</span>
              </label>
            )}

            <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] p-0.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
              {(['30d', '60d', '90d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer font-mono-data font-bold ${
                    timeframe === t
                      ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] shadow-xs'
                      : 'text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Sensitivity Simulation Panel */}
        <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-4 rounded-lg border border-[#DDD8CE] dark:border-[#1F2E3E] flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#BC412B] dark:text-[#E05A42] font-mono-data">
                Dynamic Econometric Sensitivity Simulator
              </span>
              {totalSensitivityDelta !== 0 && (
                <span className="text-[11px] font-mono-data font-bold px-2 py-0.5 bg-[#BC412B] text-white rounded">
                  Impact: {totalSensitivityDelta > 0 ? `+${totalSensitivityDelta.toFixed(2)}` : totalSensitivityDelta.toFixed(2)} $/MT
                </span>
              )}
            </div>

            {/* Quick Scenario Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono-data">
              <span className="text-[#7A7268] dark:text-[#8E9B97] mr-1">Presets:</span>
              <button
                onClick={() => handleApplyScenario('baseline')}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  activeScenario === 'baseline'
                    ? 'bg-[#1A1A1A] text-white dark:bg-white dark:text-[#101820] border-transparent font-bold'
                    : 'bg-white dark:bg-[#101820] text-[#6B645C] dark:text-[#8E9B97] border-[#DDD8CE] dark:border-[#1F2E3E]'
                }`}
              >
                Baseline
              </button>
              <button
                onClick={() => handleApplyScenario('monsoon')}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  activeScenario === 'monsoon'
                    ? 'bg-[#BC412B] text-white border-transparent font-bold'
                    : 'bg-white dark:bg-[#101820] text-[#6B645C] dark:text-[#8E9B97] border-[#DDD8CE] dark:border-[#1F2E3E]'
                }`}
              >
                Monsoon Delay (+4d)
              </button>
              <button
                onClick={() => handleApplyScenario('bunkerSpike')}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  activeScenario === 'bunkerSpike'
                    ? 'bg-[#BC412B] text-white border-transparent font-bold'
                    : 'bg-white dark:bg-[#101820] text-[#6B645C] dark:text-[#8E9B97] border-[#DDD8CE] dark:border-[#1F2E3E]'
                }`}
              >
                Bunker Rally (+25%)
              </button>
              <button
                onClick={() => handleApplyScenario('tonnageSurplus')}
                className={`px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  activeScenario === 'tonnageSurplus'
                    ? 'bg-[#2D5A43] text-white border-transparent font-bold'
                    : 'bg-white dark:bg-[#101820] text-[#6B645C] dark:text-[#8E9B97] border-[#DDD8CE] dark:border-[#1F2E3E]'
                }`}
              >
                Tonnage Surplus (-10%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div>
              <div className="flex justify-between font-mono-data text-xs mb-1.5">
                <span className="font-semibold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  VLSFO Bunker Fuel Shock:
                </span>
                <span className="font-bold text-[#BC412B] dark:text-[#E05A42]">
                  {bunkerSpikePercent > 0 ? `+${bunkerSpikePercent}%` : `${bunkerSpikePercent}%`} (${Math.round(615 * (1 + bunkerSpikePercent / 100))}/MT)
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                step="5"
                value={bunkerSpikePercent}
                onChange={(e) => {
                  setBunkerSpikePercent(Number(e.target.value));
                  setActiveScenario('custom');
                }}
                className="w-full accent-[#BC412B] cursor-pointer h-2 bg-[#DDD8CE] dark:bg-[#1F2E3E] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-1">
                <span>-20% ($492/MT)</span>
                <span>Base ($615/MT)</span>
                <span>+40% ($861/MT)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-mono-data text-xs mb-1.5">
                <span className="font-semibold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  Discharge Port Congestion Delay:
                </span>
                <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                  {congestionDelayDays} Days Extra Berth Waiting
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={congestionDelayDays}
                onChange={(e) => {
                  setCongestionDelayDays(Number(e.target.value));
                  setActiveScenario('custom');
                }}
                className="w-full accent-[#BC412B] cursor-pointer h-2 bg-[#DDD8CE] dark:bg-[#1F2E3E] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data mt-1">
                <span>0 Days (Normal Flow)</span>
                <span>+5 Days (High Chop)</span>
                <span>+10 Days (Critical Logjam)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHART 1: FORWARD CURVE & CONFIDENCE BAND */}
        {activeChartTab === 'forwardCurve' && (
          <div className="w-full h-[380px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BC412B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#BC412B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CE" opacity={0.5} className="dark:opacity-20" />
                <XAxis
                  dataKey="day"
                  stroke="#7A7268"
                  tick={{ fontSize: 11, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#7A7268' }}
                />
                <YAxis
                  domain={displayMode === 'rate' ? [12.0, 18.0] : [2.1, 3.2]}
                  stroke="#7A7268"
                  tick={{ fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(val) => (displayMode === 'rate' ? `$${val}` : `$${val}M`)}
                />
                <Tooltip content={<CustomForecastTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                />

                {/* Reference line marking Today */}
                <ReferenceLine
                  x="Today"
                  stroke="#BC412B"
                  strokeDasharray="4 4"
                  label={{
                    value: 'TODAY',
                    position: 'top',
                    fill: '#BC412B',
                    fontSize: 10,
                    fontFamily: 'monospace',
                    fontWeight: 'bold'
                  }}
                />

                {/* Spot reference baseline */}
                <ReferenceLine
                  y={displayMode === 'rate' ? currentSpotRate : (currentSpotRate * parcelSizeMT) / 1000000}
                  stroke="#7A7268"
                  strokeDasharray="2 2"
                  strokeOpacity={0.6}
                  label={{
                    value: `Spot: $${currentSpotRate.toFixed(2)}`,
                    position: 'insideBottomRight',
                    fill: '#7A7268',
                    fontSize: 10,
                    fontFamily: 'monospace'
                  }}
                />

                {/* 95% Confidence Band Area */}
                {showConfidenceBand && (
                  <Area
                    type="monotone"
                    dataKey="displayUpper"
                    stroke="none"
                    fill="url(#forecastAreaGrad)"
                    name="95% Confidence Upper Band"
                    isAnimationActive={true}
                  />
                )}

                {/* Historical Settled Freight Line */}
                <Line
                  type="monotone"
                  dataKey="displayRate"
                  stroke="#1A1A1A"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1A1A1A', stroke: '#FFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 7, fill: '#1A1A1A' }}
                  name="Settled Historical Spot Rate"
                  connectNulls={false}
                  isAnimationActive={true}
                />

                {/* Forward Bayesian Forecast Line */}
                <Line
                  type="monotone"
                  dataKey="displayForecast"
                  stroke="#BC412B"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={{ r: 4, fill: '#BC412B', stroke: '#FFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 7, fill: '#BC412B' }}
                  name="Forward Projected Curve"
                  connectNulls={false}
                  isAnimationActive={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* CHART 2: MULTI-CORRIDOR BENCHMARK */}
        {activeChartTab === 'corridors' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-[#6B645C] dark:text-[#A3B1AB]">
              <span>Comparative Dry Bulk Freight Curves across Major Indian Ocean / Pacific Corridors ($/MT)</span>
              <span className="font-mono-data font-semibold text-[#BC412B] dark:text-[#E05A42]">Panamax &amp; Supramax Benchmark</span>
            </div>
            <div className="w-full h-[380px] sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={multiCorridorBenchmarkData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CE" opacity={0.5} className="dark:opacity-20" />
                  <XAxis
                    dataKey="time"
                    stroke="#7A7268"
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                  />
                  <YAxis
                    domain={[10.0, 22.0]}
                    stroke="#7A7268"
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomCorridorTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />

                  <ReferenceLine
                    x="Today"
                    stroke="#7A7268"
                    strokeDasharray="4 4"
                    label={{ value: 'TODAY', position: 'top', fill: '#7A7268', fontSize: 10, fontFamily: 'monospace' }}
                  />

                  <Line
                    type="monotone"
                    dataKey="newcastleParadip"
                    name="Newcastle → Paradip (Panamax)"
                    stroke="#BC412B"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="richardsBayParadip"
                    name="Richards Bay → Paradip (Capesize)"
                    stroke="#2D5A43"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gladstoneGangavaram"
                    name="Gladstone → Gangavaram (Panamax)"
                    stroke="#D97706"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="taboneoVizag"
                    name="Taboneo → Vizag (Supramax)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 3: FREIGHT COST DECOMPOSITION */}
        {activeChartTab === 'costBreakdown' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-[#6B645C] dark:text-[#A3B1AB]">
              <span>Stacked Structural Cost Breakdown of Newcastle → Paradip Freight ($/MT)</span>
              <span className="font-mono-data font-semibold text-[#2D5A43] dark:text-[#3EB58A]">Bunker &amp; Operating Margin Sensitivity</span>
            </div>
            <div className="w-full h-[380px] sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={freightCostBreakdownTimeline}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="gradOpex" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A5568" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4A5568" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradBunker" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BC412B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#BC412B" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradPort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradMargin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D5A43" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2D5A43" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CE" opacity={0.5} className="dark:opacity-20" />
                  <XAxis dataKey="period" stroke="#7A7268" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis
                    domain={[0, 20.0]}
                    stroke="#7A7268"
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomCostTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />

                  <Area
                    type="monotone"
                    dataKey="baseOpex"
                    stackId="1"
                    stroke="#4A5568"
                    fill="url(#gradOpex)"
                    name="Base Vessel OPEX & Crew"
                  />
                  <Area
                    type="monotone"
                    dataKey="bunkerFuel"
                    stackId="1"
                    stroke="#BC412B"
                    fill="url(#gradBunker)"
                    name="VLSFO Bunker Fuel Burn"
                  />
                  <Area
                    type="monotone"
                    dataKey="portCanalDues"
                    stackId="1"
                    stroke="#D97706"
                    fill="url(#gradPort)"
                    name="Port Dues & Navigation Fees"
                  />
                  <Area
                    type="monotone"
                    dataKey="marketMargin"
                    stackId="1"
                    stroke="#2D5A43"
                    fill="url(#gradMargin)"
                    name="Carrier Margin / Scarcity Premium"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART 4: PROBABILITY DISTRIBUTION DENSITY */}
        {activeChartTab === 'distribution' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs text-[#6B645C] dark:text-[#A3B1AB]">
              <span>Monte Carlo Probability Distribution of Forward Rate Outcome (+30d Horizon)</span>
              <span className="font-mono-data font-semibold text-[#BC412B] dark:text-[#E05A42]">Confidence Level: 95% (n=10,000 runs)</span>
            </div>
            <div className="w-full h-[380px] sm:h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forwardRateProbabilityDistribution}
                  margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BC412B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#BC412B" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CE" opacity={0.5} className="dark:opacity-20" />
                  <XAxis dataKey="priceBracket" stroke="#7A7268" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis
                    domain={[0, 40]}
                    stroke="#7A7268"
                    tick={{ fontSize: 11, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    formatter={(val: any, name: string) => [`${val}%`, name === 'probabilityPct' ? 'Probability Density' : 'Cumulative Probability']}
                    contentStyle={{
                      backgroundColor: 'rgba(22, 32, 44, 0.95)',
                      borderColor: '#1F2E3E',
                      borderRadius: '8px',
                      color: '#E8ECE9',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                  />

                  <Area
                    type="monotone"
                    dataKey="probabilityPct"
                    stroke="#BC412B"
                    strokeWidth={2.5}
                    fill="url(#probGrad)"
                    name="Probability Density (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Legend / Econometric Interpretation Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <div className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#BC412B]"></span>
              Optimal Window Signal
            </div>
            <p className="text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
              Curve indicates market bottoming around Day +20 to +25 ($13.40–$13.60/MT) prior to Q4 pre-winter restocking rally.
            </p>
          </div>

          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <div className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D5A43]"></span>
              Tonnage Supply Pressure
            </div>
            <p className="text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
              14 Panamax ballast vessels discharging in East Coast India open for Newcastle ballasting, exerting downward pressure on prompt freight.
            </p>
          </div>

          <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E]">
            <div className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
              Bunker Volatility Hedge
            </div>
            <p className="text-[#6B645C] dark:text-[#A3B1AB] font-serif-body">
              Singapore VLSFO forward spreads are flat at $600–$615/MT. BAF escalators recommended for contracts exceeding 45 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
