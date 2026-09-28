# ✈️ TripMacha: AI-Powered Travel Aggregator & Co-Pilot

<div align="center">

![TripMacha Banner](https://img.shields.io/badge/TripMacha-AI%20Travel%20Engine-6366f1?style=for-the-badge&logo=compass&logoColor=white)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Celery](https://img.shields.io/badge/Celery-Distributed%20Queue-37814A?style=flat-square&logo=celery&logoColor=white)](https://docs.celeryq.dev)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Google%20GenAI-Gemini%202.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![Playwright](https://img.shields.io/badge/Playwright-Stealth%20Automation-2EAD33?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)

**TripMacha** is a next-generation AI travel aggregator and trip planner tailored specifically for the Indian travel ecosystem. It dynamically coordinates distributed stealth scrapers across major Indian travel providers, utilizes Google Gemini to parse raw pages without brittle CSS selectors, and renders real-time price comparisons with custom itinerary blueprints.

</div>

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack Overview](#-tech-stack-overview)
- [Repository Structure](#-repository-structure)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Local Development Setup](#-local-development-setup)
  - [Method 1: Docker Compose (Recommended)](#method-1-docker-compose-recommended)
  - [Method 2: Multi-Terminal Manual Run](#method-2-multi-terminal-manual-run)
- [API Reference](#-api-reference)
- [Aggregator & Scraper Coverage](#-aggregator--scraper-coverage)
- [Windows Gotchas & Performance Tips](#-windows-gotchas--performance-tips)
- [How to Upload this Project to GitHub](#-how-to-upload-this-project-to-github)
- [License](#-license)

---

## 🌟 Key Features

- 🤖 **AI Travel Co-Pilot (Gemini 2.5 Flash):** Natural language intent parser extracts destinations, IATA airport codes, and travel dates, crafting custom itineraries and launching background scrapers automatically.
- 🛠️ **Dual-Mode Trip Engine:**
  - **DIY Trip Assembly:** Automatically aggregates and packages Flights, Hotels, and Ground Transport (Trains, Buses, Cabs) into 3 tier-locked budget options (Shoestring, Moderate, Premium, Luxury).
  - **Curated Tour Packages:** Discovers and normalizes pre-made holiday packages from leading Indian tour operators with day-by-day itineraries.
- 🕵️‍♂️ **Stealth Browser Automation:** Playwright Chromium instances equipped with persistent contexts, randomized user-agents, anti-detection flags, and automatic modal dismissal to bypass anti-bot walls.
- ⚡ **Zero-Brittle LLM Scraping:** Raw page HTML is stripped of non-visual DOM bloat via `BeautifulSoup` and fed into Google Gemini with strict Pydantic schemas, eliminating brittle CSS selector maintenance.
- 📊 **Live Comparison Split-Pane Dashboard:** Real-time polling updates users on Celery scraping tasks, rendering interactive deal cards with deep booking links.
- 🔐 **Google OAuth 2.0:** Integrated authentication with database models for user profiles, wallets, reward points, and saved trips.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Frontend ["React 18 + Vite Frontend"]
        UI["Live Split-Pane UI"]
        Chat["AI Chat Co-Pilot"]
        DIYForm["DIY / Tour Search Widget"]
        Store["Zustand State Store"]
    end

    subgraph Backend ["FastAPI Gateway (:8000)"]
        API_Chat["/api/chat (Intent Parser)"]
        API_Scrape["/api/scrape/trigger-search"]
        API_Status["/api/scrape/status/:id"]
    end

    subgraph AI_Engine ["Google Gemini Engine"]
        Gemini_Intent["Gemini 2.5 Flash (Intent & Itinerary)"]
        Gemini_Parser["Gemini 2.5 Flash (DOM Data Parser)"]
    end

    subgraph Queue ["Distributed Processing"]
        Redis[("Redis 7 (Broker & Backend)")]
        Celery["Celery Worker Cluster"]
    end

    subgraph Scrapers ["Parallel Playwright Workers"]
        FlightScraper["OTAs: MMT, Kayak, Cleartrip"]
        HotelScraper["Hotels: Cleartrip, Booking.com"]
        TrainScraper["Rail: ConfirmTkt / IRCTC"]
        BusScraper["Bus: RedBus"]
        CabScraper["Cabs: MMT, Goibibo"]
        TourScraper["Tours: Thomas Cook, Thrillophilia, SOTC"]
    end

    UI --> Chat & DIYForm
    Chat -->|Prompt| API_Chat
    API_Chat -->|Structured Prompt| Gemini_Intent
    Gemini_Intent -->|JSON: Airport Codes + Dates| API_Chat
    Chat -->|Trigger Background Scraping| API_Scrape

    DIYForm -->|Search Parameters| API_Scrape
    API_Scrape -->|Dispatch Task| Redis
    Redis --> Celery
    Celery --> Scrapers
    Scrapers -->|Raw Page Text| Gemini_Parser
    Gemini_Parser -->|Strict Pydantic JSON| Celery
    Celery -->|Store Result| Redis
    Store -->|Poll Task Status| API_Status
    API_Status -->|Fetch Result| Redis
```

---

## 💻 Tech Stack Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (`Vite 5`) | Fast single-page application and reactive UI |
| **Styling** | Tailwind CSS 3.4 + PostCSS | Modern responsive styling and micro-animations |
| **Icons** | Lucide React | Clean, lightweight iconography |
| **State Management** | Zustand | Lightweight global state for chat, filters, and scraped listings |
| **Authentication** | `@react-oauth/google` + `jwt-decode` | Seamless Google OAuth login flow |
| **Backend Framework** | FastAPI (Python 3.11) + Uvicorn | High-throughput asynchronous REST API gateway |
| **Data Schemas** | Pydantic v2 | Strict request validation and LLM response modeling |
| **Task Queue** | Celery 5.x | Asynchronous background task orchestration |
| **Message Broker** | Redis 7 | High-performance in-memory broker and result backend |
| **Web Scraping** | Playwright (Python async) | Headless Chromium automation with anti-bot stealth profiles |
| **HTML Sanitizer** | BeautifulSoup4 | Strips scripts, styles, and tags to minimize LLM token usage |
| **AI / LLM** | Google Gemini (`google-genai` SDK) | Intent extraction, itinerary generation & structured data synthesis |
| **Database ORM** | SQLAlchemy | Relational models for Users, Trips, Wishlist, and Wallets |
| **Containerization** | Docker & Docker Compose | Multi-container setup for local development and deployment |

---

## 📁 Repository Structure

```text
TripMacha/
├── .env.example                 # Root environment variables reference
├── .gitignore                   # Git ignore configurations (filters logs, dumps, PDBs)
├── docker-compose.yml           # Multi-container orchestration (Redis, DB, Backend, Worker)
├── README.md                    # Project documentation
│
├── backend/                     # FastAPI & Celery Backend Service
│   ├── Dockerfile               # Container build file (includes Chromium & dependencies)
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment template
│   └── app/
│       ├── main.py              # FastAPI app initialization, CORS, and router registration
│       ├── api/
│       │   ├── routes_chat.py   # Gemini AI intent extraction & itinerary generation
│       │   └── routes_scraping.py # Task dispatch and polling endpoints
│       ├── agents/
│       │   ├── chat_agents.py   # Chat helper routines
│       │   └── data_parser_agent.py # Gemini HTML-to-JSON cleaning & parsing pipeline
│       ├── core/
│       │   ├── config.py        # Centralized settings & environment loading
│       │   └── prompts.py       # LLM system prompts
│       ├── database/
│       │   └── models.py        # SQLAlchemy models (User, Trip, WishlistItem)
│       ├── models/              # Pydantic data schemas
│       │   ├── diy_schemas.py
│       │   ├── tour_schemas.py
│       │   └── user_request.py
│       ├── scrapers/            # Playwright automation engine
│       │   ├── core_browser.py  # Stealth browser launcher & popup handler
│       │   ├── individual_diy/  # Scrapers for flights, OTAs
│       │   └── tour_packages/   # Scrapers for SOTC, Thrillophilia, Veena World
│       └── workers/
│           ├── celery_app.py    # Celery instance configuration
│           └── tasks.py         # Parallel scraping tasks and package assembly
│
├── frontend/                    # React (Vite) Single Page Application
│   ├── package.json             # NPM dependencies and scripts
│   ├── vite.config.js           # Vite dev server configuration
│   ├── tailwind.config.js       # Tailwind CSS design system tokens
│   ├── .env.example             # Frontend environment template
│   └── src/
│       ├── App.jsx              # Workspace entry point
│       ├── Main.jsx             # React DOM root render
│       ├── index.css            # Tailwind baseline directives
│       ├── components/
│       │   ├── TripMachaLogo.jsx
│       │   ├── chat/            # ChatSidebar & MessageBubble
│       │   └── dashboard/       # DIYSearchForm, TourSearchForm, LiveComparisonDashboard
│       ├── pages/
│       │   ├── LandingPage.jsx  # Hero landing experience
│       │   └── HybridPlanner.jsx# Split-pane search & live comparison workspace
│       ├── services/
│       │   └── api.js           # Centralized Axios API service
│       └── store/
│           └── useTripStore.js  # Zustand state store
│
└── infrastructure/              # Local Windows Redis binaries (for non-docker Windows run)
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `backend/` directory (or use `.env.example` as a template):

```bash
# ==========================================================
# TripMacha Backend Environment Configuration
# ==========================================================

# 1. Google Gemini AI API Key (Required for AI features)
# Obtain a free key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here

# 2. Redis Connection (Used for Celery task queuing & results)
# When running locally without Docker:
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# 3. PostgreSQL Database Connection (Optional for local search, required for auth/history)
DATABASE_URL=postgresql://tripmacha_admin:local_password_123@localhost:5432/tripmacha_dev_db

# 4. Frontend CORS Configuration
FRONTEND_URL=http://localhost:5173
```

For the `frontend/` folder, an optional `.env` can configure custom endpoints:

```bash
# Frontend API Base URL (defaults to http://localhost:8000 if not specified)
VITE_API_URL=http://localhost:8000
```

---

## 🚀 Local Development Setup

### Method 1: Docker Compose (Recommended)

This spins up Redis, PostgreSQL, the FastAPI backend, and the Celery Playwright worker automatically.

1. **Clone the repository and enter the directory:**
   ```bash
   git clone https://github.com/your-username/TripMacha.git
   cd TripMacha
   ```

2. **Set your Gemini API Key:**
   Create `backend/.env` with your `GEMINI_API_KEY`.

3. **Start the backend infrastructure:**
   ```bash
   docker-compose up --build
   ```

4. **Start the Frontend (in a separate terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

---

### Method 2: Multi-Terminal Manual Run

If you are developing locally without Docker, open **four separate terminals**:

#### Terminal 1: Redis Broker
- **On Linux / macOS:**
  ```bash
  redis-server
  ```
  *(or `docker run -d -p 6379:6379 redis:7-alpine`)*
- **On Windows:**
  You can run the bundled portable Redis executable:
  ```powershell
  cd infrastructure
  .\redis-server.exe
  ```

#### Terminal 2: FastAPI Backend Server
```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
playwright install chromium

uvicorn app.main:app --reload --port 8000
```
Verify the backend is live by opening: `http://localhost:8000/health` or interactive docs at `http://localhost:8000/docs`.

#### Terminal 3: Celery Background Worker
*(With your virtual environment activated)*
```bash
cd backend

# On Linux / macOS:
celery -A app.workers.celery_app.celery_app worker --loglevel=info --concurrency=2

# On Windows (use solo pool to prevent subprocess concurrency blocks):
celery -A app.workers.celery_app.celery_app worker --loglevel=info --pool=solo
```

#### Terminal 4: React (Vite) Frontend
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to access the TripMacha dashboard!

---

## 📡 API Reference

### 1. AI Co-Pilot Intent & Itinerary
- **Endpoint:** `POST /api/chat`
- **Payload:**
  ```json
  {
    "prompt": "I want to take a 4-day weekend trip to Goa around next month",
    "history": []
  }
  ```
- **Response:**
  ```json
  {
    "chat_reply": "Here is an exciting 3-day itinerary for Goa: Day 1: North Goa beaches...",
    "airport_code": "GOI",
    "search_date": "2026-10-20"
  }
  ```

### 2. Trigger Search Task
- **Endpoint:** `POST /api/scrape/trigger-search`
- **Query Parameters:**
  - `mode`: `diy` | `flights` | `hotels` | `trains` | `buses` | `cabs` | `tours`
  - `origin`: e.g. `DEL` or `Delhi`
  - `destination`: e.g. `GOI` or `Goa`
  - `date`: `YYYY-MM-DD`
  - `duration`: e.g. `4` (days)
  - `budget`: `shoestring` | `moderate` | `premium` | `luxury`
- **Response:**
  ```json
  {
    "task_id": "a9082ef7-3210-449e-8c54-7123985a9bc1",
    "status": "Processing diy matrix execution"
  }
  ```

### 3. Poll Task Status
- **Endpoint:** `GET /api/scrape/status/{task_id}`
- **Response (In Progress):**
  ```json
  {
    "status": "Simultaneously scraping Flights, Hotels, and Ground Transport...",
    "data": null
  }
  ```
- **Response (Completed):**
  ```json
  {
    "status": "completed",
    "data": {
      "destination": "Goa Holiday Deals",
      "flights": [
        {
          "airline": "IndiGo 6E-205",
          "departure_time": "06:15 AM",
          "arrival_time": "08:45 AM",
          "price": "₹5,420",
          "link": "https://www.makemytrip.com",
          "itinerary": []
        }
      ]
    }
  }
  ```

---

## 🌐 Aggregator & Scraper Coverage

| Category | Aggregators / Providers Targeted | Engine Strategy |
| :--- | :--- | :--- |
| **Flights** | MakeMyTrip, Kayak, Cleartrip, IndiGo | Parallel Playwright + IATA Code Normalizer |
| **Hotels** | Booking.com, Cleartrip Hotels | Live rate extraction & guest-count filtering |
| **Trains** | ConfirmTkt (IRCTC GDS) | Station route resolver & live quota availability |
| **Buses** | RedBus | Intercity sleeper/volvo live inventory |
| **Cabs** | MakeMyTrip Cabs, Goibibo Outstation | Fixed & per-km outstation rate estimator |
| **Tour Packages** | Thomas Cook, Thrillophilia, SOTC, Veena World | Accordion-based day-by-day itinerary parser |

---

## 💡 Windows Gotchas & Performance Tips

1. **Celery Worker Pool on Windows:**
   On Windows, Celery's default `prefork` process pool will fail with `ValueError: not enough values to unpack`. Always run with `--pool=solo`:
   ```powershell
   celery -A app.workers.celery_app.celery_app worker --loglevel=info --pool=solo
   ```
2. **Playwright Browser Binaries:**
   If you see `Executable doesn't exist at C:\Users\...\ms-playwright\chromium...`, run:
   ```bash
   playwright install chromium
   ```
3. **PDB & Temp Files:**
   The `.gitignore` has been pre-configured to exclude large memory dumps (`dump.rdb`) and Windows debug symbol files (`*.pdb`) so your commits remain lightweight.

---

## 📤 How to Upload this Project to GitHub

Follow these steps to publish this repository to your personal GitHub account:

### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Choose a repository name (e.g., `TripMacha` or `tripmacha-ai-travel`).
3. Set the visibility to **Public** or **Private**.
4. **Important:** Leave "Initialize this repository with a README" **unchecked** (we already have a complete one).
5. Click **Create repository**.

### Step 2: Initialize Git and Commit Locally

Open your terminal in this project root (`TripMacha-main`) and run:

```bash
# 1. Initialize local Git repository
git init

# 2. Rename default branch to main
git branch -M main

# 3. Stage all clean project files
git add .

# 4. Create your first commit
git commit -m "feat: initial commit of TripMacha AI travel aggregator"
```

### Step 3: Link Remote and Push to GitHub

Copy the repository URL from GitHub (HTTPS or SSH) and run:

```bash
# 5. Add your GitHub repository as the remote origin
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 6. Push your code to GitHub
git push -u origin main
```

*(Enter your GitHub username and Personal Access Token / sign in when prompted).*

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to customize and expand for your personal or commercial travel applications.
