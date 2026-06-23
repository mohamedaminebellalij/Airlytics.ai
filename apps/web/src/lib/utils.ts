import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Trend } from '@airlytics/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...options,
  }).format(d);
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(d);
}

export function getTrendColor(trend: Trend): string {
  const map: Record<Trend, string> = {
    BUY:  'var(--buy)',
    WAIT: 'var(--wait)',
    RISK: 'var(--risk)',
  };
  return map[trend];
}

export function daysUntil(date: string): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Generate realistic price history with trends
export function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility = 0.04,
  trend = 0
): { date: string; price: number }[] {
  const result = [];
  let price = basePrice * (0.85 + Math.random() * 0.3);
  const startDate = addDays(new Date(), -days);

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const change = (Math.random() - 0.5 + trend) * volatility;
    const seasonality = Math.sin((i / 7) * Math.PI) * 0.02;
    price = Math.max(basePrice * 0.5, price * (1 + change + seasonality));
    result.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
    });
  }
  return result;
}

// Generate forecast with confidence bands
export function generateForecast(
  lastPrice: number,
  days: number,
  trend: -1 | 0 | 1,
  baseVolatility = 0.03
): { date: string; price: number; lower: number; upper: number }[] {
  const result = [];
  let price = lastPrice;
  const startDate = new Date();

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const trendFactor = trend * 0.005;
    const change = (Math.random() - 0.5) * baseVolatility + trendFactor;
    price = Math.max(lastPrice * 0.7, price * (1 + change));
    const uncertainty = baseVolatility * Math.sqrt(i + 1) * price;
    result.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price),
      lower: Math.round(price - uncertainty * 1.5),
      upper: Math.round(price + uncertainty * 1.5),
    });
  }
  return result;
}
