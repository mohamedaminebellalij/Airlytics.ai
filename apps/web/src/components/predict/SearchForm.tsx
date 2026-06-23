'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, CalendarDays, Plane } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SearchFormProps {
  initialOrigin?: string;
  initialDestination?: string;
  onSearch?: (params: { origin: string; destination: string; date: string; airline: string }) => void;
  loading?: boolean;
}

const airlines = ['Toutes compagnies', 'Air France', 'Delta', 'British Airways', 'Emirates', 'Lufthansa', 'United'];

export function SearchForm({ initialOrigin = 'CDG', initialDestination = 'JFK', onSearch, loading }: SearchFormProps) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 23);
    return d.toISOString().split('T')[0];
  });
  const [airline, setAirline] = useState('Toutes compagnies');

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ origin, destination, date, airline });
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-base)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
    fontFamily: 'var(--font-space-grotesk)',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card p-5"
    >
      <div className="flex items-end gap-3 flex-wrap">
        {/* Origin */}
        <div className="flex-1 min-w-[100px]">
          <label style={labelStyle}>
            <Plane size={10} style={{ display: 'inline', marginRight: 4 }} />
            Départ
          </label>
          <input
            value={origin}
            onChange={e => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
            placeholder="CDG"
            style={{ ...inputStyle, fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 18, fontWeight: 600, letterSpacing: 2 }}
            maxLength={3}
          />
        </div>

        {/* Swap */}
        <motion.button
          type="button"
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={swap}
          className="mb-[1px] w-9 h-9 flex items-center justify-center rounded-md shrink-0"
          style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
        >
          <ArrowLeftRight size={15} />
        </motion.button>

        {/* Destination */}
        <div className="flex-1 min-w-[100px]">
          <label style={labelStyle}>
            <Plane size={10} style={{ display: 'inline', marginRight: 4, transform: 'scaleX(-1)' }} />
            Arrivée
          </label>
          <input
            value={destination}
            onChange={e => setDestination(e.target.value.toUpperCase().slice(0, 3))}
            placeholder="JFK"
            style={{ ...inputStyle, fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 18, fontWeight: 600, letterSpacing: 2 }}
            maxLength={3}
          />
        </div>

        {/* Date */}
        <div className="flex-1 min-w-[140px]">
          <label style={labelStyle}>
            <CalendarDays size={10} style={{ display: 'inline', marginRight: 4 }} />
            Date de départ
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Airline */}
        <div className="flex-1 min-w-[160px]">
          <label style={labelStyle}>Compagnie</label>
          <select
            value={airline}
            onChange={e => setAirline(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {airlines.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          size="md"
          className="shrink-0 mb-[1px]"
        >
          Analyser
        </Button>
      </div>
    </form>
  );
}
