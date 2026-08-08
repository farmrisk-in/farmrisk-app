# 06 — API Layer (`lib/`)

Everything that talks to the outside world lives in `lib/`. There are two modules:

- `lib/api.ts` — 10 fetch functions hitting the FarmRisk Next.js backend.
- `lib/supabase.ts` — Supabase client (auth + profiles) with a custom storage wrapper.
- `lib/auth/phone.ts` — phone-number normalization helper.

No other `lib/` files exist. There is no local database — all domain data comes from the remote API.

---

## Base URL resolution — `getApiUrl()`

```ts
export function getApiUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL || "https://farmrisk.vercel.app";
  // Android emulator localhost needs to be routed to 10.0.2.2
  if (Platform.OS === "android" && url.includes("localhost")) {
    return url.replace("localhost", "10.0.2.2");
  }
  // Remove trailing slash if any
  return url.replace(/\/$/, "");
}
```

Rules:

1. Reads `EXPO_PUBLIC_API_URL` (env var), falling back to `https://farmrisk.vercel.app`.
2. **Android emulator special case:** any `localhost` in the URL is rewritten to `10.0.2.2` (the emulator's alias for the host machine). Physical devices need the LAN IP or a public URL instead.
3. Trailing slashes are stripped.

Every `lib/api.ts` function starts by calling `getApiUrl()` and throws `Error` with a descriptive message when `res.ok` is false. All responses are parsed with `res.json()`.

---

## Endpoint reference

| # | Function | Method + Path | Params | Returns |
|---|---|---|---|---|
| 1 | `getWeather(lat, lng)` | GET `/api/weather?lat=&lng=` | lat, lng (required) | Open-Meteo-style weather object (see `types/weather.ts`) |
| 2 | `getForecast(lat, lon)` | GET `/api/forecast?lat=&lon=` | lat, lon (required) | `ForecastResponse` |
| 3 | `getSoilMoisture(lat, lon, crop?, daysbefore?)` | GET `/api/soil-moisture?lat=&lon=&crop=&daysbefore=` | lat, lon required; `crop` omitted when `"general"`; `daysbefore` omitted when null/undefined | `SoilMoistureResponse` |
| 4 | `getAIAdvisory(payload)` | POST `/api/ai` | JSON body (`AIAdvisoryRequestPayload`) | `AIAPIResponse` (`{ success?, advisory_summary, sources? }`) |
| 5 | `getWeatherSummary(payload)` | POST `/api/ai/weather-summary` | JSON body (similar village-report payload) | AI summary response |
| 6 | `searchLocations(q)` | GET `/api/locations?mode=search&q=` | `q` URL-encoded; returns `data.results || []` | `any[]` of location suggestions |
| 7 | `reverseGeocode(lat, lng)` | GET `/api/locations?mode=reverse&lat=&lon=` | lat, lng | object with `display_name` / `displayName`, `district`, `state` fields |
| 8 | `getCrops(lat, lng)` | GET `/api/crops?lat=&lng=` | lat, lng | `CropsAPIResponse` |
| 9 | `getCalendar(crop, lat, lng)` | GET `/api/calender?lat=&lng=&crop=` | crop, lat, lng | `CalendarAPIResponse` |
| 10 | `getRiskScore(payload)` | POST `/api/risk` | JSON body (client-built hazard payload) | Risk bands per hazard |

### ⚠️ Critical gotchas

- **`/api/calender` is intentionally misspelled** (one `a`). The backend route is `/api/calender`, so the frontend must keep this spelling. Do not "fix" it.
- `getCalendar` takes `crop` **first**, then `lat, lng` (different argument order from `getForecast`/`getSoilMoisture`).
- `getForecast` uses `lon` for the longitude query param, while `getWeather`, `getCrops`, and `getCalendar` use `lng`. Keep them as-is — the backend expects these exact names.
- `getSoilMoisture` drops the `crop` param when it's `"general"` (the API treats "general" as no crop).
- `searchLocations` returns `data.results || []` (already unwrapped), all other functions return the raw JSON body.
- The API is a **Next.js** deployment (Vercel); the codebase in this repo is only the mobile app — the API source is not in this repository.

---

## `lib/supabase.ts` — Supabase client

```ts
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://meaqfipbbrlqfautkaan.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_jCYy_8ivOndk6MRLJ3nzNw_vT9_R8el";
```

- Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **Hardcoded fallbacks are committed** (URL + publishable key) so the app runs without env config. These same values are duplicated in `eas.json` for release builds.
- If either value is missing, logs a `console.warn` (does not crash).
- **Custom storage wrapper (`customStorage`)** wraps `@react-native-async-storage/async-storage`:
  - Every method checks `typeof window === "undefined"` first and no-ops (or returns `null` for `getItem`) — this is the SSR / server-side safety net so Supabase doesn't crash during static rendering or headless contexts.
  - All storage failures are caught and logged with `console.error` instead of throwing.
- Client options:
  - `autoRefreshToken: true`
  - `persistSession: true`
  - `detectSessionInUrl: false` (app-only auth; no OAuth link detection)

Supabase is used for:
- Auth (phone-password sign in/up — see `lib/auth/phone.ts` and the auth flow in `03-providers.md`).
- Reading/writing the `profiles` table (see `types/database.ts`).

---

## `lib/auth/phone.ts` — phone normalization

```ts
export function normalizePhoneNumber(value: string) {
  const normalized = value.trim().replace(/\s+/g, "");
  if (!/^[6-9]\d{9}$/.test(normalized)) return null;
  return normalized;
}
```

- Strips whitespace.
- Validates a **10-digit Indian mobile number**: first digit must be 6–9 (`/^[6-9]\d{9}$/`).
- Returns the normalized 10-digit string, or `null` if invalid.
- The AuthProvider converts a valid number into the Supabase email `"<phone>@farmrisk.app"` before signing in.

---

## Error handling conventions

- All fetch functions throw `Error("...request failed: " + res.statusText)` on non-OK status. No retry/backoff in `lib/api.ts` — retry behavior comes from TanStack Query options in the hooks.
- No timeouts are set in `lib/api.ts`; requests hang until the OS times out.
- Network failures surface through TanStack Query as `query.isError` and are handled by screens (usually with a retry button or fallback data).
