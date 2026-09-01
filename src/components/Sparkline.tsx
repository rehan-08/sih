import React from 'react';

interface SparklineProps {
  data: number[];
  forecastData?: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  forecastData,
  width = 160,
  height = 40,
  color = '#BC412B',
  fillOpacity = 0.12
}) => {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className="flex items-center justify-center text-[10px] text-[#7A7268] dark:text-[#8E9B97]">No history yet</div>;
  }

  const forecast = forecastData && forecastData.length > 0 ? forecastData : [];
  const combined = [...data, ...forecast];

  const min = Math.min(...combined);
  const max = Math.max(...combined);
  const range = max - min || 1;
  const stepX = width / (combined.length - 1);

  const toXY = (v: number, i: number) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  };

  const historyPoints = data.map((v, i) => toXY(v, i));
  const linePath = `M ${historyPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaPath = `${linePath} L ${historyPoints[historyPoints.length - 1].x},${height} L 0,${height} Z`;

  const forecastPoints = forecast.map((v, i) => toXY(v, data.length - 1 + i));
  const forecastPath = forecastPoints.length > 0
    ? `M ${historyPoints[historyPoints.length - 1].x.toFixed(1)},${historyPoints[historyPoints.length - 1].y.toFixed(1)} L ${forecastPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
    : null;

  const trendUp = data[data.length - 1] > data[0];
  const lastHistoryPoint = historyPoints[historyPoints.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={areaPath} fill={color} fillOpacity={fillOpacity} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {forecastPath && (
        <path d={forecastPath} fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={1.5} strokeDasharray="3 3" strokeLinejoin="round" strokeLinecap="round" />
      )}
      <circle cx={lastHistoryPoint.x} cy={lastHistoryPoint.y} r={2.5} fill={trendUp ? '#BC412B' : '#2D5A43'} />
      {forecastPoints.length > 0 && (
        <circle cx={forecastPoints[forecastPoints.length - 1].x} cy={forecastPoints[forecastPoints.length - 1].y} r={2} fill={color} fillOpacity={0.6} />
      )}
    </svg>
  );
};
