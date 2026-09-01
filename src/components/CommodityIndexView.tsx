import React, { useState } from 'react';
import { thermalIndexChartData } from '../data/maritimeData';

interface SupplyDemandRow {
  commodity: string;
  supply: Array<{ region: string; volumeMT: number }>;
  demand: Array<{ region: string; volumeMT: number }>;
  balance: number;
}

// Indicative annual seaborne volumes (million MT) across the origin/destination regions
// this desk tracks — directional, not a precise global trade dataset.
const globalSupplyDemand: SupplyDemandRow[] = [
  {
    commodity: 'Thermal Coal',
    supply: [
      { region: 'Australia', volumeMT: 185 },
      { region: 'Indonesia', volumeMT: 400 },
      { region: 'Russia', volumeMT: 150 },
      { region: 'S. Africa', volumeMT: 70 }
    ],
    demand: [
      { region: 'India', volumeMT: 95 },
      { region: 'China', volumeMT: 220 },
      { region: 'Japan/S.Korea', volumeMT: 130 }
    ],
    balance: 360
  },
  {
    commodity: 'Coking Coal',
    supply: [
      { region: 'Australia', volumeMT: 160 },
      { region: 'Russia', volumeMT: 25 },
      { region: 'Mozambique', volumeMT: 12 }
    ],
    demand: [
      { region: 'India', volumeMT: 55 },
      { region: 'China', volumeMT: 60 },
      { region: 'Japan/S.Korea', volumeMT: 60 }
    ],
    balance: 22
  },
  {
    commodity: 'Bauxite',
    supply: [
      { region: 'Australia', volumeMT: 105 }
    ],
    demand: [
      { region: 'India', volumeMT: 20 },
      { region: 'China', volumeMT: 110 }
    ],
    balance: -25
  },
  {
    commodity: 'Iron Ore',
    supply: [
      { region: 'Australia', volumeMT: 900 }
    ],
    demand: [
      { region: 'China', volumeMT: 1100 },
      { region: 'India', volumeMT: 40 }
    ],
    balance: -240
  },
  {
    commodity: 'Rock Phosphate / DAP',
    supply: [
      { region: 'Morocco', volumeMT: 30 },
      { region: 'Saudi Arabia', volumeMT: 22 },
      { region: 'Jordan', volumeMT: 8 }
    ],
    demand: [
      { region: 'India', volumeMT: 13 },
      { region: 'Brazil', volumeMT: 10 },
      { region: 'USA', volumeMT: 8 }
    ],
    balance: 29
  },
  {
    commodity: 'Urea',
    supply: [
      { region: 'Middle East', volumeMT: 12 },
      { region: 'China', volumeMT: 8 },
      { region: 'Russia', volumeMT: 6 }
    ],
    demand: [
      { region: 'India', volumeMT: 9 },
      { region: 'Brazil', volumeMT: 5 },
      { region: 'USA', volumeMT: 4 }
    ],
    balance: 8
  },
  {
    commodity: 'Pulses',
    supply: [
      { region: 'Canada', volumeMT: 3.5 },
      { region: 'Australia', volumeMT: 2.0 },
      { region: 'E. Africa', volumeMT: 1.2 }
    ],
    demand: [
      { region: 'India', volumeMT: 4.5 },
      { region: 'Bangladesh', volumeMT: 1.0 },
      { region: 'EU', volumeMT: 0.8 }
    ],
    balance: 0.4
  },
  {
    commodity: 'Steel Scrap',
    supply: [
      { region: 'USA', volumeMT: 18 },
      { region: 'EU', volumeMT: 20 },
      { region: 'Japan', volumeMT: 8 }
    ],
    demand: [
      { region: 'India', volumeMT: 9 },
      { region: 'Turkey', volumeMT: 22 },
      { region: 'Pakistan', volumeMT: 3 }
    ],
    balance: 12
  },
  {
    commodity: 'Pet Coke',
    supply: [
      { region: 'USA', volumeMT: 30 },
      { region: 'Saudi Arabia', volumeMT: 5 }
    ],
    demand: [
      { region: 'India', volumeMT: 14 },
      { region: 'China', volumeMT: 6 }
    ],
    balance: 15
  },
  {
    commodity: 'Sulphur',
    supply: [
      { region: 'Middle East', volumeMT: 20 },
      { region: 'Kazakhstan', volumeMT: 8 },
      { region: 'Canada', volumeMT: 6 }
    ],
    demand: [
      { region: 'India', volumeMT: 8 },
      { region: 'Morocco', volumeMT: 6 },
      { region: 'China', volumeMT: 5 }
    ],
    balance: 15
  },
  {
    commodity: 'Limestone / Gypsum',
    supply: [
      { region: 'Thailand', volumeMT: 12 },
      { region: 'Indonesia', volumeMT: 8 },
      { region: 'UAE', volumeMT: 6 }
    ],
    demand: [
      { region: 'India', volumeMT: 7 },
      { region: 'Bangladesh', volumeMT: 6 },
      { region: 'Vietnam', volumeMT: 5 }
    ],
    balance: 8
  },
  {
    commodity: 'Wood Pulp / Timber',
    supply: [
      { region: 'Myanmar', volumeMT: 4 },
      { region: 'Malaysia', volumeMT: 5 },
      { region: 'New Zealand', volumeMT: 6 }
    ],
    demand: [
      { region: 'India', volumeMT: 3 },
      { region: 'China', volumeMT: 9 },
      { region: 'Vietnam', volumeMT: 2 }
    ],
    balance: 1
  },
  {
    commodity: 'Muriate of Potash (MOP)',
    supply: [
      { region: 'Canada', volumeMT: 22 },
      { region: 'Belarus', volumeMT: 12 },
      { region: 'Jordan', volumeMT: 3 },
      { region: 'Russia', volumeMT: 10 }
    ],
    demand: [
      { region: 'India', volumeMT: 4 },
      { region: 'Brazil', volumeMT: 13 },
      { region: 'China', volumeMT: 9 }
    ],
    balance: 21
  },
  {
    commodity: 'Copper Concentrate',
    supply: [
      { region: 'Chile', volumeMT: 6 },
      { region: 'Peru', volumeMT: 4.5 },
      { region: 'Indonesia', volumeMT: 2 }
    ],
    demand: [
      { region: 'India', volumeMT: 1.2 },
      { region: 'China', volumeMT: 9 },
      { region: 'Japan', volumeMT: 1.5 }
    ],
    balance: 0.8
  },
  {
    commodity: 'Manganese Ore',
    supply: [
      { region: 'South Africa', volumeMT: 8 },
      { region: 'Gabon', volumeMT: 6 },
      { region: 'Australia', volumeMT: 4 }
    ],
    demand: [
      { region: 'India', volumeMT: 3.5 },
      { region: 'China', volumeMT: 11 },
      { region: 'S. Korea', volumeMT: 1.5 }
    ],
    balance: 2
  },
  {
    commodity: 'Soda Ash',
    supply: [
      { region: 'USA', volumeMT: 5 },
      { region: 'Turkey', volumeMT: 4 }
    ],
    demand: [
      { region: 'India', volumeMT: 1.8 },
      { region: 'SE Asia', volumeMT: 3 },
      { region: 'EU', volumeMT: 2 }
    ],
    balance: 2.2
  },
  {
    commodity: 'Cement Clinker',
    supply: [
      { region: 'Vietnam', volumeMT: 9 },
      { region: 'Thailand', volumeMT: 5 },
      { region: 'UAE', volumeMT: 3 }
    ],
    demand: [
      { region: 'India', volumeMT: 3 },
      { region: 'Bangladesh', volumeMT: 8 },
      { region: 'Sri Lanka', volumeMT: 2 }
    ],
    balance: 4
  }
];

export const CommodityIndexView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Landed Cost & Arbitrage Calculator States
  const [fobPrice, setFobPrice] = useState<number>(128.45);
  const [oceanFreight, setOceanFreight] = useState<number>(14.20);
  const [customsDutyPercent, setCustomsDutyPercent] = useState<number>(2.5);
  const [gstCompensationCess, setGstCompensationCess] = useState<number>(400); // INR per MT
  const [inrUsdRate, setInrUsdRate] = useState<number>(87.5);
  const [portHandlingCharges, setPortHandlingCharges] = useState<number>(4.80);

  // Landed calculations in USD and INR
  const cifPriceUSD = fobPrice + oceanFreight;
  const basicCustomsDutyUSD = cifPriceUSD * (customsDutyPercent / 100);
  const portHandlingUSD = portHandlingCharges;
  const landedPreTaxUSD = cifPriceUSD + basicCustomsDutyUSD + portHandlingUSD;
  const gstCessUSD = gstCompensationCess / inrUsdRate;
  const totalLandedUSD = landedPreTaxUSD + gstCessUSD;
  const totalLandedINR = totalLandedUSD * inrUsdRate;

  // Comparison origins
  const originBenchmarks = [
    { origin: 'Newcastle 6000 kcal (AU)', fob: 128.45, freight: 14.20, landed: totalLandedUSD, status: 'BENCHMARK' },
    { origin: 'Richards Bay 6000 kcal (ZA)', fob: 122.50, freight: 18.80, landed: 122.50 + 18.80 + 3.5 + 4.8 + gstCessUSD, status: '+$3.85 / MT' },
    { origin: 'Indonesian ICI4 4200 (ID)', fob: 54.20, freight: 7.90, landed: 54.20 + 7.90 + 1.6 + 4.8 + gstCessUSD, status: 'Low CV Blend' },
    { origin: 'Domestic Coal India E-Auction', fob: 78.00, freight: 24.50, landed: 78.00 + 24.50 + 8.2, status: 'Inland Rake' }
  ];

  const width = 600;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  const minPrice = 90;
  const maxPrice = 150;

  const getY = (val: number) => {
    return height - padding.bottom - ((val - minPrice) / (maxPrice - minPrice)) * (height - padding.top - padding.bottom);
  };

  const getX = (index: number) => {
    return padding.left + (index / (thermalIndexChartData.length - 1)) * (width - padding.left - padding.right);
  };

  const linePath = thermalIndexChartData
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.price)}`)
    .join(' ');

  const areaPath = `${linePath} L ${getX(thermalIndexChartData.length - 1)} ${height - padding.bottom} L ${getX(0)} ${height - padding.bottom} Z`;

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto w-full text-[#1A1A1A] dark:text-[#E8ECE9]">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
        <span>Monographs</span>
        <span>&gt;</span>
        <span>Commodities</span>
        <span>&gt;</span>
        <span className="text-[#BC412B] dark:text-[#E05A42] font-semibold">Newcastle Thermal Index &amp; Import Parity</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
              Newcastle Thermal Index
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] text-[#BC412B] dark:text-[#E05A42] text-[10px] font-bold font-mono-data">
              LIVE QUOTATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic mt-1">
            Benchmark Thermal Coal 6,000 kcal/kg NAR FOB Newcastle (Australia)
          </p>
        </div>

        <div className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
          Index ID: NTI-6000-FOB
        </div>
      </div>

      {/* Main Grid: Chart & Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Price & Chart (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Price & Interactive Chart Card */}
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-6 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7A7268] dark:text-[#8E9B97] block mb-1">
                  Spot Price (FOB Newcastle)
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-[#1A1A1A] dark:text-[#E8ECE9] font-mono-data">
                    ${fobPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#7A7268] dark:text-[#8E9B97] font-mono-data">/ MT</span>
                  <span className="px-2 py-0.5 rounded bg-[#EDE8DE] dark:bg-[#16202C] text-[#2D5A43] dark:text-[#3EB58A] text-xs font-bold font-mono-data flex items-center gap-1 border border-[#DDD8CE] dark:border-[#1F2E3E]">
                    <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                    <span>+2.1% (+$2.65)</span>
                  </span>
                </div>
              </div>

              {/* Range filters */}
              <div className="flex bg-[#EDE8DE] dark:bg-[#16202C] p-0.5 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] text-xs">
                {(['1M', '3M', '6M', '1Y'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRange(r)}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer font-mono-data ${
                      selectedRange === r
                        ? 'bg-white dark:bg-[#101820] text-[#BC412B] dark:text-[#E05A42] font-bold shadow-2xs'
                        : 'text-[#6B645C] dark:text-[#8E9B97] hover:text-[#1A1A1A] dark:hover:text-[#E8ECE9]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Historical Line Chart */}
            <div className="relative w-full overflow-hidden">
              <svg className="w-full h-auto" viewBox={`0 0 ${width} ${height}`}>
                {/* Horizontal price lines */}
                {[100, 115, 130, 145].map((val) => (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={getY(val)}
                      x2={width - padding.right}
                      y2={getY(val)}
                      stroke="currentColor"
                      className="text-[#DDD8CE] dark:text-[#1F2E3E]"
                      strokeDasharray="2 2"
                    />
                    <text
                      x={padding.left - 6}
                      y={getY(val) + 3}
                      fill="currentColor"
                      className="text-[#7A7268] dark:text-[#8E9B97]"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      ${val}
                    </text>
                  </g>
                ))}

                {/* Area Gradient Under Curve */}
                <path
                  d={areaPath}
                  fill="currentColor"
                  className="text-[#BC412B]/10 dark:text-[#BC412B]/20"
                />

                {/* Main Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#BC412B"
                  strokeWidth="2.5"
                />

                {/* Data Points */}
                {thermalIndexChartData.map((pt, i) => {
                  const cx = getX(i);
                  const cy = getY(pt.price);
                  const isHovered = hoveredIndex === i;

                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 6 : 3.5}
                        fill="#BC412B"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={cx}
                        y={height - padding.bottom + 16}
                        fill="currentColor"
                        className="text-[#7A7268] dark:text-[#8E9B97]"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {pt.month}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Hover tooltip */}
              {hoveredIndex !== null && (
                <div
                  className="absolute z-20 bg-white dark:bg-[#16202C] border border-[#DDD8CE] dark:border-[#1F2E3E] p-2 rounded shadow-lg text-xs pointer-events-none font-mono-data"
                  style={{
                    left: `${getX(hoveredIndex) - 30}px`,
                    top: `${getY(thermalIndexChartData[hoveredIndex].price) - 50}px`
                  }}
                >
                  <div className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
                    {thermalIndexChartData[hoveredIndex].month} 2026
                  </div>
                  <div className="text-[#BC412B] dark:text-[#E05A42]">
                    ${thermalIndexChartData[hoveredIndex].price} / MT
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Landed Cost & Netback Calculator (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CE] dark:border-[#1F2E3E]">
              <h3 className="font-editorial text-base font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">calculate</span>
                <span>Paradip Landed Cost Calculator</span>
              </h3>
              <span className="text-[10px] font-mono-data text-[#2D5A43] dark:text-[#3EB58A] font-bold">
                IMPORT PARITY
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center font-medium mb-1">
                  <span>FOB Newcastle Coal:</span>
                  <span className="font-mono-data font-bold">${fobPrice.toFixed(2)}/MT</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="180"
                  step="1"
                  value={fobPrice}
                  onChange={(e) => setFobPrice(Number(e.target.value))}
                  className="w-full accent-[#BC412B] cursor-pointer h-1.5 bg-[#EDE8DE] dark:bg-[#1F2E3E] rounded"
                />
              </div>

              <div>
                <div className="flex justify-between items-center font-medium mb-1">
                  <span>Ocean Freight (Panamax):</span>
                  <span className="font-mono-data font-bold">${oceanFreight.toFixed(2)}/MT</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="25"
                  step="0.5"
                  value={oceanFreight}
                  onChange={(e) => setOceanFreight(Number(e.target.value))}
                  className="w-full accent-[#BC412B] cursor-pointer h-1.5 bg-[#EDE8DE] dark:bg-[#1F2E3E] rounded"
                />
              </div>

              <div className="bg-[#F4F0E8] dark:bg-[#16202C] p-3 rounded border border-[#DDD8CE] dark:border-[#1F2E3E] space-y-1.5 font-mono-data text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#6B645C] dark:text-[#8E9B97]">CIF Paradip Value:</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">${cifPriceUSD.toFixed(2)}/MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B645C] dark:text-[#8E9B97]">Customs Duty (2.5%):</span>
                  <span className="text-[#1A1A1A] dark:text-[#E8ECE9]">+${basicCustomsDutyUSD.toFixed(2)}/MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B645C] dark:text-[#8E9B97]">Port Handling &amp; Stevedoring:</span>
                  <span className="text-[#1A1A1A] dark:text-[#E8ECE9]">+${portHandlingUSD.toFixed(2)}/MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B645C] dark:text-[#8E9B97]">GST Compensation Cess (₹400):</span>
                  <span className="text-[#1A1A1A] dark:text-[#E8ECE9]">+${gstCessUSD.toFixed(2)}/MT</span>
                </div>
                <div className="pt-2 border-t border-[#DDD8CE] dark:border-[#1F2E3E] flex justify-between text-xs font-bold text-[#BC412B] dark:text-[#E05A42]">
                  <span>Total Landed Paradip Cost:</span>
                  <span>${totalLandedUSD.toFixed(2)} / MT (₹{Math.round(totalLandedINR).toLocaleString()})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Arbitrage Origins Comparison */}
          <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A7268] dark:text-[#8E9B97] font-mono-data">
              Global Sourcing Arbitrage Matrix
            </h4>
            <div className="space-y-2 text-xs">
              {originBenchmarks.map((b, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] last:border-0">
                  <div>
                    <span className="font-bold text-[#1A1A1A] dark:text-[#E8ECE9] block">{b.origin}</span>
                    <span className="text-[10px] text-[#7A7268] dark:text-[#8E9B97] font-mono-data">FOB ${b.fob} + Freight ${b.freight}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-data font-bold text-[#1A1A1A] dark:text-[#E8ECE9] block">${b.landed.toFixed(2)}/MT</span>
                    <span className="text-[10px] text-[#BC412B] dark:text-[#E05A42] font-mono-data font-semibold">{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Supply & Demand Balance */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#F4F0E8] dark:bg-[#16202C]">
          <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">
            Global Supply &amp; Demand Balance
          </h3>
          <p className="text-xs text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
            Indicative annual seaborne export capacity vs import demand by commodity, across the origin and destination regions this desk tracks
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#DDD8CE] dark:border-[#1F2E3E] bg-[#EDE8DE]/70 dark:bg-[#1C2834]/70 text-[10px] font-bold text-[#7A7268] dark:text-[#8E9B97] uppercase tracking-wider">
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Export Supply (M MT/yr)</th>
                <th className="py-3 px-4">Import Demand (M MT/yr)</th>
                <th className="py-3 px-4 text-right">Global Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD8CE] dark:divide-[#1F2E3E]">
              {globalSupplyDemand.map((row) => {
                const isSurplus = row.balance > 50;
                const isDeficit = row.balance < 0;
                return (
                  <tr key={row.commodity} className="hover:bg-[#F9F7F2] dark:hover:bg-[#16202C] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A] dark:text-[#E8ECE9]">{row.commodity}</td>
                    <td className="py-3.5 px-4 font-mono-data text-[#555555] dark:text-[#A3B1AB]">
                      {row.supply.map(s => `${s.region} ${s.volumeMT}`).join(' · ')}
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-[#555555] dark:text-[#A3B1AB]">
                      {row.demand.map(d => `${d.region} ${d.volumeMT}`).join(' · ')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold font-mono-data border ${
                        isSurplus
                          ? 'bg-[#2D5A43]/10 text-[#2D5A43] dark:text-[#3EB58A] border-[#2D5A43]/30'
                          : isDeficit
                          ? 'bg-[#BC412B]/10 text-[#BC412B] dark:text-[#E05A42] border-[#BC412B]/30'
                          : 'bg-[#8C5E28]/10 text-[#8C5E28] dark:text-[#D4A359] border-[#8C5E28]/30'
                      }`}>
                        {row.balance > 0 ? '+' : ''}{row.balance} M MT ({isSurplus ? 'SURPLUS' : isDeficit ? 'DEFICIT' : 'TIGHT'})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
