# Components

Three groups:
1. `components/dashboard/` — full data sections used to compose screens.
2. `components/ui/` — presentational primitives.
3. Top-level `components/` — shared building blocks (map, logo, icons, location gate).

---

## Dashboard Sections (`components/dashboard/`)

Barrel file `components/dashboard/index.ts` exports:
`Header`, `SearchSection`, `CurrentWeatherSection`, `HourlyWeatherSection`, `LightningRiskSection`, `ForecastSection`, `AIAdvisorySection`, `SoilMoistureSection`, `CropsSection`, `CalendarSection`, `CropCalendarSection`, `RiskSection`.

### `Header`
- Time-based greeting ("Good morning," etc.) + user name (from `useAuth().user.user_metadata`, falls back to email prefix or "Farmer").
- Logged out: shows `Logo` + "FarmRisk" wordmark.
- Logged in: shows avatar image (`assets/pic5.webp`) + name.
- Menu button (right) → `router.push("/profile")`.

### `SearchSection`
- Fake tappable search bar showing active `location.name` / `location.displayName` → `router.push("/search")`.
- GPS button → `requestCurrentLocation()` (spinner while resolving).
- Map button → `router.push("/map")`.

### `CurrentWeatherSection`
- Uses `useWeather()` + `useWeatherSummary(i18n.language)` + `useLocationContext()`.
- Gradient spotlight card (SVG radial gradient, emerald theme, dark/light variants).
- Shows: location coords badge, big temp, "Feels like", `WeatherIcon`, condition text, **AI weather summary** text (from `useWeatherSummary`), and an 8-metric 2×4 grid (Rainfall, Wind, Clouds, Humidity, Gusts, Direction, Pressure MSL, Pressure Surf).
- Loading → `CurrentWeatherSkeleton` (matching layout).

### `HourlyWeatherSection`
- Uses `useWeather()`; renders horizontal scroll of next-24h slots: time, icon, temp, rain chance %, rain mm, wind km/h.
- "Next 24 Hours" pill → `router.push("/weather-table?type=hourly")`.
- Loading/error states with skeletons.

### `ForecastSection`
- Uses `useForecast()` + `useWeather()`.
- Renders 16-day horizontal forecast: date, weekday, icon (by rain volume), Tmax, gradient bar, Tmin, precipitation mm.
- Falls back to Open-Meteo `daily` data when model rows are empty (shows "Bias Corrected" badge only when NOT fallback).
- → `router.push("/weather-table?type=forecast")`.

### `RiskSection`
- Uses `useRiskScore()`.
- Overall risk badge + 6 `RiskGauge` cards (Heavy Rain, Heat Stress, Pest/Disease, Lightning, High Wind, Frost) — each a VictoryPie gauge (110° arc) with band color.
- Tap a gauge → modal with risk level, major factor, and analysis reasons.
- Colors per band: Extreme `#ef4444`, High `#f97316`, Moderate `#eab308`, Low `#10b981`, Minimal gray.

### `SoilMoistureSection`
- Uses `useSoilMoisture(crop, daysbefore)`.
- **Very large component (~738 lines):** custom SVG/Victory multi-series chart (sm_percentile, P_obs, PE, E, R, G) with toggleable series, tooltip on touch, irrigation settings modal (`daysbefore` input), settings modal.
- Data: last 30 days sorted ascending; manual date parsing `YYYY-MM-DD` → "Aug 6" (Hermes-safe).
- `visibleDataRef`/touch refs distinguish tap vs drag for tooltips.

### `CropCalendarSection`
- Uses `useCalendar(crop)`; renders 12-month phase bars per season entry.
- Phases: **Sowing** (green), **Growing** (yellow/olive), **Harvesting** (red), with a "today" marker line.
- Handles month wrap-around (e.g. Nov→Feb) with two-segment bars.
- Empty/error/no-crop states.

### `CalendarSection`
- Older, simpler variant of the crop calendar using react-native-paper `Card`.
- Shows `crop — season`, sow period, harvest period (uses `sowingPeriod`/`harvestingPeriod` or computed from day/month fields).
- **Currently unused by any screen** (CropCalendarSection is used instead).

### `CropsSection`
- Uses `useCrops()`; horizontal chip list of top crops with area (ha).
- Props: `selectedCrop`, `onSelectCrop`. Tapping selects/deselects.
- **Currently unused by screens** (crop selection moved to Profile).

### `AIAdvisorySection`
- Props: `{ crop?: string }`. Uses `useAI(crop, i18n.language)`.
- Renders AI advisory markdown-lite: headers (`#`), bullets (`-`/`*`), **bold**, *italic* → styled RN Text.
- "Sources" button → modal listing `sources` (`{ source, page }`).
- Loading/error states.

### `LightningRiskSection`
- Uses `useWeather()` (`data.lightning: { score, category }`).
- Category → color/advisory/zoom: Severe `#FF040E`/z11, High `#FF4116`/z12, Moderate `#FF9C04`/z13, Low `#006045`/z10.5.
- Renders a non-interactive Leaflet map via `react-native-webview` (HTML string, CartoDB tiles dark/light, circle radius by category).

### `DownloadButton`
- Generic icon button (Hugeicons `Download01Icon`), logs "download" on press. Not wired to real functionality.

---

## UI Primitives (`components/ui/`)

### `Icon` — `Icon.tsx`
- Wraps `HugeiconsIcon` from `@hugeicons/react-native`.
- `cssInterop` maps `className` → `style` (with `color`/`opacity` as native style props).
- Props: `{ icon, size = 24, strokeWidth = 1.5, className, ... }`.

### `Skeleton` — `Skeleton.tsx`
- Animated shimmer placeholder (opacity loop 0.35 ↔ 0.85, 1s each way, native driver).
- Props: `{ width?, height?, borderRadius = 12, className?, style?, ...ViewProps }`.
- Background `bg-muted`.

### `LanguageSelector` — `LanguageSelector.tsx`
- Bottom-sheet `Modal` language picker. Props: `{ visible, onClose }`.
- Renders one row per `SUPPORTED_LANGUAGES` entry, showing each language's name in its **own script** (`LANGUAGE_NAMES` from `@/i18n`); active language gets a tick.
- On press → `changeAppLanguage(code)` (persists to AsyncStorage + switches instantly) then `onClose()`.
- Mounted from `app/profile.tsx` (Profile → Language row).

### `ThemeToggle` — `ThemeToggle.tsx`
- Uses `useColorScheme()` from nativewind (`toggleColorScheme`).
- Sun icon in dark mode, Moon in light.

### `Collapsible` — `collapsible.tsx`
- Simple expand/collapse using `IconSymbol` (chevron rotates 90° when open). Uses `Colors` from theme + `useColorScheme` hook.

### `IconSymbol` — `icon-symbol.tsx` / `icon-symbol.ios.tsx`
- `icon-symbol.tsx`: iOS `expo-symbols` `SymbolView` (SF Symbols). Props `{ name, size, color, weight }`.
- `icon-symbol.ios.tsx`: Android/web fallback using `@expo/vector-icons/MaterialIcons`, with a small `MAPPING` from SF Symbol names → Material icon names (`house.fill` → `home`, etc.).

---

## Shared Components (top-level `components/`)

### `WeatherIcon` — `WeatherIcon.tsx`
- Maps a weather condition name (with or without `.svg`, case-insensitive) → bundled SVG asset via a big `WEATHER_ICON_MAP`.
- Uses `expo-image` `Image` with `contentFit="contain"`.
- Default: `clear_day.svg`.
- 24 icons available in `assets/images/weathericons/` (blizzard, rain, snow, thunderstorms, fog/haze, clouds, etc.).

### `Logo` — `Logo.tsx`
- Inline SVG logo (emerald leaf mark) via `react-native-svg`, `cssInterop` for `className`.

### `LeafletMapView` — `LeafletMapView.tsx`
- `forwardRef<WebView, LeafletMapViewProps>` — ref lets parents call `injectJavaScript`.
- Props:
  ```ts
  {
    initialCenter: { lat, lng },
    initialZoom?: number,        // default 13
    isDark?: boolean,
    showZoomControl?: boolean,   // default false
    showCrosshair?: boolean,     // default true
    enableDrawing?: boolean,     // default false (Leaflet.Draw polygon mode)
    onMove?, onReady?, onClick?, onPolygonComplete?,
  }
  ```
- Generates an HTML string with Leaflet 1.9.4 (unpkg CDN), OSM light tiles / CartoDB dark tiles.
- Bidirectional messaging: RN→JS `flyTo`/`setView` (via injected message events; listens on both `window` and `document` for Android compat); JS→RN events `move`, `ready`, `click`, `polygon_complete` via `window.ReactNativeWebView.postMessage`.
- Used by `app/map.tsx` (location picker).

### `LocationRequired` — `LocationRequired.tsx`
- Full-screen prompt when no location could be resolved.
- Buttons: **Search Location** (`/search`), **Open Settings** (iOS `app-settings:` / Android `Linking.openSettings()`), **Retry** (`retryLocationInit()`).

---

## Component → Hook Dependency Map

| Component | Hooks used |
|---|---|
| `Header` | `useAuth`, `useRouter` |
| `SearchSection` | `useLocationContext`, `useRouter` |
| `CurrentWeatherSection` | `useWeather`, `useWeatherSummary`, `useLocationContext` |
| `HourlyWeatherSection` | `useWeather`, `useRouter` |
| `ForecastSection` | `useForecast`, `useWeather`, `useRouter` |
| `RiskSection` | `useRiskScore` |
| `SoilMoistureSection` | `useSoilMoisture` |
| `CropCalendarSection` | `useCalendar` |
| `CalendarSection` | `useCalendar` |
| `CropsSection` | `useCrops` |
| `AIAdvisorySection` | `useAI` |
| `LightningRiskSection` | `useWeather`, `useLocationContext` |
| `ThemeToggle` | nativewind `useColorScheme` |
| `LocationRequired` | `useLocationContext`, `useRouter` |
