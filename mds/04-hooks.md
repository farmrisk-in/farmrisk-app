# Hooks (`hooks/`)

There are **two families** of data hooks in this project:

1. **Context-based hooks** — read lat/lng from `LocationProvider` context internally; take **no coordinates** (or only crop/language options). These are the ones used by screens & dashboard components.
2. **Parameter-based hooks** — take explicit `(lat, lng)` coordinates. These live in `hooks/useDashboardQueries.ts` and are used where coordinates are available directly (e.g. location search).

> ⚠️ **Important:** Do not confuse the two. `import { useWeather } from "@/hooks/useWeather"` = context-based (no args). `import { useLocationSearch } from "@/hooks/useDashboardQueries"` = parameter-based.

---

## Context-based data hooks

All of these use the pattern:

```ts
const { location, isResolving } = useLocationContext();
const query = useQuery({
  queryKey: ["...", location?.lat, location?.lng, ...],
  queryFn: () => getX(location!.lat, location!.lng),
  enabled: !isResolving && !!location?.lat && !!location?.lng,
  staleTime: 60 * 60 * 1000, // 1 hour
});
```

They return the same shape:

```ts
{ data, isLoading, isFetching, isError, error, refetch }
```

where `isLoading = isResolving || !location || query.isLoading`.

### `useWeather()` — `hooks/useWeather.ts`
- Query key: `["weather", lat, lng]`
- Calls `getWeather(lat, lng)`.
- Returns `data` (Open-Meteo-shaped response: `current`, `hourly`, `daily`, `lightning` — see `types/weather.ts`).
- Default export + named export.

### `useForecast()` — `hooks/useForecast.ts`
- Query key: `["forecast", lat, lng]` → `getForecast(lat, lng)` (deep-learning bias-corrected model).
- **Also consumes `useWeather()`** to build a **fallback** forecast from Open-Meteo `daily` data when the model response is empty/offline.
- Returns `forecastRows`: unified array of `{ date, tmax, tmax_corrected, tmin, tmin_corrected, pcp, pcp_corrected, is_forecast }` (model rows mapped, or fallback rows).
- `isError` is only true when the query failed **and** no fallback rows exist.

### `useSoilMoisture(crop?, daysbefore?)` — `hooks/useSoilMoisture.ts`
- Query key: `["soil-moisture", lat, lng, activeCrop, daysbefore]` → `getSoilMoisture(lat, lng, crop, daysbefore)`.
- `activeCrop = crop && crop !== "general" ? crop : undefined` — the API only appends `&crop=` when not "general".
- Returns `data` (see `types/forecast.ts` `SoilMoistureResponse`; note the API may return either an array or `{ soil_moisture: [...] }` — consumers handle both).
- `isLoading` also includes `isForecastLoading` (it internally calls `useForecast()`).

### `useCrops()` — `hooks/useCrops.ts`
- Query key: `["crops", lat, lng]` → `getCrops(lat, lng)`.
- Returns `{ data, crops: data.crops || [], district, state, isLoading, ... }`.

### `useCalendar(crop?)` — `hooks/useCalendar.ts`
- Query key: `["calendar", activeCrop, lat, lng]` → `getCalendar(crop, lat, lng)` where `activeCrop = crop || "general"`.
- Returns `{ data, calendar: data.calendar || [], district, state, ... }`.

### `useAI(cropId?, language = "en")` — `hooks/useAI.ts`
The AI advisory hook. Internally composes **all** other data hooks:
- `useCalendar(cropId)` + `useWeather()` + `useForecast()` + `useSoilMoisture(cropId)`.
- Builds a `VillageReportAPIResponse` (see `types/forecast.ts`) object from forecast rows + soil moisture rows, keyed by a `forecastHash` (`date:pcp_corrected` joined) to invalidate the advisory when forecast changes.
- **Auto query** (general advisory): key `["ai", lat, lng, activeCrop, language, forecastHash]` → `getAIAdvisory({ location, cropId, calendarData, weatherData, forecastData: villageReport, language })`. Enabled only when all context data is loaded. `staleTime` 1h.
- **Mutation** for custom questions: `askAdvisory(query)` → `getAIAdvisory({ query, location, cropId, calendarData, weatherData, forecastData, language })`.
- Returns:
  ```ts
  {
    data: query.data?.advisory_summary ?? askMutation.data?.advisory_summary,
    sources: query.data?.sources || [],   // [{ source, page }]
    isLoading, isError, error,
    askAdvisory: askMutation.mutate,
    refetch,
  }
  ```

### `useWeatherSummary(language = "en")` — `hooks/useWeatherSummary.ts`
- Same village-report assembly as `useAI` (with `cropId: "general"`).
- Query key: `["weather-summary", lat, lng, language, forecastHash]` → `getWeatherSummary({ location, cropId: "general", calendarData, weatherData, forecastData, language })`, `retry: false`.
- Returns `{ data: query.data?.weather_summary, ... }`.

### `useRiskScore()` — `hooks/useRiskScore.ts`
- Composes `useWeather()`, `useForecast()`, `useSoilMoisture("general")`.
- Builds a payload client-side:
  - From forecast rows (first 5): `rain_next5`, `rain_dates`, `max_daily_rain`, `total_rainfall`, `rainy_days`, `max_temp`, `avg_max_temp`, `min_temp`, `avg_min_temp`.
  - From weather: `humidity`, `wind_speed`, `wind_gusts`, `gusts_hourly`, `times_hourly`, `lightning_score`.
  - From soil moisture: `soil_moisture_available`, `soil_percentile` (latest).
- Query key: `["riskScore", lat, lng, JSON.stringify(payload)]` → `getRiskScore(payload)`.
- Returns `{ data, isLoading, isError, error }` (no refetch exposed). `data.success` + `data.overall`, `data.heavy_rain`, `data.heat_stress`, `data.pest`, `data.lightning`, `data.wind`, `data.frost` — each hazard has `{ score, band, major_factor, reasons }`.

---

## Parameter-based hooks — `hooks/useDashboardQueries.ts`

A legacy/simple set of one-liner TanStack Query hooks (file header still says `useWeather.ts`, but the file is `useDashboardQueries.ts`):

| Hook | Signature | Query key | Enabled |
|---|---|---|---|
| `useWeather` | `(lat, lng)` | `["weather", lat, lng]` | both coords truthy |
| `useForecast` | `(lat, lng)` | `["forecast", lat, lng]` | both coords truthy |
| `useSoilMoisture` | `(lat, lng, crop?, daysbefore?)` | `["soil-moisture", lat, lng, crop, daysbefore]` | both coords truthy |
| `useCrops` | `(lat, lng)` | `["crops", lat, lng]` | both coords truthy |
| `useCalendar` | `(crop, lat, lng)` | `["calendar", crop, lat, lng]` | coords + crop truthy |
| `useAIAdvisory` | `()` → mutation | — | — |
| `useWeatherSummary` | `()` → mutation | — | — |
| `useLocationSearch` | `(q)` | `["location-search", q]` | `q.trim().length > 2` |

- `useAIAdvisory` / `useWeatherSummary` are **mutations** (`useMutation`) — call `.mutate()`.
- `useLocationSearch` has `staleTime: 30s` and requires ≥ 3 characters. **Used by `app/search.tsx`.**

---

## UI / utility hooks

### `useAuth()` — `hooks/useAuth.ts`
Reads `AuthContext`; returns safe default `{ user: null, session: null, loading: false, signOut: async () => {} }` if provider missing.

### `usePro()` — `hooks/usePro.ts`
Derived auth helper:
```ts
{ isPro, loading, user, firstName, lastName, fullName, email }
```
`isPro = !loading && !!session && !!user`. Reads `user.user_metadata.first_name/last_name`.

### `useLanguage()` — `hooks/useLanguage.ts`
Reads `LanguageContext`; **throws** if used outside `LanguageProvider`.

### `useRefreshDashboard()` — `hooks/useRefreshDashboard.ts`
Pull-to-refresh with 10-second spam cooldown:
```ts
{ refreshing: boolean, onRefresh: () => Promise<void> }
```
`onRefresh` calls `queryClient.invalidateQueries()` (all queries) if >10s since last refresh; otherwise briefly sets `refreshing` and returns.

### `useColorScheme` — `hooks/use-color-scheme.ts` / `hooks/use-color-scheme.web.ts`
- `use-color-scheme.ts`: re-exports `useColorScheme` from **nativewind** (`{ colorScheme, toggleColorScheme, setColorScheme }`).
- `use-color-scheme.web.ts`: hydration-safe wrapper returning `"light"` until mounted (for static web rendering).
- **Most components import `useColorScheme` directly from `"nativewind"`** — only the root layout and `collapsible.tsx` use the `hooks/` versions.

### `useThemeColor(props, colorName)` — `hooks/use-theme-color.ts`
Resolves a color from `props` or `Colors[theme][colorName]` (see `constants/theme.ts`). Not widely used in the current screens (most styling goes through NativeWind classes).

---

## Query Cache Keys Quick Reference

| Data | Key parts |
|---|---|
| Weather | `["weather", lat, lng]` |
| Forecast | `["forecast", lat, lng]` |
| Soil moisture | `["soil-moisture", lat, lng, crop, daysbefore]` |
| Crops | `["crops", lat, lng]` |
| Calendar | `["calendar", crop, lat, lng]` |
| AI advisory | `["ai", lat, lng, crop, language, forecastHash]` |
| Weather summary | `["weather-summary", lat, lng, language, forecastHash]` |
| Risk score | `["riskScore", lat, lng, payloadHash]` |
| Location search | `["location-search", q]` |

> **Tip for AI working on this code:** adding/changing query keys affects cache invalidation. `useRefreshDashboard` invalidates everything, so new queries with different keys still refresh on pull-to-refresh.
