'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, Sliders, TrendingDown, Star } from 'lucide-react';
import { mockDestinations } from '@/lib/mock-data';
import { VerdictBadge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import type { Destination } from '@airlytics/types';
import {
  ResponsiveContainer, LineChart, Line, Tooltip,
} from 'recharts';

function SparkLine({ data }: { data: { price: number }[] }) {
  const mini = data.slice(-14);
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={mini}>
        <Line
          type="monotone"
          dataKey="price"
          stroke="var(--accent-blue)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DestCard({ dest, delay = 0 }: { dest: Destination; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="card card-hover overflow-hidden cursor-pointer"
    >
      {/* Top color band */}
      <div
        className="h-1.5"
        style={{
          background: dest.trend === 'BUY' ? 'linear-gradient(90deg, var(--buy), transparent)' :
                      dest.trend === 'RISK' ? 'linear-gradient(90deg, var(--risk), transparent)' :
                      'linear-gradient(90deg, var(--wait), transparent)',
        }}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                {dest.iata}
              </span>
              <VerdictBadge trend={dest.trend} size="sm" showArrow={false} />
            </div>
            <h3 className="font-bold text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {dest.city}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{dest.country}</p>
          </div>
          <span className="text-2xl">{dest.weatherIcon}</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-3">
          <span className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(dest.price)}
          </span>
          <span className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>A/R</span>
        </div>

        {/* Sparkline */}
        <SparkLine data={dest.priceHistory} />

        {/* Footer stats */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Star size={11} style={{ color: 'var(--accent-green)' }} />
            Score Q/P : <strong className="font-mono">{dest.qualityScore}</strong>/100
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span>{dest.weatherIcon}</span>
            {dest.temperature}°C
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1 mt-2.5 flex-wrap">
          {dest.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [budget, setBudget] = useState(600);
  const [region, setRegion] = useState('Tous');
  const [trendFilter, setTrendFilter] = useState<'ALL' | 'BUY' | 'WAIT' | 'RISK'>('ALL');

  const regions = ['Tous', 'Europe', 'Asie', 'Amériques', 'Afrique', 'M-Orient', 'Océanie'];

  const filtered = useMemo(() => {
    return mockDestinations.filter(d => {
      if (d.price > budget) return false;
      if (region !== 'Tous' && d.region !== region) return false;
      if (trendFilter !== 'ALL' && d.trend !== trendFilter) return false;
      return true;
    }).sort((a, b) => b.qualityScore - a.qualityScore);
  }, [budget, region, trendFilter]);

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Globe size={20} style={{ color: 'var(--accent-blue)' }} />
            Explorer les destinations
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {filtered.length} destinations · filtrées par IA · budget ≤ {formatPrice(budget)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-4">
        {/* Budget slider */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <Sliders size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
            Budget max :
          </span>
          <input
            type="range"
            min={50} max={1200} step={50}
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent-blue)' }}
          />
          <span className="text-sm font-bold font-mono w-16 text-right" style={{ color: 'var(--accent-blue)' }}>
            {formatPrice(budget)}
          </span>
        </div>

        {/* Region */}
        <div className="flex gap-1.5 flex-wrap">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-all"
              style={{
                background: region === r ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                color: region === r ? 'var(--accent-blue)' : 'var(--text-secondary)',
                border: `1px solid ${region === r ? 'var(--border-accent)' : 'var(--border)'}`,
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Trend filter */}
        <div className="flex gap-1.5">
          {[
            { key: 'ALL',  label: 'Tous' },
            { key: 'BUY',  label: '↓ Acheter' },
            { key: 'WAIT', label: '→ Attendre' },
            { key: 'RISK', label: '↑ Risque' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTrendFilter(t.key as typeof trendFilter)}
              className="text-[11px] px-2.5 py-1 rounded-full font-medium font-mono transition-all"
              style={{
                background: trendFilter === t.key
                  ? (t.key === 'BUY' ? 'var(--buy-dim)' : t.key === 'RISK' ? 'var(--risk-dim)' : t.key === 'WAIT' ? 'var(--wait-dim)' : 'var(--accent-blue-dim)')
                  : 'var(--bg-base)',
                color: trendFilter === t.key
                  ? (t.key === 'BUY' ? 'var(--buy)' : t.key === 'RISK' ? 'var(--risk)' : t.key === 'WAIT' ? 'var(--wait)' : 'var(--accent-blue)')
                  : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
          <Globe size={32} className="mx-auto mb-3 opacity-40" />
          <p>Aucune destination dans ce budget. Essayez d'augmenter le filtre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((dest, i) => (
            <DestCard key={dest.iata} dest={dest} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  );
}
