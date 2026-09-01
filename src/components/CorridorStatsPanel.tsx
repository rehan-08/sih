import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { portIntelligenceData, freightForecastHistory } from '../data/maritimeData';

const INDIA_PORT_IDS = ['paradip', 'visakhapatnam', 'gangavaram', 'gopalpur', 'haldia', 'dhamra'];

const congestionColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return '#BC412B';
    case 'HIGH': return '#D97706';
    case 'MODERATE': return '#8C5E28';
    default: return '#2D5A43';
  }
};

export const CorridorStatsPanel: React.FC = () => {
  const congestionData = INDIA_PORT_IDS
    .map(id => portIntelligenceData.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p && !!p.congestion)
    .map(p => ({
      name: p.name,
      congestionIndex: p.congestion!.congestionIndex,
      level: p.congestion!.congestionLevel
    }));

  const freightHistoryData = freightForecastHistory
    .filter(pt => pt.rate !== null)
    .map(pt => ({ date: pt.date, rate: pt.rate as number }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Port Congestion Bar Chart */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-3">
        <div>
          <h3 className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">traffic</span>
            Port Congestion Index — India East Coast
          </h3>
          <p className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
            Current live congestion telemetry across all six discharge terminals
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={congestionData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CE" opacity={0.3} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#7A7268' }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#7A7268' }} />
            <Tooltip
              contentStyle={{ background: '#101820', border: '1px solid #1F2E3E', borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: '#E8ECE9' }}
              formatter={(value: number, _name, item) => [`${value}/100 (${item.payload.level})`, 'Congestion']}
            />
            <Bar dataKey="congestionIndex" radius={[3, 3, 0, 0]}>
              {congestionData.map((entry, i) => (
                <Cell key={i} fill={congestionColor(entry.level)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Freight Rate History Bar Chart */}
      <div className="bg-white dark:bg-[#101820] border border-[#DDD8CE] dark:border-[#1F2E3E] rounded-lg p-5 shadow-sm flex flex-col gap-3">
        <div>
          <h3 className="font-editorial text-sm font-bold text-[#1A1A1A] dark:text-[#E8ECE9] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BC412B] dark:text-[#E05A42] text-[18px]">bar_chart</span>
            30-Day Freight Rate History (Newcastle → Paradip)
          </h3>
          <p className="text-[11px] text-[#6B645C] dark:text-[#A3B1AB] font-serif-body italic">
            Panamax spot rate, $/MT — trailing 30 days of settled fixtures
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={freightHistoryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDD8CE" opacity={0.3} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7A7268' }} />
            <YAxis domain={[13, 17]} tick={{ fontSize: 10, fill: '#7A7268' }} />
            <Tooltip
              contentStyle={{ background: '#101820', border: '1px solid #1F2E3E', borderRadius: 6, fontSize: 11 }}
              labelStyle={{ color: '#E8ECE9' }}
              formatter={(value: number) => [`$${value}/MT`, 'Spot Rate']}
            />
            <Bar dataKey="rate" fill="#BC412B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
