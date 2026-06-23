'use client';

import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Bell, CheckCircle, AlertCircle, Info, PiggyBank, Target, Activity } from 'lucide-react';
import { mockTrackedFlights, mockAlerts } from '@/lib/mock-data';
import { VerdictBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { formatPrice, formatPercent, formatDate } from '@/lib/utils';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

function Sparkline({ data, trend }: { data: number[]; trend: 'BUY' | 'WAIT' | 'RISK' }) {
  const points = data.map((price, i) => ({ i, price }));
  const color = trend === 'BUY' ? '#2bd9a0' : trend === 'RISK' ? '#ff4e6a' : '#f5a623';
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={points}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

const alertIcons = {
  price_drop: <TrendingDown size={14} style={{ color: 'var(--buy)' }} />,
  buy_signal: <TrendingDown size={14} style={{ color: 'var(--buy)' }} />,
  expiring:   <AlertCircle size={14} style={{ color: 'var(--wait)' }} />,
  prediction_update: <Info size={14} style={{ color: 'var(--accent-blue)' }} />,
};

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Vue d'ensemble · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Économies réalisées"
          value="287€"
          delta={-12.4}
          icon={<PiggyBank size={14} />}
        />
        <StatCard
          label="Précision modèle IA"
          value="84.2%"
          icon={<Target size={14} />}
        />
        <StatCard
          label="Vols suivis"
          value="4"
          delta={0}
          icon={<Activity size={14} />}
        />
        <StatCard
          label="Alertes actives"
          value="3"
          icon={<Bell size={14} />}
        />
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Tracked flights */}
        <div className="col-span-12 lg:col-span-8">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Vols suivis
            </h3>
            <div className="space-y-0">
              {mockTrackedFlights.map((flight, i) => (
                <motion.div
                  key={flight.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 py-3 transition-colors cursor-pointer rounded-md px-2"
                  style={{ borderBottom: i < mockTrackedFlights.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  {/* Route */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {flight.route}
                      </span>
                      <VerdictBadge trend={flight.trend} size="sm" />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {flight.airline} · {formatDate(flight.departureDate)}
                    </p>
                  </div>

                  {/* Sparkline */}
                  <Sparkline data={flight.sparkline} trend={flight.trend} />

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(flight.currentPrice)}
                    </p>
                    <p
                      className="text-xs font-mono"
                      style={{ color: flight.variation < 0 ? 'var(--buy)' : 'var(--risk)' }}
                    >
                      {flight.variation < 0 ? '↓' : '↑'} {Math.abs(flight.variation)}%
                    </p>
                  </div>

                  {/* Probability */}
                  <div className="w-14 text-right shrink-0">
                    <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                      {flight.probability}%
                    </p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>IA conf.</p>
                  </div>

                  {/* Alert icon */}
                  <div className="shrink-0">
                    {flight.alertActive
                      ? <Bell size={14} style={{ color: 'var(--accent-blue)' }} />
                      : <Bell size={14} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    }
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Alert feed */}
        <div className="col-span-12 lg:col-span-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Feed d'alertes
              </h3>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}
              >
                {mockAlerts.filter(a => !a.isRead).length} non lues
              </span>
            </div>
            <div className="space-y-3">
              {mockAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-3 rounded-md"
                  style={{
                    background: alert.isRead ? 'transparent' : 'var(--accent-blue-dim)',
                    border: `1px solid ${alert.isRead ? 'transparent' : 'var(--border-accent)'}`,
                  }}
                >
                  <div className="shrink-0 mt-0.5">
                    {alertIcons[alert.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {alert.message}
                    </p>
                    <p className="text-[10px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(alert.createdAt, { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                         style={{ background: 'var(--accent-blue)' }} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
