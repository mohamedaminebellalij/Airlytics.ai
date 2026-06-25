'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { VerdictBadge } from '@/components/ui/Badge';

export interface DestSuggestion {
  iata: string;
  city: string;
  country: string;
  emoji: string;
  price: number;
  trend: 'BUY' | 'WAIT' | 'RISK';
}

interface Props {
  originCity: string;
  suggestions: DestSuggestion[];
  onSelect: (iata: string, city: string) => void;
}

export function DestinationSuggestions({ originCity, suggestions, onSelect }: Props) {
  if (!suggestions.length) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={14} style={{ color: 'var(--accent-blue)' }} />
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Destinations populaires depuis {originCity}
        </span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {suggestions.map((s, i) => (
          <motion.button
            key={s.iata}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(s.iata, s.city)}
            className="shrink-0 p-3 rounded-xl text-left"
            style={{
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              minWidth: 130,
            }}
          >
            <span className="text-2xl block mb-1.5">{s.emoji}</span>
            <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
              {s.city}
            </p>
            <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>
              {s.country}
            </p>
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold text-sm" style={{ color: 'var(--accent-blue)' }}>
                {formatPrice(s.price)}
              </span>
              <VerdictBadge trend={s.trend} size="sm" showArrow={false} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
