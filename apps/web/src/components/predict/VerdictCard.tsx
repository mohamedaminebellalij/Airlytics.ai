'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { PredictionResult } from '@airlytics/types';
import { formatPrice, formatPercent, getTrendColor } from '@/lib/utils';

interface VerdictCardProps {
  prediction: PredictionResult;
}

const verdictConfig = {
  BUY:  { label: 'ACHETER',  icon: '↓', subtitle: 'Baisse de prix prévue',    bgVar: '--buy-dim',  borderVar: '--buy-border',  colorVar: '--buy' },
  WAIT: { label: 'ATTENDRE', icon: '→', subtitle: 'Stabilité observée',       bgVar: '--wait-dim', borderVar: '--wait-border', colorVar: '--wait' },
  RISK: { label: 'RISQUE',   icon: '↑', subtitle: 'Hausse de prix probable',  bgVar: '--risk-dim', borderVar: '--risk-border', colorVar: '--risk' },
};

function ConfidenceRing({ value, trend }: { value: number; trend: string }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);
  const color = getTrendColor(trend as 'BUY' | 'WAIT' | 'RISK');

  return (
    <svg width="136" height="136" viewBox="0 0 136 136" style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx="68" cy="68" r={r} fill="none"
        stroke="var(--border)" strokeWidth="8" />
      {/* Filled arc */}
      <motion.circle
        cx="68" cy="68" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
}

export function VerdictCard({ prediction }: VerdictCardProps) {
  const cfg = verdictConfig[prediction.trend];
  const color = getTrendColor(prediction.trend);

  return (
    <div
      className="card p-6 flex flex-col gap-4"
      style={{
        background: `color-mix(in srgb, var(${cfg.bgVar}) 60%, var(--bg-card))`,
        borderColor: `var(${cfg.borderVar})`,
      }}
    >
      {/* Route header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Prédiction IA — {prediction.airline}
          </p>
          <h2 className="text-2xl font-bold font-mono mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {prediction.route}
          </h2>
        </div>
        <span
          className="text-[10px] font-semibold font-mono px-2 py-1 rounded-full"
          style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
        >
          {prediction.departureDate}
        </span>
      </div>

      {/* Main verdict */}
      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative shrink-0">
          <ConfidenceRing value={prediction.confidence} trend={prediction.trend} />
          <div className="absolute inset-0 flex flex-col items-center justify-center"
               style={{ gap: 2 }}>
            <span className="text-3xl font-bold font-mono" style={{ color }}>
              {prediction.probability}%
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              probabilité
            </span>
          </div>
        </div>

        {/* Verdict text */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <span
              className="text-5xl font-black font-mono leading-none"
              style={{ color }}
            >
              {cfg.icon}
            </span>
            <div>
              <div
                className="text-2xl font-black uppercase tracking-wider"
                style={{ color }}
              >
                {cfg.label}
              </div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {cfg.subtitle}
              </div>
            </div>
          </motion.div>

          {/* Price stats */}
          <div className="flex items-center gap-4 mt-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Prix actuel
              </p>
              <p className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                {formatPrice(prediction.currentPrice)}
              </p>
            </div>
            <div
              className="text-xs font-semibold font-mono px-2.5 py-1 rounded-md"
              style={{
                background: prediction.expectedDelta < 0 ? 'var(--buy-dim)' : 'var(--risk-dim)',
                color: prediction.expectedDelta < 0 ? 'var(--buy)' : 'var(--risk)',
              }}
            >
              {formatPercent(prediction.expectedDelta)} prévu
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Confiance modèle
              </p>
              <p className="text-sm font-bold font-mono" style={{ color: 'var(--text-secondary)' }}>
                {prediction.confidence}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
