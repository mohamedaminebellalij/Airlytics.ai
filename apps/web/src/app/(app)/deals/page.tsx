'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Shield, AlertTriangle } from 'lucide-react';
import { mockDeals } from '@/lib/mock-data';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import type { Deal, DealType } from '@airlytics/types';

function useCountdown(expiresAt: string) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expiré'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

const dealTypeConfig: Record<DealType, { label: string; icon: React.ReactNode; colorVar: string }> = {
  error_fare:       { label: 'Erreur tarifaire', icon: <AlertTriangle size={12} />, colorVar: '--risk' },
  rare_opportunity: { label: 'Opportunité rare', icon: <Zap size={12} />,           colorVar: '--accent-blue' },
  price_drop:       { label: 'Baisse de prix',   icon: <Clock size={12} />,         colorVar: '--buy' },
  flash_sale:       { label: 'Flash Sale',        icon: <Zap size={12} />,           colorVar: '--wait' },
};

function DealCard({ deal }: { deal: Deal }) {
  const countdown = useCountdown(deal.expiresAt);
  const cfg = dealTypeConfig[deal.type];
  const isUrgent = new Date(deal.expiresAt).getTime() - Date.now() < 3 * 3600 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="card overflow-hidden"
      style={{ borderColor: isUrgent ? 'var(--risk-border)' : undefined }}
    >
      {/* Type banner */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
        style={{
          background: `var(${cfg.colorVar}-dim)`,
          borderBottom: `1px solid var(${cfg.colorVar}-border)`,
          color: `var(${cfg.colorVar})`,
        }}
      >
        {cfg.icon}
        {cfg.label}
        {deal.isVerified && (
          <span className="ml-auto flex items-center gap-1 text-[10px]">
            <Shield size={10} /> Vérifié
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Route */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg font-mono" style={{ color: 'var(--text-primary)' }}>
              {deal.origin} → {deal.destination}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {deal.destinationName} · {deal.airline}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs line-through font-mono" style={{ color: 'var(--text-muted)' }}>
              {formatPrice(deal.originalPrice)}
            </p>
            <p className="text-2xl font-black font-mono" style={{ color: 'var(--buy)' }}>
              {formatPrice(deal.dealPrice)}
            </p>
            <span
              className="text-xs font-semibold font-mono px-1.5 py-0.5 rounded"
              style={{ background: 'var(--buy-dim)', color: 'var(--buy)' }}
            >
              -{deal.discount}%
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-md mb-3"
          style={{ background: isUrgent ? 'var(--risk-dim)' : 'var(--bg-base)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Expire dans</span>
          <span
            className="font-mono font-bold text-sm tracking-widest"
            style={{ color: isUrgent ? 'var(--risk)' : 'var(--text-primary)' }}
          >
            {countdown}
          </span>
        </div>

        {/* Extra info */}
        <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {deal.probability && (
            <span className="font-mono" style={{ color: 'var(--buy)' }}>
              IA confiance {deal.probability}%
            </span>
          )}
          {deal.seatsLeft && (
            <span style={{ color: deal.seatsLeft < 4 ? 'var(--risk)' : 'var(--text-secondary)' }}>
              {deal.seatsLeft} places restantes
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {deal.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-base)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {tag}
            </span>
          ))}
        </div>

        <Button
          variant="success"
          size="sm"
          fullWidth
          onClick={() => window.open(`https://www.google.com/travel/flights/search?q=vols+${deal.origin}+${deal.destination}`, '_blank')}
        >
          Voir ce deal →
        </Button>
      </div>
    </motion.div>
  );
}

export default function DealsPage() {
  const [filter, setFilter] = useState<'all' | DealType>('all');

  const types: { key: 'all' | DealType; label: string }[] = [
    { key: 'all',             label: 'Tous' },
    { key: 'error_fare',      label: 'Erreurs tarifaires' },
    { key: 'price_drop',      label: 'Baisses de prix' },
    { key: 'rare_opportunity',label: 'Opportunités rares' },
    { key: 'flash_sale',      label: 'Flash Sales' },
  ];

  const filtered = filter === 'all' ? mockDeals : mockDeals.filter(d => d.type === filter);

  return (
    <div className="max-w-[1100px] mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'var(--buy-dim)', color: 'var(--buy)' }}>
          <Zap size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Smart Deals</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {mockDeals.length} opportunités · Mises à jour en temps réel
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Erreurs tarifaires', value: '2', color: '--risk' },
          { label: 'Moy. réduction',     value: '-52%', color: '--buy' },
          { label: 'Expirent <4h',       value: '3', color: '--wait' },
          { label: 'Places restantes',   value: '29', color: '--accent-blue' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className="text-2xl font-black font-mono" style={{ color: `var(${s.color})` }}>{s.value}</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
            style={{
              background: filter === t.key ? 'var(--accent-blue-dim)' : 'var(--bg-card)',
              color: filter === t.key ? 'var(--accent-blue)' : 'var(--text-secondary)',
              border: `1px solid ${filter === t.key ? 'var(--border-accent)' : 'var(--border)'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Deals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(deal => <DealCard key={deal.id} deal={deal} />)}
      </div>
    </div>
  );
}
