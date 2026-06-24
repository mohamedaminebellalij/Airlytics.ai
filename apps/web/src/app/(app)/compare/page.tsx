'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Wifi, Luggage, Search, ExternalLink, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { mockFlights, mockCalendar } from '@/lib/mock-data';
import { VerdictBadge, ProbabilityBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDate, formatPercent } from '@/lib/utils';
import type { Flight } from '@airlytics/types';

const airlineColors: Record<string, string> = {
  'Air France': '#002157',
  'Delta': '#003366',
  'British Airways': '#075aaa',
  'United': '#00205b',
  'Corsair': '#e63946',
};

const bookingUrls: Record<string, string> = {
  'Air France':      'https://www.airfrance.fr',
  'Delta':           'https://www.delta.com',
  'British Airways': 'https://www.britishairways.com',
  'United':          'https://www.united.com',
  'Corsair':         'https://www.corsair.fr',
};

function getPlatformPrices(basePrice: number, seed: number) {
  const jitter = (n: number) => Math.round(basePrice * (1 + (((seed * n * 7919) % 17) - 8) / 100));
  return [
    { name: 'Google Flights', url: 'https://www.google.com/travel/flights', price: basePrice, logo: '✈' },
    { name: 'Skyscanner',     url: 'https://www.skyscanner.fr',             price: jitter(3), logo: '🔭' },
    { name: 'Kayak',          url: 'https://www.kayak.fr',                  price: jitter(5), logo: '🛶' },
    { name: 'Expedia',        url: 'https://www.expedia.fr',                price: jitter(7), logo: '📦' },
    { name: 'Kiwi',           url: 'https://www.kiwi.com',                  price: jitter(11), logo: '🥝' },
  ];
}

function MultiPlatformComparison({ flight }: { flight: Flight }) {
  const seed = flight.id.charCodeAt(flight.id.length - 1);
  const platforms = getPlatformPrices(flight.price, seed).sort((a, b) => a.price - b.price);
  const best = platforms[0];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 pt-4"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
        Comparaison multi-plateformes
      </p>
      <div className="space-y-2">
        {platforms.map(p => {
          const isBest = p.name === best.name;
          return (
            <div
              key={p.name}
              className="flex items-center gap-3 px-3 py-2 rounded-md"
              style={{
                background: isBest ? 'var(--buy-dim)' : 'var(--bg-base)',
                border: `1px solid ${isBest ? 'var(--buy-border)' : 'var(--border-subtle)'}`,
              }}
            >
              <span className="text-base">{p.logo}</span>
              <span className="text-xs flex-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                {p.name}
                {isBest && (
                  <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'var(--buy)', color: 'white' }}>
                    MEILLEUR PRIX
                  </span>
                )}
              </span>
              <span className="font-mono font-bold text-sm" style={{ color: isBest ? 'var(--buy)' : 'var(--text-primary)' }}>
                {formatPrice(p.price)}
              </span>
              <button
                onClick={() => window.open(`${p.url}/search?q=vols+${flight.origin}+${flight.destination}`, '_blank')}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-all"
                style={{
                  background: isBest ? 'var(--buy)' : 'var(--bg-card)',
                  color: isBest ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${isBest ? 'transparent' : 'var(--border)'}`,
                }}
              >
                Voir <ExternalLink size={9} />
              </button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function FlightCard({ flight, rank }: { flight: Flight; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const isBest = rank === 0;

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = bookingUrls[flight.airline] ?? `https://www.google.com/travel/flights/search?q=vols+${flight.origin}+${flight.destination}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.07 }}
      className="card p-4"
      style={{ borderColor: isBest ? 'var(--buy-border)' : undefined }}
    >
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
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

        {/* Buy button */}
        <Button
          variant="success"
          size="sm"
          onClick={handleBuy}
          icon={<ShoppingCart size={12} />}
        >
          Acheter
        </Button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-3 gap-4 mb-4">
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
          </div>

          {/* Toggle comparison */}
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs flex items-center gap-1.5 font-medium transition-all"
            style={{ color: 'var(--accent-blue)' }}
          >
            <ExternalLink size={11} />
            {showComparison ? 'Masquer' : 'Comparer les prix sur toutes les plateformes'}
          </button>

          {showComparison && <MultiPlatformComparison flight={flight} />}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ComparePage() {
  const [sortBy, setSortBy] = useState<'price' | 'smart' | 'time'>('smart');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [origin, setOrigin] = useState('CDG');
  const [destination, setDestination] = useState('JFK');

  const sorted = useMemo(() => {
    let list = [...mockFlights];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f =>
        f.airline.toLowerCase().includes(q) ||
        f.flightNumber.toLowerCase().includes(q) ||
        f.airlineCode.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'smart') return list.sort((a, b) => b.probability - a.probability);
    return list.sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime());
  }, [sortBy, searchQuery]);

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Comparer les vols</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {origin} → {destination} · {selectedDay !== null ? formatDate(mockCalendar[selectedDay].date) : '16 juillet 2026'}
        </p>
      </div>

      {/* Flight search bar */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md"
               style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              value={`${origin}`}
              onChange={e => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="CDG"
              className="w-16 bg-transparent text-sm font-mono font-bold outline-none text-center"
              style={{ color: 'var(--text-primary)' }}
              maxLength={3}
            />
            <button
              onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }}
              className="p-1 rounded transition-all"
              style={{ color: 'var(--accent-blue)' }}
            >
              <ArrowLeftRight size={14} />
            </button>
            <input
              value={`${destination}`}
              onChange={e => setDestination(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="JFK"
              className="w-16 bg-transparent text-sm font-mono font-bold outline-none text-center"
              style={{ color: 'var(--text-primary)' }}
              maxLength={3}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-md"
               style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filtrer par compagnie, numéro de vol…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </Card>

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
                    style={{ color: day.isLowest ? 'var(--buy)' : selectedDay === i ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
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
        {sorted.length === 0 ? (
          <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            Aucun vol correspondant — essayez un autre filtre
          </div>
        ) : (
          sorted.map((flight, i) => (
            <FlightCard key={flight.id} flight={flight} rank={i} />
          ))
        )}
      </div>
    </div>
  );
}
