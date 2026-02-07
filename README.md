# 🌍 TravelScout — Real-Time Travel Comparison Engine

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Puppeteer-Stealth-40B5A4?logo=puppeteer&logoColor=white" alt="Puppeteer" />
  <img src="https://img.shields.io/badge/Material--UI-5.x-007FFF?logo=mui&logoColor=white" alt="MUI" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

<p align="center">
  A full-stack web scraping platform that aggregates real-time hotel prices, transportation options, and tourist attractions from multiple sources — enabling travelers to compare and find the best deals in one place.
</p>

---

## ✨ Features

### Core Functionality
- **Multi-Source Hotel Comparison** — Scrapes Booking.com, Agoda, and MakeMyTrip simultaneously using headless browsers
- **Transportation Aggregation** — Collects bus and flight data from Shohoz, Bangladesh Railway, and Google Flights
- **Tourist Attractions** — Fetches destination highlights via Wikipedia & Wikivoyage REST APIs
- **Real-Time Pricing** — Live data from actual booking platforms, not cached databases

### Frontend
- **Dark / Light Theme** — Persistent toggle with full MUI theme customization
- **Favorites System** — Bookmark hotels and results (localStorage persistence)
- **Search History** — Track past searches with one-click re-search (localStorage)
- **Responsive Design** — Fully mobile-optimized with adaptive layouts
- **Glass-morphism Navbar** — Sticky header with drawers for history & favorites
- **Animated Landing Page** — Hero section, feature cards, stats, CTA sections
- **Sort & Filter** — Sort by price/rating, filter by source platform
- **Loading Skeletons** — Smooth skeleton animations during data fetch

### Backend
- **Anti-Detection Scraping** — Puppeteer-extra with StealthPlugin to bypass bot detection
- **Rate Limiting** — Express rate limiter (50 requests / 15 minutes)
- **Response Caching** — In-memory cache with configurable TTL
- **Structured Logging** — Color-coded console logs with timestamps
- **Graceful Timeouts** — 2-minute timeout wrapper per scraper with Promise.allSettled

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Navbar   │ │ SearchForm │ │ Results  │ │ LandingPage  │ │
│  │ (Drawer) │ │ (DatePick) │ │ (Tabs)   │ │ (Hero/CTA)   │ │
│  └──────────┘ └────────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Context Providers: Theme │ Favorites │ Search History │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ Axios (AbortController)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Express.js Backend                       │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────────────┐  │
│  │ Rate     │ │ Cache      │ │ POST /api/search         │  │
│  │ Limiter  │ │ Layer      │ │ GET  /api/health         │  │
│  └──────────┘ └────────────┘ │ DELETE /api/cache         │  │
│                               └──────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Scraper Orchestrator                     │   │
│  │  ┌───────────┐ ┌──────┐ ┌────────────┐ ┌─────────┐  │   │
│  │  │Booking.com│ │Agoda │ │MakeMyTrip  │ │Wikipedia│  │   │
│  │  │(Puppeteer)│ │(Pupp)│ │(Puppeteer) │ │(REST)   │  │   │
│  │  └───────────┘ └──────┘ └────────────┘ └─────────┘  │   │
│  │  ┌───────────┐ ┌──────────────┐ ┌────────────────┐  │   │
│  │  │Shohoz     │ │BD Railway    │ │Google Flights  │  │   │
│  │  │(Puppeteer)│ │(Cheerio)     │ │(Puppeteer)     │  │   │
│  │  └───────────┘ └──────────────┘ └────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Material-UI 5, Framer Motion, React DatePicker |
| **State** | React Context API, localStorage persistence |
| **Backend** | Node.js, Express.js, cors, express-rate-limit |
| **Scraping** | Puppeteer-extra + StealthPlugin, Cheerio, Axios |
| **APIs** | Wikipedia MediaWiki REST API, Wikivoyage API |
| **Styling** | MUI Theme System (light/dark), CSS-in-JS, Google Fonts (Poppins, Inter) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 16.x
- **npm** >= 8.x
- **Chromium** (auto-installed by Puppeteer)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/travelscout.git
cd travelscout

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the App

```bash
# Terminal 1 — Start backend (port 5000)
cd backend
npm start

# Terminal 2 — Start frontend (port 3000)
cd frontend
npm start
```

The app will open at `http://localhost:3000`.

---

## 📁 Project Structure

```
travelscout/
├── backend/
│   ├── server.js              # Express server, routes, middleware
│   ├── package.json
│   └── scrapers/
│       ├── index.js            # Scraper orchestrator
│       ├── hotelScrapper.js    # Hotel aggregator (Booking + Agoda + MMT)
│       ├── booking.js          # Booking.com scraper (Puppeteer)
│       ├── agoda.js            # Agoda scraper (Puppeteer)
│       ├── makemytrip.js       # MakeMyTrip scraper (Puppeteer)
│       ├── transportation.js   # Transport aggregator (Shohoz + Railway + Flights)
│       ├── tourist-places.js   # Wikipedia + Wikivoyage API client
│       └── hotels.js           # Legacy hotel scraper
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js              # Main app with navigation
│   │   ├── App.css             # Global styles
│   │   ├── index.js            # Entry point with providers
│   │   ├── index.css
│   │   ├── context/
│   │   │   ├── ThemeContext.js      # Dark/Light mode system
│   │   │   ├── FavoritesContext.js  # Favorites with localStorage
│   │   │   └── SearchHistoryContext.js # Search history tracking
│   │   ├── components/
│   │   │   ├── Navbar.js        # Sticky navbar + drawers
│   │   │   ├── Footer.js        # Professional footer
│   │   │   ├── LandingPage.js   # Hero + features + CTA
│   │   │   ├── SearchForm.js    # Search inputs + date pickers
│   │   │   ├── ResultCard.js    # Result display + favorites
│   │   │   ├── ResultsSection.js # Tabs + sort + filter
│   │   │   └── ErrorBoundary.js  # Error boundary wrapper
│   │   └── utils/
│   │       └── api.js           # Axios client + helpers
│   └── package.json
│
└── README.md
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/search` | Execute multi-source travel search |
| `GET` | `/api/health` | Health check with server stats |
| `DELETE` | `/api/cache` | Clear server response cache |

### Search Request Body

```json
{
  "from": "Dhaka",
  "to": "Cox's Bazar",
  "checkIn": "2025-02-15",
  "checkOut": "2025-02-18",
  "guests": 2,
  "rooms": 1
}
```

### Search Response

```json
{
  "hotels": [
    {
      "name": "Hotel Name",
      "price": 4500,
      "rating": "8.5",
      "location": "City Center",
      "imageUrl": "https://...",
      "bookingLink": "https://...",
      "source": "Booking.com",
      "amenities": ["WiFi", "Pool", "Restaurant"]
    }
  ],
  "transportation": [...],
  "touristPlaces": [...],
  "meta": {
    "searchParams": {...},
    "timing": "45.2s",
    "cached": false
  }
}
```

---

## 🎨 Screenshots

> _Add screenshots of your running application here_

| Light Mode | Dark Mode |
|:---:|:---:|
| ![Light](screenshots/light.png) | ![Dark](screenshots/dark.png) |

| Landing Page | Search Results |
|:---:|:---:|
| ![Landing](screenshots/landing.png) | ![Results](screenshots/results.png) |

---

## ⚡ Key Technical Decisions

1. **Puppeteer-extra StealthPlugin** — Bypasses Cloudflare and other bot-detection systems
2. **Promise.allSettled()** — Ensures partial results are returned even if some scrapers fail
3. **AbortController** — Frontend can cancel in-flight requests when navigating away
4. **Context API over Redux** — Lighter state management suitable for this app's complexity
5. **localStorage** — No-backend persistence for favorites and search history
6. **MUI Theme System** — Full dark/light mode with custom component overrides

---

## 📝 Known Limitations

- Some scrapers may return 0 results due to anti-bot measures by target sites
- Puppeteer requires significant memory — hosting on low-tier servers may be slow
- No user authentication (search history is device-local)
- Scraping is subject to target site HTML structure changes

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ using React, Node.js, and Puppeteer
</p>
