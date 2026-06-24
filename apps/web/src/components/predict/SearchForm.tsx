'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Clock, Luggage, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AirportInput } from '@/components/ui/AirportInput';
import type { Airport } from '@/lib/airports';

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  airline: string;
  tripType: 'one-way' | 'round-trip';
  departureTime: string;
  cabinClass: 'economy' | 'business' | 'first' | 'premium';
  originCity?: string;
  destinationCity?: string;
}

interface SearchFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  onSearch?: (params: SearchParams) => void;
  loading?: boolean;
}

const airlines = ['Toutes compagnies', 'Air France', 'Delta', 'British Airways', 'Emirates', 'Lufthansa', 'Ryanair', 'EasyJet', 'Transavia', 'Vueling'];
const cabinClasses = [
  { value: 'economy',  label: 'Économique' },
  { value: 'premium',  label: 'Premium Éco' },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: '1re classe' },
];
const timeSlots = [
  { value: '', label: 'Toute heure' },
  { value: '00:00-06:00', label: '00h – 06h (Nuit)' },
  { value: '06:00-12:00', label: '06h – 12h (Matin)' },
  { value: '12:00-18:00', label: '12h – 18h (Après-midi)' },
  { value: '18:00-24:00', label: '18h – 00h (Soir)' },
];

const selectStyle: React.CSSProperties = {
  background: 'var(--bg-base)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 13,
  padding: '9px 10px',
  width: '100%',
  outline: 'none',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--text-muted)',
  marginBottom: 5,
  display: 'block',
};

function DateInput({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1 min-w-[140px]">
      <label style={labelStyle}>{label}</label>
      <div
        className="relative cursor-pointer"
        onClick={() => ref.current?.showPicker?.()}
        style={{ ...selectStyle, padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <input
          ref={ref}
          type="date"
          value={value}
          min={min}
          onChange={e => onChange(e.target.value)}
          style={{
            ...selectStyle,
            border: 'none',
            background: 'transparent',
            flex: 1,
            paddingRight: 34,
            colorScheme: 'dark',
            cursor: 'pointer',
          }}
          onClick={e => e.stopPropagation()}
        />
        <CalendarDays
          size={14}
          className="absolute right-2 pointer-events-none"
          style={{ color: 'var(--accent-blue)' }}
        />
      </div>
    </div>
  );
}

export function SearchForm({ initialOrigin = 'CDG', initialDestination = 'JFK', onSearch, loading }: SearchFormProps) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [originCity, setOriginCity] = useState<string | undefined>();
  const [destinationCity, setDestinationCity] = useState<string | undefined>();
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 23);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [airline, setAirline] = useState('Toutes compagnies');
  const [departureTime, setDepartureTime] = useState('');
  const [cabinClass, setCabinClass] = useState<'economy' | 'business' | 'first' | 'premium'>('economy');

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginCity(destinationCity);
    setDestinationCity(originCity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ origin, destination, date, returnDate: tripType === 'round-trip' ? returnDate : undefined, airline, tripType, departureTime, cabinClass, originCity, destinationCity });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      {/* Trip type toggle */}
      <div className="flex gap-2">
        {([
          { key: 'one-way', label: '→ Aller simple' },
          { key: 'round-trip', label: '⇄ Aller-retour' },
        ] as const).map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTripType(t.key)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={{
              background: tripType === t.key ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
              color: tripType === t.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: `1px solid ${tripType === t.key ? 'var(--border-accent)' : 'var(--border)'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Row 1: Origin ↔ Dest + Dates */}
      <div className="flex items-start gap-3 flex-wrap">
        {/* Origin */}
        <div className="flex-1 min-w-[120px]">
          <label style={labelStyle}>Départ</label>
          <AirportInput
            value={origin}
            onChange={(iata, a?: Airport) => { setOrigin(iata); setOriginCity(a?.city); }}
            placeholder="CDG"
          />
        </div>

        {/* Swap */}
        <div className="pt-6">
          <motion.button
            type="button"
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={swap}
            className="w-9 h-9 flex items-center justify-center rounded-md shrink-0"
            style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
          >
            <ArrowLeftRight size={15} />
          </motion.button>
        </div>

        {/* Destination */}
        <div className="flex-1 min-w-[120px]">
          <label style={labelStyle}>Arrivée</label>
          <AirportInput
            value={destination}
            onChange={(iata, a?: Airport) => { setDestination(iata); setDestinationCity(a?.city); }}
            placeholder="JFK"
          />
        </div>

        <DateInput label="Date départ" value={date} onChange={setDate} />

        {tripType === 'round-trip' && (
          <DateInput label="Date retour" value={returnDate} onChange={setReturnDate} min={date} />
        )}
      </div>

      {/* Row 2: Airline + Time + Cabin class + Submit */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[150px]">
          <label style={labelStyle}>Compagnie</label>
          <select value={airline} onChange={e => setAirline(e.target.value)} style={selectStyle}>
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label style={labelStyle}>
            <Clock size={9} style={{ display: 'inline', marginRight: 3 }} />
            Heure de départ
          </label>
          <select value={departureTime} onChange={e => setDepartureTime(e.target.value)} style={selectStyle}>
            {timeSlots.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label style={labelStyle}>
            <Luggage size={9} style={{ display: 'inline', marginRight: 3 }} />
            Classe
          </label>
          <select value={cabinClass} onChange={e => setCabinClass(e.target.value as typeof cabinClass)} style={selectStyle}>
            {cabinClasses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <Button type="submit" loading={loading} size="md" className="shrink-0">
          Analyser
        </Button>
      </div>
    </form>
  );
}
