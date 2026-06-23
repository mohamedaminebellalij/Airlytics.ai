'use client';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
} from 'recharts';
import type { PricePoint, ForecastPoint } from '@airlytics/types';
import { formatPrice, formatDateShort } from '@/lib/utils';

interface PriceChartProps {
  history: PricePoint[];
  forecast: ForecastPoint[];
  currentPrice: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip" style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        p.value != null && (
          <p key={i} style={{ fontSize: 13, fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 600, color: p.color }}>
            {formatPrice(p.value)}
          </p>
        )
      ))}
    </div>
  );
}

export function PriceChart({ history, forecast, currentPrice }: PriceChartProps) {
  // Merge into one dataset; forecast points get `forecast` key instead of `price`
  const histData = history.map(p => ({ date: p.date, price: p.price }));
  const fcstData = forecast.map(p => ({ date: p.date, forecast: p.price, lower: p.lower, upper: p.upper }));

  // Last history point connects to first forecast
  const combined = [
    ...histData,
    { date: histData[histData.length - 1].date, forecast: histData[histData.length - 1].price },
    ...fcstData,
  ];

  const todayLabel = new Date().toISOString().split('T')[0];
  const allPrices = [
    ...history.map(p => p.price),
    ...forecast.map(p => p.upper),
    ...forecast.map(p => p.lower),
  ];
  const minPrice = Math.min(...allPrices) * 0.95;
  const maxPrice = Math.max(...allPrices) * 1.05;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Historique 90j + Prévision 21j
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Bande de confiance en vert clair
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--accent-blue)' }} />
            Historique
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--accent-green)', borderTop: '1px dashed var(--accent-green)' }} />
            Prévision
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={combined} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <defs>
            <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#5b86ff" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#5b86ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fcstGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2bd9a0" stopOpacity={0.20} />
              <stop offset="95%" stopColor="#2bd9a0" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2bd9a0" stopOpacity={0.10} />
              <stop offset="95%" stopColor="#2bd9a0" stopOpacity={0.03} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-ibm-plex-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => formatDateShort(v)}
            interval={14}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'var(--font-ibm-plex-mono)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${Math.round(v / 10) * 10}€`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Today reference line */}
          <ReferenceLine
            x={todayLabel}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{ value: 'Auj.', fill: 'var(--text-muted)', fontSize: 9, position: 'insideTopRight' }}
          />

          {/* Current price reference */}
          <ReferenceLine
            y={currentPrice}
            stroke="var(--accent-blue)"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />

          {/* Confidence band (upper) */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#confBand)"
            isAnimationActive={true}
            animationDuration={1200}
          />

          {/* History area */}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#5b86ff"
            strokeWidth={2}
            fill="url(#histGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#5b86ff', stroke: 'var(--bg-card)', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1200}
          />

          {/* Forecast area */}
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#2bd9a0"
            strokeWidth={2}
            strokeDasharray="5 3"
            fill="url(#fcstGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#2bd9a0', stroke: 'var(--bg-card)', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1400}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
