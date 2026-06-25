"""Airlytics AI Service — FastAPI endpoint for price prediction."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, timedelta
from typing import Optional
import random
import math

app = FastAPI(
    title="Airlytics AI Service",
    description="Flight price prediction using LightGBM + Prophet",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    route: str           # e.g. "CDG-JFK"
    departure_date: date
    airline: Optional[str] = None
    cabin_class: str = "economy"


class FeatureContribution(BaseModel):
    name: str
    value: float
    impact: str
    description: str


class BestBuyWindow(BaseModel):
    start: str
    end: str
    expected_price: float
    saving: float


class PredictResponse(BaseModel):
    route: str
    trend: str               # BUY | WAIT | RISK
    probability: float
    confidence: float
    current_price: float
    expected_delta: float
    best_buy_window: BestBuyWindow
    feature_contributions: list[FeatureContribution]
    model_version: str = "lgbm-v2.4"
    generated_at: str


# ─── Feature Engineering ──────────────────────────────────────────────────────

def compute_features(route: str, departure_date: date, airline: Optional[str]) -> dict:
    today = date.today()
    days_before = (departure_date - today).days

    # Seasonality: July/August is peak
    month = departure_date.month
    seasonality = 1.0 + 0.3 * math.sin((month - 3) * math.pi / 6)

    # Route popularity (simplified)
    popular_routes = {"CDG-JFK", "CDG-LHR", "CDG-DXB", "CDG-NRT"}
    route_popularity = 0.9 if route in popular_routes else 0.5

    # Booking window score (optimum ~21-35 days out)
    if 21 <= days_before <= 35:
        booking_window_score = 1.0
    elif 14 <= days_before < 21 or 35 < days_before <= 56:
        booking_window_score = 0.7
    else:
        booking_window_score = 0.3

    return {
        "days_before_departure": days_before,
        "seasonality": seasonality,
        "route_popularity": route_popularity,
        "booking_window_score": booking_window_score,
        "search_volume": random.uniform(0.3, 0.9),
        "volatility_score": random.uniform(0.1, 0.5),
        "fuel_cost_index": random.uniform(0.85, 1.15),
        "holiday_proximity": 0.2 if days_before < 14 else 0.0,
    }


def mock_predict(features: dict, current_price: float) -> tuple[str, float, float, float]:
    """Simulate model inference. In production: lgbm_model.predict(features_array)"""
    score = (
        features["booking_window_score"] * 0.35
        + (1 - features["route_popularity"]) * 0.20
        + (1 - features["seasonality"] / 1.3) * 0.20
        - features["fuel_cost_index"] * 0.15
        + (1 - features["search_volume"]) * 0.10
    )

    if score > 0.55:
        trend, probability = "BUY", min(95, 50 + score * 80)
        expected_delta = -(score * 18)
    elif score > 0.35:
        trend, probability = "WAIT", min(85, 40 + score * 60)
        expected_delta = (0.55 - score) * 10
    else:
        trend, probability = "RISK", min(90, 40 + (0.55 - score) * 80)
        expected_delta = (0.55 - score) * 30

    confidence = probability * random.uniform(0.88, 1.0)
    return trend, round(probability, 1), round(confidence, 1), round(expected_delta, 1)


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "models": ["lgbm-v2.4", "prophet-v1.8", "lstm-v3.1"]}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if (req.departure_date - date.today()).days < 1:
        raise HTTPException(400, "Departure date must be in the future")

    # Base price lookup (mock)
    base_prices = {
        "CDG-JFK": 462, "CDG-LHR": 98, "CDG-DXB": 524,
        "CDG-NRT": 680, "CDG-BKK": 394,
    }
    current_price = base_prices.get(req.route, 350) * random.uniform(0.92, 1.08)

    features = compute_features(req.route, req.departure_date, req.airline)
    trend, probability, confidence, expected_delta = mock_predict(features, current_price)

    # Best buy window
    best_start = date.today() + timedelta(days=3)
    best_end   = date.today() + timedelta(days=7)
    expected_price = current_price * (1 + expected_delta / 100)
    saving = current_price - expected_price

    feature_contributions = [
        FeatureContribution(
            name="Jours avant départ",
            value=0.34 if 21 <= features["days_before_departure"] <= 35 else -0.15,
            impact="positive" if 21 <= features["days_before_departure"] <= 35 else "negative",
            description=f"{features['days_before_departure']} jours — {'zone optimale' if 21 <= features['days_before_departure'] <= 35 else 'hors zone optimale'}",
        ),
        FeatureContribution(
            name="Fenêtre de réservation",
            value=features["booking_window_score"] * 0.4,
            impact="positive" if features["booking_window_score"] > 0.6 else "negative",
            description=f"Score fenêtre : {features['booking_window_score']:.2f}",
        ),
        FeatureContribution(
            name="Saisonnalité",
            value=(1.3 - features["seasonality"]) * 0.3,
            impact="positive" if features["seasonality"] < 1.1 else "negative",
            description=f"Indice saisonnalité : {features['seasonality']:.2f}",
        ),
        FeatureContribution(
            name="Carburant",
            value=-(features["fuel_cost_index"] - 1.0) * 0.5,
            impact="negative" if features["fuel_cost_index"] > 1.0 else "positive",
            description=f"Indice carburant : {features['fuel_cost_index']:.2f}",
        ),
        FeatureContribution(
            name="Volume de recherche",
            value=(1 - features["search_volume"]) * 0.2,
            impact="positive" if features["search_volume"] < 0.5 else "negative",
            description=f"Concurrence actuelle : {features['search_volume']:.2f}",
        ),
    ]

    from datetime import datetime
    return PredictResponse(
        route=req.route,
        trend=trend,
        probability=probability,
        confidence=confidence,
        current_price=round(current_price, 0),
        expected_delta=expected_delta,
        best_buy_window=BestBuyWindow(
            start=best_start.isoformat(),
            end=best_end.isoformat(),
            expected_price=round(expected_price, 0),
            saving=round(saving, 0),
        ),
        feature_contributions=feature_contributions,
        generated_at=datetime.utcnow().isoformat(),
    )
