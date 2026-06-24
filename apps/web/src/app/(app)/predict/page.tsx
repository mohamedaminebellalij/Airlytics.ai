'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { SearchForm, type SearchParams } from '@/components/predict/SearchForm';
import { VerdictCard } from '@/components/predict/VerdictCard';
import { PriceChart } from '@/components/predict/PriceChart';
import { FeatureImportance } from '@/components/predict/FeatureImportance';
import { BestBuyWindow } from '@/components/predict/BestBuyWindow';
import { TrackPanel } from '@/components/predict/TrackPanel';
import { mockPrediction, generatePrediction } from '@/lib/mock-data';
import { findAirport } from '@/lib/airports';
import { formatDate } from '@/lib/utils';
import type { PredictionResult } from '@airlytics/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function PredictContent() {
  const searchParams = useSearchParams();
  const initialOrigin = searchParams.get('from') ?? 'CDG';
  const initialDestination = searchParams.get('to') ?? 'JFK';

  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 23);
    return d.toISOString().split('T')[0];
  })();

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult>(mockPrediction);
  const [analyzed, setAnalyzed] = useState(true);
  const [lastParams, setLastParams] = useState<SearchParams>({
    origin: initialOrigin,
    destination: initialDestination,
    date: defaultDate,
    airline: 'Air France',
    tripType: 'one-way',
    departureTime: '',
    cabinClass: 'economy',
  });

  const originInfo = findAirport(lastParams.origin);
  const destInfo = findAirport(lastParams.destination);
  const originLabel = originInfo?.city ?? lastParams.origin;
  const destLabel = destInfo?.city ?? lastParams.destination;

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setAnalyzed(false);
    setLastParams(params);
    await new Promise(r => setTimeout(r, 1400));
    setPrediction(generatePrediction({ origin: params.origin, destination: params.destination, date: params.date, airline: params.airline }));
    setLoading(false);
    setAnalyzed(true);
  };

  const navigateDate = async (delta: number) => {
    const newDate = addDaysToDate(lastParams.date, delta);
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) return;
    await handleSearch({ ...lastParams, date: newDate });
  };

  const today = new Date().toISOString().split('T')[0];
  const isPastDate = lastParams.date <= today;

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Prédiction de prix
          </h1>
          {analyzed && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>{originLabel}</span>
              {' → '}
              <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>{destLabel}</span>
              {' · '}
              {lastParams.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
              {' · '}
              {lastParams.cabinClass === 'economy' ? 'Économique' : lastParams.cabinClass === 'business' ? 'Business' : lastParams.cabinClass === 'first' ? '1re classe' : 'Premium Éco'}
            </p>
          )}
          {!analyzed && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              IA de prédiction — LightGBM + Prophet · Mise à jour toutes les 15 min
            </p>
          )}
        </div>

        {/* Date navigation */}
        {analyzed && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 p-1.5 rounded-xl shrink-0"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <button
              onClick={() => navigateDate(-1)}
              disabled={loading || isPastDate}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => !isPastDate && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-2">
              <CalendarDays size={12} style={{ color: 'var(--accent-blue)' }} />
              <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatDate(lastParams.date, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <button
              onClick={() => navigateDate(1)}
              disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>

      <SearchForm
        initialOrigin={initialOrigin}
        initialDestination={initialDestination}
        onSearch={handleSearch}
        loading={loading}
      />

      {analyzed && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-12 gap-5"
        >
          <motion.div variants={item} className="col-span-12">
            <VerdictCard prediction={prediction} />
          </motion.div>

          <motion.div variants={item} className="col-span-12 lg:col-span-8">
            <PriceChart
              history={prediction.priceHistory}
              forecast={prediction.priceForecast}
              currentPrice={prediction.currentPrice}
            />
          </motion.div>

          <motion.div variants={item} className="col-span-12 lg:col-span-4">
            <FeatureImportance contributions={prediction.featureContributions} />
          </motion.div>

          <motion.div variants={item} className="col-span-12 lg:col-span-8">
            <BestBuyWindow prediction={prediction} />
          </motion.div>

          <motion.div variants={item} className="col-span-12 lg:col-span-4">
            <TrackPanel prediction={prediction} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function PredictPage() {
  return (
    <Suspense fallback={null}>
      <PredictContent />
    </Suspense>
  );
}
