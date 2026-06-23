'use client';

import { motion } from 'framer-motion';
import type { FeatureContribution } from '@airlytics/types';

interface FeatureImportanceProps {
  contributions: FeatureContribution[];
}

export function FeatureImportance({ contributions }: FeatureImportanceProps) {
  const sorted = [...contributions].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const maxVal = Math.max(...sorted.map(c => Math.abs(c.value)));

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          Importance des features
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Facteurs qui ont influencé la prédiction
        </p>
      </div>

      <div className="space-y-3">
        {sorted.map((feat, i) => {
          const pct = (Math.abs(feat.value) / maxVal) * 100;
          const isPositive = feat.impact === 'positive';
          const isNegative = feat.impact === 'negative';
          const barColor = isPositive ? 'var(--buy)' : isNegative ? 'var(--risk)' : 'var(--wait)';

          return (
            <motion.div
              key={feat.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {feat.name}
                </span>
                <span
                  className="text-xs font-mono font-semibold"
                  style={{ color: barColor }}
                >
                  {feat.value > 0 ? '+' : ''}{(feat.value * 100).toFixed(0)}%
                </span>
              </div>

              {/* Bar */}
              <div className="relative h-1.5 rounded-full overflow-hidden"
                   style={{ background: 'var(--bg-base)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: barColor }}
                />
              </div>

              {/* Description on hover */}
              <p className="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 style={{ color: 'var(--text-muted)' }}>
                {feat.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
