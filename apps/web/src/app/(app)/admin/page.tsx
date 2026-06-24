'use client';

import { motion } from 'framer-motion';
import {
  ShieldCheck, Activity, FlaskConical, Users, TrendingUp,
  Eye, MousePointer, Search, BarChart2, Globe,
} from 'lucide-react';
import { mockModelMetrics, mockPredictionLogs, mockABTests } from '@/lib/mock-data';
import { VerdictBadge, StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import type { ModelMetrics } from '@airlytics/types';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

// Simulated analytics data
const dailyVisits = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  const base = 1200 + Math.sin(i * 0.5) * 300 + i * 18;
  return {
    date: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    visits: Math.round(base + (Math.random() * 200 - 100)),
    users: Math.round(base * 0.7 + (Math.random() * 150 - 75)),
  };
});

const seoKeywords = [
  { keyword: 'prédiction prix avion', position: 3, volume: 2400, trend: '+2' },
  { keyword: 'meilleur moment acheter billet avion', position: 7, volume: 1800, trend: '+5' },
  { keyword: 'airlytics', position: 1, volume: 890, trend: '—' },
  { keyword: 'forecast prix vol IA', position: 12, volume: 1200, trend: '+3' },
  { keyword: 'comparer prix vols', position: 18, volume: 5600, trend: '-1' },
  { keyword: 'alertes prix avion', position: 9, volume: 980, trend: '+7' },
];

const cpmData = [
  { zone: 'Dashboard (sidebar)', cpm: 4.20, impressions: '48K', revenue: '201€' },
  { zone: 'Prédiction (banner)', cpm: 6.80, impressions: '31K', revenue: '211€' },
  { zone: 'Comparer (inline)', cpm: 5.10, impressions: '22K', revenue: '112€' },
  { zone: 'Smart Deals (card)', cpm: 8.40, impressions: '19K', revenue: '160€' },
];

function ModelCard({ model }: { model: ModelMetrics }) {
  const radarData = [
    { metric: 'Accuracy', val: model.accuracy },
    { metric: 'Précision', val: model.precision },
    { metric: 'Recall', val: model.recall },
    { metric: 'F1', val: model.f1 },
    { metric: 'Confiance', val: model.avgConfidence },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{model.name}</h4>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{model.modelId}</p>
        </div>
        <StatusBadge status={model.status} />
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
          <Radar dataKey="val" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.15} dot={false} />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="text-center p-2 rounded-md" style={{ background: 'var(--bg-base)' }}>
          <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{model.accuracy}%</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Accuracy</p>
        </div>
        <div className="text-center p-2 rounded-md" style={{
          background: model.drift > 0.12 ? 'var(--risk-dim)' : 'var(--bg-base)',
        }}>
          <p className="text-xs font-mono font-bold"
             style={{ color: model.drift > 0.12 ? 'var(--risk)' : 'var(--text-primary)' }}>
            {(model.drift * 100).toFixed(0)}%
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dérive</p>
        </div>
        <div className="col-span-2 text-center p-2 rounded-md" style={{ background: 'var(--bg-base)' }}>
          <p className="text-xs font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
            {model.predictionCount.toLocaleString()}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Prédictions · Entraîné {formatDate(model.lastTrained)}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Administration</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Monitoring IA · Analytics · SEO · CPM</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Prédictions / 24h" value="8,420" icon={<Activity size={14} />} />
        <StatCard label="Accuracy globale" value="84.2%" icon={<TrendingUp size={14} />} />
        <StatCard label="Modèles actifs" value="4" icon={<FlaskConical size={14} />} />
        <StatCard label="Tests A/B actifs" value="2" icon={<Users size={14} />} />
      </div>

      {/* ─── Analytics Section ──────────────────────────────────── */}
      <div>
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Eye size={15} style={{ color: 'var(--accent-blue)' }} />
          Analytics site — 30 derniers jours
        </h2>

        {/* Analytics stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Visites / jour', value: '1 847', icon: <Eye size={13} />, color: '--accent-blue' },
            { label: 'Utilisateurs uniques', value: '1 312', icon: <Users size={13} />, color: '--buy' },
            { label: 'Taux de rebond', value: '34.2%', icon: <MousePointer size={13} />, color: '--wait' },
            { label: 'Pages vues / session', value: '4.7', icon: <Globe size={13} />, color: '--accent-blue' },
            { label: 'Durée moy. session', value: '3m 42s', icon: <Activity size={13} />, color: '--buy' },
          ].map(s => (
            <div key={s.label} className="card p-3">
              <div className="flex items-center gap-2 mb-1" style={{ color: `var(${s.color})` }}>
                {s.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </span>
              </div>
              <p className="text-xl font-black font-mono" style={{ color: `var(${s.color})` }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Visits chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-xs mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Visites journalières
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyVisits}>
              <defs>
                <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b86ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5b86ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2bd9a0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2bd9a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} interval={6} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text-muted)' }}
              />
              <Area type="monotone" dataKey="visits" name="Visites" stroke="#5b86ff" fill="url(#visitsGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="users" name="Utilisateurs" stroke="#2bd9a0" fill="url(#usersGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── CPM / Publicité ──────────────────────────────────── */}
      <div>
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart2 size={15} style={{ color: 'var(--accent-blue)' }} />
          Régie publicitaire — CPM & Revenus
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Revenus / mois', value: '684€', color: '--buy' },
            { label: 'CPM moyen', value: '6.13€', color: '--accent-blue' },
            { label: 'Impressions / mois', value: '120K', color: '--accent-blue' },
            { label: 'Taux de clics (CTR)', value: '2.4%', color: '--wait' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className="text-2xl font-black font-mono" style={{ color: `var(${s.color})` }}>{s.value}</p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Zone publicitaire', 'CPM', 'Impressions', 'Revenus'].map(col => (
                  <th key={col} className="text-left pb-3 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cpmData.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="py-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>{row.zone}</td>
                  <td className="py-2.5 text-sm font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>{row.cpm}€</td>
                  <td className="py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>{row.impressions}</td>
                  <td className="py-2.5 text-sm font-mono font-bold" style={{ color: 'var(--buy)' }}>{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── SEO ──────────────────────────────────── */}
      <div>
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Search size={15} style={{ color: 'var(--accent-blue)' }} />
          SEO — Référencement naturel
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Domain Authority', value: '28', note: '/ 100', color: '--accent-blue' },
            { label: 'Pages indexées', value: '47', note: 'pages', color: '--buy' },
            { label: 'Backlinks', value: '312', note: 'liens', color: '--accent-blue' },
            { label: 'Score Core Web Vitals', value: '91', note: '/ 100', color: '--buy' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className="text-2xl font-black font-mono" style={{ color: `var(${s.color})` }}>
                {s.value}<span className="text-xs font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{s.note}</span>
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-xs mb-4 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Mots-clés principaux
          </h3>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Mot-clé', 'Position Google', 'Volume / mois', 'Évolution'].map(col => (
                  <th key={col} className="text-left pb-3 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seoKeywords.map((kw, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td className="py-2.5 text-sm" style={{ color: 'var(--text-primary)' }}>{kw.keyword}</td>
                  <td className="py-2.5">
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                      style={{
                        background: kw.position <= 3 ? 'var(--buy-dim)' : kw.position <= 10 ? 'var(--accent-blue-dim)' : 'var(--bg-base)',
                        color: kw.position <= 3 ? 'var(--buy)' : kw.position <= 10 ? 'var(--accent-blue)' : 'var(--text-secondary)',
                      }}
                    >
                      #{kw.position}
                    </span>
                  </td>
                  <td className="py-2.5 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {kw.volume.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-xs font-mono font-bold"
                      style={{ color: kw.trend.startsWith('+') ? 'var(--buy)' : kw.trend.startsWith('-') ? 'var(--risk)' : 'var(--text-muted)' }}>
                    {kw.trend}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model monitoring */}
      <div>
        <h2 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Activity size={15} style={{ color: 'var(--accent-blue)' }} />
          Modèles ML — Monitoring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockModelMetrics.map((m, i) => (
            <motion.div
              key={m.modelId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <ModelCard model={m} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Logs + A/B tests */}
      <div className="grid grid-cols-12 gap-5">
        {/* Prediction Logs */}
        <div className="col-span-12 lg:col-span-7 card p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Activity size={14} style={{ color: 'var(--accent-blue)' }} />
            Logs de prédictions récents
          </h3>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Route', 'Tendance', 'Probabilité', 'Résultat', 'Latence', 'Date'].map(col => (
                  <th key={col} className="text-left pb-3 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPredictionLogs.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <td className="py-2.5 text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {log.route}
                  </td>
                  <td className="py-2.5">
                    <VerdictBadge trend={log.trend} size="sm" />
                  </td>
                  <td className="py-2.5 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {log.probability}%
                  </td>
                  <td className="py-2.5">
                    {log.correct !== undefined ? (
                      <span className="text-xs font-mono font-semibold"
                            style={{ color: log.correct ? 'var(--buy)' : 'var(--risk)' }}>
                        {log.correct ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>En attente</span>
                    )}
                  </td>
                  <td className="py-2.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {log.latencyMs}ms
                  </td>
                  <td className="py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(log.requestedAt, { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* A/B Tests */}
        <div className="col-span-12 lg:col-span-5 card p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FlaskConical size={14} style={{ color: 'var(--accent-blue)' }} />
            Tests A/B
          </h3>
          <div className="space-y-4">
            {mockABTests.map((test, i) => {
              const rateA = ((test.conversions.a / test.visitors.a) * 100).toFixed(1);
              const rateB = ((test.conversions.b / test.visitors.b) * 100).toFixed(1);
              const winner = Number(rateB) > Number(rateA) ? 'b' : 'a';
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-3 rounded-md"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{test.name}</p>
                    <StatusBadge status={test.status === 'running' ? 'active' : test.status === 'paused' ? 'paused' : 'completed'} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {(['a', 'b'] as const).map(variant => (
                      <div
                        key={variant}
                        className="p-2 rounded"
                        style={{
                          background: (test.winner === variant || (test.status === 'running' && winner === variant))
                            ? 'var(--buy-dim)' : 'var(--bg-card)',
                          border: `1px solid ${(test.winner === variant) ? 'var(--buy-border)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"
                           style={{ color: 'var(--text-muted)' }}>
                          Variante {variant.toUpperCase()}
                          {test.winner === variant && ' 🏆'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{test[`variant${variant.toUpperCase() as 'A' | 'B'}`]}</p>
                        <p className="text-sm font-mono font-bold mt-1"
                           style={{ color: variant === 'a' ? 'var(--accent-blue)' : 'var(--buy)' }}>
                          {variant === 'a' ? rateA : rateB}%
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {test.visitors[variant].toLocaleString()} visiteurs
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
