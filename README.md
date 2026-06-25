# Airlytics.ai — AI-Powered Flight Price Intelligence

> **Stop guessing. Start predicting.**
> Airlytics predicts flight price trends using LightGBM, Prophet, and LSTM models trained on real booking data.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Airlytics.ai Monorepo                       │
│                         (Turborepo)                                 │
├─────────────┬───────────────┬──────────────┬────────────────────────┤
│  apps/web   │   apps/api    │  services/ai │   packages/            │
│  Next.js 15 │   NestJS      │  FastAPI     │   ui, types            │
│  TypeScript │   Gateway +   │  ML Pipeline │                        │
│  App Router │   Microsvcs   │  LightGBM    │                        │
└──────┬──────┴──────┬────────┴──────┬───────┴────────────────────────┘
       │              │               │
       └──────────────┼───────────────┘
                      │
       ┌──────────────▼──────────────────────────────┐
       │              Data Layer                      │
       │  PostgreSQL · TimescaleDB · Redis · Kafka    │
       └─────────────────────────────────────────────┘
```

### Data Pipeline

```
Amadeus/Kiwi/Skyscanner API
         │
         ▼ (Kafka topic: raw-fares)
    Ingestion Service
         │
         ▼
   TimescaleDB (price time-series)
         │
         ▼
   Feature Store (Redis)
         │
         ▼
   ML Training (MLflow)
   ├── LightGBM  → trend classification (BUY/WAIT/RISK)
   ├── Prophet   → 21-day price forecast
   └── LSTM      → temporal pattern detection
         │
         ▼
   Scoring Engine → /predict endpoint
         │
         ▼
   Recommendation Engine → /deals, /assistant
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) · TypeScript · TailwindCSS |
| Animations | Framer Motion |
| Charts | Recharts |
| State | TanStack Query v5 |
| API Gateway | NestJS 10 |
| AI Service | FastAPI · Python 3.12 |
| ML Models | LightGBM · XGBoost · Prophet · LSTM (PyTorch) |
| ML Registry | MLflow |
| OLTP DB | PostgreSQL 16 |
| Time-series | TimescaleDB |
| Cache & Queue | Redis 7 |
| Event Bus | Apache Kafka |
| Infra | Docker · Kubernetes · Terraform |
| CI/CD | GitHub Actions |

---

## Monorepo Structure

```
Airlytics.ai/
├── apps/
│   ├── web/                    # Next.js 15 frontend
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (app)/      # Route group with sidebar layout
│   │       │   │   ├── predict/    # CORE — Price prediction
│   │       │   │   ├── compare/    # Multi-airline comparison
│   │       │   │   ├── assistant/  # AI chat interface
│   │       │   │   ├── explore/    # Destination discovery
│   │       │   │   ├── deals/      # Smart deals & error fares
│   │       │   │   ├── dashboard/  # Tracked flights + alerts
│   │       │   │   ├── ads/        # Ad network management
│   │       │   │   └── admin/      # AI monitoring + admin
│   │       │   └── globals.css     # Design tokens (CSS variables)
│   │       ├── components/
│   │       │   ├── layout/         # Sidebar, Topbar, ThemeProvider
│   │       │   ├── ui/             # Badge, Card, Button, Skeleton
│   │       │   └── predict/        # VerdictCard, PriceChart, etc.
│   │       └── lib/
│   │           ├── mock-data.ts    # Realistic seed data
│   │           └── utils.ts        # Utilities
│   └── api/                    # NestJS API gateway
│       └── src/
│           ├── main.ts
│           └── app.module.ts
├── services/
│   └── ai/                     # FastAPI AI service
│       ├── main.py             # POST /predict endpoint
│       └── requirements.txt
├── packages/
│   ├── types/                  # Shared TypeScript types
│   │   └── src/index.ts
│   └── ui/                     # Shared design system (WIP)
├── infra/
│   ├── db/
│   │   └── init.sql            # Full PostgreSQL schema
│   └── terraform/              # Infrastructure as code (WIP)
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## Design System

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-blue` | `#5b86ff` | Primary interactions, links |
| `--accent-green` | `#2bd9a0` | BUY signal, savings, positive |
| `--buy` | `#2bd9a0` | Price decrease / good time to buy |
| `--risk` | `#ff4e6a` | Price increase / high risk |
| `--wait` | `#f5a623` | Stable / wait for better moment |
| `--bg-base` | `#090c14` | App background |
| `--bg-panel` | `#0f1420` | Sidebar, topbar |
| `--bg-card` | `#141928` | Cards, panels |

### Typography
- **Space Grotesk** — All UI text, headings, labels
- **IBM Plex Mono** — All numbers, prices, percentages, IATA codes, flight numbers

### Verdict Semantics
```
↓ BUY     = Green  = Price likely to DROP   = Buy NOW
→ WAIT    = Amber  = Price STABLE           = Wait 3-7 more days
↑ RISK    = Red    = Price likely to RISE   = Buy ASAP or skip
```

---

## Modules

### 1. `/predict` — AI Price Prediction (CORE)
The flagship module. For any route + date + airline:
- **Verdict ring** — animated confidence ring showing BUY/WAIT/RISK with probability
- **Price chart** — 90-day history + 21-day forecast with confidence band
- **Feature importance** — breakdown of ML features driving the prediction
- **Best buy window** — calendar grid highlighting optimal purchase days
- **Track panel** — set price alerts via email or push

### 2. `/compare` — Multi-airline Comparison
- 7-day price calendar with min price highlighted
- Flight results sorted by "Smart" (IA-ranked), price, or departure time
- Each flight card shows its own prediction badge
- Expandable rows with full flight details

### 3. `/assistant` — AI Contextual Chat
- Chat interface powered by AI + real-time prediction data
- Understands flight queries, destination questions, "where can I go for €X?"
- Responds with verdict chips: WAIT / EXPLORER / ACT NOW
- Suggested quick questions

### 4. `/explore` — Destination Discovery
- Budget slider filtering destinations in real-time
- Region + trend filters
- Destination cards with sparkline price history, quality score, weather
- Sorted by quality/price ratio

### 5. `/deals` — Smart Deals
- Error fares, rare opportunities, price drops, flash sales
- Live countdown timer per deal
- AI confidence score on each deal
- Urgency signals (seats left, expiry)

### 6. `/dashboard` — Tracked Flights Hub
- All tracked flights with sparkline price trends
- Color-coded variation percentages
- Alert feed with unread indicators
- Key stats: savings, model accuracy, active alerts

### 7. `/ads` — Ad Network Management
- Campaign table: impressions, clicks, CTR, spend vs budget, CPM, status
- Inventory view: fill rate per format with bar chart
- 5 ad formats: sponsored flight, native destination, assistant suggestion, newsletter banner, dashboard banner
- AI targeting by route, budget range, detected user intent

### 8. `/admin` — AI Operations
- Radar charts per model (accuracy, precision, recall, F1, confidence)
- Drift monitoring with color alerts
- Recent prediction logs with actual outcomes
- A/B test results with conversion rates

---

## API Endpoints

### AI Service (FastAPI — port 8000)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health + model list |
| `POST` | `/predict` | Price prediction for a route |

```json
// POST /predict
{
  "route": "CDG-JFK",
  "departure_date": "2026-07-16",
  "airline": "AF",
  "cabin_class": "economy"
}

// Response
{
  "route": "CDG-JFK",
  "trend": "BUY",
  "probability": 81.0,
  "confidence": 87.0,
  "current_price": 462,
  "expected_delta": -12.4,
  "best_buy_window": {
    "start": "2026-06-26",
    "end": "2026-06-30",
    "expected_price": 406,
    "saving": 56
  },
  "feature_contributions": [...],
  "model_version": "lgbm-v2.4",
  "generated_at": "2026-06-23T..."
}
```

---

## Quick Start

### Prerequisites
- Node.js ≥ 20
- Docker & Docker Compose
- Python 3.12 (for AI service)

### Development

```bash
# Install dependencies
npm install

# Start full stack (with Docker)
docker compose up -d postgres redis kafka

# Start all apps in dev mode
npm run dev
# → Web:  http://localhost:3000
# → API:  http://localhost:3001
# → AI:   http://localhost:8000 (python)

# Or run web only (uses mock data)
cd apps/web && npm run dev
```

### AI Service only

```bash
cd services/ai
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Monetisation

| Tier | Features |
|------|---------|
| **FREE** | Comparateur + 5 prédictions/mois + 1 vol suivi |
| **PRO €9.99/mo** | IA complète, alertes illimitées, destinations premium |
| **BUSINESS €99/mo** | API Travel Intelligence, analytics B2B, white-label |
| **Publicité** | Régie pub native — vols sponsorisés, destinations natives, suggestions assistant |

---

## Environment Variables

```env
# apps/web
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000

# apps/api
DATABASE_URL=postgresql://airlytics:secret@localhost:5432/airlytics
REDIS_URL=redis://localhost:6379
KAFKA_BROKERS=localhost:9092
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# services/ai
DATABASE_URL=postgresql://airlytics:secret@localhost:5432/airlytics
TIMESCALE_URL=postgresql://airlytics:secret@localhost:5433/airlytics_ts
MLFLOW_TRACKING_URI=http://localhost:5000
AMADEUS_API_KEY=your_key
AMADEUS_API_SECRET=your_secret
```

---

## Roadmap

- [ ] Real data ingestion (Amadeus API → Kafka)
- [ ] MLflow model training pipeline
- [ ] TimescaleDB continuous aggregates
- [ ] NestJS microservices (predict, alerts, users)
- [ ] Stripe integration (PRO/BUSINESS plans)
- [ ] Kubernetes manifests (Helm charts)
- [ ] Terraform modules (AWS EKS + RDS + ElastiCache)
- [ ] Mobile app (React Native)
- [ ] Browser extension for price tracking

---

*Built with Next.js 15 · NestJS · FastAPI · LightGBM · TimescaleDB · Kafka*
