'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { SearchForm, type SearchParams } from '@/components/predict/SearchForm';
import { VerdictCard } from '@/components/predict/VerdictCard';
import { PriceChart } from '@/components/predict/PriceChart';
import { FeatureImportance } from '@/components/predict/FeatureImportance';
import { BestBuyWindow } from '@/components/predict/BestBuyWindow';
import { TrackPanel } from '@/components/predict/TrackPanel';
import { AirlineSelector } from '@/components/predict/AirlineSelector';
import { DestinationSuggestions, type DestSuggestion } from '@/components/predict/DestinationSuggestions';
import {
  mockPrediction, generatePrediction, generateAirlinesForRoute, mockDestinations,
  ROUTE_PRICE_RANGES,
  type AirlineOption,
} from '@/lib/mock-data';
import { findAirport } from '@/lib/airports';
import { formatDate } from '@/lib/utils';
import type { PredictionResult } from '@airlytics/types';

// ─── Destination suggestions data ────────────────────────────────────────────

const POPULAR_FROM: Record<string, string[]> = {
  CMN: ['CDG', 'ORY', 'MAD', 'BCN', 'LHR', 'LIS', 'MRS', 'AMS'],
  RAK: ['CDG', 'ORY', 'MAD', 'BCN', 'LGW', 'MRS', 'LYS'],
  RBA: ['CDG', 'ORY', 'MAD', 'BCN', 'MRS', 'LYS', 'NCE'],
  AGA: ['CDG', 'ORY', 'MAD', 'BCN', 'LGW', 'MRS'],
  TNG: ['MAD', 'BCN', 'CDG', 'ORY', 'LIS', 'MRS'],
  FEZ: ['CDG', 'ORY', 'BCN', 'MAD', 'MRS', 'LYS'],
  OUD: ['CDG', 'ORY', 'MAD', 'BCN', 'MRS'],
  CDG: ['JFK', 'DXB', 'BKK', 'BCN', 'MAD', 'LIS', 'CMN', 'RAK', 'AMS', 'FCO', 'ATH'],
  ORY: ['RAK', 'CMN', 'TNG', 'BCN', 'MAD', 'LIS', 'ATH', 'FCO', 'DXB'],
  NCE: ['CDG', 'LHR', 'AMS', 'BCN', 'MAD', 'FCO', 'RAK'],
  MRS: ['CMN', 'RAK', 'TNG', 'MAD', 'BCN', 'CDG', 'LIS'],
  LYS: ['CMN', 'RAK', 'MAD', 'BCN', 'CDG', 'ATH', 'LIS'],
  TLS: ['MAD', 'BCN', 'LIS', 'CDG', 'RAK'],
  MAD: ['CDG', 'LIS', 'LHR', 'AMS', 'JFK', 'BCN', 'FCO', 'CMN'],
  BCN: ['CDG', 'MAD', 'LIS', 'LHR', 'AMS', 'FCO', 'ATH', 'CMN'],
  LHR: ['CDG', 'AMS', 'BCN', 'MAD', 'JFK', 'DXB', 'FCO', 'IST'],
  AMS: ['CDG', 'LHR', 'BCN', 'MAD', 'FCO', 'BKK', 'JFK', 'IST'],
  FRA: ['CDG', 'LHR', 'AMS', 'BCN', 'DXB', 'BKK', 'JFK'],
  MUC: ['CDG', 'LHR', 'AMS', 'BCN', 'DXB', 'BKK'],
  DXB: ['CDG', 'LHR', 'BKK', 'CMB', 'JFK', 'DEL', 'BOM'],
};

const DEST_EMOJI: Record<string, string> = {
  JFK:'🗽', LAX:'🎬', MIA:'🏖️', YYZ:'🍁',
  LHR:'🎡', LGW:'🎡', STN:'🎡', EDI:'🏰',
  CDG:'🗼', ORY:'🗼', NCE:'🌊', MRS:'⚓', LYS:'🍷', TLS:'🌹', BOD:'🍷',
  MAD:'💃', BCN:'🏟️', AGP:'🌅', PMI:'🏖️',
  LIS:'🌉', OPO:'🍷', FAO:'🏖️',
  FRA:'🏦', MUC:'🍺', BER:'🎭', HAM:'⚓',
  AMS:'🌷', BRU:'🍫', GVA:'🏔️', ZRH:'⌚', VIE:'🎼', BUD:'♨️',
  FCO:'🍕', MXP:'👠', VCE:'🚣',
  ATH:'🏛️', PRG:'🍺', WAW:'🦅', ARN:'🌊', CPH:'🧜',
  IST:'🕌', LCA:'🌊',
  DXB:'🏙️', AUH:'🦅', DOH:'⛽', MCT:'🏜️',
  CAI:'🏺', TUN:'🌊', CMN:'🇲🇦', RAK:'🌿', RBA:'🏛️',
  AGA:'🏖️', FEZ:'🕌', TNG:'⚓', OUD:'🌵',
  NBO:'🦁', JNB:'💎', CPT:'🏔️',
  BKK:'🛕', SIN:'🦁', KUL:'🏙️', HKG:'🌃',
  NRT:'⛩️', ICN:'🏯',
  DEL:'🕌', BOM:'🎬',
  SYD:'🦘', MEL:'🏄',
  GRU:'🌴', MEX:'🌮', CUN:'🏖️', SCL:'🍷', EZE:'🥩', BOG:'☕',
};

function getSuggestions(originIata: string, currentDest: string): DestSuggestion[] {
  const upper = originIata.toUpperCase();
  const destList = POPULAR_FROM[upper] ?? ['CDG', 'MAD', 'BCN', 'LIS', 'AMS', 'LHR'];
  const oAp = findAirport(upper);
  const oRegion = oAp?.region ?? 'Europe';

  return destList
    .filter(d => d !== upper && d !== currentDest.toUpperCase())
    .slice(0, 9)
    .map(iata => {
      const airport = findAirport(iata);
      const mockDest = mockDestinations.find(d => d.iata === iata);
      const dRegion = airport?.region ?? 'Europe';
      const key = `${oRegion}_${dRegion}`;
      const [min, max] = ROUTE_PRICE_RANGES[key] ?? [100, 300];
      const seed = (upper + iata).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      const price = mockDest?.price ?? Math.round(min + ((seed * 13 + 7) % (max - min)));
      const trend = (mockDest?.trend ?? (price < (min + max) / 2 ? 'BUY' : 'WAIT')) as 'BUY' | 'WAIT' | 'RISK';
      return {
        iata,
        city: airport?.city ?? iata,
        country: airport?.country ?? '',
        emoji: DEST_EMOJI[iata] ?? (dRegion === 'Asie' ? '🏯' : dRegion === 'Amériques' ? '🌎' : dRegion === 'Afrique' ? '🌍' : '✈️'),
        price,
        trend,
      };
    });
}

// ─── Animation variants ───────────────────────────────────────────────────────

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

// ─── Main content ─────────────────────────────────────────────────────────────

function PredictContent() {
  const searchParams = useSearchParams();
  const initialOrigin = searchParams.get('from') ?? 'CDG';
  const initialDestination = searchParams.get('to') ?? 'JFK';

  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 23);
    return d.toISOString().split('T')[0];
  })();

  // Step: 'browse' = destination suggestions visible
  //       'airlines' = airline cards visible, waiting for selection
  //       'results' = prediction shown
  const [step, setStep] = useState<'browse' | 'airlines' | 'results'>('browse');
  const [currentOrigin, setCurrentOrigin] = useState(initialOrigin);
  const [destinationOverride, setDestinationOverride] = useState<string | undefined>();
  const [pendingParams, setPendingParams] = useState<SearchParams | null>(null);
  const [airlineOptions, setAirlineOptions] = useState<AirlineOption[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult>(mockPrediction);

  const originInfo = findAirport(currentOrigin);
  const originLabel = originInfo?.city ?? currentOrigin;

  const suggestions = useMemo(
    () => getSuggestions(currentOrigin, destinationOverride ?? initialDestination),
    [currentOrigin, destinationOverride, initialDestination],
  );

  const handleSearch = (params: SearchParams) => {
    setPendingParams(params);
    setCurrentOrigin(params.origin);
    setAirlineOptions(generateAirlinesForRoute(params.origin, params.destination));
    setSelectedAirline(null);
    setStep('airlines');
  };

  const handleAirlineSelect = async (airlineName: string) => {
    if (!pendingParams) return;
    setSelectedAirline(airlineName);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setPrediction(generatePrediction({
      origin: pendingParams.origin,
      destination: pendingParams.destination,
      date: pendingParams.date,
      airline: airlineName,
    }));
    setLoading(false);
    setStep('results');
  };

  const handleDestinationSuggestion = (iata: string) => {
    setDestinationOverride(iata);
    setStep('browse');
  };

  const navigateDate = async (delta: number) => {
    if (!pendingParams) return;
    const newDate = addDaysToDate(pendingParams.date, delta);
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) return;
    const updated = { ...pendingParams, date: newDate };
    setPendingParams(updated);
    if (selectedAirline) {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      setPrediction(generatePrediction({ origin: updated.origin, destination: updated.destination, date: newDate, airline: selectedAirline }));
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const isPastDate = (pendingParams?.date ?? defaultDate) <= today;
  const destLabel = findAirport(pendingParams?.destination ?? initialDestination)?.city ?? (pendingParams?.destination ?? initialDestination);

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Prédiction de prix
          </h1>
          {step === 'results' && pendingParams && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>{originLabel}</span>
              {' → '}
              <span className="font-semibold" style={{ color: 'var(--accent-blue)' }}>{destLabel}</span>
              {' · '}{pendingParams.tripType === 'round-trip' ? 'Aller-retour' : 'Aller simple'}
              {' · '}{selectedAirline}
            </p>
          )}
          {step !== 'results' && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              IA de prédiction — LightGBM + Prophet · Mise à jour toutes les 15 min
            </p>
          )}
        </div>

        {/* Date navigation (only in results) */}
        {step === 'results' && pendingParams && (
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
                {formatDate(pendingParams.date, { day: 'numeric', month: 'short', year: 'numeric' })}
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

      {/* Search form */}
      <SearchForm
        initialOrigin={initialOrigin}
        initialDestination={initialDestination}
        destinationOverride={destinationOverride}
        onOriginChange={iata => { setCurrentOrigin(iata); setStep('browse'); }}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Step: browse — destination suggestions */}
      {step === 'browse' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <DestinationSuggestions
            originCity={originLabel}
            suggestions={suggestions}
            onSelect={handleDestinationSuggestion}
          />
        </motion.div>
      )}

      {/* Step: airlines — airline selector */}
      {(step === 'airlines' || step === 'results') && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <AirlineSelector
            airlines={airlineOptions}
            selected={selectedAirline}
            onSelect={handleAirlineSelect}
          />
        </motion.div>
      )}

      {/* Step: results — prediction panels */}
      {step === 'results' && !loading && (
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

      {/* Loading spinner while generating prediction */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: 'var(--accent-blue)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Analyse en cours — {selectedAirline} …
          </p>
        </div>
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
