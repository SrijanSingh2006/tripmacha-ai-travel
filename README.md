# TripMacha

TripMacha is an India-focused trip planner with a React web app, a React Native mobile app, and an optional FastAPI travel API.

## Features

- Plan trips by route, date, duration, group size, and budget.
- Compare sample flight, stay, and local experience options with an itinerary.
- Save trips and use device-local profile storage and reminders.
- Connect to the existing API for AI planning and travel searches; the mobile app falls back to offline demo data when the API is unavailable.

## Run the mobile app

```sh
cd mobile
npm install
npm run prebuild:android
npm run android
```

This builds and opens the native Android app. Use JDK 17 and the Android SDK with an emulator or connected device. For a browser preview, run `npm run web` from `mobile/`. See [mobile/README.md](mobile/README.md) for emulator, API, and release setup.

## Run the web app

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The web app uses the backend at `http://localhost:8000` by default.

## Connect the mobile app to the API

Copy `mobile/.env.example` to `mobile/.env` and set `EXPO_PUBLIC_API_URL`. For an Android emulator, use `http://10.0.2.2:8000`; for a physical phone, use the development computer's LAN address. Restart Expo after changing the value.

The API-backed AI and scraping features require the backend's Gemini key, Redis, and worker services. Without those services, the mobile app remains usable in demo mode.

## Tech stack

- Mobile: React Native, Expo, and TypeScript
- Web: React and Vite
- API: FastAPI and Python
- Background jobs and scraping: Celery, Redis, Playwright, and Gemini
- Data: PostgreSQL and SQLAlchemy

## Repository layout

- `mobile/` — Expo app, Android Gradle project, and EAS build profiles
- `frontend/` — React/Vite website
- `backend/` — FastAPI API, Celery tasks, and scrapers
- `docker-compose.yml` — Redis, PostgreSQL, API, and worker services
