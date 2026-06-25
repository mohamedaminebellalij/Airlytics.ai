'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { searchAirports, findAirport, type Airport } from '@/lib/airports';

interface AirportInputProps {
  value: string;
  onChange: (iata: string, airport?: Airport) => void;
  placeholder?: string;
  className?: string;
}

export function AirportInput({ value, onChange, placeholder = 'CDG', className }: AirportInputProps) {
  const airport = findAirport(value);
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (q: string) => {
    setQuery(q);
    const r = searchAirports(q);
    setResults(r);
    setOpen(r.length > 0 && q.length >= 1);
  };

  const select = (a: Airport) => {
    setQuery(a.iata);
    setOpen(false);
    onChange(a.iata, a);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
        if (!findAirport(query) && query.length === 3) {
          onChange(query.toUpperCase());
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, onChange]);

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-ibm-plex-mono)',
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: 2,
    width: '100%',
    padding: 0,
  };

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <div
        className="px-3 py-2.5 rounded-lg transition-all"
        style={{
          background: 'var(--bg-base)',
          border: `1px solid ${focused ? 'var(--accent-blue)' : 'var(--border)'}`,
        }}
      >
        <input
          value={query}
          onChange={e => handleChange(e.target.value.toUpperCase().slice(0, 3))}
          placeholder={placeholder}
          style={inputStyle}
          maxLength={3}
          onFocus={() => { setFocused(true); if (query.length >= 1) setOpen(searchAirports(query).length > 0); }}
          onKeyDown={e => {
            if (e.key === 'Enter' && results.length > 0) { select(results[0]); e.preventDefault(); }
            if (e.key === 'Escape') setOpen(false);
          }}
        />
        {airport && (
          <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {airport.city}, {airport.country}
          </p>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 left-0 z-50 w-64 overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent)',
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            {results.map(a => (
              <button
                key={a.iata}
                type="button"
                onMouseDown={() => select(a)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="w-9 h-7 rounded flex items-center justify-center shrink-0 font-mono text-xs font-bold"
                  style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
                >
                  {a.iata}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{a.city}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={8} className="inline mr-0.5" />{a.country}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
