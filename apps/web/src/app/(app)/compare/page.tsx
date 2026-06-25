'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Wifi, Luggage, Search, ExternalLink, ShoppingCart, ArrowLeftRight } from 'lucide-react';
import { mockCalendar } from '@/lib/mock-data';
import { VerdictBadge, ProbabilityBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AirportInput } from '@/components/ui/AirportInput';
import { formatPrice, formatDate, formatPercent } from '@/lib/utils';
import type { Airport } from '@/lib/airports';
import type { Flight } from '@airlytics/types';

const AIRLINE_META: Record<string, { color: string; isLowCost: boolean; url: string }> = {
  'Air France':      { color: '#002157', isLowCost: false, url: 'https://www.airfrance.fr' },
  'Delta':           { color: '#003366', isLowCost: false, url: 'https://www.delta.com' },
  'British Airways': { color: '#075aaa', isLowCost: false, url: 'https://www.britishairways.com' },
  'United':          { color: '#00205b', isLowCost: false, url: 'https://www.united.com' },
  'Emirates':        { color: '#c8922a', isLowCost: false, url: 'https://www.emirates.com' },
  'Ryanair':         { color: '#073590', isLowCost: true,  url: 'https://www.ryanair.com' },
  'EasyJet':         { color: '#ff6600', isLowCost: true,  url: 'https://www.easyjet.com' },
  'Transavia':       { color: '#006c35', isLowCost: true,  url: 'https://www.transavia.com' },
  'Vueling':         { color: '#8a6c00', isLowCost: true,  url: 'https://www.vueling.com' },
  'Corsair':         { color: '#e63946', isLowCost: false, url: 'https://www.corsair.fr' },
};

const AIRLINE_CODES: Record<string, string> = {
  'Air France': 'AF', 'Delta': 'DL', 'British Airways': 'BA', 'United': 'UA',
  'Emirates': 'EK', 'Ryanair': 'FR', 'EasyJet': 'U2', 'Transavia': 'TO',
  'Vueling': 'VY', 'Corsair': 'SS',
};

const FLIGHT_PREFIXES: Record<string, string> = {
  'Air France': 'AF', 'Delta': 'DL', 'British Airways': 'BA', 'United': 'UA',
  'Emirates': 'EK', 'Ryanair': 'FR', 'EasyJet': 'EZY', 'Transavia': 'HV',
  'Vueling': 'VY', 'Corsair': 'SS',
};

function generateFlights(dayOffset: number, origin: string, destination: string, cabinClass: string): Flight[] {
  const seed = dayOffset * 31 + origin.charCodeAt(0) * 7 + destination.charCodeAt(0) * 13;
  const basePrice = 180 + (seed % 500);
  const cabinMultiplier = cabinClass === 'business' ? 3.2 : cabinClass === 'first' ? 5.8 : cabinClass === 'premium' ? 1.8 : 1.0;

  const allAirlines = Object.keys(AIRLINE_META);
  const shuffled = [...allAirlines].sort((a, b) => ((seed * a.charCodeAt(0)) % 17) - ((seed * b.charCodeAt(0)) % 17));
  const count = 5 + (seed % 4);
  const chosen = shuffled.slice(0, count);

  return chosen.map((airline, i) => {
    const meta = AIRLINE_META[airline];
    const lcMult = meta.isLowCost ? 0.62 : 1.0;
    const price = Math.round(basePrice * lcMult * cabinMultiplier * (0.88 + i * 0.06));
    const depHour = 6 + ((seed + i * 3) % 16);
    const durationH = 2 + (seed + i) % 8;
    const durationM = (seed * (i + 1) * 7) % 60;
    const arrHour = (depHour + durationH) % 24;
    const stops = meta.isLowCost && (seed + i) % 3 === 0 ? 1 : 0;
    const trend = (['BUY', 'WAIT', 'RISK'] as const)[(seed + i * 3) % 3];
    const probability = 52 + ((seed + i * 11) % 42);

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 21 + dayOffset);
    const dateStr = baseDate.toISOString().split('T')[0];
    const arrDay = arrHour < depHour ? (() => { const d = new Date(baseDate); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : dateStr;

    return {
      id: `d${dayOffset}-${i}`,
      airline,
      airlineCode: AIRLINE_CODES[airline] ?? airline.slice(0, 2),
      flightNumber: `${FLIGHT_PREFIXES[airline] ?? ''} ${100 + ((seed + i * 37) % 900)}`,
      origin, destination,
      departure: `${dateStr}T${depHour.toString().padStart(2, '0')}:${(durationM % 60).toString().padStart(2, '0')}:00`,
      arrival:   `${arrDay}T${arrHour.toString().padStart(2, '0')}:00:00`,
      duration: `${durationH}h${durationM.toString().padStart(2, '0')}`,
      stops, price, currency: 'EUR' as const,
      trend, probability,
      expectedDelta: trend === 'BUY' ? -(3 + (seed % 18)) : trend === 'RISK' ? 5 + (seed % 12) : (seed % 7),
      cabinClass: (cabinClass === 'premium' ? 'premium_eco' : cabinClass) as 'economy' | 'business' | 'first',
      seatsLeft: meta.isLowCost ? 2 + (seed % 6) : i === 0 ? 4 : undefined,
    };
  });
}

function getPlatformPrices(basePrice: number, seed: number) {
  const j = (n: number) => Math.round(basePrice * (1 + (((seed * n * 7919) % 19) - 9) / 100));
  return [
    { name: 'Google Flights', url: 'https://www.google.com/travel/flights', price: basePrice,  logo: '✈' },
    { name: 'Skyscanner',     url: 'https://www.skyscanner.fr',             price: j(3),        logo: '🔭' },
    { name: 'Kayak',          url: 'https://www.kayak.fr',                  price: j(5),        logo: '🛶' },
    { name: 'Expedia',        url: 'https://www.expedia.fr',                price: j(7),        logo: '📦' },
    { name: 'Kiwi',           url: 'https://www.kiwi.com',                  price: j(11),       logo: '🥝' },
  ].sort((a, b) => a.price - b.price);
}

function MultiPlatformComparison({ flight }: { flight: Flight }) {
  const seed = flight.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const platforms = getPlatformPrices(flight.price, seed);
  const best = platforms[0];
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
        Comparaison multi-plateformes
      </p>
      {platforms.map(p => {
        const isBest = p.name === best.name;
        return (
          <div key={p.name} className="flex items-center gap-2.5 px-3 py-1.5 rounded-md"
               style={{ background: isBest ? 'var(--buy-dim)' : 'var(--bg-base)', border: `1px solid ${isBest ? 'var(--buy-border)' : 'var(--border-subtle)'}` }}>
            <span className="text-sm">{p.logo}</span>
            <span className="text-xs flex-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
              {p.name}
              {isBest && <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: 'var(--buy)', color: 'white' }}>BEST</span>}
            </span>
            <span className="font-mono font-bold text-sm" style={{ color: isBest ? 'var(--buy)' : 'var(--text-primary)' }}>{formatPrice(p.price)}</span>
            <button onClick={() => window.open(`${p.url}/search?q=vols+${flight.origin}+${flight.destination}`, '_blank')}
                    className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: isBest ? 'var(--buy)' : 'var(--bg-card)', color: isBest ? 'white' : 'var(--text-muted)' }}>
              Voir
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FlightCard({ flight, rank }: { flight: Flight; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const isBest = rank === 0;
  const meta = AIRLINE_META[flight.airline];
  const isLowCost = meta?.isLowCost;

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = meta?.url ?? `https://www.google.com/travel/flights/search?q=vols+${flight.origin}+${flight.destination}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.06 }}
      className="card p-4"
      style={{ borderColor: isBest ? 'var(--buy-border)' : undefined }}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 font-mono"
             style={{ background: meta?.color ?? 'var(--bg-hover)' }}>
          {flight.airlineCode}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-semibold text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{flight.flightNumber}</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{flight.airline}</span>
            {isBest && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'var(--buy-dim)', color: 'var(--buy)' }}>★ BEST IA</span>}
            {isLowCost && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>LOW COST</span>}
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-mono">
              {new Date(flight.departure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {' → '}
              {new Date(flight.arrival).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1"><Clock size={10} /> {flight.duration}</span>
            <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} escale`}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{formatPrice(flight.price)}</span>
          <ProbabilityBadge value={flight.probability} trend={flight.trend} />
          {flight.seatsLeft && flight.seatsLeft < 6 && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--risk)' }}>{flight.seatsLeft} places</span>
          )}
        </div>

        <Button variant="success" size="sm" onClick={handleBuy} icon={<ShoppingCart size={12} />}>
          Acheter
        </Button>
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Prédiction IA</p>
              <VerdictBadge trend={flight.trend} />
              <p className="text-xs mt-1 font-mono" style={{ color: flight.expectedDelta < 0 ? 'var(--buy)' : 'var(--risk)' }}>
                {formatPercent(flight.expectedDelta)} attendu
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Services</p>
              <div className="flex gap-2">
                {!isLowCost && <Wifi size={14} style={{ color: 'var(--text-secondary)' }} />}
                <Luggage size={14} style={{ color: 'var(--text-secondary)' }} />
              </div>
              {isLowCost && <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Bagages payants</p>}
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Classe</p>
              <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{flight.cabinClass}</p>
            </div>
          </div>

          <button onClick={() => setShowComparison(!showComparison)}
                  className="text-xs flex items-center gap-1.5 font-medium" style={{ color: 'var(--accent-blue)' }}>
            <ExternalLink size={11} />
            {showComparison ? 'Masquer la comparaison' : 'Comparer sur toutes les plateformes'}
          </button>

          {showComparison && <MultiPlatformComparison flight={flight} />}
        </motion.div>
      )}
    </motion.div>
  );
}

const CABIN_CLASSES = [
  { value: 'economy',  label: 'Économique' },
  { value: 'premium',  label: 'Premium Éco' },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: '1re classe' },
] as const;

export default function ComparePage() {
  const [sortBy, setSortBy] = useState<'price' | 'smart' | 'time'>('smart');
  const [selectedDay, setSelectedDay] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [origin, setOrigin] = useState('CDG');
  const [destination, setDestination] = useState('JFK');
  const [cabinClass, setCabinClass] = useState<'economy' | 'premium' | 'business' | 'first'>('economy');

  const flights = useMemo(
    () => generateFlights(selectedDay, origin, destination, cabinClass),
    [selectedDay, origin, destination, cabinClass]
  );

  const sorted = useMemo(() => {
    let list = [...flights];
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
  }, [flights, sortBy, searchQuery]);

  return (
    <div className="max-w-[900px] mx-auto p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Comparer les vols</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-mono font-semibold" style={{ color: 'var(--accent-blue)' }}>{origin}</span>
          {' → '}
          <span className="font-mono font-semibold" style={{ color: 'var(--accent-blue)' }}>{destination}</span>
          {' · '}
          {formatDate(mockCalendar[selectedDay]?.date ?? new Date().toISOString(), { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Search bar */}
      <Card className="p-4">
        <div className="flex items-start gap-3 flex-wrap">
          {/* Route */}
          <div className="flex items-end gap-2">
            <div className="w-32">
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Départ</p>
              <AirportInput value={origin} onChange={(iata: string, a?: Airport) => setOrigin(a?.iata ?? iata)} />
            </div>
            <button
              onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }}
              className="mb-1 w-8 h-8 flex items-center justify-center rounded-md shrink-0"
              style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
            >
              <ArrowLeftRight size={13} />
            </button>
            <div className="w-32">
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Arrivée</p>
              <AirportInput value={destination} onChange={(iata: string, a?: Airport) => setDestination(a?.iata ?? iata)} />
            </div>
          </div>

          {/* Cabin class */}
          <div className="flex-1 min-w-[140px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Classe</p>
            <div className="flex gap-1.5 flex-wrap">
              {CABIN_CLASSES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCabinClass(c.value)}
                  className="text-[11px] px-2.5 py-1 rounded-full font-medium transition-all"
                  style={{
                    background: cabinClass === c.value ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                    color: cabinClass === c.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    border: `1px solid ${cabinClass === c.value ? 'var(--border-accent)' : 'var(--border)'}`,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyword filter */}
          <div className="flex-1 min-w-[180px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Filtrer</p>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                 style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Compagnie, vol…"
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
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
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center p-2.5 rounded-md cursor-pointer transition-all"
              onClick={() => setSelectedDay(i)}
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
              {day.isLowest && <span className="text-[9px] mt-0.5 font-semibold" style={{ color: 'var(--buy)' }}>★ Min</span>}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-secondary)' }}>Trier par :</span>
        {[{ key: 'smart', label: '★ Le plus malin' }, { key: 'price', label: 'Prix ↑' }, { key: 'time', label: 'Heure' }].map(opt => (
          <button key={opt.key} onClick={() => setSortBy(opt.key as typeof sortBy)}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-all"
                  style={{ background: sortBy === opt.key ? 'var(--accent-blue-dim)' : 'var(--bg-card)', color: sortBy === opt.key ? 'var(--accent-blue)' : 'var(--text-secondary)', border: `1px solid ${sortBy === opt.key ? 'var(--border-accent)' : 'var(--border)'}` }}>
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{sorted.length} vols</span>
      </div>

      {/* Flight list */}
      <div className="space-y-2.5">
        {sorted.length === 0 ? (
          <div className="card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            Aucun vol — essayez un autre filtre
          </div>
        ) : sorted.map((flight, i) => <FlightCard key={flight.id} flight={flight} rank={i} />)}
      </div>
    </div>
  );
}
