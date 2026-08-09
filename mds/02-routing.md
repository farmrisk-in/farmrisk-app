# Routing & Screens (Expo Router v6)

Expo Router uses file-based routing: every file under `app/` becomes a route. This project has **no manual route registrations** beyond the `Stack`/`Tabs` layouts — adding a file adds a screen.

---

## Root Stack — `app/_layout.tsx`

The root layout renders providers and a `<Stack>` navigator:

| `Stack.Screen` name | Route path | Presentation | Notes |
|---|---|---|---|
| `onboarding` | `/onboarding` | group w/ own Stack | 5-step first-launch flow, header hidden (see §Onboarding flow below) |
| `(tabs)` | `/` | default | Tab navigator, header hidden |
| `search` | `/search` | `modal`, `fade_from_bottom` | header hidden |
| `profile` | `/profile` | `transparentModal` | header hidden |
| `map` | `/map` | `fullScreenModal`, `slide_from_bottom` | header hidden, title "Map" |
| `weather-table` | `/weather-table` | `card` | header hidden |
| `soil-detail` | `/soil-detail` | `card` | header hidden |

Global `screenOptions` set the content background to `#09090b` (dark) / `#ffffff` (light).

`StatusBar` style follows the color scheme (`light` in dark mode, `dark` in light mode).

`LogBox.ignoreLogs(["Require cycle: node_modules/victory"])` silences a known Victory warning.

---

## Bottom Tabs — `app/(tabs)/_layout.tsx`

Four tabs, header hidden, custom active/inactive tints:

| Tab file | Tab title | Icon (Hugeicons) |
|---|---|---|
| `index.tsx` | Home | `Home01Icon` |
| `forecast.tsx` | Forecast | `SunCloud01Icon` |
| `tools.tsx` | Tools | `Wrench01Icon` |
| `alerts.tsx` | Alerts | `Notification01Icon` |

Tab bar styling: floating bar with `paddingBottom = max(insets.bottom, 12)`, `marginBottom: 10`, label size 11 semibold. Active tint `#4ade80` (dark) / `#007a55` (light); inactive `#9f9fa9` / `#71717a`.

---

## Screens

### 1. Dashboard / Home — `app/(tabs)/index.tsx`
Composes, in order: `Header` → `SearchSection` → `CurrentWeatherSection` → `RiskSection` → `HourlyWeatherSection` → `ForecastSection` → `SoilMoistureSection` → `AIAdvisorySection`.

- Uses `useRefreshDashboard()` for pull-to-refresh (10s cooldown).
- If `!location && !isResolving && locationError` → renders `<LocationRequired />` full-screen instead.
- Local `selectedCrop` state is passed to `AIAdvisorySection` (currently always `""`).

### 2. Forecast tab — `app/(tabs)/forecast.tsx`
Renders `Header` → `HourlyWeatherSection` → `ForecastSection` → `SoilMoistureSection crop={selectedCrop}` → `CropCalendarSection crop={selectedCrop}`.

- Reads `selectedCrop` from `useCropContext()` (set in Profile screen).
- Same `LocationRequired` guard + pull-to-refresh.

### 3. Tools tab — `app/(tabs)/tools.tsx`
Renders `Header` → section title → `AIAdvisorySection crop={selectedCrop}` → a static "Smart Field Utilities" card (Irrigation Tool, Sowing Planner placeholders).

### 4. Alerts tab — `app/(tabs)/alerts.tsx`
Renders `Header` → section title → `LightningRiskSection` → static "Active Weather Hazards" card (Heavy Rainfall / Heatwave / Frost placeholders).

### 5. Search — `app/search.tsx` (modal)
Google-Maps-style search page:
- Paper `Searchbar` (auto-focused on mount), NativeWind-styled via `cssInterop`.
- **Debounced query (300ms)** → `useLocationSearch(q)` from `@/hooks/useDashboardQueries` (min 3 chars, 30s cache).
- Shows matching **recent searches** (AsyncStorage `farmrisk:recent_locations`, max 5) merged with API results (duplicates filtered out).
- "Use My Location" quick action calls `requestCurrentLocation()`.
- "Select on Map" navigates to `/map`.
- Selecting a result: builds `SelectedLocation { lat, lng, name, displayName }`, calls `setLocation(loc)`, saves to recents, `router.back()`.

### 6. Map — `app/map.tsx` (full-screen modal)
Leaflet-based location picker:
- Renders `<LeafletMapView>` (WebView) centered on current `location` or default (23.0225, 72.5714 — Dholka, Gujarat).
- Crosshair center; `onMove` debounces (500ms) a **reverse geocode** to show place name.
- "My Location" button: requests GPS permission, then `injectJavaScript` dispatches a `flyTo` message to the WebView.
- "Confirm": reverse-geocodes the center, calls `setLocation(...)`, `router.back()`.
- Custom top bar + bottom info panel with coords, place name, and Confirm button.

### 7. Profile — `app/profile.tsx` (transparent modal)
Two modes via local state `Mode = "login" | "register"`:
- **Logged out:** name/phone/password form. Registration creates email `${phone}@farmrisk.app` with metadata `{ first_name, last_name, phone }` via `supabase.auth.signUp`. Login uses `signInWithPassword`. Phone validated by `normalizePhoneNumber` (10-digit Indian mobile starting 6–9).
- **Logged in:** profile card (Theme toggle, Active Crop picker modal, Name, Phone, Email) + Sign Out button. Crop picker uses `useCrops()` + `useCropContext().setSelectedCrop`.
- The "Active Crop" selection persists (CropProvider) and feeds the Forecast & Tools tabs.

### 8. Weather table — `app/weather-table.tsx`
Full-page tables reached via `router.push("/weather-table?type=hourly" | "type=forecast")`:
- **Hourly:** 24-hour rows (time, temp, rain chance, rain mm, wind km/h, icon).
- **Forecast:** 16-day rows (date, high/low, rain mm, icon) using `useForecast().forecastRows`, falling back to `weather.daily` when empty.

### 9. Soil detail — `app/soil-detail.tsx`
Full-page soil moisture table (date, moisture bar %, rain, PE) from `useSoilMoisture()`, newest first. (Currently not linked from any screen — reachable via deep link `/soil-detail`.)

---

## Onboarding flow — `app/onboarding/`

A 5-step, first-launch sequence driven by a small state machine (`constants/onboarding.ts`) with AsyncStorage persistence (`lib/onboarding.ts`). It is the root `Stack`'s `initialRouteName` (`app/_layout.tsx`), so **every launch starts at `/onboarding`** — the splash decides where to go next:

| Step | Screen | Route | What happens |
|---|---|---|---|
| **1 — Splash** | `app/onboarding/index.tsx` | `/onboarding` | Dark screen with logo + wordmark; after **1.8s** (`SPLASH_DURATION_MS`) checks `isOnboarded()` → `router.replace("/")` if `has_onboarded === "true"`, else `router.replace("/onboarding/welcome")` |
| **2 — Welcome** | `app/onboarding/welcome.tsx` | `/onboarding/welcome` | `ImageBackground` (`assets/images/splash.png`) + `LinearGradient` fade to `#09090b`; top bar with **language selector** (`LanguageSelector`, EN/HI/MR/TA/GU); glassmorphic `BlurView` card (title, subtitle, **Get Started** CTA → `/onboarding/auth`) |
| **3 — Auth** | `app/onboarding/auth.tsx` | `/onboarding/auth` | Sign in / Register toggle (Supabase phone auth, same logic as `profile.tsx`), or **Continue as Guest** → `/onboarding/location-perm` |
| **4 — Location** | `app/onboarding/location-perm.tsx` | `/onboarding/location-perm` | `transparentModal` with `BlurView` backdrop; **Allow Location Access** → `Location.requestForegroundPermissionsAsync()` + `requestCurrentLocation()`; **Select Location Manually** → `router.push("/search")` (existing search screen). Once a location exists, the CTA becomes **Continue to Dashboard** |
| **5 — Complete** | (no screen) | `/` | `markOnboarded()` writes `has_onboarded = "true"`, then `router.replace("/")` lands on the dashboard; every later launch skips straight to the tabs |

Key details:

- **Transitions use `router.replace()`** so the onboarding stack never accumulates back-stack entries (back button from location-perm returns to auth, not to splash).
- The onboarding Stack (`app/onboarding/_layout.tsx`) sets `headerShown: false`, `contentStyle: { backgroundColor: "#09090b" }`, and per-screen animations: `none` (splash), `fade` (welcome), `slide_from_bottom` (auth), `fade` + `transparentModal` (location-perm).
- **`LocationProvider` skips its GPS auto-prompt during onboarding** — `requestCurrentLocation` is only invoked automatically once `has_onboarded === "true"`, so the permission dialog never fires during splash/welcome. The location-perm step is the deliberate, user-initiated permission moment.
- Guest users get no Supabase account — `useAuth()` simply reports no user; the dashboard works fully as guest.

---

## Navigation Patterns Used

- `router.replace("/onboarding/<step>")` — forward transitions inside the onboarding flow (replaces, keeps back-stack clean).
- `router.replace("/")` — onboarding complete (from splash when already onboarded, and from location-perm when finishing).
- `router.push("/profile")` — Header avatar/menu button.
- `router.push("/search")` — SearchSection fake search bar.
- `router.push("/map")` — SearchSection map button + search screen "Select on Map".
- `router.push("/weather-table?type=hourly")` — HourlyWeatherSection "Next 24 Hours" pill.
- `router.push("/weather-table?type=forecast")` — ForecastSection chevron.
- `router.back()` — modals/sheets after selection.

## How to Add a New Screen

1. Create `app/<name>.tsx` (or `app/(tabs)/<name>.tsx` for a tab).
2. Register in the root `Stack` (add a `<Stack.Screen name="<name>" options={...} />`) if you need custom presentation; Expo Router will auto-add it otherwise.
3. To add a tab: create the file under `app/(tabs)/` and register in `app/(tabs)/_layout.tsx` with `title` + `tabBarIcon`.
