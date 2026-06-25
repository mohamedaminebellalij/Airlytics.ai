'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Globe, Sliders, Star, Calendar, Map, LayoutGrid, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockDestinations } from '@/lib/mock-data';
import { VerdictBadge } from '@/components/ui/Badge';
import { AirportInput } from '@/components/ui/AirportInput';
import { formatPrice } from '@/lib/utils';
import type { Destination } from '@airlytics/types';
import type { Airport } from '@/lib/airports';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

// Dynamic import — Leaflet must be client-only (no SSR)
const FlightMap = dynamic(() => import('@/components/explore/FlightMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full rounded-xl"
         style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="text-center space-y-2">
        <Globe size={28} className="mx-auto animate-pulse" style={{ color: 'var(--accent-blue)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement de la carte…</p>
      </div>
    </div>
  ),
});

const REGION_MIN_DAYS: Record<string, number> = {
  'Europe': 2, 'Afrique': 3, 'M-Orient': 4, 'Asie': 7, 'Amériques': 7, 'Océanie': 12,
};

const PERIODS = [
  { key: 'all',     label: 'Flexible',   days: 999, icon: '🌍' },
  { key: 'weekend', label: 'Week-end',   days: 3,   icon: '⚡' },
  { key: '1week',   label: '1 semaine',  days: 7,   icon: '📅' },
  { key: '2weeks',  label: '2 semaines', days: 14,  icon: '🌴' },
  { key: '1month',  label: '1 mois',     days: 30,  icon: '✈️' },
] as const;

type Period = (typeof PERIODS)[number]['key'];
type ViewMode = 'cards' | 'map';

function matchesPeriod(dest: Destination, period: Period): boolean {
  if (period === 'all') return true;
  const minDays = REGION_MIN_DAYS[dest.region] ?? 3;
  const perioDays = PERIODS.find(p => p.key === period)!.days;
  return minDays <= perioDays;
}

function getRecommendedLabel(dest: Destination): string {
  const minDays = REGION_MIN_DAYS[dest.region] ?? 3;
  if (minDays <= 3) return 'Week-end';
  if (minDays <= 7) return '1 semaine';
  if (minDays <= 14) return '2 semaines';
  return '1 mois+';
}

function SparkLine({ data }: { data: { price: number }[] }) {
  const mini = data.slice(-14);
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={mini}>
        <Line type="monotone" dataKey="price" stroke="var(--accent-blue)"
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DestCard({ dest, originIata, delay = 0 }: { dest: Destination; originIata: string; delay?: number }) {
  const router = useRouter();
  const recLabel = getRecommendedLabel(dest);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className="card card-hover overflow-hidden cursor-pointer"
      onClick={() => router.push(`/predict?from=${originIata}&to=${dest.iata}`)}
    >
      <div
        className="h-1.5"
        style={{
          background: dest.trend === 'BUY' ? 'linear-gradient(90deg, var(--buy), transparent)' :
                      dest.trend === 'RISK' ? 'linear-gradient(90deg, var(--risk), transparent)' :
                      'linear-gradient(90deg, var(--wait), transparent)',
        }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                {originIata} → {dest.iata}
              </span>
              <VerdictBadge trend={dest.trend} size="sm" showArrow={false} />
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
                {recLabel}
              </span>
            </div>
            <h3 className="font-bold text-base mt-0.5" style={{ color: 'var(--text-primary)' }}>{dest.city}</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{dest.country}</p>
          </div>
          <span className="text-2xl">{dest.weatherIcon}</span>
        </div>

        <div className="flex items-end gap-2 mb-3">
          <span className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(dest.price)}
          </span>
          <span className="text-xs mb-0.5" style={{ color: 'var(--text-secondary)' }}>A/R</span>
        </div>

        <SparkLine data={dest.priceHistory} />

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

        <div className="flex gap-1 mt-2.5 flex-wrap">
          {dest.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
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
  const [period, setPeriod] = useState<Period>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [originIata, setOriginIata] = useState('CMN');

  const regions = ['Tous', 'Europe', 'Asie', 'Amériques', 'Afrique', 'M-Orient', 'Océanie'];

  const handleOriginChange = useCallback((iata: string, airport?: Airport) => {
    setOriginIata(airport?.iata ?? iata);
  }, []);

  const filtered = useMemo(() => {
    return mockDestinations.filter(d => {
      if (d.iata === originIata) return false;
      if (d.price > budget) return false;
      if (region !== 'Tous' && d.region !== region) return false;
      if (trendFilter !== 'ALL' && d.trend !== trendFilter) return false;
      if (!matchesPeriod(d, period)) return false;
      return true;
    }).sort((a, b) => b.qualityScore - a.qualityScore);
  }, [budget, region, trendFilter, period, originIata]);

  const selectedPeriodInfo = PERIODS.find(p => p.key === period)!;

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
            {period !== 'all' && ` · ${selectedPeriodInfo.label}`}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {[
            { key: 'cards', label: 'Cartes', icon: <LayoutGrid size={13} /> },
            { key: 'map',   label: 'Carte',  icon: <Map size={13} /> },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key as ViewMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: viewMode === v.key ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: viewMode === v.key ? 'white' : 'var(--text-secondary)',
              }}
            >
              {v.icon}
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        {/* Departure + Period */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Departure city */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>
              Depuis :
            </span>
            <div className="w-44">
              <AirportInput value={originIata} onChange={handleOriginChange} />
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              toutes destinations
            </span>
          </div>

          <div className="flex-1 min-w-0" />

          {/* Period filter */}
          <div className="flex items-center gap-2">
            <Calendar size={13} style={{ color: 'var(--accent-blue)' }} />
            <div className="flex gap-1.5 flex-wrap">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className="text-[11px] px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1"
                  style={{
                    background: period === p.key ? 'var(--accent-blue)' : 'var(--bg-base)',
                    color: period === p.key ? 'white' : 'var(--text-secondary)',
                    border: `1px solid ${period === p.key ? 'var(--accent-blue)' : 'var(--border)'}`,
                  }}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4"
             style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          {/* Budget slider */}
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Sliders size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
              Budget max :
            </span>
            <input
              type="range" min={50} max={1200} step={50} value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="flex-1" style={{ accentColor: 'var(--accent-blue)' }}
            />
            <span className="text-sm font-bold font-mono w-16 text-right" style={{ color: 'var(--accent-blue)' }}>
              {formatPrice(budget)}
            </span>
          </div>

          {/* Region */}
          <div className="flex gap-1.5 flex-wrap">
            {regions.map(r => (
              <button key={r} onClick={() => setRegion(r)}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-all"
                      style={{
                        background: region === r ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                        color: region === r ? 'var(--accent-blue)' : 'var(--text-secondary)',
                        border: `1px solid ${region === r ? 'var(--border-accent)' : 'var(--border)'}`,
                      }}>
                {r}
              </button>
            ))}
          </div>

          {/* Trend filter */}
          <div className="flex gap-1.5">
            {[
              { key: 'ALL', label: 'Tous' }, { key: 'BUY', label: '↓ Acheter' },
              { key: 'WAIT', label: '→ Attendre' }, { key: 'RISK', label: '↑ Risque' },
            ].map(t => (
              <button key={t.key} onClick={() => setTrendFilter(t.key as typeof trendFilter)}
                      className="text-[11px] px-2.5 py-1 rounded-full font-medium font-mono transition-all"
                      style={{
                        background: trendFilter === t.key
                          ? (t.key === 'BUY' ? 'var(--buy-dim)' : t.key === 'RISK' ? 'var(--risk-dim)' : t.key === 'WAIT' ? 'var(--wait-dim)' : 'var(--accent-blue-dim)')
                          : 'var(--bg-base)',
                        color: trendFilter === t.key
                          ? (t.key === 'BUY' ? 'var(--buy)' : t.key === 'RISK' ? 'var(--risk)' : t.key === 'WAIT' ? 'var(--wait)' : 'var(--accent-blue)')
                          : 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Period banner */}
      {period !== 'all' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'var(--accent-blue-dim)', border: '1px solid var(--border-accent)' }}
        >
          <span className="text-lg">{selectedPeriodInfo.icon}</span>
          <p style={{ color: 'var(--accent-blue)' }}>
            <strong>{filtered.length} destinations idéales</strong> pour un voyage de{' '}
            <strong>{selectedPeriodInfo.label.toLowerCase()}</strong> depuis{' '}
            <strong>{originIata}</strong>
          </p>
        </motion.div>
      )}

      {/* Map view */}
      {viewMode === 'map' ? (
        <div style={{ height: 560, borderRadius: 12 }}>
          {filtered.length === 0 ? (
            <div className="card p-12 text-center h-full flex flex-col items-center justify-center"
                 style={{ color: 'var(--text-secondary)' }}>
              <Globe size={32} className="mx-auto mb-3 opacity-40" />
              <p>Aucune destination dans ces critères. Ajustez le budget ou la période.</p>
            </div>
          ) : (
            <FlightMap destinations={filtered} originIata={originIata} />
          )}
        </div>
      ) : (
        /* Card grid */
        filtered.length === 0 ? (
          <div className="card p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <Globe size={32} className="mx-auto mb-3 opacity-40" />
            <p>Aucune destination dans ces critères. Ajustez le budget ou la période.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((dest, i) => (
              <DestCard key={dest.iata} dest={dest} originIata={originIata} delay={i * 0.03} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
