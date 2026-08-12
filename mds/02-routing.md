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
| `farm-select` | `/farm-select` | `fullScreenModal`, `slide_from_bottom` | header hidden — satellite map, draw/select farms |
| `my-farms` | `/my-farms` | `modal`, `slide_from_bottom` | header hidden — saved farm list (from profile) |
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
| `weather.tsx` | Forecast | `SunCloud01Icon` |
| `farmrisk.tsx` | Tools | `Wrench01Icon` |
| `insights.tsx` | Alerts | `Notification01Icon` |

Tab bar styling: floating bar with `paddingBottom = max(insets.bottom, 12)`, `marginBottom: 10`, label size 11 semibold. Active tint `#4ade80` (dark) / `#007a55` (light); inactive `#9f9fa9` / `#71717a`.

---

## Screens

### 1. Dashboard / Home — `app/(tabs)/index.tsx`
Composes, in order: `Header` → `SearchSection` → `CurrentWeatherSection` → `RiskSection` → `HourlyWeatherSection` → `ForecastSection` → `SoilMoistureSection` → `AIAdvisorySection`.

- Uses `useRefreshDashboard()` for pull-to-refresh (10s cooldown).
- If `!location && !isResolving && locationError` → renders `<LocationRequired />` full-screen instead.
- Local `selectedCrop` state is passed to `AIAdvisorySection` (currently always `""`).

### 2. Forecast tab — `app/(tabs)/weather.tsx`
Renders `Header` → `HourlyWeatherSection` → `ForecastSection` → `SoilMoistureSection crop={selectedCrop}` → `CropCalendarSection crop={selectedCrop}`.

- Reads `selectedCrop` from `useCropContext()` (set in Profile screen).
- Same `LocationRequired` guard + pull-to-refresh.

### 3. Tools tab — `app/(tabs)/farmrisk.tsx`
Renders `Header` → section title → `AIAdvisorySection crop={selectedCrop}` → a static "Smart Field Utilities" card (Irrigation Tool, Sowing Planner placeholders).

### 4. Alerts tab — `app/(tabs)/insights.tsx`
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
- **Logged in:** profile card (Theme toggle, Active Crop picker modal, Name, Phone, Email, **My Farms** row → `router.push("/my-farms")`) + Sign Out button. Crop picker uses `useCrops()` + `useCropContext().setSelectedCrop`.
- The "Active Crop" selection persists (CropProvider) and feeds the Forecast & Tools tabs.

### 8. Weather table — `app/weather-table.tsx`
Full-page tables reached via `router.push("/weather-table?type=hourly" | "type=forecast")`:
- **Hourly:** 24-hour rows (time, temp, rain chance, rain mm, wind km/h, icon).
- **Forecast:** 16-day rows (date, high/low, rain mm, icon) using `useForecast().forecastRows`, falling back to `weather.daily` when empty.

### 9. Soil detail — `app/soil-detail.tsx`
Full-page soil moisture table (date, moisture bar %, rain, PE) from `useSoilMoisture()`, newest first. (Currently not linked from any screen — reachable via deep link `/soil-detail`.)

### 10. Farm select — `app/farm-select.tsx` (full-screen modal)
Satellite map for drawing & selecting farm boundaries. Entry points: **Profile → My Farms → Select on Map** and **Onboarding Step 5**.
- Renders `<FarmMapView>` (WebView + Leaflet, ArcGIS World Imagery satellite tiles + labels overlay) centered on the active `location` (or Dholka, Gujarat default).
- **Browse mode:** tap a saved farm polygon → `farm_selected` event → `selectFarm(farm)` → `router.back()`.
- **Draw mode:** tap to place vertices, **Undo** pops the last point, **Finish** (≥3 points) validates the polygon and opens `SaveFieldDialog` (name, crops, season, crop stage). Saving calls `saveField(...)` (Supabase for logged-in, AsyncStorage for guests) and re-renders the farms.
- GPS button requests `expo-location` permission and `flyTo` the current position.

### 11. My Farms — `app/my-farms.tsx` (modal)
List of saved farms from `useFields()` with select / delete / GeoJSON export:
- **Tap a farm** → `selectFarm(farm)` (persists to AsyncStorage, moves the active location to the farm centroid) → `router.back()`.
- **Export GeoJSON** → `Share.share()` a `FeatureCollection` of all farms.
- **Delete** → `Alert` confirm → `deleteField(id)`.
- "Select on Map" + empty-state CTA → `router.push("/farm-select")`. Active farm gets an "Active" badge.

---

## Onboarding flow — `app/onboarding/`

A 5-step, first-launch sequence driven by a small state machine (`constants/onboarding.ts`) with AsyncStorage persistence (`lib/onboarding.ts`). It is the root `Stack`'s `initialRouteName` (`app/_layout.tsx`), so **every launch starts at `/onboarding`** — the splash decides where to go next:

| Step | Screen | Route | What happens |
|---|---|---|---|
| **1 — Splash** | `app/onboarding/index.tsx` | `/onboarding` | Dark screen with logo + wordmark; after **1.8s** (`SPLASH_DURATION_MS`) checks `isOnboarded()` → `router.replace("/")` if `has_onboarded === "true"`, else `router.replace("/onboarding/welcome")` |
| **2 — Welcome** | `app/onboarding/welcome.tsx` | `/onboarding/welcome` | `ImageBackground` (`assets/images/splash.png`) + `LinearGradient` fade to `#09090b`; top bar with **language selector** (`LanguageSelector`, EN/HI/MR/TA/GU); glassmorphic `BlurView` card (title, subtitle, **Get Started** CTA → `/onboarding/auth`) |
| **3 — Auth** | `app/onboarding/auth.tsx` | `/onboarding/auth` | Sign in / Register toggle (Supabase phone auth, same logic as `profile.tsx`), or **Continue as Guest** → `/onboarding/location-perm` |
| **4 — Location** | `app/onboarding/location-perm.tsx` | `/onboarding/location-perm` | `transparentModal` with `BlurView` backdrop; **Allow Location Access** → `Location.requestForegroundPermissionsAsync()` + `requestCurrentLocation()`; **Select Location Manually** → `router.push("/search")` (existing search screen). Once a location exists, the CTA becomes **Continue to Dashboard** → `/onboarding/farm-select` |
| **5 — Farm select** | `app/onboarding/farm-select.tsx` | `/onboarding/farm-select` | `transparentModal` prompt: **Draw Farm** CTA → `router.push("/farm-select")` (full map), or **Skip for now**. `complete()` calls `markOnboarded()` then `router.replace("/")` — if a farm was selected, the dashboard's SearchSection shows it; otherwise GPS location is used |

Key details:

- **Transitions use `router.replace()`** so the onboarding stack never accumulates back-stack entries (back button from location-perm returns to auth, not to splash).
- The onboarding Stack (`app/onboarding/_layout.tsx`) sets `headerShown: false`, `contentStyle: { backgroundColor: "#09090b" }`, and per-screen animations: `none` (splash), `fade` (welcome), `slide_from_bottom` (auth), `fade` + `transparentModal` (location-perm and farm-select).
- **`LocationProvider` skips its GPS auto-prompt during onboarding** — `requestCurrentLocation` is only invoked automatically once `has_onboarded === "true"`, so the permission dialog never fires during splash/welcome. The location-perm step is the deliberate, user-initiated permission moment.
- **Farm selection is optional.** Skipping Step 5 is allowed — the app then uses GPS/village location. A farm selected later (Profile → My Farms, or SearchSection) updates the dashboard's active location to the farm centroid.
- Guest users get no Supabase account — `useAuth()` simply reports no user; the dashboard works fully as guest. Guest farms persist to AsyncStorage (`farmrisk:local_fields`) instead of Supabase.

---

## Navigation Patterns Used

- `router.replace("/onboarding/<step>")` — forward transitions inside the onboarding flow (replaces, keeps back-stack clean).
- `router.replace("/")` — onboarding complete (from splash when already onboarded, and from the farm-select step when finishing).
- `router.push("/profile")` — Header avatar/menu button.
- `router.push("/search")` — SearchSection fake search bar.
- `router.push("/map")` — SearchSection map button + search screen "Select on Map".
- `router.push("/my-farms")` — Profile "My Farms" row.
- `router.push("/farm-select")` — My Farms "Select on Map" + onboarding farm step's "Draw Farm" CTA.
- `router.push("/weather-table?type=hourly")` — HourlyWeatherSection "Next 24 Hours" pill.
- `router.push("/weather-table?type=forecast")` — ForecastSection chevron.
- `router.back()` — modals/sheets after selection.

## How to Add a New Screen

1. Create `app/<name>.tsx` (or `app/(tabs)/<name>.tsx` for a tab).
2. Register in the root `Stack` (add a `<Stack.Screen name="<name>" options={...} />`) if you need custom presentation; Expo Router will auto-add it otherwise.
3. To add a tab: create the file under `app/(tabs)/` and register in `app/(tabs)/_layout.tsx` with `title` + `tabBarIcon`.
