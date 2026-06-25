export interface Airport {
  iata: string;
  city: string;
  cityEn: string;
  country: string;
  region: string;
}

export const AIRPORTS: Airport[] = [
  // ── France ───────────────────────────────────────────────────────
  { iata: 'CDG', city: 'Paris Charles de Gaulle', cityEn: 'Paris CDG', country: 'France', region: 'Europe' },
  { iata: 'ORY', city: 'Paris Orly', cityEn: 'Paris Orly', country: 'France', region: 'Europe' },
  { iata: 'NCE', city: 'Nice', cityEn: 'Nice', country: 'France', region: 'Europe' },
  { iata: 'MRS', city: 'Marseille', cityEn: 'Marseille', country: 'France', region: 'Europe' },
  { iata: 'LYS', city: 'Lyon', cityEn: 'Lyon', country: 'France', region: 'Europe' },
  { iata: 'TLS', city: 'Toulouse', cityEn: 'Toulouse', country: 'France', region: 'Europe' },
  { iata: 'BOD', city: 'Bordeaux', cityEn: 'Bordeaux', country: 'France', region: 'Europe' },
  { iata: 'NTE', city: 'Nantes', cityEn: 'Nantes', country: 'France', region: 'Europe' },
  { iata: 'SXB', city: 'Strasbourg', cityEn: 'Strasbourg', country: 'France', region: 'Europe' },
  { iata: 'BIQ', city: 'Biarritz', cityEn: 'Biarritz', country: 'France', region: 'Europe' },
  { iata: 'MPL', city: 'Montpellier', cityEn: 'Montpellier', country: 'France', region: 'Europe' },
  // ── Maroc ────────────────────────────────────────────────────────
  { iata: 'CMN', city: 'Casablanca', cityEn: 'Casablanca', country: 'Maroc', region: 'Afrique' },
  { iata: 'RAK', city: 'Marrakech', cityEn: 'Marrakech', country: 'Maroc', region: 'Afrique' },
  { iata: 'RBA', city: 'Rabat', cityEn: 'Rabat', country: 'Maroc', region: 'Afrique' },
  { iata: 'AGA', city: 'Agadir', cityEn: 'Agadir', country: 'Maroc', region: 'Afrique' },
  { iata: 'FEZ', city: 'Fès', cityEn: 'Fez', country: 'Maroc', region: 'Afrique' },
  { iata: 'TNG', city: 'Tanger', cityEn: 'Tangier', country: 'Maroc', region: 'Afrique' },
  { iata: 'OUD', city: 'Oujda', cityEn: 'Oujda', country: 'Maroc', region: 'Afrique' },
  // ── Espagne ──────────────────────────────────────────────────────
  { iata: 'MAD', city: 'Madrid', cityEn: 'Madrid', country: 'Espagne', region: 'Europe' },
  { iata: 'BCN', city: 'Barcelone', cityEn: 'Barcelona', country: 'Espagne', region: 'Europe' },
  { iata: 'AGP', city: 'Malaga', cityEn: 'Malaga', country: 'Espagne', region: 'Europe' },
  { iata: 'PMI', city: 'Palma de Majorque', cityEn: 'Palma Mallorca', country: 'Espagne', region: 'Europe' },
  { iata: 'ALC', city: 'Alicante', cityEn: 'Alicante', country: 'Espagne', region: 'Europe' },
  { iata: 'SVQ', city: 'Séville', cityEn: 'Seville', country: 'Espagne', region: 'Europe' },
  { iata: 'IBZ', city: 'Ibiza', cityEn: 'Ibiza', country: 'Espagne', region: 'Europe' },
  // ── Portugal ─────────────────────────────────────────────────────
  { iata: 'LIS', city: 'Lisbonne', cityEn: 'Lisbon', country: 'Portugal', region: 'Europe' },
  { iata: 'OPO', city: 'Porto', cityEn: 'Porto', country: 'Portugal', region: 'Europe' },
  { iata: 'FAO', city: 'Faro (Algarve)', cityEn: 'Faro', country: 'Portugal', region: 'Europe' },
  // ── Royaume-Uni ──────────────────────────────────────────────────
  { iata: 'LHR', city: 'Londres Heathrow', cityEn: 'London Heathrow', country: 'Royaume-Uni', region: 'Europe' },
  { iata: 'LGW', city: 'Londres Gatwick', cityEn: 'London Gatwick', country: 'Royaume-Uni', region: 'Europe' },
  { iata: 'STN', city: 'Londres Stansted', cityEn: 'London Stansted', country: 'Royaume-Uni', region: 'Europe' },
  { iata: 'EDI', city: 'Édimbourg', cityEn: 'Edinburgh', country: 'Royaume-Uni', region: 'Europe' },
  // ── Allemagne ────────────────────────────────────────────────────
  { iata: 'FRA', city: 'Francfort', cityEn: 'Frankfurt', country: 'Allemagne', region: 'Europe' },
  { iata: 'MUC', city: 'Munich', cityEn: 'Munich', country: 'Allemagne', region: 'Europe' },
  { iata: 'BER', city: 'Berlin', cityEn: 'Berlin', country: 'Allemagne', region: 'Europe' },
  { iata: 'HAM', city: 'Hambourg', cityEn: 'Hamburg', country: 'Allemagne', region: 'Europe' },
  // ── Italie ───────────────────────────────────────────────────────
  { iata: 'FCO', city: 'Rome', cityEn: 'Rome', country: 'Italie', region: 'Europe' },
  { iata: 'MXP', city: 'Milan Malpensa', cityEn: 'Milan', country: 'Italie', region: 'Europe' },
  { iata: 'VCE', city: 'Venise', cityEn: 'Venice', country: 'Italie', region: 'Europe' },
  { iata: 'NAP', city: 'Naples', cityEn: 'Naples', country: 'Italie', region: 'Europe' },
  { iata: 'FLR', city: 'Florence', cityEn: 'Florence', country: 'Italie', region: 'Europe' },
  { iata: 'CTA', city: 'Catane (Sicile)', cityEn: 'Catania', country: 'Italie', region: 'Europe' },
  // ── États-Unis ───────────────────────────────────────────────────
  { iata: 'JFK', city: 'New York JFK', cityEn: 'New York', country: 'États-Unis', region: 'Amériques' },
  { iata: 'EWR', city: 'New York Newark', cityEn: 'New York', country: 'États-Unis', region: 'Amériques' },
  { iata: 'LAX', city: 'Los Angeles', cityEn: 'Los Angeles', country: 'États-Unis', region: 'Amériques' },
  { iata: 'MIA', city: 'Miami', cityEn: 'Miami', country: 'États-Unis', region: 'Amériques' },
  { iata: 'ORD', city: 'Chicago', cityEn: 'Chicago', country: 'États-Unis', region: 'Amériques' },
  { iata: 'SFO', city: 'San Francisco', cityEn: 'San Francisco', country: 'États-Unis', region: 'Amériques' },
  { iata: 'LAS', city: 'Las Vegas', cityEn: 'Las Vegas', country: 'États-Unis', region: 'Amériques' },
  { iata: 'BOS', city: 'Boston', cityEn: 'Boston', country: 'États-Unis', region: 'Amériques' },
  { iata: 'ATL', city: 'Atlanta', cityEn: 'Atlanta', country: 'États-Unis', region: 'Amériques' },
  // ── Canada ───────────────────────────────────────────────────────
  { iata: 'YYZ', city: 'Toronto', cityEn: 'Toronto', country: 'Canada', region: 'Amériques' },
  { iata: 'YUL', city: 'Montréal', cityEn: 'Montreal', country: 'Canada', region: 'Amériques' },
  { iata: 'YVR', city: 'Vancouver', cityEn: 'Vancouver', country: 'Canada', region: 'Amériques' },
  // ── Asie ─────────────────────────────────────────────────────────
  { iata: 'BKK', city: 'Bangkok', cityEn: 'Bangkok', country: 'Thaïlande', region: 'Asie' },
  { iata: 'HKT', city: 'Phuket', cityEn: 'Phuket', country: 'Thaïlande', region: 'Asie' },
  { iata: 'NRT', city: 'Tokyo Narita', cityEn: 'Tokyo', country: 'Japon', region: 'Asie' },
  { iata: 'HND', city: 'Tokyo Haneda', cityEn: 'Tokyo Haneda', country: 'Japon', region: 'Asie' },
  { iata: 'KIX', city: 'Osaka', cityEn: 'Osaka', country: 'Japon', region: 'Asie' },
  { iata: 'ICN', city: 'Séoul', cityEn: 'Seoul', country: 'Corée du Sud', region: 'Asie' },
  { iata: 'SIN', city: 'Singapour', cityEn: 'Singapore', country: 'Singapour', region: 'Asie' },
  { iata: 'KUL', city: 'Kuala Lumpur', cityEn: 'Kuala Lumpur', country: 'Malaisie', region: 'Asie' },
  { iata: 'DPS', city: 'Bali (Denpasar)', cityEn: 'Bali', country: 'Indonésie', region: 'Asie' },
  { iata: 'CGK', city: 'Jakarta', cityEn: 'Jakarta', country: 'Indonésie', region: 'Asie' },
  { iata: 'MNL', city: 'Manille', cityEn: 'Manila', country: 'Philippines', region: 'Asie' },
  { iata: 'HAN', city: 'Hanoï', cityEn: 'Hanoi', country: 'Vietnam', region: 'Asie' },
  { iata: 'SGN', city: 'Hô Chi Minh Ville', cityEn: 'Ho Chi Minh', country: 'Vietnam', region: 'Asie' },
  { iata: 'BOM', city: 'Mumbai', cityEn: 'Mumbai', country: 'Inde', region: 'Asie' },
  { iata: 'DEL', city: 'New Delhi', cityEn: 'New Delhi', country: 'Inde', region: 'Asie' },
  { iata: 'PEK', city: 'Pékin', cityEn: 'Beijing', country: 'Chine', region: 'Asie' },
  { iata: 'PVG', city: 'Shanghai', cityEn: 'Shanghai', country: 'Chine', region: 'Asie' },
  { iata: 'HKG', city: 'Hong Kong', cityEn: 'Hong Kong', country: 'Hong Kong', region: 'Asie' },
  // ── Moyen-Orient ─────────────────────────────────────────────────
  { iata: 'DXB', city: 'Dubaï', cityEn: 'Dubai', country: 'Émirats Arabes Unis', region: 'M-Orient' },
  { iata: 'AUH', city: 'Abu Dhabi', cityEn: 'Abu Dhabi', country: 'Émirats Arabes Unis', region: 'M-Orient' },
  { iata: 'DOH', city: 'Doha', cityEn: 'Doha', country: 'Qatar', region: 'M-Orient' },
  { iata: 'RUH', city: 'Riyad', cityEn: 'Riyadh', country: 'Arabie Saoudite', region: 'M-Orient' },
  { iata: 'BEY', city: 'Beyrouth', cityEn: 'Beirut', country: 'Liban', region: 'M-Orient' },
  { iata: 'AMM', city: 'Amman', cityEn: 'Amman', country: 'Jordanie', region: 'M-Orient' },
  { iata: 'TLV', city: 'Tel Aviv', cityEn: 'Tel Aviv', country: 'Israël', region: 'M-Orient' },
  // ── Afrique ──────────────────────────────────────────────────────
  { iata: 'JNB', city: 'Johannesburg', cityEn: 'Johannesburg', country: 'Afrique du Sud', region: 'Afrique' },
  { iata: 'CPT', city: 'Le Cap', cityEn: 'Cape Town', country: 'Afrique du Sud', region: 'Afrique' },
  { iata: 'CAI', city: 'Le Caire', cityEn: 'Cairo', country: 'Égypte', region: 'Afrique' },
  { iata: 'HRG', city: 'Hurghada', cityEn: 'Hurghada', country: 'Égypte', region: 'Afrique' },
  { iata: 'SSH', city: 'Charm el-Cheikh', cityEn: 'Sharm el-Sheikh', country: 'Égypte', region: 'Afrique' },
  { iata: 'TUN', city: 'Tunis', cityEn: 'Tunis', country: 'Tunisie', region: 'Afrique' },
  { iata: 'DJE', city: 'Djerba', cityEn: 'Djerba', country: 'Tunisie', region: 'Afrique' },
  { iata: 'ALG', city: 'Alger', cityEn: 'Algiers', country: 'Algérie', region: 'Afrique' },
  { iata: 'ORN', city: 'Oran', cityEn: 'Oran', country: 'Algérie', region: 'Afrique' },
  { iata: 'DKR', city: 'Dakar', cityEn: 'Dakar', country: 'Sénégal', region: 'Afrique' },
  { iata: 'ABJ', city: 'Abidjan', cityEn: 'Abidjan', country: "Côte d'Ivoire", region: 'Afrique' },
  { iata: 'NBO', city: 'Nairobi', cityEn: 'Nairobi', country: 'Kenya', region: 'Afrique' },
  // ── Amérique latine ──────────────────────────────────────────────
  { iata: 'GRU', city: 'São Paulo', cityEn: 'Sao Paulo', country: 'Brésil', region: 'Amériques' },
  { iata: 'GIG', city: 'Rio de Janeiro', cityEn: 'Rio de Janeiro', country: 'Brésil', region: 'Amériques' },
  { iata: 'MEX', city: 'Mexico', cityEn: 'Mexico City', country: 'Mexique', region: 'Amériques' },
  { iata: 'CUN', city: 'Cancún', cityEn: 'Cancun', country: 'Mexique', region: 'Amériques' },
  { iata: 'EZE', city: 'Buenos Aires', cityEn: 'Buenos Aires', country: 'Argentine', region: 'Amériques' },
  { iata: 'BOG', city: 'Bogotá', cityEn: 'Bogota', country: 'Colombie', region: 'Amériques' },
  // ── Grèce ────────────────────────────────────────────────────────
  { iata: 'ATH', city: 'Athènes', cityEn: 'Athens', country: 'Grèce', region: 'Europe' },
  { iata: 'JTR', city: 'Santorin', cityEn: 'Santorini', country: 'Grèce', region: 'Europe' },
  { iata: 'HER', city: 'Héraklion (Crète)', cityEn: 'Heraklion', country: 'Grèce', region: 'Europe' },
  { iata: 'CFU', city: 'Corfou', cityEn: 'Corfu', country: 'Grèce', region: 'Europe' },
  { iata: 'MYK', city: 'Mykonos', cityEn: 'Mykonos', country: 'Grèce', region: 'Europe' },
  // ── Turquie ──────────────────────────────────────────────────────
  { iata: 'IST', city: 'Istanbul', cityEn: 'Istanbul', country: 'Turquie', region: 'Europe' },
  { iata: 'AYT', city: 'Antalya', cityEn: 'Antalya', country: 'Turquie', region: 'Europe' },
  { iata: 'DLM', city: 'Dalaman', cityEn: 'Dalaman', country: 'Turquie', region: 'Europe' },
  // ── Europe du Nord ───────────────────────────────────────────────
  { iata: 'AMS', city: 'Amsterdam', cityEn: 'Amsterdam', country: 'Pays-Bas', region: 'Europe' },
  { iata: 'BRU', city: 'Bruxelles', cityEn: 'Brussels', country: 'Belgique', region: 'Europe' },
  { iata: 'ZRH', city: 'Zurich', cityEn: 'Zurich', country: 'Suisse', region: 'Europe' },
  { iata: 'GVA', city: 'Genève', cityEn: 'Geneva', country: 'Suisse', region: 'Europe' },
  { iata: 'VIE', city: 'Vienne', cityEn: 'Vienna', country: 'Autriche', region: 'Europe' },
  { iata: 'PRG', city: 'Prague', cityEn: 'Prague', country: 'Tchéquie', region: 'Europe' },
  { iata: 'BUD', city: 'Budapest', cityEn: 'Budapest', country: 'Hongrie', region: 'Europe' },
  { iata: 'WAW', city: 'Varsovie', cityEn: 'Warsaw', country: 'Pologne', region: 'Europe' },
  { iata: 'DUB', city: 'Dublin', cityEn: 'Dublin', country: 'Irlande', region: 'Europe' },
  { iata: 'CPH', city: 'Copenhague', cityEn: 'Copenhagen', country: 'Danemark', region: 'Europe' },
  { iata: 'ARN', city: 'Stockholm', cityEn: 'Stockholm', country: 'Suède', region: 'Europe' },
  { iata: 'OSL', city: 'Oslo', cityEn: 'Oslo', country: 'Norvège', region: 'Europe' },
  { iata: 'HEL', city: 'Helsinki', cityEn: 'Helsinki', country: 'Finlande', region: 'Europe' },
  { iata: 'RIX', city: 'Riga', cityEn: 'Riga', country: 'Lettonie', region: 'Europe' },
  // ── Océanie ──────────────────────────────────────────────────────
  { iata: 'SYD', city: 'Sydney', cityEn: 'Sydney', country: 'Australie', region: 'Océanie' },
  { iata: 'MEL', city: 'Melbourne', cityEn: 'Melbourne', country: 'Australie', region: 'Océanie' },
  { iata: 'AKL', city: 'Auckland', cityEn: 'Auckland', country: 'Nouvelle-Zélande', region: 'Océanie' },
];

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];
  return AIRPORTS.filter(a =>
    a.iata.toLowerCase().startsWith(q) ||
    a.city.toLowerCase().includes(q) ||
    a.cityEn.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  ).sort((a, b) => {
    const aStarts = a.iata.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.iata.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  }).slice(0, 8);
}

export function findAirport(iata: string): Airport | undefined {
  return AIRPORTS.find(a => a.iata.toUpperCase() === iata.toUpperCase());
}

export function resolveIata(input: string): string {
  const up = input.toUpperCase().trim();
  if (AIRPORTS.find(a => a.iata === up)) return up;
  const q = input.toLowerCase().trim();
  const found = AIRPORTS.find(a =>
    a.city.toLowerCase().includes(q) ||
    a.cityEn.toLowerCase().includes(q)
  );
  return found?.iata ?? up;
}
