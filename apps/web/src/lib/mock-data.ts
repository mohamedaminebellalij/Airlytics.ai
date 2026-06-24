import type {
  PredictionResult, Flight, PriceCalendarDay, Deal, Destination,
  TrackedFlight, Alert, AdCampaign, AdInventory, ModelMetrics,
  PredictionLog, ABTest, ChatMessage,
} from '@airlytics/types';
import { generatePriceHistory, generateForecast, addDays } from './utils';

// ─── Prediction Mock ──────────────────────────────────────────────────────────

const history = generatePriceHistory(462, 90, 0.035, -0.001);
const lastPrice = history[history.length - 1].price;
const forecast = generateForecast(lastPrice, 21, -1, 0.03);

export const mockPrediction: PredictionResult = {
  route: 'CDG → JFK',
  origin: 'CDG',
  destination: 'JFK',
  departureDate: addDays(new Date(), 23).toISOString().split('T')[0],
  airline: 'Air France',
  trend: 'BUY',
  probability: 81,
  confidence: 87,
  currentPrice: lastPrice,
  expectedDelta: -12.4,
  bestBuyWindow: {
    start: addDays(new Date(), 3).toISOString().split('T')[0],
    end:   addDays(new Date(), 7).toISOString().split('T')[0],
    expectedPrice: Math.round(lastPrice * 0.88),
    saving: Math.round(lastPrice * 0.124),
  },
  featureContributions: [
    { name: 'Jours avant départ',     value: 0.34,  impact: 'positive', description: '23 jours — zone optimale d\'achat' },
    { name: 'Fenêtre de réservation', value: 0.22,  impact: 'positive', description: 'Historiquement rentable 3–8 sem. à l\'avance' },
    { name: 'Saisonnalité',           value: 0.18,  impact: 'positive', description: 'Période hors-saison haute' },
    { name: 'Carburant (kérosène)',   value: -0.12, impact: 'negative', description: 'Légère hausse du prix du carburant' },
    { name: 'Volume de recherche',    value: 0.09,  impact: 'positive', description: 'Faible concurrence sur la route' },
    { name: 'Popularité route',       value: -0.07, impact: 'negative', description: 'Route très demandée CDG–JFK' },
    { name: 'Vacances & jours fériés',value: 0.05,  impact: 'positive', description: 'Pas de pic de congé imminent' },
    { name: 'Indice météo dest.',     value: 0.03,  impact: 'neutral',  description: 'Météo stable à NYC' },
  ],
  priceHistory: history,
  priceForecast: forecast,
  generatedAt: new Date().toISOString(),
};

// ─── Flights (Compare) ────────────────────────────────────────────────────────

export const mockFlights: Flight[] = [
  {
    id: 'f1', airline: 'Air France', airlineCode: 'AF', flightNumber: 'AF 006',
    origin: 'CDG', destination: 'JFK',
    departure: addDays(new Date(), 23).toISOString().split('T')[0] + 'T10:30:00',
    arrival:   addDays(new Date(), 23).toISOString().split('T')[0] + 'T13:15:00',
    duration: '8h45', stops: 0, price: lastPrice, currency: 'EUR',
    trend: 'BUY', probability: 81, expectedDelta: -12.4,
    cabinClass: 'economy', seatsLeft: 4,
  },
  {
    id: 'f2', airline: 'Delta', airlineCode: 'DL', flightNumber: 'DL 264',
    origin: 'CDG', destination: 'JFK',
    departure: addDays(new Date(), 23).toISOString().split('T')[0] + 'T08:00:00',
    arrival:   addDays(new Date(), 23).toISOString().split('T')[0] + 'T10:55:00',
    duration: '8h55', stops: 0, price: Math.round(lastPrice * 1.08), currency: 'EUR',
    trend: 'WAIT', probability: 62, expectedDelta: 5.2,
    cabinClass: 'economy', seatsLeft: 12,
  },
  {
    id: 'f3', airline: 'British Airways', airlineCode: 'BA', flightNumber: 'BA 177',
    origin: 'CDG', destination: 'JFK',
    departure: addDays(new Date(), 23).toISOString().split('T')[0] + 'T14:20:00',
    arrival:   addDays(new Date(), 23).toISOString().split('T')[0] + 'T17:55:00',
    duration: '9h35', stops: 1, price: Math.round(lastPrice * 0.92), currency: 'EUR',
    trend: 'BUY', probability: 74, expectedDelta: -8.1,
    cabinClass: 'economy',
  },
  {
    id: 'f4', airline: 'United', airlineCode: 'UA', flightNumber: 'UA 990',
    origin: 'CDG', destination: 'JFK',
    departure: addDays(new Date(), 23).toISOString().split('T')[0] + 'T17:45:00',
    arrival:   addDays(new Date(), 23).toISOString().split('T')[0] + 'T20:30:00',
    duration: '8h45', stops: 0, price: Math.round(lastPrice * 0.97), currency: 'EUR',
    trend: 'RISK', probability: 71, expectedDelta: 9.3,
    cabinClass: 'economy', seatsLeft: 2,
  },
  {
    id: 'f5', airline: 'Corsair', airlineCode: 'SS', flightNumber: 'SS 736',
    origin: 'CDG', destination: 'JFK',
    departure: addDays(new Date(), 24).toISOString().split('T')[0] + 'T23:00:00',
    arrival:   addDays(new Date(), 25).toISOString().split('T')[0] + 'T02:30:00',
    duration: '9h30', stops: 0, price: Math.round(lastPrice * 0.78), currency: 'EUR',
    trend: 'BUY', probability: 88, expectedDelta: -15.2,
    cabinClass: 'economy', seatsLeft: 8,
  },
];

// Price calendar (7 days)
export const mockCalendar: PriceCalendarDay[] = Array.from({ length: 7 }, (_, i) => {
  const price = Math.round(lastPrice * (0.82 + Math.random() * 0.36));
  const isLowest = i === 2;
  return {
    date: addDays(new Date(), i + 21).toISOString().split('T')[0],
    price,
    trend: isLowest ? 'BUY' : price < lastPrice * 0.95 ? 'BUY' : price > lastPrice * 1.05 ? 'RISK' : 'WAIT',
    isLowest,
  };
});

// ─── Deals ────────────────────────────────────────────────────────────────────

export const mockDeals: Deal[] = [
  {
    id: 'd1', type: 'error_fare', origin: 'CDG', destination: 'NYC', destinationName: 'New York',
    airline: 'American Airlines', originalPrice: 1240, dealPrice: 287, discount: 77,
    expiresAt: addDays(new Date(), 0).toISOString().replace(/T.*/, 'T23:59:00'),
    isVerified: true, probability: 94, seatsLeft: 3,
    tags: ['Erreur tarifaire', 'Business', 'Urgent'],
  },
  {
    id: 'd2', type: 'price_drop', origin: 'CDG', destination: 'BKK', destinationName: 'Bangkok',
    airline: 'Thai Airways', originalPrice: 680, dealPrice: 394, discount: 42,
    expiresAt: addDays(new Date(), 2).toISOString().replace(/T.*/, 'T18:00:00'),
    isVerified: true, probability: 82, seatsLeft: 11,
    tags: ['Baisse prix', 'Low-cost', 'Asie'],
  },
  {
    id: 'd3', type: 'rare_opportunity', origin: 'ORY', destination: 'DPS', destinationName: 'Bali',
    airline: 'Air France', originalPrice: 890, dealPrice: 498, discount: 44,
    expiresAt: addDays(new Date(), 1).toISOString().replace(/T.*/, 'T12:00:00'),
    isVerified: true, probability: 77,
    tags: ['Opportunité rare', 'Direct', 'Bali'],
  },
  {
    id: 'd4', type: 'flash_sale', origin: 'CDG', destination: 'DXB', destinationName: 'Dubaï',
    airline: 'Emirates', originalPrice: 720, dealPrice: 430, discount: 40,
    expiresAt: addDays(new Date(), 3).toISOString().replace(/T.*/, 'T08:00:00'),
    isVerified: true, probability: 69, seatsLeft: 6,
    tags: ['Flash Sale', 'Business fav.', 'Proche-Orient'],
  },
  {
    id: 'd5', type: 'price_drop', origin: 'CDG', destination: 'GRU', destinationName: 'São Paulo',
    airline: 'LATAM', originalPrice: 840, dealPrice: 521, discount: 38,
    expiresAt: addDays(new Date(), 5).toISOString().replace(/T.*/, 'T23:59:00'),
    isVerified: false, probability: 61,
    tags: ['Amérique du Sud', 'Direct'],
  },
  {
    id: 'd6', type: 'error_fare', origin: 'LYS', destination: 'JNB', destinationName: 'Johannesburg',
    airline: 'South African Airways', originalPrice: 1100, dealPrice: 299, discount: 73,
    expiresAt: addDays(new Date(), 0).toISOString().replace(/T.*/, 'T20:00:00'),
    isVerified: true, probability: 91, seatsLeft: 1,
    tags: ['Erreur tarifaire', 'Afrique', 'Urgent'],
  },
];

// ─── Destinations ─────────────────────────────────────────────────────────────

export const mockDestinations: Destination[] = [
  { iata:'JFK', city:'New York',     country:'États-Unis',  region:'Amériques', price:462,  qualityScore:88, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:22, trend:'BUY',  priceHistory:generatePriceHistory(462,30), tags:['Populaire','Business','Shopping'], lat:40.7,  lng:-74.0 },
  { iata:'BKK', city:'Bangkok',      country:'Thaïlande',   region:'Asie',      price:394,  qualityScore:92, weather:'Tropical',    weatherIcon:'🌤️', temperature:32, trend:'BUY',  priceHistory:generatePriceHistory(394,30), tags:['Culture','Street Food','Pas cher'], lat:13.7, lng:100.5 },
  { iata:'DPS', city:'Bali',         country:'Indonésie',   region:'Asie',      price:498,  qualityScore:95, weather:'Chaud',       weatherIcon:'☀️',  temperature:29, trend:'WAIT', priceHistory:generatePriceHistory(498,30), tags:['Plages','Yoga','Nature'], lat:-8.4,  lng:115.2 },
  { iata:'DXB', city:'Dubaï',        country:'Émirats',     region:'M-Orient',  price:430,  qualityScore:79, weather:'Chaud sec',   weatherIcon:'🌡️', temperature:38, trend:'BUY',  priceHistory:generatePriceHistory(430,30), tags:['Luxe','Shopping','Layover'], lat:25.2,  lng:55.3 },
  { iata:'NRT', city:'Tokyo',        country:'Japon',       region:'Asie',      price:680,  qualityScore:97, weather:'Nuageux',     weatherIcon:'⛅',  temperature:18, trend:'WAIT', priceHistory:generatePriceHistory(680,30), tags:['Culture','Gastronomie','Sakura'], lat:35.7,  lng:139.7 },
  { iata:'GRU', city:'São Paulo',    country:'Brésil',      region:'Amériques', price:521,  qualityScore:72, weather:'Pluvieux',    weatherIcon:'🌧️', temperature:20, trend:'RISK', priceHistory:generatePriceHistory(521,30), tags:['Carnaval','Fête','Diversité'], lat:-23.5, lng:-46.6 },
  { iata:'RAK', city:'Marrakech',    country:'Maroc',       region:'Afrique',   price:119,  qualityScore:88, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:31, trend:'BUY',  priceHistory:generatePriceHistory(119,30), tags:['Médina','Souks','Gastronomie'], lat:31.6,  lng:-8.0 },
  { iata:'LIS', city:'Lisbonne',     country:'Portugal',    region:'Europe',    price:98,   qualityScore:90, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:26, trend:'BUY',  priceHistory:generatePriceHistory(98,30),  tags:['Week-end','Pastel de nata','Trams'], lat:38.7,  lng:-9.1 },
  { iata:'ICN', city:'Séoul',        country:'Corée du Sud',region:'Asie',      price:590,  qualityScore:93, weather:'Frais',       weatherIcon:'🍃',  temperature:14, trend:'WAIT', priceHistory:generatePriceHistory(590,30), tags:['K-pop','Technologie','Cuisine'], lat:37.6,  lng:126.9 },
  { iata:'MEX', city:'Mexico',       country:'Mexique',     region:'Amériques', price:480,  qualityScore:76, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:24, trend:'BUY',  priceHistory:generatePriceHistory(480,30), tags:['Aztèques','Cuisine','Plage'], lat:19.4,  lng:-99.1 },
  { iata:'SYD', city:'Sydney',       country:'Australie',   region:'Océanie',   price:1050, qualityScore:89, weather:'Doux',        weatherIcon:'🌤️', temperature:19, trend:'RISK', priceHistory:generatePriceHistory(1050,30),tags:['Opéra','Plages','Wildlife'], lat:-33.9, lng:151.2 },
  { iata:'CPT', city:'Le Cap',       country:'Afrique du S.',region:'Afrique',  price:680,  qualityScore:87, weather:'Frais',       weatherIcon:'⛅',  temperature:16, trend:'WAIT', priceHistory:generatePriceHistory(680,30), tags:['Safari','Table Mountain','Vin'], lat:-33.9, lng:18.4 },
  { iata:'BCN', city:'Barcelone',    country:'Espagne',     region:'Europe',    price:79,   qualityScore:91, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:28, trend:'BUY',  priceHistory:generatePriceHistory(79,30),  tags:['Plage','Architecture','Tapas'], lat:41.4,  lng:2.2 },
  { iata:'AMS', city:'Amsterdam',    country:'Pays-Bas',    region:'Europe',    price:89,   qualityScore:86, weather:'Nuageux',     weatherIcon:'⛅',  temperature:18, trend:'WAIT', priceHistory:generatePriceHistory(89,30),  tags:['Canaux','Musées','Vélo'], lat:52.4,  lng:4.9 },
  { iata:'FCO', city:'Rome',         country:'Italie',      region:'Europe',    price:112,  qualityScore:89, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:29, trend:'BUY',  priceHistory:generatePriceHistory(112,30), tags:['Histoire','Gastronomie','Art'], lat:41.8,  lng:12.5 },
  { iata:'PRG', city:'Prague',       country:'Rép. tchèque',region:'Europe',    price:94,   qualityScore:85, weather:'Doux',        weatherIcon:'🌤️', temperature:20, trend:'BUY',  priceHistory:generatePriceHistory(94,30),  tags:['Week-end','Architecture','Bière'], lat:50.1,  lng:14.3 },
  { iata:'ATH', city:'Athènes',      country:'Grèce',       region:'Europe',    price:148,  qualityScore:87, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:32, trend:'BUY',  priceHistory:generatePriceHistory(148,30), tags:['Mythologie','Mer','Histoire'], lat:37.9,  lng:23.7 },
  { iata:'IST', city:'Istanbul',     country:'Turquie',     region:'M-Orient',  price:145,  qualityScore:88, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:26, trend:'BUY',  priceHistory:generatePriceHistory(145,30), tags:['Bosphore','Culture','Gastronomie'], lat:41.0, lng:28.9 },
  { iata:'SIN', city:'Singapour',    country:'Singapour',   region:'Asie',      price:560,  qualityScore:94, weather:'Tropical',    weatherIcon:'🌦️', temperature:30, trend:'WAIT', priceHistory:generatePriceHistory(560,30), tags:['Modernité','Street Food','Propre'], lat:1.4,  lng:103.8 },
  { iata:'KUL', city:'Kuala Lumpur', country:'Malaisie',    region:'Asie',      price:480,  qualityScore:82, weather:'Tropical',    weatherIcon:'🌧️', temperature:31, trend:'BUY',  priceHistory:generatePriceHistory(480,30), tags:['Tour Pétronas','Diversité','Pas cher'], lat:3.1, lng:101.7 },
  { iata:'HKG', city:'Hong Kong',    country:'Chine RAS',   region:'Asie',      price:620,  qualityScore:90, weather:'Chaud',       weatherIcon:'🌤️', temperature:28, trend:'WAIT', priceHistory:generatePriceHistory(620,30), tags:['Gratte-ciels','Shopping','Dim Sum'], lat:22.3, lng:114.2 },
  { iata:'CMN', city:'Casablanca',   country:'Maroc',       region:'Afrique',   price:98,   qualityScore:78, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:25, trend:'BUY',  priceHistory:generatePriceHistory(98,30),  tags:['Mosquée','Médina','Hassan II'], lat:33.6,  lng:-7.6 },
  { iata:'TUN', city:'Tunis',        country:'Tunisie',     region:'Afrique',   price:129,  qualityScore:75, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:30, trend:'BUY',  priceHistory:generatePriceHistory(129,30), tags:['Méditerranée','Médina','Pas cher'], lat:36.9, lng:10.2 },
  { iata:'NBO', city:'Nairobi',      country:'Kenya',       region:'Afrique',   price:520,  qualityScore:80, weather:'Doux',        weatherIcon:'🌤️', temperature:22, trend:'WAIT', priceHistory:generatePriceHistory(520,30), tags:['Safari','Faune','Nature'], lat:-1.3,   lng:36.8 },
  { iata:'LAX', city:'Los Angeles',  country:'États-Unis',  region:'Amériques', price:540,  qualityScore:83, weather:'Ensoleillé',  weatherIcon:'☀️',  temperature:25, trend:'BUY',  priceHistory:generatePriceHistory(540,30), tags:['Hollywood','Plages','Culture'], lat:33.9,  lng:-118.4 },
  { iata:'MIA', city:'Miami',        country:'États-Unis',  region:'Amériques', price:510,  qualityScore:81, weather:'Tropical',    weatherIcon:'☀️',  temperature:29, trend:'WAIT', priceHistory:generatePriceHistory(510,30), tags:['Plages','Nightlife','Art Deco'], lat:25.8,  lng:-80.3 },
  { iata:'CUN', city:'Cancún',       country:'Mexique',     region:'Amériques', price:420,  qualityScore:84, weather:'Tropical',    weatherIcon:'☀️',  temperature:30, trend:'BUY',  priceHistory:generatePriceHistory(420,30), tags:['Plages','Ruines Maya','Tout inclus'], lat:21.0, lng:-86.9 },
  { iata:'VIE', city:'Vienne',       country:'Autriche',    region:'Europe',    price:118,  qualityScore:88, weather:'Nuageux',     weatherIcon:'⛅',  temperature:19, trend:'WAIT', priceHistory:generatePriceHistory(118,30), tags:['Musique','Architecture','Café'], lat:48.1,  lng:16.6 },
  { iata:'BUD', city:'Budapest',     country:'Hongrie',     region:'Europe',    price:87,   qualityScore:86, weather:'Doux',        weatherIcon:'🌤️', temperature:22, trend:'BUY',  priceHistory:generatePriceHistory(87,30),  tags:['Bains','Danube','Budget'], lat:47.5,  lng:19.1 },
  { iata:'MCT', city:'Muscat',       country:'Oman',        region:'M-Orient',  price:348,  qualityScore:82, weather:'Chaud sec',   weatherIcon:'🌡️', temperature:35, trend:'WAIT', priceHistory:generatePriceHistory(348,30), tags:['Désert','Luxe','Authentique'], lat:23.6,  lng:58.6 },
];

// ─── Dashboard — Tracked Flights ──────────────────────────────────────────────

export const mockTrackedFlights: TrackedFlight[] = [
  {
    id:'t1', route:'CDG → JFK', origin:'CDG', destination:'JFK',
    departureDate: addDays(new Date(), 23).toISOString().split('T')[0],
    airline:'Air France', currentPrice:462, variation:-8.4,
    trend:'BUY', probability:81, alertActive:true, alertThreshold:440,
    sparkline:[510,502,498,490,481,474,470,462],
    trackedSince: addDays(new Date(), -14).toISOString(),
  },
  {
    id:'t2', route:'ORY → BCN', origin:'ORY', destination:'BCN',
    departureDate: addDays(new Date(), 45).toISOString().split('T')[0],
    airline:'Vueling', currentPrice:89, variation:3.2,
    trend:'WAIT', probability:57, alertActive:false,
    sparkline:[82,85,84,87,89,88,90,89],
    trackedSince: addDays(new Date(), -7).toISOString(),
  },
  {
    id:'t3', route:'CDG → DXB', origin:'CDG', destination:'DXB',
    departureDate: addDays(new Date(), 60).toISOString().split('T')[0],
    airline:'Emirates', currentPrice:524, variation:11.7,
    trend:'RISK', probability:76, alertActive:true, alertThreshold:480,
    sparkline:[470,479,485,495,506,512,518,524],
    trackedSince: addDays(new Date(), -5).toISOString(),
  },
  {
    id:'t4', route:'CDG → BKK', origin:'CDG', destination:'BKK',
    departureDate: addDays(new Date(), 90).toISOString().split('T')[0],
    airline:'Thai Airways', currentPrice:394, variation:-15.1,
    trend:'BUY', probability:88, alertActive:true, alertThreshold:420,
    sparkline:[465,458,445,432,425,410,400,394],
    trackedSince: addDays(new Date(), -21).toISOString(),
  },
];

export const mockAlerts: Alert[] = [
  { id:'a1', type:'price_drop', message:'CDG→JFK baisse de 8.4% — Moment idéal d\'acheter', route:'CDG→JFK', delta:-8.4, trend:'BUY',  createdAt: addDays(new Date(),-0.1).toISOString(), isRead:false },
  { id:'a2', type:'buy_signal', message:'Signal IA fort : CDG→BKK — Probabilité 88%',       route:'CDG→BKK', trend:'BUY',  createdAt: addDays(new Date(),-1).toISOString(),   isRead:false },
  { id:'a3', type:'expiring',   message:'Deal Bangkok expire dans 3h — 394€ seulement',     route:'CDG→BKK', createdAt: addDays(new Date(),-2).toISOString(),   isRead:true },
  { id:'a4', type:'prediction_update', message:'CDG→DXB hausse détectée — Risque élevé',   route:'CDG→DXB', trend:'RISK', createdAt: addDays(new Date(),-3).toISOString(),   isRead:true },
];

// ─── Ads ──────────────────────────────────────────────────────────────────────

export const mockCampaigns: AdCampaign[] = [
  { id:'c1', advertiser:'Emirates',       format:'sponsored_flight',      impressions:128400, clicks:2142, ctr:1.67, spend:4820, budget:10000, cpm:37.5, status:'active',  startDate:'2026-06-01', endDate:'2026-06-30', targeting:{ routes:['CDG-DXB','ORY-DXB'], intent:['luxury','business'] } },
  { id:'c2', advertiser:'Booking.com',    format:'native_destination',    impressions:342000, clicks:8550, ctr:2.50, spend:9420, budget:12000, cpm:27.5, status:'active',  startDate:'2026-06-01', endDate:'2026-07-31', targeting:{ budgetRange:[300,800] } },
  { id:'c3', advertiser:'TUI France',     format:'newsletter_banner',     impressions:89200,  clicks:1250, ctr:1.40, spend:2140, budget:3000,  cpm:24.0, status:'paused',  startDate:'2026-05-15', endDate:'2026-06-20', targeting:{ intent:['family','holiday'] } },
  { id:'c4', advertiser:'Airbnb',         format:'assistant_suggestion',  impressions:52100,  clicks:1820, ctr:3.49, spend:3210, budget:5000,  cpm:61.6, status:'active',  startDate:'2026-06-10', endDate:'2026-07-10', targeting:{ intent:['explorer','leisure'] } },
  { id:'c5', advertiser:'Qatar Airways',  format:'dashboard_banner',      impressions:210000, clicks:3150, ctr:1.50, spend:5880, budget:8000,  cpm:28.0, status:'active',  startDate:'2026-06-01', endDate:'2026-06-30', targeting:{ routes:['CDG-DOH','ORY-DOH'] } },
  { id:'c6', advertiser:'Europcar',       format:'native_destination',    impressions:64000,  clicks:512,  ctr:0.80, spend:896,  budget:2000,  cpm:14.0, status:'draft',   startDate:'2026-07-01', endDate:'2026-07-31', targeting:{} },
];

export const mockInventory: AdInventory[] = [
  { format:'sponsored_flight',     available:500,  sold:342, fillRate:68.4, avgCpm:38.2, revenue:13050 },
  { format:'native_destination',   available:1200, sold:896, fillRate:74.7, avgCpm:28.8, revenue:25804 },
  { format:'assistant_suggestion', available:300,  sold:271, fillRate:90.3, avgCpm:62.0, revenue:16802 },
  { format:'newsletter_banner',    available:80,   sold:48,  fillRate:60.0, avgCpm:24.5, revenue:1176  },
  { format:'dashboard_banner',     available:450,  sold:310, fillRate:68.9, avgCpm:29.0, revenue:8990  },
];

// ─── Admin / Model Metrics ────────────────────────────────────────────────────

export const mockModelMetrics: ModelMetrics[] = [
  { modelId:'lgbm-v2.4', name:'LightGBM Classifieur',  accuracy:84.2, precision:82.7, recall:86.1, f1:84.4, drift:0.08, lastTrained:'2026-06-20', predictionCount:42840, avgConfidence:81.3, status:'healthy' },
  { modelId:'prophet-v1.8', name:'Prophet Prévision',  accuracy:78.9, precision:77.2, recall:80.4, f1:78.8, drift:0.14, lastTrained:'2026-06-18', predictionCount:38210, avgConfidence:74.6, status:'warning' },
  { modelId:'lstm-v3.1', name:'LSTM Séries Temp.',     accuracy:81.4, precision:80.1, recall:82.8, f1:81.4, drift:0.06, lastTrained:'2026-06-21', predictionCount:29480, avgConfidence:79.1, status:'healthy' },
  { modelId:'xgb-v1.2',  name:'XGBoost Ensemble',     accuracy:85.7, precision:84.2, recall:87.3, f1:85.7, drift:0.11, lastTrained:'2026-06-19', predictionCount:51200, avgConfidence:83.8, status:'healthy' },
];

export const mockPredictionLogs: PredictionLog[] = [
  { id:'p1', route:'CDG→JFK', requestedAt: addDays(new Date(),-0.01).toISOString(), trend:'BUY',  probability:81, confidence:87, actualOutcome:'BUY',  correct:true,  latencyMs:142, userId:'u1' },
  { id:'p2', route:'ORY→BCN', requestedAt: addDays(new Date(),-0.05).toISOString(), trend:'WAIT', probability:57, confidence:63, latencyMs:98 },
  { id:'p3', route:'CDG→DXB', requestedAt: addDays(new Date(),-0.1).toISOString(),  trend:'RISK', probability:76, confidence:71, actualOutcome:'RISK', correct:true,  latencyMs:203, userId:'u2' },
  { id:'p4', route:'CDG→NRT', requestedAt: addDays(new Date(),-0.3).toISOString(),  trend:'BUY',  probability:68, confidence:74, actualOutcome:'WAIT', correct:false, latencyMs:177, userId:'u3' },
  { id:'p5', route:'LYS→AMS', requestedAt: addDays(new Date(),-1).toISOString(),    trend:'BUY',  probability:82, confidence:88, actualOutcome:'BUY',  correct:true,  latencyMs:124 },
];

export const mockABTests: ABTest[] = [
  { id:'ab1', name:'Verdict Card — Layout',  variantA:'Layout actuel', variantB:'Nouveau anneau confiance', trafficSplit:50, conversions:{a:142,b:193}, visitors:{a:1840,b:1820}, status:'running',   startDate:'2026-06-15' },
  { id:'ab2', name:'CTA Track — Texte',      variantA:'"Suivre ce vol"', variantB:'"Alerter moi"',          trafficSplit:50, conversions:{a:87,b:112},  visitors:{a:940,b:960},  status:'running',   startDate:'2026-06-18' },
  { id:'ab3', name:'Smart Deals — Format',   variantA:'Grille cartes', variantB:'Liste condensée',          trafficSplit:30, conversions:{a:204,b:187}, visitors:{a:2100,b:910}, status:'completed', startDate:'2026-05-20', winner:'a' },
];

// ─── Chat Messages ────────────────────────────────────────────────────────────

// ─── Dynamic Prediction Generator ────────────────────────────────────────────

export function generatePrediction(params: {
  origin: string;
  destination: string;
  date: string;
  airline: string;
}): PredictionResult {
  const { origin, destination, date, airline } = params;
  const seed = `${origin}${destination}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const trends = ['BUY', 'WAIT', 'RISK'] as const;
  const trend = trends[seed % 3];
  const basePrice = 150 + (seed % 12) * 70;
  const prob = 55 + (seed % 35);
  const conf = 65 + (seed % 25);
  const absDelta = 4 + (seed % 18);
  const expectedDelta = trend === 'BUY' ? -absDelta : trend === 'RISK' ? absDelta : (seed % 5) - 2;
  const daysUntilDep = Math.max(7, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
  const h = generatePriceHistory(basePrice, 90, 0.035, trend === 'BUY' ? -0.001 : trend === 'RISK' ? 0.001 : 0);
  const lastP = h[h.length - 1].price;
  const fc = generateForecast(lastP, 21, trend === 'BUY' ? -1 : trend === 'RISK' ? 1 : 0, 0.03);
  const airlineName = airline === 'Toutes compagnies'
    ? (['Air France', 'Lufthansa', 'British Airways'] as const)[seed % 3]
    : airline;

  return {
    route: `${origin} → ${destination}`,
    origin,
    destination,
    departureDate: date,
    airline: airlineName,
    trend,
    probability: prob,
    confidence: conf,
    currentPrice: lastP,
    expectedDelta,
    bestBuyWindow: {
      start: addDays(new Date(), 3).toISOString().split('T')[0],
      end:   addDays(new Date(), Math.min(8, daysUntilDep - 1)).toISOString().split('T')[0],
      expectedPrice: Math.round(lastP * (1 + expectedDelta / 100)),
      saving: Math.round(lastP * Math.abs(expectedDelta) / 100),
    },
    featureContributions: [
      { name: 'Jours avant départ',     value: 0.28,  impact: 'positive', description: `${daysUntilDep} jours — analyse en cours` },
      { name: 'Fenêtre de réservation', value: 0.21,  impact: trend === 'BUY' ? 'positive' : 'negative', description: 'Basé sur historique 24 mois' },
      { name: 'Saisonnalité',           value: trend === 'BUY' ? 0.17 : -0.15, impact: trend === 'BUY' ? 'positive' : 'negative', description: 'Période analysée' },
      { name: 'Carburant (kérosène)',   value: -0.11, impact: 'negative', description: 'Légère volatilité du marché' },
      { name: 'Volume de recherche',    value: 0.08,  impact: 'neutral',  description: `Concurrence sur ${origin}–${destination}` },
      { name: 'Popularité route',       value: -0.06, impact: 'neutral',  description: `Route ${origin}–${destination}` },
    ],
    priceHistory: h,
    priceForecast: fc,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const mockMessages: ChatMessage[] = [
  {
    id:'m1', role:'user',
    content: 'Analyse le vol CDG→JFK du 16 juillet. Est-ce que je dois acheter maintenant ?',
    createdAt: addDays(new Date(), -0.01).toISOString(),
  },
  {
    id:'m2', role:'assistant',
    content: 'J\'ai analysé le vol **Air France AF 006 CDG→JFK** du 16 juillet.\n\n**Signal IA : ACHETER**\n\nLe modèle détecte une probabilité de **81%** de baisse de prix dans les 7 prochains jours. Le prix actuel de **462€** devrait descendre vers **406€** d\'ici le week-end prochain.\n\nLes principaux facteurs :\n- ✅ Fenêtre de réservation optimale (23 jours avant départ)\n- ✅ Faible volume de recherche actuellement\n- ✅ Hors saison haute sur cette route\n- ⚠️ Légère hausse du kérosène à surveiller\n\n**Ma recommandation** : Attendez encore 3–5 jours pour maximiser l\'économie potentielle (~57€).',
    chips: ['WAIT', 'ACT_NOW'],
    createdAt: addDays(new Date(), -0.009).toISOString(),
  },
  {
    id:'m3', role:'user',
    content: 'Où peut-on partir depuis Paris avec un budget de 200€ pour un week-end ?',
    createdAt: addDays(new Date(), -0.008).toISOString(),
  },
  {
    id:'m4', role:'assistant',
    content: 'Avec **200€ depuis Paris** pour un week-end, voici les meilleures options :\n\n🇵🇹 **Lisbonne** (98€ A/R) — Score qualité/prix : 9/10\nVols easyJet vendredi soir. Météo parfaite (26°C). Tendance : prix stable.\n\n🇲🇦 **Marrakech** (142€ A/R) — Score : 8.5/10\nVols Royal Air Maroc direct. Idéal pour un city break culturel.\n\n🇮🇹 **Rome** (128€ A/R) — Score : 8.2/10\nMultiples compagnies. Légère hausse prévue après le 28 juin.\n\n🇪🇸 **Barcelone** (89€ A/R) — Score : 7.8/10\nVueling. Prix en baisse (-12%). Meilleur rapport qualité/prix actuellement.',
    chips: ['EXPLORER'],
    createdAt: addDays(new Date(), -0.007).toISOString(),
  },
];
