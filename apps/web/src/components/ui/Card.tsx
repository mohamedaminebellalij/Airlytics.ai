import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, className, hover, glass, style, onClick }: CardProps) {
  return (
    <div
      className={cn('card', hover && 'card-hover', glass && 'glass', className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-5', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-md flex items-center justify-center"
               style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, delta, unit, icon, className }: StatCardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  return (
    <div className={cn('card p-5', className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {icon && (
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
               style={{ background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-bold text-2xl font-mono" style={{ color: 'var(--text-primary)' }}>
          {value}
        </span>
        {unit && <span className="text-sm mb-0.5" style={{ color: 'var(--text-secondary)' }}>{unit}</span>}
      </div>
      {delta !== undefined && (
        <p className="mt-1.5 text-xs font-mono"
           style={{ color: isNegative ? 'var(--buy)' : isPositive ? 'var(--risk)' : 'var(--text-muted)' }}>
          {delta > 0 ? '+' : ''}{delta}% vs hier
        </p>
      )}
    </div>
  );
}
