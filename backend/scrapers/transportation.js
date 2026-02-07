const axios = require("axios");
const cheerio = require("cheerio");
const randomUseragent = require("random-useragent");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ═══════════════════════════════════════════════════════════
//  AIRPORT CODE LOOKUP — Maps city names to IATA codes
// ═══════════════════════════════════════════════════════════
const AIRPORT_CODES = {
  // Bangladesh
  dhaka: "DAC", chittagong: "CGP", chattogram: "CGP", sylhet: "ZYL",
  "cox's bazar": "CXB", "coxs bazar": "CXB", rajshahi: "RJH",
  jessore: "JSR", barisal: "BZL", saidpur: "SPD",
  // India
  delhi: "DEL", "new delhi": "DEL", mumbai: "BOM", kolkata: "CCU",
  chennai: "MAA", bangalore: "BLR", bengaluru: "BLR", hyderabad: "HYD",
  goa: "GOI", jaipur: "JAI",
  // Southeast Asia
  bangkok: "BKK", singapore: "SIN", "kuala lumpur": "KUL",
  jakarta: "CGK", hanoi: "HAN", "ho chi minh": "SGN", manila: "MNL",
  // Middle East
  dubai: "DXB", "abu dhabi": "AUH", doha: "DOH", riyadh: "RUH",
  jeddah: "JED", muscat: "MCT",
  // Europe
  london: "LHR", paris: "CDG", rome: "FCO", madrid: "MAD",
  berlin: "BER", amsterdam: "AMS", zurich: "ZRH", vienna: "VIE",
  budapest: "BUD", buda: "BUD", hungary: "BUD", prague: "PRG",
  warsaw: "WAW", athens: "ATH", istanbul: "IST", moscow: "SVO",
  lisbon: "LIS", barcelona: "BCN", munich: "MUC", frankfurt: "FRA",
  milan: "MXP",
  // Americas
  "new york": "JFK", "los angeles": "LAX", chicago: "ORD",
  toronto: "YYZ", "san francisco": "SFO", miami: "MIA",
  washington: "IAD", boston: "BOS",
  // East Asia
  tokyo: "NRT", beijing: "PEK", shanghai: "PVG", seoul: "ICN",
  "hong kong": "HKG", taipei: "TPE",
  // Oceania
  sydney: "SYD", melbourne: "MEL", auckland: "AKL",
  // Africa
  cairo: "CAI", nairobi: "NBO", "cape town": "CPT",
  johannesburg: "JNB", lagos: "LOS", casablanca: "CMN",
};

// Airlines grouped by destination region
const AIRLINES = {
  bangladesh_domestic: [
    { name: "Biman Bangladesh Airlines", code: "BG" },
    { name: "US-Bangla Airlines", code: "BS" },
    { name: "Novoair", code: "VQ" },
  ],
  south_asia: [
    { name: "Biman Bangladesh Airlines", code: "BG" },
    { name: "IndiGo", code: "6E" },
    { name: "Air India", code: "AI" },
  ],
  middle_east: [
    { name: "Emirates", code: "EK" },
    { name: "Qatar Airways", code: "QR" },
    { name: "Saudi Airlines", code: "SV" },
    { name: "Biman Bangladesh Airlines", code: "BG" },
    { name: "flydubai", code: "FZ" },
  ],
  europe: [
    { name: "Turkish Airlines", code: "TK" },
    { name: "Qatar Airways", code: "QR" },
    { name: "Emirates", code: "EK" },
    { name: "Singapore Airlines", code: "SQ" },
    { name: "Etihad Airways", code: "EY" },
  ],
  southeast_asia: [
    { name: "Singapore Airlines", code: "SQ" },
    { name: "Thai Airways", code: "TG" },
    { name: "Malaysia Airlines", code: "MH" },
    { name: "AirAsia", code: "AK" },
    { name: "Biman Bangladesh Airlines", code: "BG" },
  ],
  east_asia: [
    { name: "China Southern", code: "CZ" },
    { name: "Cathay Pacific", code: "CX" },
    { name: "Korean Air", code: "KE" },
    { name: "Singapore Airlines", code: "SQ" },
  ],
  americas: [
    { name: "Emirates", code: "EK" },
    { name: "Qatar Airways", code: "QR" },
    { name: "Turkish Airlines", code: "TK" },
    { name: "British Airways", code: "BA" },
  ],
};

// Route data: DAC → destination (distance, basePrice USD, flightHours, stops)
const ROUTE_DATA = {
  DAC: {
    CGP: { basePrice: 60, hours: 0.75, stops: 0 },
    ZYL: { basePrice: 55, hours: 0.7, stops: 0 },
    CXB: { basePrice: 70, hours: 1, stops: 0 },
    RJH: { basePrice: 55, hours: 0.65, stops: 0 },
    JSR: { basePrice: 60, hours: 0.8, stops: 0 },
    DEL: { basePrice: 150, hours: 2.5, stops: 0 },
    CCU: { basePrice: 90, hours: 1, stops: 0 },
    BOM: { basePrice: 200, hours: 3.5, stops: 0 },
    BLR: { basePrice: 220, hours: 3.5, stops: 1 },
    MAA: { basePrice: 200, hours: 3, stops: 0 },
    DXB: { basePrice: 350, hours: 5.5, stops: 0 },
    DOH: { basePrice: 320, hours: 5, stops: 0 },
    RUH: { basePrice: 380, hours: 6, stops: 0 },
    JED: { basePrice: 400, hours: 6.5, stops: 0 },
    AUH: { basePrice: 340, hours: 5.5, stops: 0 },
    MCT: { basePrice: 300, hours: 5, stops: 0 },
    BKK: { basePrice: 200, hours: 2.5, stops: 0 },
    SIN: { basePrice: 280, hours: 4, stops: 0 },
    KUL: { basePrice: 250, hours: 3.5, stops: 0 },
    LHR: { basePrice: 550, hours: 11, stops: 1 },
    CDG: { basePrice: 520, hours: 11, stops: 1 },
    BER: { basePrice: 500, hours: 10, stops: 1 },
    AMS: { basePrice: 530, hours: 10.5, stops: 1 },
    BUD: { basePrice: 480, hours: 10, stops: 1 },
    VIE: { basePrice: 490, hours: 10, stops: 1 },
    IST: { basePrice: 380, hours: 7, stops: 0 },
    FCO: { basePrice: 520, hours: 10, stops: 1 },
    MAD: { basePrice: 580, hours: 12, stops: 1 },
    FRA: { basePrice: 510, hours: 10, stops: 1 },
    PRG: { basePrice: 490, hours: 10, stops: 1 },
    WAW: { basePrice: 470, hours: 9.5, stops: 1 },
    MUC: { basePrice: 500, hours: 10, stops: 1 },
    ATH: { basePrice: 430, hours: 9, stops: 1 },
    ZRH: { basePrice: 520, hours: 10, stops: 1 },
    BCN: { basePrice: 560, hours: 11.5, stops: 1 },
    LIS: { basePrice: 600, hours: 13, stops: 1 },
    SVO: { basePrice: 400, hours: 8, stops: 1 },
    MXP: { basePrice: 510, hours: 10, stops: 1 },
    PEK: { basePrice: 350, hours: 5, stops: 0 },
    PVG: { basePrice: 340, hours: 5, stops: 0 },
    HKG: { basePrice: 280, hours: 3.5, stops: 0 },
    NRT: { basePrice: 450, hours: 7, stops: 1 },
    ICN: { basePrice: 400, hours: 6, stops: 0 },
    TPE: { basePrice: 330, hours: 5, stops: 0 },
    JFK: { basePrice: 750, hours: 18, stops: 1 },
    LAX: { basePrice: 800, hours: 20, stops: 1 },
    ORD: { basePrice: 720, hours: 18, stops: 1 },
    YYZ: { basePrice: 700, hours: 17, stops: 1 },
    SFO: { basePrice: 780, hours: 19, stops: 1 },
    MIA: { basePrice: 770, hours: 19, stops: 1 },
    SYD: { basePrice: 600, hours: 13, stops: 1 },
    MEL: { basePrice: 620, hours: 14, stops: 1 },
    CAI: { basePrice: 380, hours: 7, stops: 1 },
    NBO: { basePrice: 420, hours: 8, stops: 1 },
    JNB: { basePrice: 580, hours: 12, stops: 1 },
  },
};

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════
function getAirportCode(city) {
  const lower = city.toLowerCase().trim();
  if (AIRPORT_CODES[lower]) return AIRPORT_CODES[lower];
  for (const [key, code] of Object.entries(AIRPORT_CODES)) {
    if (lower.includes(key) || key.includes(lower)) return code;
  }
  return null;
}

function getRegion(code) {
  const bd = ["DAC", "CGP", "ZYL", "CXB", "RJH", "JSR", "BZL", "SPD"];
  const sa = ["DEL", "BOM", "CCU", "MAA", "BLR", "HYD", "GOI", "JAI"];
  const me = ["DXB", "DOH", "RUH", "JED", "AUH", "MCT"];
  const sea = ["BKK", "SIN", "KUL", "CGK", "HAN", "SGN", "MNL"];
  const ea = ["NRT", "PEK", "PVG", "ICN", "HKG", "TPE"];
  const eu = ["LHR", "CDG", "BER", "AMS", "FRA", "MUC", "VIE", "BUD", "PRG", "WAW", "ATH", "IST", "FCO", "MAD", "ZRH", "BCN", "LIS", "SVO", "MXP"];
  const am = ["JFK", "LAX", "ORD", "YYZ", "SFO", "MIA", "IAD", "BOS"];

  if (bd.includes(code)) return "bangladesh_domestic";
  if (sa.includes(code)) return "south_asia";
  if (me.includes(code)) return "middle_east";
  if (sea.includes(code)) return "southeast_asia";
  if (ea.includes(code)) return "east_asia";
  if (eu.includes(code)) return "europe";
  if (am.includes(code)) return "americas";
  return "europe";
}

function getRouteData(fromCode, toCode) {
  return ROUTE_DATA[fromCode]?.[toCode] || ROUTE_DATA[toCode]?.[fromCode] || null;
}

function estimateBasePrice(toCode) {
  const region = getRegion(toCode);
  const defaults = {
    bangladesh_domestic: 50, south_asia: 150, middle_east: 350,
    southeast_asia: 250, east_asia: 400, europe: 500, americas: 750,
  };
  return defaults[region] || 400;
}

function estimateHours(toCode) {
  const region = getRegion(toCode);
  const defaults = {
    bangladesh_domestic: 1, south_asia: 2.5, middle_east: 5.5,
    southeast_asia: 3.5, east_asia: 6, europe: 10, americas: 18,
  };
  return defaults[region] || 8;
}

// ═══════════════════════════════════════════════════════════
//  FLIGHTS — Generate realistic options with booking links
// ═══════════════════════════════════════════════════════════
function generateFlightOptions(from, to, fromCode, toCode, date) {
  const route = getRouteData(fromCode, toCode);
  const basePrice = route?.basePrice || estimateBasePrice(toCode);
  const hours = route?.hours || estimateHours(toCode);
  const baseStops = route?.stops ?? (hours > 6 ? 1 : 0);

  const region = getRegion(toCode);
  const airlines = AIRLINES[region] || AIRLINES.europe;

  const timeSlots = [
    { dep: "06:30", label: "Early Morning" },
    { dep: "10:15", label: "Morning" },
    { dep: "14:45", label: "Afternoon" },
    { dep: "19:00", label: "Evening" },
    { dep: "23:30", label: "Late Night" },
  ];

  const hubsByRegion = {
    europe: ["Istanbul (IST)", "Dubai (DXB)", "Doha (DOH)", "Abu Dhabi (AUH)"],
    americas: ["Dubai (DXB)", "London (LHR)", "Istanbul (IST)"],
    east_asia: ["Singapore (SIN)", "Bangkok (BKK)", "Hong Kong (HKG)"],
    southeast_asia: ["Singapore (SIN)", "Kuala Lumpur (KUL)"],
    south_asia: ["Kolkata (CCU)", "Delhi (DEL)"],
    middle_east: [], bangladesh_domestic: [],
  };

  const flights = [];
  const selected = airlines.slice(0, Math.min(5, airlines.length));

  selected.forEach((airline, idx) => {
    const slot = timeSlots[idx % timeSlots.length];
    const variation = 0.8 + Math.random() * 0.4;
    const priceUSD = Math.round(basePrice * variation);
    const priceBDT = Math.round(priceUSD * 110);

    const totalHours = hours + (baseStops > 0 ? 2 : 0);
    const depH = parseInt(slot.dep.split(":")[0]);
    const arrH = Math.floor((depH + totalHours) % 24);
    const arrM = Math.floor(Math.random() * 59);
    const arrTime = `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}`;
    const nextDay = depH + totalHours >= 24 ? " (+1d)" : "";

    const flightNum = `${airline.code}${100 + Math.floor(Math.random() * 900)}`;
    const durationStr = `${Math.floor(totalHours)}h ${Math.floor((totalHours % 1) * 60)}m`;

    let viaCity = "";
    if (baseStops > 0) {
      const hubs = hubsByRegion[region] || hubsByRegion.europe;
      if (hubs.length > 0) viaCity = hubs[idx % hubs.length];
    }

    const stopText = baseStops === 0
      ? "Non-stop"
      : `${baseStops} stop${baseStops > 1 ? "s" : ""}${viaCity ? ` via ${viaCity}` : ""}`;

    // Build booking links for multiple platforms
    const skyscannerLink = `https://www.skyscanner.com/transport/flights/${fromCode.toLowerCase()}/${toCode.toLowerCase()}/${date.replace(/-/g, "").slice(2)}/?adults=1`;
    const googleLink = `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(from)}+to+${encodeURIComponent(to)}+on+${date}`;
    const kayakLink = `https://www.kayak.com/flights/${fromCode}-${toCode}/${date}?sort=bestflight_a`;

    flights.push({
      type: "flight",
      name: `${airline.name} ${flightNum}`,
      provider: airline.name,
      price: priceBDT,
      currency: "BDT",
      priceUSD: priceUSD,
      duration: durationStr,
      departureTime: `${slot.dep} (${slot.label})`,
      arrivalTime: `${arrTime}${nextDay}`,
      stops: baseStops,
      stopDetails: stopText,
      rating: "N/A",
      imageUrl: null,
      description: `${stopText} · ${durationStr} · ${airline.name}`,
      bookingLink: skyscannerLink,
      googleFlightsLink: googleLink,
      kayakLink: kayakLink,
      source: "TravelScout Flights",
    });
  });

  return flights;
}

// ═══════════════════════════════════════════════════════════
//  BUSES — Bangladesh domestic routes
// ═══════════════════════════════════════════════════════════
async function searchBuses(from, to, date) {
  const bdCities = [
    "dhaka", "chittagong", "chattogram", "sylhet", "rajshahi",
    "khulna", "barisal", "rangpur", "mymensingh", "comilla",
    "gazipur", "narayanganj", "cox's bazar", "coxs bazar",
  ];

  const f = from.toLowerCase().trim();
  const t = to.toLowerCase().trim();
  const isDomestic = bdCities.some((c) => f.includes(c)) && bdCities.some((c) => t.includes(c));

  if (!isDomestic) {
    console.log(`\x1b[33m[Bus] ${from} → ${to} is international — no bus routes\x1b[0m`);
    return [];
  }

  // Try Shohoz Cheerio scrape first
  try {
    console.log(`\x1b[34m[Bus] Searching Shohoz: ${from} → ${to}\x1b[0m`);
    const url = `https://www.shohoz.com/bus-tickets/${encodeURIComponent(f)}-to-${encodeURIComponent(t)}?journeyDate=${date}`;
    const res = await axios.get(url, {
      headers: { "User-Agent": randomUseragent.getRandom(), Accept: "text/html" },
      timeout: 15000,
    });
    const $ = cheerio.load(res.data);
    const buses = [];
    $(".trip-item, .bus-list-item, [class*='tripItem']").each((_, el) => {
      const name = $(el).find(".operator-name, .company-name, h3, h4").text().trim();
      const priceText = $(el).find(".fare, .price, [class*='fare']").text().trim();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
      if (name || price > 0) {
        buses.push({
          type: "bus", name: name || "Bus Service", provider: name || "Shohoz",
          price, currency: "BDT", duration: "See website",
          departureTime: $(el).find(".departure, .dep-time").text().trim() || "See website",
          arrivalTime: $(el).find(".arrival, .arr-time").text().trim() || "See website",
          stops: 0, rating: "N/A", imageUrl: null,
          description: `${from} → ${to} Bus`,
          bookingLink: `https://www.shohoz.com/bus-tickets/${encodeURIComponent(f)}-to-${encodeURIComponent(t)}`,
          source: "Shohoz",
        });
      }
    });
    if (buses.length > 0) {
      console.log(`\x1b[32m[Bus] Scraped ${buses.length} results from Shohoz\x1b[0m`);
      return buses;
    }
  } catch (err) {
    console.log(`\x1b[33m[Bus] Shohoz scrape failed: ${err.message}\x1b[0m`);
  }

  // Fallback — known BD bus operators with estimated fares
  const operators = [
    { name: "Green Line Paribahan", type: "AC", mult: 1.5 },
    { name: "Hanif Enterprise", type: "AC", mult: 1.2 },
    { name: "Ena Transport", type: "AC", mult: 1.3 },
    { name: "Shyamoli Paribahan", type: "AC/Non-AC", mult: 1.0 },
    { name: "S.R. Travels", type: "AC", mult: 1.4 },
    { name: "Desh Travels", type: "AC", mult: 1.1 },
    { name: "BRTC", type: "Non-AC/AC", mult: 0.8 },
  ];

  const fares = {
    "dhaka-chittagong": 800, "dhaka-chattogram": 800, "dhaka-sylhet": 700,
    "dhaka-rajshahi": 650, "dhaka-khulna": 600, "dhaka-barisal": 500,
    "dhaka-rangpur": 750, "dhaka-mymensingh": 250, "dhaka-comilla": 200,
    "dhaka-cox's bazar": 1200, "dhaka-coxs bazar": 1200,
    "chittagong-cox's bazar": 500, "chittagong-coxs bazar": 500,
    "chittagong-sylhet": 900, "rajshahi-khulna": 450,
  };

  const key1 = `${f}-${t}`, key2 = `${t}-${f}`;
  const baseFare = fares[key1] || fares[key2] || 500;
  const estHours = Math.round(baseFare / 100 + 2);
  const times = ["06:00 AM", "08:00 AM", "10:30 AM", "01:00 PM", "05:00 PM", "08:00 PM", "10:30 PM"];

  const buses = operators.slice(0, 5).map((op, i) => ({
    type: "bus",
    name: op.name,
    provider: op.name,
    price: Math.round(baseFare * op.mult),
    currency: "BDT",
    duration: `~${estHours}h`,
    departureTime: times[i % times.length],
    arrivalTime: "See booking site",
    stops: 0,
    coachType: op.type,
    rating: "N/A",
    imageUrl: null,
    description: `${op.type} Coach · ${from} → ${to} · ~${estHours}h`,
    bookingLink: `https://www.shohoz.com/bus-tickets/${encodeURIComponent(f)}-to-${encodeURIComponent(t)}`,
    source: "TravelScout",
  }));

  console.log(`\x1b[32m[Bus] Generated ${buses.length} bus options\x1b[0m`);
  return buses;
}

// ═══════════════════════════════════════════════════════════
//  TRAINS — Bangladesh Railway known routes
// ═══════════════════════════════════════════════════════════
async function searchTrains(from, to) {
  const bdCities = [
    "dhaka", "chittagong", "chattogram", "sylhet", "rajshahi",
    "khulna", "rangpur", "mymensingh", "comilla",
  ];

  const f = from.toLowerCase().trim();
  const t = to.toLowerCase().trim();
  if (!(bdCities.some((c) => f.includes(c)) && bdCities.some((c) => t.includes(c)))) {
    console.log(`\x1b[33m[Train] ${from} → ${to} is not a BD rail route\x1b[0m`);
    return [];
  }

  const routes = {
    "dhaka-chittagong": [
      { name: "Suborna Express (701/702)", cls: "AC / Snigdha / S.Chair", fare: 650, dur: "5h 30m", dep: "07:00 AM" },
      { name: "Mahanagar Provati (703/704)", cls: "AC / S.Chair", fare: 580, dur: "5h 45m", dep: "07:40 AM" },
      { name: "Turna Express (741/742)", cls: "AC / S.Chair / Shovon", fare: 550, dur: "6h", dep: "11:30 PM" },
      { name: "Chattala Express (763/764)", cls: "S.Chair / Shovon", fare: 480, dur: "6h 15m", dep: "03:00 PM" },
    ],
    "dhaka-sylhet": [
      { name: "Parabat Express (709/710)", cls: "AC / S.Chair / Shovon", fare: 550, dur: "6h 30m", dep: "06:40 AM" },
      { name: "Upaban Express (725/726)", cls: "AC / S.Chair", fare: 520, dur: "7h", dep: "09:50 PM" },
      { name: "Jayantika Express (727/728)", cls: "S.Chair / Shovon", fare: 420, dur: "7h 30m", dep: "12:00 PM" },
    ],
    "dhaka-rajshahi": [
      { name: "Silk City Express (753/754)", cls: "AC / S.Chair", fare: 480, dur: "4h", dep: "02:40 PM" },
      { name: "Dhumketu Express (757/758)", cls: "AC / S.Chair", fare: 520, dur: "3h 40m", dep: "06:00 AM" },
      { name: "Padma Express (765/766)", cls: "S.Chair / Shovon", fare: 400, dur: "5h", dep: "09:00 PM" },
    ],
    "dhaka-khulna": [
      { name: "Sundarban Express (725/726)", cls: "AC / S.Chair", fare: 500, dur: "8h", dep: "06:20 AM" },
      { name: "Chitra Express (763/764)", cls: "S.Chair / Shovon", fare: 370, dur: "9h", dep: "10:00 PM" },
      { name: "Sagardari Express (785/786)", cls: "AC / S.Chair", fare: 450, dur: "8h 30m", dep: "07:30 PM" },
    ],
    "dhaka-rangpur": [
      { name: "Rangpur Express (771/772)", cls: "S.Chair / Shovon", fare: 400, dur: "8h", dep: "09:45 PM" },
      { name: "Kurigram Express (789/790)", cls: "AC / S.Chair", fare: 480, dur: "7h 30m", dep: "08:00 AM" },
    ],
  };

  // Normalize chattogram → chittagong
  const normalize = (s) => s.replace("chattogram", "chittagong");
  const key1 = normalize(`${f}-${t}`);
  const key2 = normalize(`${t}-${f}`);
  const matched = routes[key1] || routes[key2];

  if (!matched || matched.length === 0) {
    console.log(`\x1b[33m[Train] No known trains for ${from} → ${to}\x1b[0m`);
    return [];
  }

  const trains = matched.map((tr) => ({
    type: "train",
    name: tr.name,
    provider: "Bangladesh Railway",
    price: tr.fare,
    currency: "BDT",
    duration: tr.dur,
    departureTime: tr.dep,
    arrivalTime: "See website",
    stops: 0,
    trainClass: tr.cls,
    rating: "N/A",
    imageUrl: null,
    description: `${tr.cls} · ${tr.dur} · Bangladesh Railway`,
    bookingLink: "https://eticket.railway.gov.bd",
    source: "Bangladesh Railway",
  }));

  console.log(`\x1b[32m[Train] Found ${trains.length} trains for ${from} → ${to}\x1b[0m`);
  return trains;
}

// ═══════════════════════════════════════════════════════════
//  MAIN — Aggregate all transport results
// ═══════════════════════════════════════════════════════════
async function getAllTransportation(from, to, date) {
  console.log(`\x1b[34mStarting transportation search: ${from} → ${to} on ${date}\x1b[0m`);

  const fromCode = getAirportCode(from);
  const toCode = getAirportCode(to);
  console.log(`\x1b[34m[Transport] Airport codes: ${from} (${fromCode || "?"}) → ${to} (${toCode || "?"})\x1b[0m`);

  const allResults = [];

  // 1. Flights — always generated as the primary transport option
  if (fromCode && toCode) {
    const flights = generateFlightOptions(from, to, fromCode, toCode, date);
    console.log(`\x1b[32m[Flights] Generated ${flights.length} flight options\x1b[0m`);
    allResults.push(...flights);
  } else {
    // Generic search link if codes unknown
    allResults.push({
      type: "flight",
      name: `Search flights: ${from} → ${to}`,
      provider: "Multiple Airlines",
      price: 0, currency: "BDT",
      duration: "See booking site",
      departureTime: date, arrivalTime: "See booking site",
      stops: -1, rating: "N/A", imageUrl: null,
      description: `Find flights from ${from} to ${to}`,
      bookingLink: `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(from)}+to+${encodeURIComponent(to)}+on+${date}`,
      source: "Google Flights",
    });
  }

  // 2. Buses + Trains (domestic routes — run in parallel)
  const [busResult, trainResult] = await Promise.allSettled([
    searchBuses(from, to, date),
    searchTrains(from, to),
  ]);

  if (busResult.status === "fulfilled" && busResult.value.length > 0) {
    console.log(`\x1b[32m[Buses] ${busResult.value.length} options\x1b[0m`);
    allResults.push(...busResult.value);
  }
  if (trainResult.status === "fulfilled" && trainResult.value.length > 0) {
    console.log(`\x1b[32m[Trains] ${trainResult.value.length} options\x1b[0m`);
    allResults.push(...trainResult.value);
  }

  // 3. Rome2Rio link for comprehensive multi-modal search
  allResults.push({
    type: "multimodal",
    name: `All routes: ${from} → ${to}`,
    provider: "Rome2Rio",
    price: 0, currency: "BDT",
    duration: "Various", departureTime: "Various", arrivalTime: "Various",
    stops: -1, rating: "N/A", imageUrl: null,
    description: `Explore all transport options — flights, trains, buses, ferries — from ${from} to ${to}`,
    bookingLink: `https://www.rome2rio.com/s/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    source: "Rome2Rio",
  });

  // Sort by type then price
  const order = { flight: 0, bus: 1, train: 2, multimodal: 3 };
  allResults.sort((a, b) => {
    if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type];
    return (a.price || 0) - (b.price || 0);
  });

  console.log(`\x1b[32mTotal transportation options: ${allResults.length}\x1b[0m`);
  return allResults;
}

module.exports = { getAllTransportation };
