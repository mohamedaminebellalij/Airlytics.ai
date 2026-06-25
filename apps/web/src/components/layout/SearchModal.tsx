'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchAirports, findAirport } from '@/lib/airports';
import type { Airport } from '@/lib/airports';

const POPULAR_ROUTES = [
  { from: 'CDG', to: 'JFK', label: 'Paris → New York', hint: 'BUY · -12%' },
  { from: 'CDG', to: 'BKK', label: 'Paris → Bangkok', hint: 'WAIT · stable' },
  { from: 'CDG', to: 'DXB', label: 'Paris → Dubaï', hint: 'BUY · -8%' },
  { from: 'ORY', to: 'MAD', label: 'Paris Orly → Madrid', hint: 'BUY · -5%' },
  { from: 'CDG', to: 'NRT', label: 'Paris → Tokyo', hint: 'WAIT · +3%' },
  { from: 'CDG', to: 'LAX', label: 'Paris → Los Angeles', hint: 'BUY · -15%' },
  { from: 'CDG', to: 'CMN', label: 'Paris → Casablanca', hint: 'BUY · -9%' },
  { from: 'CDG', to: 'LIS', label: 'Paris → Lisbonne', hint: 'BUY · -6%' },
];

const RECENT = [
  { from: 'CDG', to: 'JFK', label: 'CDG → JFK' },
  { from: 'CDG', to: 'BKK', label: 'CDG → BKK' },
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

function getRouteHint(from: string, to: string): string {
  const seed = (from + to).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const trend = seed % 3 === 0 ? 'BUY' : seed % 3 === 1 ? 'WAIT' : 'RISK';
  const pct = seed % 18;
  return `${trend} · ${trend === 'BUY' ? '-' : '+'}${pct}%`;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [airportResults, setAirportResults] = useState<Airport[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setAirportResults([]);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!open) return;
        onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (query.length >= 2) {
      setAirportResults(searchAirports(query));
    } else {
      setAirportResults([]);
    }
  }, [query]);

  const go = (from: string, to: string) => {
    router.push(`/predict?from=${from}&to=${to}`);
    onClose();
  };

  const goToPredict = (iata: string) => {
    router.push(`/predict?from=CDG&to=${iata}`);
    onClose();
  };

  // Parse "CDG JFK" or "Paris New York" style input
  const parseRouteQuery = (q: string): { from: string; to: string } | null => {
    const parts = q.trim().split(/[\s→\->/]+/);
    if (parts.length < 2) return null;

    // Try IATA codes
    const iataPattern = /^[A-Za-z]{3}$/;
    if (iataPattern.test(parts[0]) && iataPattern.test(parts[1])) {
      const fromAp = findAirport(parts[0].toUpperCase());
      const toAp = findAirport(parts[1].toUpperCase());
      if (fromAp && toAp) return { from: fromAp.iata, to: toAp.iata };
    }

    // Try city names
    const fromResults = searchAirports(parts[0]);
    const toResults = searchAirports(parts.slice(1).join(' '));
    if (fromResults.length > 0 && toResults.length > 0) {
      return { from: fromResults[0].iata, to: toResults[0].iata };
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseRouteQuery(query);
    if (parsed) {
      go(parsed.from, parsed.to);
    } else if (airportResults.length > 0) {
      goToPredict(airportResults[0].iata);
    } else if (query.length >= 3) {
      router.push('/compare');
      onClose();
    }
  };

  const showAirportResults = query.length >= 2 && airportResults.length > 0;
  const filteredPopular = query.length >= 1
    ? POPULAR_ROUTES.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.from.includes(query.toUpperCase()) ||
        r.to.includes(query.toUpperCase())
      )
    : POPULAR_ROUTES;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-[560px] -translate-x-1/2"
          >
            <div className="card overflow-hidden shadow-2xl" style={{ border: '1px solid var(--border-accent)' }}>
              {/* Input */}
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="CDG JFK · Paris Bangkok · Rabat Nice…"
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery('')}>
                      <X size={14} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                       style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                    ESC
                  </kbd>
                </div>
              </form>

              {/* Recent */}
              {!query && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                    Récents
                  </p>
                  <div className="flex gap-2">
                    {RECENT.map(r => (
                      <button
                        key={r.label}
                        onClick={() => go(r.from, r.to)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all"
                        style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                      >
                        <Clock size={11} />
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Airport search results */}
              {showAirportResults && (
                <div className="px-2 py-2 max-h-[280px] overflow-y-auto">
                  <p className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5"
                     style={{ color: 'var(--text-muted)' }}>
                    Aéroports trouvés
                  </p>
                  {airportResults.map(ap => (
                    <button
                      key={ap.iata}
                      onClick={() => goToPredict(ap.iata)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 font-mono text-xs font-bold"
                           style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
                        {ap.iata}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ap.city}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{ap.country}</p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                            style={{ background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                        CDG → {ap.iata}
                      </span>
                      <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Popular routes (when no airport results) */}
              {!showAirportResults && (
                <div className="px-2 py-2 max-h-[320px] overflow-y-auto">
                  <p className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5"
                     style={{ color: 'var(--text-muted)' }}>
                    {query ? 'Résultats' : 'Routes populaires'}
                  </p>
                  {filteredPopular.map(r => {
                    const hint = r.hint ?? getRouteHint(r.from, r.to);
                    return (
                      <button
                        key={r.from + r.to}
                        onClick={() => go(r.from, r.to)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                             style={{ background: 'var(--accent-blue-dim)' }}>
                          <TrendingDown size={13} style={{ color: 'var(--accent-blue)' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{r.label}</p>
                          <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                            {r.from} → {r.to}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded"
                              style={{
                                background: hint.startsWith('BUY') ? 'var(--buy-dim)' : hint.startsWith('RISK') ? 'var(--risk-dim)' : 'var(--wait-dim)',
                                color: hint.startsWith('BUY') ? 'var(--buy)' : hint.startsWith('RISK') ? 'var(--risk)' : 'var(--wait)',
                              }}>
                          {hint}
                        </span>
                        <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    );
                  })}
                  {filteredPopular.length === 0 && (
                    <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                      Aucun résultat — essayez &quot;Paris Bangkok&quot; ou &quot;CDG JFK&quot;
                    </p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2.5 flex items-center gap-3 text-[11px]"
                   style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <span><kbd className="font-mono">↵</kbd> Analyser</span>
                <span><kbd className="font-mono">ESC</kbd> Fermer</span>
                <span className="ml-auto">Recherche par ville ou code IATA</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
