# FarmRisk Mobile (Expo App) 🌾📱

Welcome to the **FarmRisk** mobile client repository. This is an universal React Native / Expo application designed to provide village-level micro-climate data, weather forecasting, crop calendar stages, soil moisture metrics, and real-time AI agricultural advisories for farmers.

---

## 🛠️ Project Architecture

We use **Expo SDK 54** with **Expo Router** file-based navigation, backed by **Supabase Auth** and persistent storage.

```
├── app/                      # Expo Router Navigation & Screens
│   ├── (tabs)/               # Bottom Tab Bar Layout
│   │   ├── _layout.tsx       # Bottom Tabs Shell configuration
│   │   ├── index.tsx         # Dashboard Screen (Free vs Paid Gated views)
│   │   └── profile.tsx       # Profile Details + Login & Register Form
│   ├── _layout.tsx           # Global Root Layout (injects Providers)
│   └── modal.tsx             # Info modal screen
├── constants/
│   ├── theme.ts              # Global colors (Light & Dark theme palettes)
│   ├── content.ts            # Localized string arrays for language translation
│   └── languages/            # Language files (en, hi, mr, ta, gu)
├── hooks/                    # Context hooks
│   ├── useAuth.ts            # Retrieves authentication state
│   ├── usePro.ts             # Checks if session exists (Pro status wrapper)
│   └── useLanguage.ts        # Localization translator hook
├── lib/                      # Framework Initializers & API Helpers
│   ├── supabase.ts           # Supabase client with AsyncStorage session persistence
│   ├── api.ts                # Unified fetches mapping to the Next.js API endpoints
│   └── auth/
│       └── phone.ts          # Phone normalizer (10-digit Indian numbers)
└── providers/                # Global State Contexts
    ├── AuthProvider.tsx      # Handles reactive Supabase session subscriptions
    ├── LanguageProvider.tsx  # Handles AsyncStorage-backed language selection
    └── LocationProvider.tsx  # Manages active coordinate state (defaults to Dholka)
```

---

## 🚀 Local Development Setup

### 1. Prerequisites

Ensure you have **Node.js**, **Bun**, and the **Expo CLI** (or EAS CLI) installed.

### 2. Environment Configuration

Create a `.env` file in the root directory (this is already set up for you):

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_URL=
```

> [!NOTE]
> During development, `EXPO_PUBLIC_API_URL` should point to your active Next.js backend server. The mobile app automatically handles routing requests from `localhost` to `10.0.2.2` when running inside an Android Emulator.

### 3. Install Dependencies

Run the package installer:

```bash
bun install
```

### 4. Run the Development Server

```bash
bun start
```

- Press **`a`** to load the app in an Android Emulator.
- Press **`i`** to load the app in an iOS Simulator.
- Press **`w`** to open the web portal version in your browser.

---

## 📦 Building the Android APK

To distribute the app directly to users or upload it to GitHub, you need an **APK file**. There are three ways to build this:

### Option A: Automated Release (GitHub Actions)

We have configured a CI/CD pipeline inside [.github/workflows/build-and-release.yml](file:///.github/workflows/build-and-release.yml).

1. Add an `EXPO_TOKEN` secret to your GitHub Repository Settings (generated from your [Expo Dashboard](https://expo.dev/settings/access-tokens)).
2. Push a release tag starting with `v` (e.g., `v1.0.0`):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. The Action will automatically spin up, build the APK locally, create a new **GitHub Release**, and upload `app-release.apk` to it!

---

### Option B: Local EAS Builder (No Cloud Credits Needed)

You can compile the Android package directly on your local computer using the installed Android SDK.

1. Log in to your Expo account:
   ```bash
   eas login
   ```
2. Run the local build command:
   ```bash
   eas build --platform android --profile preview --local
   ```
3. After the build completes, the compiled `.apk` file will be generated in your project root directory.

---

### Option C: EAS Cloud Builder (Uses Expo Servers)

If you don't have the Android SDK or Java configured locally, you can delegate the compilation to Expo's remote servers:

1. Log in to your Expo account:
   ```bash
   eas login
   ```
2. Run the EAS build command:
   ```bash
   eas build --platform android --profile preview
   ```
3. Once the build completes on Expo's servers, a download URL will be printed to your terminal. Click it to download your compiled `.apk` file.

---

## 🐙 Adding APK to GitHub Releases Manually

If you built the APK locally using **Option B** or **Option C**, you can attach it to a GitHub Release manually:

1. Navigate to your repository page on GitHub.
2. Click **Releases** on the right sidebar, then click **Draft a new release**.
3. Create a version tag (e.g., `v1.0.0`), enter a title, and write release notes.
4. Drag and drop the compiled `.apk` file into the box labeled **"Attach binaries by dropping them here"**.
5. Click **Publish release** to save and distribute!
