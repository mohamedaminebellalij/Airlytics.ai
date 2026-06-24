'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const POPULAR_ROUTES = [
  { from: 'CDG', to: 'JFK', label: 'Paris → New York', hint: 'BUY · -12%' },
  { from: 'CDG', to: 'BKK', label: 'Paris → Bangkok', hint: 'WAIT · stable' },
  { from: 'CDG', to: 'DXB', label: 'Paris → Dubaï', hint: 'BUY · -8%' },
  { from: 'ORY', to: 'MAD', label: 'Paris → Madrid', hint: 'BUY · -5%' },
  { from: 'CDG', to: 'NRT', label: 'Paris → Tokyo', hint: 'WAIT · +3%' },
  { from: 'CDG', to: 'LAX', label: 'Paris → Los Angeles', hint: 'BUY · -15%' },
];

const RECENT = [
  { from: 'CDG', to: 'JFK', label: 'CDG → JFK' },
  { from: 'CDG', to: 'BKK', label: 'CDG → BKK' },
];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
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

  const go = (from: string, to: string) => {
    router.push(`/predict?from=${from}&to=${to}`);
    onClose();
  };

  const parseQuery = (q: string) => {
    const parts = q.toUpperCase().split(/[\s→\->/]+/).filter(p => p.length === 3);
    if (parts.length >= 2) return { from: parts[0], to: parts[1] };
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseQuery(query);
    if (parsed) go(parsed.from, parsed.to);
    else if (query.length >= 3) {
      router.push(`/compare`);
      onClose();
    }
  };

  const filtered = query.length >= 1
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Modal */}
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
                    placeholder="Chercher un vol… ex: CDG JFK ou Paris New York"
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

              {/* Results */}
              <div className="px-2 py-2 max-h-[320px] overflow-y-auto">
                <p className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5"
                   style={{ color: 'var(--text-muted)' }}>
                  {query ? 'Résultats' : 'Routes populaires'}
                </p>
                {filtered.map(r => (
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
                          style={{ background: r.hint.startsWith('BUY') ? 'var(--buy-dim)' : 'var(--wait-dim)',
                                   color: r.hint.startsWith('BUY') ? 'var(--buy)' : 'var(--wait)' }}>
                      {r.hint}
                    </span>
                    <ArrowRight size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
                    Aucun résultat — tapez un code IATA (ex: CDG JFK)
                  </p>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 flex items-center gap-3 text-[11px]"
                   style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <span><kbd className="font-mono">↵</kbd> Analyser</span>
                <span><kbd className="font-mono">ESC</kbd> Fermer</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
