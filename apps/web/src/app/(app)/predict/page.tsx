'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SearchForm } from '@/components/predict/SearchForm';
import { VerdictCard } from '@/components/predict/VerdictCard';
import { PriceChart } from '@/components/predict/PriceChart';
import { FeatureImportance } from '@/components/predict/FeatureImportance';
import { BestBuyWindow } from '@/components/predict/BestBuyWindow';
import { TrackPanel } from '@/components/predict/TrackPanel';
import { mockPrediction, generatePrediction } from '@/lib/mock-data';
import type { PredictionResult } from '@airlytics/types';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function PredictContent() {
  const searchParams = useSearchParams();
  const initialOrigin = searchParams.get('from') ?? 'CDG';
  const initialDestination = searchParams.get('to') ?? 'JFK';

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult>(mockPrediction);
  const [analyzed, setAnalyzed] = useState(true);

  const handleSearch = async (params: { origin: string; destination: string; date: string; airline: string }) => {
    setLoading(true);
    setAnalyzed(false);
    await new Promise(r => setTimeout(r, 1400));
    setPrediction(generatePrediction(params));
    setLoading(false);
    setAnalyzed(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Prédiction de prix
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          IA de prédiction — LightGBM + Prophet · Mise à jour toutes les 15 min
        </p>
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
