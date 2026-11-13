# TripMacha Mobile

A React Native + Expo companion app for TripMacha. It is built with TypeScript and runs on Android, iOS, and the web preview. The original Vite site and FastAPI backend remain in the repository.

## Run the app

    cd mobile
    npm install
    npm start

For an Android emulator, press **a** in the Expo terminal. For a connected phone, install Expo Go and scan the QR code while the phone and computer are on the same network.

The app starts in **offline demo mode**. Search, sample comparison cards, trip history, saved trips, and profile storage work without API keys or a running backend.

## Run against the TripMacha API

Copy **.env.example** to **.env** and set **EXPO_PUBLIC_API_URL**:

- Android emulator: **http://10.0.2.2:8000**
- Physical Android device: the development computer's LAN address, such as **http://192.168.1.4:8000**

Restart Expo after editing **.env**. The app calls **/api/chat**, **/api/scrape/trigger-search**, and **/api/scrape/status/{task_id}**. If the API or its Gemini/Redis/Celery dependencies are unavailable, the trip planner falls back to the sample plan.

## Android development build

Install JDK 17 and the Android SDK Platform 36, Build Tools, Platform Tools, and an Android emulator image. Then run:

    npm run prebuild:android
    npm run android

On Windows, keep the `mobile` project in a short path (for example, `C:\t`) if CMake or Ninja reports path-length errors during the native build.

The prebuild command generates the native **android/** Gradle project from the Expo config. Expo Go is the fastest demo path; a development or release build is required to exercise custom native modules such as local notifications.

## Android release build

The **preview** profile in **eas.json** creates an installable APK. The **production** profile creates an Android App Bundle for Google Play:

    npx eas-cli build --platform android --profile preview
    npx eas-cli build --platform android --profile production

The first EAS build requires an Expo account and signing credentials. Store publishing also requires the developer's Play Console account and release review.

## Mobile features

- Cross-platform trip planner with origin, destination, date, party size, duration, and budget options.
- REST API integration with deterministic sample-data fallback for offline demos.
- Trip comparison cards, itinerary summary, saved trips, and local trip history.
- Device-local profile using Android/iOS secure storage.
- Five-second local notification demo, with Android notification permission and channel setup.
- Native Android package identity: **com.tripmacha.mobile**.

Live account authentication and remote push notifications need provider credentials and backend endpoints. The local profile and reminder demo are self-contained and do not pretend those credentials exist.

## Job-description fit

This project demonstrates the JD's React Native, TypeScript, mobile UI, REST API, storage, notifications, Android build configuration, Git workflow, and release-profile setup. The same Expo project targets iOS; building an iOS binary requires macOS/Xcode.
