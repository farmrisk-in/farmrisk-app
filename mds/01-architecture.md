# Architecture

## What is FarmRisk?

FarmRisk is a universal React Native app (iOS / Android / Web) delivering **village-level micro-climate data** to farmers:

- Current weather + hourly + 16-day forecasts
- Soil moisture modeling (daily water-balance history + forecasts)
- Crop lists + sowing/growing/harvesting calendars per region
- ML-based risk scoring for 6 hazards (heavy rain, heat, pest, lightning, wind, frost)
- AI-generated agricultural advisories (RAG over crop knowledge base), localized into Indian languages

The mobile client is a **thin client**: all data processing (bias correction, soil moisture model, risk engine, AI) happens on a Next.js backend. This repo only contains the app (the backend is a separate repo).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | React Native 0.81.5 + React 19.1.0 |
| SDK | Expo 54 (`expo ~54.0.36`) |
| Navigation | `expo-router ~6.0.23` (file-based) |
| Styling | NativeWind 4 + Tailwind CSS 3 (uses `global.css` design tokens) |
| Server state | TanStack Query v5 |
| Auth / DB | Supabase (`@supabase/supabase-js 2.110.5`) |
| Local storage | `@react-native-async-storage/async-storage` |
| Charts | `victory-native` |
| Maps | `react-native-webview` rendering Leaflet.js HTML |
| Icons | Hugeicons (`@hugeicons/react-native`, `@hugeicons/core-free-icons`) |
| UI kit (partial) | `react-native-paper` (Searchbar, Chip, Card, Text, Avatar) |
| Fonts/other | `expo-font`, `expo-linear-gradient`, `expo-haptics`, `expo-splash-screen`, `expo-status-bar`, `react-native-svg`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-gesture-handler` |
| Animations | `react-native-reanimated` (Skeleton shimmer), Animated API |
| Build | EAS (`eas.json`), GitHub Actions for APK releases |

> ⚠️ The app enables Expo experiments: `typedRoutes: true` and `reactCompiler: true` (see `app.json`).

---

## Folder Structure

```
farmrisk-app/
├── app/                    # Expo Router — every file = a screen/route
│   ├── _layout.tsx         # Root layout: providers + Stack navigator
│   ├── onboarding/         # 5-step first-launch flow (see 02-routing.md)
│   │   ├── _layout.tsx     # Onboarding Stack (header hidden, animations)
│   │   ├── index.tsx       # Step 1: Splash (1.8s, then routes on has_onboarded)
│   │   ├── welcome.tsx     # Step 2: Welcome hero (image + language picker + CTA)
│   │   ├── auth.tsx        # Step 3: Login / Register / Continue as Guest
│   │   └── location-perm.tsx # Step 4: Geolocation dialog (transparent modal)
│   ├── (tabs)/             # Bottom-tab group
│   │   ├── _layout.tsx     # Tab bar config (4 tabs)
│   │   ├── index.tsx       # Dashboard (Home) tab
│   │   ├── forecast.tsx    # Forecast tab
│   │   ├── tools.tsx       # Tools tab
│   │   └── alerts.tsx      # Alerts tab
│   ├── search.tsx          # Modal: location search
│   ├── map.tsx             # Full-screen: Leaflet map location picker
│   ├── profile.tsx         # Transparent modal: login/register + profile
│   ├── weather-table.tsx   # Full-page hourly/forecast tables
│   └── soil-detail.tsx     # Full-page soil moisture table
├── components/
│   ├── dashboard/          # Reusable dashboard section components
│   │   ├── index.ts        # Barrel export
│   │   ├── Header.tsx
│   │   ├── SearchSection.tsx
│   │   ├── CurrentWeatherSection.tsx
│   │   ├── HourlyWeatherSection.tsx
│   │   ├── ForecastSection.tsx
│   │   ├── SoilMoistureSection.tsx
│   │   ├── RiskSection.tsx
│   │   ├── LightningRiskSection.tsx
│   │   ├── AIAdvisorySection.tsx
│   │   ├── CropsSection.tsx
│   │   ├── CalendarSection.tsx
│   │   ├── CropCalendarSection.tsx
│   │   └── DownloadButton.tsx
│   ├── ui/                 # Generic UI primitives
│   │   ├── Icon.tsx        # Hugeicons wrapper (cssInterop)
│   │   ├── Skeleton.tsx    # Shimmer loading placeholder
│   │   ├── ThemeToggle.tsx
│   │   ├── collapsible.tsx
│   │   ├── icon-symbol.tsx        # SF Symbols (iOS)
│   │   └── icon-symbol.ios.tsx    # MaterialIcons fallback (Android/web)
│   ├── LeafletMapView.tsx  # WebView Leaflet map wrapper
│   ├── LocationRequired.tsx# Full-screen "need location" prompt
│   ├── Logo.tsx            # FarmRisk SVG logo
│   └── WeatherIcon.tsx     # Maps names → weather SVG assets
├── constants/
│   ├── theme.ts            # Colors (light/dark) + Fonts (legacy — mostly dead)
│   └── onboarding.ts       # Onboarding state machine: steps, routes, transitions, HAS_ONBOARDED_KEY
├── i18n/                   # i18next engine (see 08-theme-i18n.md + language.md)
│   ├── index.ts            # Init, storage, device detection, changeAppLanguage
│   ├── resources.ts        # Static import of all language × namespace JSON
│   ├── keys.d.ts           # Strict t() typing (en = source of truth)
│   └── locales/            # en/ hi/ mr/ ta/ gu/ × 9 namespaces each
├── hooks/                  # All custom hooks (see 04-hooks.md)
├── lib/
│   ├── api.ts              # All backend fetch functions
│   ├── supabase.ts         # Supabase client (AsyncStorage persistence)
│   ├── onboarding.ts       # isOnboarded() / markOnboarded() AsyncStorage helpers
│   └── auth/phone.ts       # Indian phone number normalizer
├── providers/              # React Context providers (see 03-providers.md)
├── types/                  # TypeScript types (see 07-types.md)
├── assets/
│   ├── images/             # App icons, splash, adaptive icons
│   ├── images/weathericons/# 24 SVG weather icons
│   └── avatar-default-svgrepo-com.svg # Default avatar SVG
├── global.css              # Tailwind + CSS design tokens (light/dark)
├── tailwind.config.js      # Maps CSS vars → Tailwind color names
├── app.json                # Expo app config
├── eas.json                # EAS build profiles
├── babel.config.js         # Babel with NativeWind
├── metro.config.js         # Metro with NativeWind
├── tsconfig.json           # Strict TS + @/ path alias
├── eslint.config.js        # Expo ESLint flat config
└── .github/workflows/      # CI/CD (APK build + Play Store release)
```

---

## Provider Tree (order matters)

Nested inside `app/_layout.tsx`, outer → inner:

```
QueryProvider            (TanStack QueryClient — retry 2, stale 5m, gc 10m)
└── PaperProvider        (react-native-paper theme provider)
    └── AuthProvider     (Supabase user/session)
        └── LanguageProvider  (i18n; renders null until AsyncStorage loads)
            └── LocationProvider  (active coordinates)
                └── CropProvider  (selected crop, persisted)
                    └── ThemeProvider  (@react-navigation/native light/dark)
                        └── <Stack>  (Expo Router navigator)
                            ├── onboarding   (nested Stack: splash → welcome → auth → location-perm)
                            ├── (tabs)
                            ├── search         (modal, fade_from_bottom)
                            ├── profile        (transparentModal)
                            ├── map            (fullScreenModal, slide_from_bottom)
                            ├── weather-table  (card)
                            └── soil-detail    (card)
                        └── <StatusBar>  (style follows color scheme)
```

**Why this order matters:**

- `QueryProvider` must wrap everything that uses `useQuery`.
- `LanguageProvider` **returns `null` while loading** the stored language → the whole app below it only renders after language hydration completes.
- `LocationProvider` kicks off async location resolution on mount — every data hook below it gates its query on `location` + `isResolving`.
- `CropProvider` is near the bottom so tabs can consume `useCropContext()` (used by Tools & Forecast tabs and Profile).

---

## Module Responsibilities

| Module | Responsibility |
|---|---|
| `app/` | Routing, screen composition, navigation state |
| `providers/` | Cross-cutting app state (auth, language, location, crop, query) |
| `hooks/` | Data-access hooks (TanStack Query) + UI hooks (theme, refresh, pro) |
| `lib/api.ts` | Single source of truth for backend calls |
| `lib/supabase.ts` | Supabase client singleton |
| `lib/onboarding.ts` | `isOnboarded()` / `markOnboarded()` AsyncStorage helpers |
| `components/dashboard/` | Composable dashboard "sections" (data + UI in one) |
| `components/ui/` | Presentational primitives |
| `i18n/` | i18next engine + per-language JSON namespaces (5 langs × 9 ns) |
| `constants/` | Theme tokens (legacy `theme.ts`) + onboarding state machine (`onboarding.ts`) |
| `types/` | Shared TypeScript contracts (mirror backend API shapes) |

---

## State Management Rules of Thumb

1. **Server data** (weather, forecast, soil, crops, calendar, AI, risk) → TanStack Query via hooks. Never keep server data in `useState`.
2. **Cross-cutting client state** → Context providers (location, auth, language, crop).
3. **Screen-local UI state** → `useState` inside components (e.g. modals, tooltips, form fields).
4. **Persistence** → AsyncStorage, always namespaced keys:
   - `has_onboarded` (onboarding flow — `"true"` skips the flow on next launch)
   - `farmrisk-language` (LanguageProvider)
   - `farmrisk:active_location` (LocationProvider)
   - `farmrisk:recent_locations` (LocationProvider + search screen)
   - `farmrisk_selected_crop` (CropProvider)
   - Supabase auth session (managed by Supabase client via `customStorage`)

---

## Pull-to-Refresh

All three data tabs (`index`, `forecast`, `tools`, `alerts`) use `useRefreshDashboard()` which:

1. Sets `refreshing = true`
2. **Spam-protects**: ignores refreshes within 10 seconds of the last one
3. Otherwise calls `queryClient.invalidateQueries()` (invalidates ALL queries, keeping location context)
4. Clears `refreshing`

RefreshControl spinner color is the brand green `#007a55`.
