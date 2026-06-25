'use client';

import { motion } from 'framer-motion';
import type { PredictionResult } from '@airlytics/types';
import { formatPrice, formatDate, addDays } from '@/lib/utils';

interface BestBuyWindowProps {
  prediction: PredictionResult;
}

export function BestBuyWindow({ prediction }: BestBuyWindowProps) {
  const { bestBuyWindow, currentPrice } = prediction;

  // Generate a 14-day view around the window
  const startRef = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(startRef, i);
    const dateStr = date.toISOString().split('T')[0];
    const inWindow = dateStr >= bestBuyWindow.start && dateStr <= bestBuyWindow.end;
    const isStart = dateStr === bestBuyWindow.start;
    const randomMod = 0.92 + Math.sin(i * 1.7) * 0.08;
    const price = inWindow
      ? Math.round(bestBuyWindow.expectedPrice * (0.97 + Math.random() * 0.06))
      : Math.round(currentPrice * randomMod);

    return { date, dateStr, price, inWindow, isStart };
  });

  const saving = currentPrice - bestBuyWindow.expectedPrice;
  const savingPct = ((saving / currentPrice) * 100).toFixed(1);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Meilleure fenêtre d&apos;achat
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {formatDate(bestBuyWindow.start)} → {formatDate(bestBuyWindow.end)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Économie estimée</p>
          <p className="text-lg font-bold font-mono" style={{ color: 'var(--buy)' }}>
            -{formatPrice(saving)}
          </p>
          <p className="text-xs font-mono" style={{ color: 'var(--buy)' }}>-{savingPct}%</p>
        </div>
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => (
          <motion.div
            key={day.dateStr}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col items-center p-2 rounded-md text-center cursor-pointer transition-all"
            style={{
              background: day.inWindow
                ? 'var(--buy-dim)'
                : 'var(--bg-base)',
              border: `1px solid ${day.inWindow ? 'var(--buy-border)' : 'var(--border-subtle)'}`,
              transform: day.isStart ? 'scale(1.05)' : undefined,
            }}
          >
            <span className="text-[9px] uppercase font-semibold mb-1"
                  style={{ color: day.inWindow ? 'var(--buy)' : 'var(--text-muted)' }}>
              {new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(day.date).slice(0,3)}
            </span>
            <span className="text-[10px] font-medium mb-1"
                  style={{ color: day.inWindow ? 'var(--buy)' : 'var(--text-secondary)' }}>
              {day.date.getDate()}
            </span>
            <span
              className="text-[9px] font-mono font-semibold"
              style={{ color: day.inWindow ? 'var(--buy)' : 'var(--text-muted)' }}
            >
              {Math.round(day.price)}€
            </span>
            {day.inWindow && (
              <span className="mt-1 text-[8px]" style={{ color: 'var(--buy)' }}>✓</span>
            )}
          </motion.div>
        ))}
      </div>

      <p className="mt-3 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Zone verte = fenêtre optimale d&apos;achat selon l&apos;IA
      </p>
    </div>
  );
}
