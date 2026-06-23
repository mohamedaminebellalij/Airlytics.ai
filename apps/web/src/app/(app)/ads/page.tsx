'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Eye, MousePointer, DollarSign, BarChart3 } from 'lucide-react';
import { mockCampaigns, mockInventory } from '@/lib/mock-data';
import { StatusBadge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { formatPrice } from '@/lib/utils';
import type { AdFormat } from '@airlytics/types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const formatLabels: Record<AdFormat, string> = {
  sponsored_flight:     'Vol sponsorisé',
  native_destination:   'Destination native',
  assistant_suggestion: 'Suggestion assistant',
  newsletter_banner:    'Bannière newsletter',
  dashboard_banner:     'Bannière dashboard',
};

const formatColors: Record<AdFormat, string> = {
  sponsored_flight:     '#5b86ff',
  native_destination:   '#2bd9a0',
  assistant_suggestion: '#f5a623',
  newsletter_banner:    '#ff4e6a',
  dashboard_banner:     '#9f7aea',
};

export default function AdsPage() {
  const [tab, setTab] = useState<'campaigns' | 'inventory'>('campaigns');

  const totalRevenue = mockInventory.reduce((s, i) => s + i.revenue, 0);
  const totalImpressions = mockCampaigns.reduce((s, c) => s + c.impressions, 0);
  const avgCtr = mockCampaigns.reduce((s, c) => s + c.ctr, 0) / mockCampaigns.length;

  const inventoryChartData = mockInventory.map(inv => ({
    name: formatLabels[inv.format].split(' ')[0],
    fillRate: inv.fillRate,
    cpm: inv.avgCpm,
  }));

  return (
    <div className="max-w-[1200px] mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Régie Publicitaire</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Gestion des campagnes · Ciblage IA par route & intention
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenus publicitaires" value={formatPrice(totalRevenue)} icon={<DollarSign size={14} />} />
        <StatCard label="Impressions totales" value={`${(totalImpressions / 1000).toFixed(0)}k`} icon={<Eye size={14} />} />
        <StatCard label="CTR moyen" value={`${avgCtr.toFixed(2)}%`} icon={<MousePointer size={14} />} />
        <StatCard label="Campagnes actives" value={mockCampaigns.filter(c => c.status === 'active').length} icon={<BarChart3 size={14} />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit"
           style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {(['campaigns', 'inventory'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="text-sm px-4 py-2 rounded-md font-medium transition-all"
            style={{
              background: tab === t ? 'var(--accent-blue)' : 'transparent',
              color: tab === t ? 'white' : 'var(--text-secondary)',
            }}
          >
            {t === 'campaigns' ? 'Campagnes' : 'Inventaire'}
          </button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Annonceur', 'Format', 'Impressions', 'Clics', 'CTR', 'Dépense', 'Budget', 'CPM', 'Statut'].map(col => (
                  <th key={col} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCampaigns.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.advertiser}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: `${formatColors[c.format]}20`,
                            color: formatColors[c.format],
                          }}>
                      {formatLabels[c.format]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {(c.impressions / 1000).toFixed(1)}k
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {c.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono font-semibold"
                      style={{ color: c.ctr > 2 ? 'var(--buy)' : c.ctr < 1 ? 'var(--risk)' : 'var(--text-secondary)' }}>
                    {c.ctr.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(c.spend)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-base)', minWidth: 60 }}>
                        <div className="h-full rounded-full" style={{ width: `${(c.spend / c.budget) * 100}%`, background: 'var(--accent-blue)' }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        {Math.round((c.spend / c.budget) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {c.cpm.toFixed(1)}€
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="grid grid-cols-12 gap-5">
          {/* Chart */}
          <div className="col-span-12 lg:col-span-7 card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Taux de remplissage par format
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={inventoryChartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)', fontSize: 12 }}
                />
                <Bar dataKey="fillRate" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} name="Taux remplissage" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inventory table */}
          <div className="col-span-12 lg:col-span-5 card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Format', 'Remplissage', 'CPM moy.', 'Revenu'].map(col => (
                    <th key={col} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-muted)' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockInventory.map((inv, i) => (
                  <tr key={inv.format} style={{ borderBottom: i < mockInventory.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatLabels[inv.format]}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                          <div className="h-full rounded-full"
                               style={{ width: `${inv.fillRate}%`, background: inv.fillRate > 80 ? 'var(--buy)' : inv.fillRate > 60 ? 'var(--accent-blue)' : 'var(--wait)' }} />
                        </div>
                        <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {inv.fillRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {inv.avgCpm.toFixed(1)}€
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: 'var(--buy)' }}>
                      {formatPrice(inv.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
