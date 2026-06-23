// ─── Prediction ────────────────────────────────────────────────────────────────

export type Trend = 'BUY' | 'WAIT' | 'RISK';

export interface FeatureContribution {
  name: string;
  value: number;       // -1 to +1 (negative = reduces price)
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PredictionResult {
  route: string;
  origin: string;
  destination: string;
  departureDate: string;
  airline: string;
  trend: Trend;
  probability: number;        // 0-100
  confidence: number;         // 0-100
  currentPrice: number;
  expectedDelta: number;      // % change expected
  bestBuyWindow: {
    start: string;
    end: string;
    expectedPrice: number;
    saving: number;
  };
  featureContributions: FeatureContribution[];
  priceHistory: PricePoint[];
  priceForecast: ForecastPoint[];
  generatedAt: string;
}

export interface PricePoint {
  date: string;
  price: number;
  volume?: number;
}

export interface ForecastPoint {
  date: string;
  price: number;
  lower: number;
  upper: number;
}

// ─── Flight ────────────────────────────────────────────────────────────────────

export interface Flight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  trend: Trend;
  probability: number;
  expectedDelta: number;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  seatsLeft?: number;
}

export interface PriceCalendarDay {
  date: string;
  price: number;
  trend: Trend;
  isLowest?: boolean;
}

// ─── Deal ──────────────────────────────────────────────────────────────────────

export type DealType = 'error_fare' | 'rare_opportunity' | 'price_drop' | 'flash_sale';

export interface Deal {
  id: string;
  type: DealType;
  origin: string;
  destination: string;
  destinationName: string;
  airline: string;
  originalPrice: number;
  dealPrice: number;
  discount: number;           // %
  expiresAt: string;
  imageUrl?: string;
  isVerified: boolean;
  probability?: number;
  seatsLeft?: number;
  tags: string[];
}

// ─── Destination ───────────────────────────────────────────────────────────────

export interface Destination {
  iata: string;
  city: string;
  country: string;
  region: string;
  price: number;
  qualityScore: number;       // 0-100
  weather: string;
  weatherIcon: string;
  temperature: number;
  trend: Trend;
  priceHistory: PricePoint[];
  tags: string[];
  lat: number;
  lng: number;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface TrackedFlight {
  id: string;
  route: string;
  origin: string;
  destination: string;
  departureDate: string;
  airline: string;
  currentPrice: number;
  variation: number;          // %
  trend: Trend;
  probability: number;
  sparkline: number[];
  alertActive: boolean;
  alertThreshold?: number;
  trackedSince: string;
}

export interface Alert {
  id: string;
  type: 'price_drop' | 'buy_signal' | 'expiring' | 'prediction_update';
  message: string;
  route: string;
  delta?: number;
  trend?: Trend;
  createdAt: string;
  isRead: boolean;
}

// ─── Ads ───────────────────────────────────────────────────────────────────────

export type AdFormat = 'sponsored_flight' | 'native_destination' | 'assistant_suggestion' | 'newsletter_banner' | 'dashboard_banner';
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

export interface AdCampaign {
  id: string;
  advertiser: string;
  format: AdFormat;
  impressions: number;
  clicks: number;
  ctr: number;               // %
  spend: number;
  budget: number;
  cpm: number;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  targeting: {
    routes?: string[];
    budgetRange?: [number, number];
    intent?: string[];
  };
}

export interface AdInventory {
  format: AdFormat;
  available: number;
  sold: number;
  fillRate: number;          // %
  avgCpm: number;
  revenue: number;
}

// ─── Admin / Model Metrics ─────────────────────────────────────────────────────

export interface ModelMetrics {
  modelId: string;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  drift: number;             // 0-1, higher = more drift
  lastTrained: string;
  predictionCount: number;
  avgConfidence: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface PredictionLog {
  id: string;
  route: string;
  requestedAt: string;
  trend: Trend;
  probability: number;
  confidence: number;
  actualOutcome?: Trend;
  correct?: boolean;
  latencyMs: number;
  userId?: string;
}

export interface ABTest {
  id: string;
  name: string;
  variantA: string;
  variantB: string;
  trafficSplit: number;      // % to variant B
  conversions: { a: number; b: number };
  visitors: { a: number; b: number };
  status: 'running' | 'completed' | 'paused';
  winner?: 'a' | 'b';
  startDate: string;
}

// ─── Auth / User ───────────────────────────────────────────────────────────────

export type PricingTier = 'free' | 'pro' | 'business';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: PricingTier;
  avatar?: string;
  createdAt: string;
  trackedFlights: number;
  savedAmount: number;
  predictionsUsed: number;
}

// ─── Chat / Assistant ──────────────────────────────────────────────────────────

export type VerdictChip = 'WAIT' | 'EXPLORER' | 'ACT_NOW';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chips?: VerdictChip[];
  flightContext?: Partial<Flight>;
  createdAt: string;
}
