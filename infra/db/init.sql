-- ─────────────────────────────────────────────────────────────────────────────
-- Airlytics.ai — Database Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- fuzzy search

-- ── Enums ─────────────────────────────────────────────────────────────────────
CREATE TYPE trend_enum AS ENUM ('BUY', 'WAIT', 'RISK');
CREATE TYPE pricing_tier AS ENUM ('free', 'pro', 'business');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed', 'draft');
CREATE TYPE ad_format AS ENUM (
  'sponsored_flight', 'native_destination',
  'assistant_suggestion', 'newsletter_banner', 'dashboard_banner'
);
CREATE TYPE deal_type AS ENUM ('error_fare', 'rare_opportunity', 'price_drop', 'flash_sale');
CREATE TYPE model_status AS ENUM ('healthy', 'warning', 'critical');

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  tier          pricing_tier NOT NULL DEFAULT 'free',
  password_hash TEXT,
  avatar_url    TEXT,
  saved_amount  NUMERIC(10,2) DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ── Routes ────────────────────────────────────────────────────────────────────
CREATE TABLE routes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin      CHAR(3) NOT NULL,
  destination CHAR(3) NOT NULL,
  popularity  NUMERIC(4,3) DEFAULT 0.5,
  UNIQUE(origin, destination)
);

-- ── Airlines ──────────────────────────────────────────────────────────────────
CREATE TABLE airlines (
  iata   CHAR(2) PRIMARY KEY,
  name   TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- ── Predictions ───────────────────────────────────────────────────────────────
CREATE TABLE predictions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  route_id          UUID REFERENCES routes(id),
  airline_iata      CHAR(2) REFERENCES airlines(iata),
  departure_date    DATE NOT NULL,
  cabin_class       TEXT NOT NULL DEFAULT 'economy',
  trend             trend_enum NOT NULL,
  probability       NUMERIC(5,2) NOT NULL,
  confidence        NUMERIC(5,2) NOT NULL,
  current_price     NUMERIC(10,2) NOT NULL,
  expected_delta    NUMERIC(6,2),
  best_buy_start    DATE,
  best_buy_end      DATE,
  best_buy_price    NUMERIC(10,2),
  feature_vector    JSONB,
  model_version     TEXT NOT NULL DEFAULT 'lgbm-v2.4',
  actual_outcome    trend_enum,
  correct           BOOLEAN,
  latency_ms        INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictions_route ON predictions(route_id, departure_date);
CREATE INDEX idx_predictions_user  ON predictions(user_id, created_at DESC);
CREATE INDEX idx_predictions_trend ON predictions(trend, created_at DESC);

-- ── Tracked Flights ───────────────────────────────────────────────────────────
CREATE TABLE tracked_flights (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route_id        UUID NOT NULL REFERENCES routes(id),
  airline_iata    CHAR(2) REFERENCES airlines(iata),
  departure_date  DATE NOT NULL,
  alert_active    BOOLEAN DEFAULT TRUE,
  alert_threshold NUMERIC(10,2),
  notify_email    BOOLEAN DEFAULT TRUE,
  notify_push     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, route_id, airline_iata, departure_date)
);

CREATE INDEX idx_tracked_flights_user ON tracked_flights(user_id);

-- ── Alerts ────────────────────────────────────────────────────────────────────
CREATE TABLE alerts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  route       TEXT,
  delta       NUMERIC(6,2),
  trend       trend_enum,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alerts(user_id, is_read, created_at DESC);

-- ── Deals ─────────────────────────────────────────────────────────────────────
CREATE TABLE deals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type            deal_type NOT NULL,
  origin          CHAR(3) NOT NULL,
  destination     CHAR(3) NOT NULL,
  airline_iata    CHAR(2) REFERENCES airlines(iata),
  original_price  NUMERIC(10,2) NOT NULL,
  deal_price      NUMERIC(10,2) NOT NULL,
  discount_pct    NUMERIC(5,2) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  seats_left      INTEGER,
  is_verified     BOOLEAN DEFAULT FALSE,
  ai_probability  NUMERIC(5,2),
  tags            TEXT[],
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_type ON deals(type, expires_at);

-- ── Destinations ──────────────────────────────────────────────────────────────
CREATE TABLE destinations (
  iata          CHAR(3) PRIMARY KEY,
  city          TEXT NOT NULL,
  country       TEXT NOT NULL,
  region        TEXT,
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  quality_score NUMERIC(5,2) DEFAULT 70,
  tags          TEXT[]
);

-- ── Ad Campaigns ──────────────────────────────────────────────────────────────
CREATE TABLE ad_campaigns (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser   TEXT NOT NULL,
  format       ad_format NOT NULL,
  budget       NUMERIC(12,2) NOT NULL,
  spend        NUMERIC(12,2) DEFAULT 0,
  cpm          NUMERIC(8,2),
  status       campaign_status NOT NULL DEFAULT 'draft',
  targeting    JSONB DEFAULT '{}',
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_impressions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id  UUID NOT NULL REFERENCES ad_campaigns(id),
  user_id      UUID REFERENCES users(id),
  clicked      BOOLEAN DEFAULT FALSE,
  revenue      NUMERIC(8,4),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_impressions_campaign ON ad_impressions(campaign_id, created_at DESC);

-- ── ML Model Registry ─────────────────────────────────────────────────────────
CREATE TABLE ml_models (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id        TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  accuracy        NUMERIC(5,2),
  precision_score NUMERIC(5,2),
  recall_score    NUMERIC(5,2),
  f1_score        NUMERIC(5,2),
  drift           NUMERIC(5,4),
  last_trained_at TIMESTAMPTZ,
  prediction_count BIGINT DEFAULT 0,
  status          model_status DEFAULT 'healthy',
  mlflow_run_id   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── A/B Tests ─────────────────────────────────────────────────────────────────
CREATE TABLE ab_tests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  variant_a       TEXT NOT NULL,
  variant_b       TEXT NOT NULL,
  traffic_split   INTEGER NOT NULL DEFAULT 50,
  conversions_a   INTEGER DEFAULT 0,
  conversions_b   INTEGER DEFAULT 0,
  visitors_a      INTEGER DEFAULT 0,
  visitors_b      INTEGER DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'running',
  winner          CHAR(1),
  start_date      DATE NOT NULL,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Seed Data ─────────────────────────────────────────────────────────────────
INSERT INTO airlines (iata, name) VALUES
  ('AF', 'Air France'),
  ('DL', 'Delta Air Lines'),
  ('BA', 'British Airways'),
  ('EK', 'Emirates'),
  ('LH', 'Lufthansa'),
  ('UA', 'United Airlines'),
  ('VY', 'Vueling'),
  ('TG', 'Thai Airways'),
  ('JL', 'Japan Airlines');

INSERT INTO routes (origin, destination, popularity) VALUES
  ('CDG', 'JFK', 0.92),
  ('CDG', 'LHR', 0.88),
  ('CDG', 'DXB', 0.75),
  ('CDG', 'NRT', 0.70),
  ('CDG', 'BKK', 0.72),
  ('ORY', 'BCN', 0.65),
  ('CDG', 'GRU', 0.60);

INSERT INTO destinations (iata, city, country, region, latitude, longitude, quality_score, tags) VALUES
  ('JFK', 'New York',    'États-Unis',   'Amériques', 40.6413, -73.7781, 88, ARRAY['Business','Shopping','Culture']),
  ('BKK', 'Bangkok',     'Thaïlande',    'Asie',      13.6900, 100.7501, 92, ARRAY['Culture','Street Food']),
  ('DXB', 'Dubai',       'UAE',          'M-Orient',  25.2532, 55.3657,  79, ARRAY['Luxury','Shopping']),
  ('LIS', 'Lisbonne',    'Portugal',     'Europe',    38.7742, -9.1342,  90, ARRAY['Weekend','Pasteis']),
  ('NRT', 'Tokyo',       'Japon',        'Asie',      35.7653, 140.3858, 97, ARRAY['Culture','Gastronomie']),
  ('CMN', 'Marrakech',   'Maroc',        'Afrique',   31.6069, -8.0363,  84, ARRAY['Souks','Médina']);
