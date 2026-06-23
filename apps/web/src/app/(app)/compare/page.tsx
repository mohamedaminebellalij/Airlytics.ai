'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Wifi, Luggage } from 'lucide-react';
import { mockFlights, mockCalendar } from '@/lib/mock-data';
import { VerdictBadge, ProbabilityBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatPrice, formatDate, formatPercent } from '@/lib/utils';
import type { Flight } from '@airlytics/types';

const airlineColors: Record<string, string> = {
  'Air France': '#002157',
  'Delta': '#003366',
  'British Airways': '#075aaa',
  'United': '#00205b',
  'Corsair': '#e63946',
};

function FlightCard({ flight, rank }: { flight: Flight; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const isBest = rank === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.07 }}
      className="card card-hover p-4 cursor-pointer"
      style={{ borderColor: isBest ? 'var(--buy-border)' : undefined }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-4">
        {/* Airline badge */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 font-mono"
          style={{ background: airlineColors[flight.airline] ?? 'var(--bg-hover)' }}
        >
          {flight.airlineCode}
        </div>

        {/* Flight info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
              {flight.flightNumber}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{flight.airline}</span>
            {isBest && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: 'var(--buy-dim)', color: 'var(--buy)' }}>
                ★ MEILLEUR CHOIX IA
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-mono">
              {new Date(flight.departure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {' → '}
              {new Date(flight.arrival).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {flight.duration}
            </span>
            <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} escale`}</span>
          </div>
        </div>

        {/* Price + prediction */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
            {formatPrice(flight.price)}
          </span>
          <ProbabilityBadge value={flight.probability} trend={flight.trend} />
          {flight.seatsLeft && flight.seatsLeft < 6 && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--risk)' }}>
              {flight.seatsLeft} places restantes
            </span>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 grid grid-cols-3 gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Prédiction IA</p>
            <VerdictBadge trend={flight.trend} />
            <p className="text-xs mt-1 font-mono" style={{ color: flight.expectedDelta < 0 ? 'var(--buy)' : 'var(--risk)' }}>
              {formatPercent(flight.expectedDelta)} attendu
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Équipements</p>
            <div className="flex gap-2">
              <Wifi size={14} style={{ color: 'var(--text-secondary)' }} />
              <Luggage size={14} style={{ color: 'var(--text-secondary)' }} />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Classe</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{flight.cabinClass}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ComparePage() {
  const [sortBy, setSortBy] = useState<'price' | 'smart' | 'time'>('smart');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const sorted = [...mockFlights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'smart') return b.probability - a.probability;
    return new Date(a.departure).getTime() - new Date(b.departure).getTime();
  });

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Comparer les vols</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          CDG → JFK · {selectedDay !== null ? formatDate(mockCalendar[selectedDay].date) : '16 juillet 2026'}
        </p>
      </div>

      {/* Price calendar */}
      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
          Calendrier des prix — 7 jours
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {mockCalendar.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center p-2.5 rounded-md cursor-pointer transition-all"
              onClick={() => setSelectedDay(selectedDay === i ? null : i)}
              style={{
                background: selectedDay === i ? 'var(--accent-blue-dim)' : day.isLowest ? 'var(--buy-dim)' : 'var(--bg-base)',
                border: `1px solid ${selectedDay === i ? 'var(--border-accent)' : day.isLowest ? 'var(--buy-border)' : 'var(--border-subtle)'}`,
              }}
            >
              <span className="text-[10px] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                {formatDate(day.date, { weekday: 'short' })}
              </span>
              <span className="text-xs font-mono font-bold mt-1"
                    style={{ color: day.isLowest ? 'var(--buy)' : 'var(--text-primary)' }}>
                {formatPrice(day.price)}
              </span>
              {day.isLowest && (
                <span className="text-[9px] mt-0.5 font-semibold" style={{ color: 'var(--buy)' }}>★ Min</span>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-secondary)' }}>Trier par :</span>
        {[
          { key: 'smart', label: '★ Le plus malin' },
          { key: 'price', label: 'Prix croissant' },
          { key: 'time',  label: 'Heure départ' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key as typeof sortBy)}
            className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
            style={{
              background: sortBy === opt.key ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
              color: sortBy === opt.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: `1px solid ${sortBy === opt.key ? 'var(--border-accent)' : 'var(--border)'}`,
            }}
          >
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
          {sorted.length} vols trouvés
        </span>
      </div>

      {/* Flight list */}
      <div className="space-y-2.5">
        {sorted.map((flight, i) => (
          <FlightCard key={flight.id} flight={flight} rank={i} />
        ))}
      </div>
    </div>
  );
}
