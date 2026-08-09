# Components

Three groups:

1. `components/dashboard/` — full data sections used to compose screens.
2. `components/ui/` — presentational primitives.
3. Top-level `components/` — shared building blocks (map, logo, icons, location gate).

---

## Dashboard Sections (`components/dashboard/`)

Barrel file `components/dashboard/index.ts` exports:
`Header`, `SearchSection`, `CurrentWeatherSection`, `HourlyWeatherSection`, `LightningRiskSection`, `ForecastSection`, `AIAdvisorySection`, `SoilMoistureSection`, `CropsSection`, `CalendarSection`, `CropCalendarSection`, `RiskSection`.

`ExportTemplate` and `DownloadButton` are **not** in the barrel — they are standalone (capture-only + widget) and are imported directly via `@/components/dashboard/...`.

### `Header`

- Time-based greeting ("Good morning," etc.) + user name (from `useAuth().user.user_metadata`, falls back to email prefix or "Farmer").
- Logged out: shows `Logo` + "FarmRisk" wordmark.
- Logged in: shows avatar image (`assets/pic5.webp`) + name.
- Menu button (right) → `router.push("/profile")`.

### `SearchSection`

- Fake tappable search bar showing active `location.name` / `location.displayName` → `router.push("/search")`.
- When a farm is active (`useFarmContext().selectedFarm`): shows the farm name + emerald "Farm" badge, with "Active" as the subtext.
- GPS button → if a farm is selected, calls `clearFarm()` to switch back to GPS mode; otherwise calls `requestCurrentLocation()` (spinner while resolving).
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
- Renders AI advisory markdown-lite: headers (`#`), bullets (`-`/`*`), **bold**, _italic_ → styled RN Text.
- "Sources" button → modal listing `sources` (`{ source, page }`).
- Loading/error states.

### `LightningRiskSection`

- Uses `useWeather()` (`data.lightning: { score, category }`).
- Category → color/advisory/zoom: Severe `#FF040E`/z11, High `#FF4116`/z12, Moderate `#FF9C04`/z13, Low `#006045`/z10.5.
- Renders a non-interactive Leaflet map via `react-native-webview` (HTML string, CartoDB tiles dark/light, circle radius by category).

### `ExportTemplate` — `ExportTemplate.tsx`

- **Capture-only template** rendered off-screen by `DownloadButton` (position `absolute`, `left: -9999`, `opacity: 0.99` — must stay `> 0` or `react-native-view-shot` refuses to capture) and captured as a JPEG.
- Fixed 680px-wide, white-background `View` that mirrors the web app's `DownloadTemplate` layout: header (FarmRisk logo + date/time), location bar (selected farm name or GPS location + crop badge), current weather strip (temp, humidity, wind, rain), 16-day forecast grid (temp bars), soil-moisture SVG line chart (30-day, dry/normal/wet bands + legend), risk grid (6 hazard cards with score/band colors), crop calendar (12-month sowing/growing/harvesting cells), AI advisory text, and a "Generated by FarmRisk" footer.
- Hooks: `useWeather`, `useForecast`, `useSoilMoisture`, `useAI(crop, lang)`, `useRiskScore`, `useCalendar`, `useLocationContext`, `useCropContext`. No extra API calls — React Query cache is shared with the dashboard.
- i18n: uses separate `useTranslation(["dashboard", "fields", "calendar"])` and `useTranslation(["weather"])` functions (strict keys — no `{ ns }` override options).
- Charts use `react-native-svg` (no VictoryNative) so capture stays deterministic.
- Props: `{ selectedFarm?: SavedField | null }`.

### `DownloadButton` — `DownloadButton.tsx`

- Full-width emerald button (Hugeicons `Download01Icon`) that exports the dashboard as a JPEG to the device gallery.
- Flow: `MediaLibrary.requestPermissionsAsync()` → `captureRef(viewShotRef, { format: "jpg", quality: 0.95, result: "tmpfile" })` on the off-screen `ExportTemplate` → `MediaLibrary.createAssetAsync(uri)` → adds the asset to a "FarmRisk" album (album creation is wrapped in try/catch — some Android devices throw; the asset still lands in the camera roll).
- Shows a spinner + localized "Generating..." label while capturing; success/error handled via `Alert`.
- i18n keys live in the `profile` namespace: `downloadImage`, `downloadGenerating`, `downloadPermissionTitle`, `downloadPermissionMsg`, `downloadSuccessTitle`, `downloadSuccessMsg`, `downloadErrorTitle`, `downloadErrorMsg` (all 5 locales: en/hi/mr/ta/gu).
- Props: `{ selectedFarm?: SavedField | null }` — passed the active farm from `useFarmContext()` so the exported report shows the farm name.
- Mounted in `app/profile.tsx` (logged-in state, between the profile hero card and the Preferences section).

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

## Farm Components (`components/farms/`)

### `FarmMapView` — `components/farms/FarmMapView.tsx`

A WebView-based Leaflet map specialized for farm boundary drawing. Uses an `imperativeHandle` (`FarmMapHandle`) so parent screens call methods directly instead of props updating.

**Map tiles:** ArcGIS World Imagery (satellite) + World Boundaries & Places (labels overlay).

**Props / events:**

```ts
interface FarmMapHandle {
  flyTo(lat: number, lng: number, zoom?: number): void;
  renderFarms(farms: SavedField[]): void;
  setDrawMode(on: boolean): void;
  clearDrawing(): void;
  undoPoint(): void;
  finishDrawing(): void;
}

type FarmMapEvent =
  | { type: "ready" }
  | { type: "point_added"; points: DrawnVertex[] }
  | { type: "point_removed"; points: DrawnVertex[] }
  | { type: "polygon_complete"; points: DrawnVertex[] }
  | { type: "farm_selected"; fieldId: string };
```

**Behavior:**

- Generates an HTML string injected into a `react-native-webview`. Leaflet 1.9.4 loaded from unpkg CDN.
- Draw mode: taps place green circle vertices; tapping near the first point closes the polygon (≥3 points).
- Saved farm polygons are rendered with semi-transparent fill (`#10b981` green with 0.25 opacity). Farm markers are clickable and emit `farm_selected` events.
- Used by `app/farm-select.tsx` (full map screen) and indirectly by `app/onboarding/farm-select.tsx` (which pushes to `/farm-select`).

### `SaveFieldDialog` — `components/farms/SaveFieldDialog.tsx`

Modal form for saving a newly drawn farm boundary.

**Props:**

```ts
{
  visible: boolean;
  onClose: () => void;
  onSave: (info: FieldInfo) => void;
  areaM2: number;
  saving: boolean;
}
```

**Form fields:** farm name (required), crops (multi-select chip picker from `useCrops()` with `DEFAULT_CROPS` fallback), season (Kharif/Rabi/Zaid pick), crop stage (Sowing/Vegetative/Flowering/Maturity pick). Validation uses `fields:validation.*` i18n keys.

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

| Component | Hooks used             |
| --------- | ---------------------- |
| `Header`  | `useAuth`, `useRouter` |

### `SearchSection` | `useLocationContext`, `useFarmContext`, `useRouter`

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
| `ExportTemplate` | `useWeather`, `useForecast`, `useSoilMoisture`, `useAI`, `useRiskScore`, `useCalendar`, `useLocationContext`, `useCropContext` |
| `DownloadButton` | `react-native-view-shot`, `expo-media-library`, `useTranslation` |
| `ThemeToggle` | nativewind `useColorScheme` |
| `LocationRequired` | `useLocationContext`, `useRouter` |
| `FarmMapView` | `react-native-webview`, Leaflet |
