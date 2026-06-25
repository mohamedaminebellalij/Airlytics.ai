'use client';

import { motion } from 'framer-motion';
import { Check, Plane } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { VerdictBadge } from '@/components/ui/Badge';
import type { AirlineOption } from '@/lib/mock-data';

interface Props {
  airlines: AirlineOption[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export function AirlineSelector({ airlines, selected, onSelect }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Plane size={14} style={{ color: 'var(--accent-blue)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Compagnies disponibles
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          — cliquez pour analyser
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {airlines.map((a, i) => {
          const sel = selected === a.name;
          return (
            <motion.button
              key={a.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(a.name)}
              className="relative p-3 rounded-xl text-left"
              style={{
                background: sel ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                border: `1px solid ${sel ? 'var(--border-accent)' : 'var(--border)'}`,
              }}
            >
              {sel && (
                <div
                  className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent-blue)' }}
                >
                  <Check size={9} color="white" strokeWidth={3} />
                </div>
              )}

              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: 'var(--bg-card)', color: 'var(--accent-blue)' }}
                >
                  {a.code}
                </span>
                {a.isLowCost && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}
                  >
                    Low-cost
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold mb-1.5 truncate pr-4" style={{ color: 'var(--text-primary)' }}>
                {a.name}
              </p>

              <p className="text-lg font-bold font-mono leading-none" style={{ color: sel ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                {formatPrice(a.price)}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {a.stops === 0 ? 'Direct' : `${a.stops} escale`} · {a.duration}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Départ {a.departure}
              </p>

              <div className="flex items-center justify-between mt-2">
                <VerdictBadge trend={a.trend} size="sm" showArrow={false} />
                {a.seatsLeft != null && (
                  <span className="text-[9px] font-medium" style={{ color: 'var(--risk)' }}>
                    {a.seatsLeft} places
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
