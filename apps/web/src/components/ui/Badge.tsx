import { cn } from '@/lib/utils';
import type { Trend } from '@airlytics/types';

interface VerdictBadgeProps {
  trend: Trend;
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  className?: string;
}

const labels: Record<Trend, string> = {
  BUY: 'ACHETER',
  WAIT: 'ATTENDRE',
  RISK: 'RISQUE',
};

const sizeStyles = {
  sm:  'text-[10px] px-2 py-0.5 gap-1',
  md:  'text-xs px-2.5 py-1 gap-1.5',
  lg:  'text-sm px-3 py-1.5 gap-2',
};

export function VerdictBadge({ trend, size = 'md', showArrow = true, className }: VerdictBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold font-mono tracking-wide',
        `badge-${trend.toLowerCase()}`,
        sizeStyles[size],
        className
      )}
    >
      {showArrow && (
        <span>{trend === 'BUY' ? '↓' : trend === 'RISK' ? '↑' : '→'}</span>
      )}
      {labels[trend]}
    </span>
  );
}

interface ProbabilityBadgeProps {
  value: number;
  trend: Trend;
  className?: string;
}

export function ProbabilityBadge({ value, trend, className }: ProbabilityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-mono rounded-full px-2 py-0.5',
        `badge-${trend.toLowerCase()}`,
        className
      )}
    >
      {trend === 'BUY' ? '↓' : trend === 'RISK' ? '↑' : '→'}
      {trend === 'BUY' ? 'baisse' : trend === 'RISK' ? 'hausse' : 'stable'} probable{' '}
      <strong>{value}%</strong>
    </span>
  );
}

interface StatusBadgeProps {
  status: 'active' | 'paused' | 'completed' | 'draft' | 'healthy' | 'warning' | 'critical';
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active:    { label: 'Actif',       color: 'badge-buy'  },
  healthy:   { label: 'Sain',        color: 'badge-buy'  },
  paused:    { label: 'En pause',    color: 'badge-wait' },
  warning:   { label: 'Attention',   color: 'badge-wait' },
  draft:     { label: 'Brouillon',   color: 'badge-wait' },
  completed: { label: 'Terminé',     color: 'badge-wait' },
  critical:  { label: 'Critique',    color: 'badge-risk' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, color: 'badge-wait' };
  return (
    <span className={cn('inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono', config.color, className)}>
      {config.label}
    </span>
  );
}
