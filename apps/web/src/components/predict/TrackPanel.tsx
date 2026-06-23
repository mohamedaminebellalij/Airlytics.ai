'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PredictionResult } from '@airlytics/types';
import { formatPrice } from '@/lib/utils';

interface TrackPanelProps {
  prediction: PredictionResult;
}

export function TrackPanel({ prediction }: TrackPanelProps) {
  const [tracking, setTracking] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [threshold, setThreshold] = useState(Math.round(prediction.currentPrice * 0.9));
  const [channels, setChannels] = useState({ email: true, push: false });

  const handleTrack = async () => {
    setTracking(true);
    await new Promise(r => setTimeout(r, 1200));
    setTracking(false);
    setTracked(true);
  };

  return (
    <div
      className="card p-5"
      style={{ borderColor: tracked ? 'var(--buy-border)' : undefined }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
        >
          <Bell size={15} />
        </div>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Suivre ce vol
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Alerte dès que le prix baisse
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tracked ? (
          <motion.div
            key="tracked"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 py-3 px-4 rounded-md"
            style={{ background: 'var(--buy-dim)', border: '1px solid var(--buy-border)' }}
          >
            <Check size={18} style={{ color: 'var(--buy)' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--buy)' }}>Vol suivi !</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Alerte à {formatPrice(threshold)} — {channels.email ? 'Email' : ''}{channels.email && channels.push ? ' + ' : ''}{channels.push ? 'Push' : ''}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Threshold */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                M&apos;alerter sous
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={Math.round(prediction.currentPrice * 0.7)}
                  max={prediction.currentPrice}
                  value={threshold}
                  onChange={e => setThreshold(Number(e.target.value))}
                  className="flex-1 accent-[#5b86ff]"
                  style={{ accentColor: 'var(--accent-blue)' }}
                />
                <span className="font-mono font-bold text-sm w-16 text-right"
                      style={{ color: 'var(--accent-blue)' }}>
                  {formatPrice(threshold)}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Économie : {formatPrice(prediction.currentPrice - threshold)} ({((1 - threshold / prediction.currentPrice) * 100).toFixed(1)}%)
              </p>
            </div>

            {/* Channels */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide block mb-2"
                     style={{ color: 'var(--text-muted)' }}>
                Canaux de notification
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'email', icon: <Mail size={13} />, label: 'Email' },
                  { key: 'push',  icon: <Smartphone size={13} />, label: 'Push' },
                ].map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setChannels(prev => ({ ...prev, [c.key]: !prev[c.key as 'email' | 'push'] }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: channels[c.key as 'email' | 'push'] ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                      color: channels[c.key as 'email' | 'push'] ? 'var(--accent-blue)' : 'var(--text-muted)',
                      border: `1px solid ${channels[c.key as 'email' | 'push'] ? 'var(--border-accent)' : 'var(--border)'}`,
                    }}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleTrack}
              loading={tracking}
              size="md"
              fullWidth
              icon={<Bell size={14} />}
            >
              Suivre {prediction.route}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
