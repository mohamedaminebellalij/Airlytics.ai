'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SearchForm } from '@/components/predict/SearchForm';
import { VerdictCard } from '@/components/predict/VerdictCard';
import { PriceChart } from '@/components/predict/PriceChart';
import { FeatureImportance } from '@/components/predict/FeatureImportance';
import { BestBuyWindow } from '@/components/predict/BestBuyWindow';
import { TrackPanel } from '@/components/predict/TrackPanel';
import { mockPrediction } from '@/lib/mock-data';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const prediction = mockPrediction;
  const [analyzed, setAnalyzed] = useState(true);

  const handleSearch = async () => {
    setLoading(true);
    setAnalyzed(false);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setAnalyzed(true);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Prédiction de prix
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          IA de prédiction — LightGBM + Prophet · Mise à jour toutes les 15 min
        </p>
      </div>

      {/* Search form */}
      <SearchForm onSearch={handleSearch} loading={loading} />

      {/* Results */}
      {analyzed && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-12 gap-5"
        >
          {/* Verdict card — full width */}
          <motion.div variants={item} className="col-span-12">
            <VerdictCard prediction={prediction} />
          </motion.div>

          {/* Price chart — 8 cols */}
          <motion.div variants={item} className="col-span-12 lg:col-span-8">
            <PriceChart
              history={prediction.priceHistory}
              forecast={prediction.priceForecast}
              currentPrice={prediction.currentPrice}
            />
          </motion.div>

          {/* Feature importance — 4 cols */}
          <motion.div variants={item} className="col-span-12 lg:col-span-4">
            <FeatureImportance contributions={prediction.featureContributions} />
          </motion.div>

          {/* Best buy window — 8 cols */}
          <motion.div variants={item} className="col-span-12 lg:col-span-8">
            <BestBuyWindow prediction={prediction} />
          </motion.div>

          {/* Track panel — 4 cols */}
          <motion.div variants={item} className="col-span-12 lg:col-span-4">
            <TrackPanel prediction={prediction} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
