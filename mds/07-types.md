# 07 — Type Definitions (`types/`)

All shared TypeScript types live in `types/`. The directory is flat — each file holds one domain's types.

| File | Contents |
|---|---|
| `types/weather.ts` | Open-Meteo weather, current/hourly/daily, lightning, WMO codes |
| `types/forecast.ts` | Forecast + soil moisture rows, responses, and the **village report spec** |
| `types/crops.ts` | Crop list, crops API response, `GENERAL_CROP` constant |
| `types/calendar.ts` | Crop calendar events + API response |
| `types/ai.ts` | AI advisory request payload + response |
| `types/database.ts` | Supabase `Database` type + `Profile` |
| `types/svg.d.ts` | `*.svg` module declaration (SvgProps) |

There is no barrel `types/index.ts` — components import directly, e.g. `import { Crop } from "@/types/crops"`.

---

## `types/weather.ts` — Open-Meteo style weather

These types describe the object returned by `GET /api/weather` (which mirrors Open-Meteo's response schema plus a `lightning` block).

### `OpenMeteoResponse`

| Field | Type | Meaning |
|---|---|---|
| `latitude` / `longitude` | `number` | Grid point that served the data |
| `elevation` | `number` | Elevation in meters (used by `useAI` for the village report) |
| `timezone` | `string \| null` | e.g. `"Asia/Kolkata"` |
| `timezoneAbbreviation` | `string \| null` | e.g. `"IST"` |
| `utcOffsetSeconds` | `number` | Offset from UTC |
| `current` | `CurrentWeather` | "Now" observation block |
| `hourly` | `HourlyWeather` | Hourly arrays (24h / next 24 rows) |
| `daily` | `DailyWeather` | Daily max/min/precip arrays |
| `lightning` | `Lightning` | Lightning risk score + category |

### `CurrentWeather`

| Field | Type | Meaning |
|---|---|---|
| `time` | `Date` | Timestamp |
| `temperature_2m` | `number` | Air temp at 2m (°C) |
| `relative_humidity_2m` | `number` | Relative humidity (%) |
| `apparent_temperature` | `number` | Feels-like temp (°C) |
| `weather_code` | `number` | WMO code |
| `pressure_msl` | `number` | Pressure at mean sea level |
| `surface_pressure` | `number` | Pressure at surface |
| `wind_speed_10m` | `number` | m/s |
| `wind_direction_10m` | `number` | Degrees |
| `wind_gusts_10m` | `number` | Gust speed m/s |
| `precipitation` | `number` | mm |
| `cloud_cover` | `number` | % |
| `icon` | `string` | Icon key resolved by WMO mapping |
| `condition` | `{ en, hi, mr, ta, gu }` | Human-readable condition per language |

### `HourlyWeather`

Parallel arrays (index = hour):

- `time: Date[]`
- `temperature_2m: number[]`
- `precipitation_probability: number[]`
- `wind_speed_10m: number[]`
- `weather_code: number[]`
- `icon: string[]`
- `rain: number[]` — rainfall amount (mm)

### `DailyWeather`

Parallel arrays (index = day):

- `time: Date[]`
- `temperature_2m_max: number[]`
- `temperature_2m_min: number[]`
- `precipitation_sum: number[]`

### `Lightning` / `LightningData`

```ts
type Lightning = { score: number; category: string };
type LightningData = { score: number; category: string; color: string; advisory: string };
```

### `WmoEntry` (condition mapping)

```ts
type WmoEntry = {
  condition: { en: string; hi: string; mr: string; ta: string; gu: string };
  icon: { day: string; night?: string };
};
```

Used to map WMO `weather_code` → translated condition + day/night icon key (from `assets/images/weathericons/`).

---

## `types/forecast.ts` — forecast, soil moisture, village report

### `Location`

```ts
{ lat: number; lon: number }
```

### `RuntimeMetrics`

```ts
{ forecast_seconds?: number; soil_moisture_seconds?: number; total_seconds: number }
```

### `ForecastRow`

| Field | Type | Meaning |
|---|---|---|
| `date` | `string` | `"YYYY-MM-DD"` |
| `tmax` / `tmin` | `number` | Max/min temp (°C) |
| `pcp` | `number` | Precipitation (mm) |
| `tmax_corrected` / `tmin_corrected` / `pcp_corrected` | `number` | **Bias-corrected aliases** — hooks prefer the `_corrected` variants |
| `is_forecast` | `0 \| 1` | 0 = historical, 1 = forecast day |

### `SoilMoistureRow`

| Field | Type | Meaning |
|---|---|---|
| `date` | `string` | `"YYYY-MM-DD"` |
| `village` / `taluka` | `string` | Place names |
| `lat` / `lon` | `number` | Coordinates |
| `P_obs` | `number \| null` | Observed precipitation (mm) |
| `Tmean` | `number` | Mean temp (°C) |
| `PE` | `number` | Reference evapotranspiration (mm/day) |
| `P_eff` | `number` | Effective precipitation entering the soil (mm) |
| `irrig` | `number` | Irrigation applied (mm) |
| `snowpack` | `number` | Snow water equivalent (mm) |
| `w` | `number` | **Active soil moisture storage (mm)** — the headline metric |
| `E` | `number` | Actual evapotranspiration (mm/day) |
| `R` | `number` | Runoff loss (mm/day) |
| `G` | `number` | Groundwater loss (mm/day) |
| `w_frac` | `number` | Storage ratio `w / WMAX` |
| `is_forecast` | `0 \| 1` | 0 = historical, 1 = forecast |
| `sm_percentile` | `number \| null` | Percentile vs. historical climatology (drives the wet/dry bands) |

### `ForecastResponse` / `SoilMoistureResponse`

```ts
ForecastResponse = {
  success: boolean;
  location: Location;
  cold_start: boolean;        // true = model spun up fresh
  forecast: ForecastRow[];
  runtime: RuntimeMetrics;
};

SoilMoistureResponse = {
  success: boolean;
  location: Location;
  cold_start: boolean;
  history_days: number;
  forecast_days: number;
  days_computed: number;
  checkpoint_last_date: string;
  soil_moisture: SoilMoistureRow[];
  runtime: RuntimeMetrics;
};
```

---

## ⚠️ The village report spec (DO NOT MODIFY)

The block between `// ORIGINAL SPEC FOR RAG / AI TEAM COMPATIBILITY` comments in `types/forecast.ts` is the **contract with the AI backend**. The schema and field names must never change — `useAI.ts` hand-builds this object client-side and POSTs it to `/api/ai`.

### `DailyForecastCorrection`

```ts
{
  date: string;
  tmax_raw: number; tmax_corrected: number;
  tmin_raw: number; tmin_corrected: number;
  pcp_raw: number;  pcp_corrected: number;
}
```

### `ForecastBlock`

```ts
{
  success: boolean;
  location: { lat: number; lon: number; elevation_m: number };
  grids_used: any[];
  forecast_source: string;          // useAI sends "bias-corrected"
  forecast: DailyForecastCorrection[];
  runtime_seconds: number;
}
```

### `SoilMoistureRecord`

```ts
{
  date: string;
  P_obs: number; Tmean: number; PE: number; P_eff: number; snowpack: number;
  w: number; E: number; R: number; G: number;
  w_frac: number; sm_percentile: number; is_forecast: number;
}
```

### `SoilMoistureBlock`

```ts
{
  success: boolean;
  location: { lat: number; lon: number };
  cold_start: boolean;
  days_computed: number;
  checkpoint_last_date: string;
  soil_moisture: SoilMoistureRecord[];
  runtime_seconds: number;
}
```

### `VillageReportAPIResponse` (top-level wrapper)

```ts
{
  requested_lat: number;
  requested_lon: number;
  village_id: number;               // useAI hardcodes 12345
  forecast: ForecastBlock;
  soil_moisture: SoilMoistureBlock;
  cache_hit: boolean;
  total_runtime_seconds: number;
  cache_key: string | null;
}
```

See `10-data-flow.md` §"The village report" for how `useAI` assembles this from hooks.

---

## `types/crops.ts`

```ts
interface Crop { id: string; name: string; area: number; }

interface CropsAPIResponse {
  success: boolean;
  district: string;
  state: string;
  distanceKm: number;      // distance from requested point to nearest crop-data grid
  crops: Crop[];
}

export const GENERAL_CROP: Crop = { id: "general", name: "General (All Crops)", area: 0 };
```

- `GENERAL_CROP` is the sentinel "no specific crop" entry; `id: "general"` is special-cased in `useSoilMoisture` (crop param dropped) and elsewhere.

---

## `types/calendar.ts`

```ts
interface CalendarEvent {
  crop: string;
  season: string;
  sowingPeriod: string;
  harvestingPeriod: string;
  sowFromMon: number | null;    // 1-12 month index for sowing window start
  sowToMon: number | null;      // sowing window end
  harvFromMon: number | null;   // harvesting window start
  harvToMon: number | null;     // harvesting window end
}

interface CalendarAPIResponse {
  success: boolean;
  state: string;
  district: string;
  districtCode: string | null;
  calendar: CalendarEvent[];
}
```

---

## `types/ai.ts`

```ts
import { SelectedLocation } from "@/providers/LocationProvider";

interface AIAdvisoryRequestPayload {
  location: SelectedLocation;      // { lat, lng, name, displayName }
  cropId: string;                  // "general" or a crop id
  calendarData: CalendarAPIResponse;
  weatherData: OpenMeteoResponse;
  forecastData?: VillageReportAPIResponse;   // optional village report
  language: string;                // "en" | "hi" | "mr" | "ta" | "gu"
}

interface AIAPIResponse {
  success?: boolean;
  advisory_summary: string;
}
```

- `SelectedLocation` is defined in `providers/LocationProvider.tsx`, **not** in `types/` — `types/ai.ts` re-imports it.
- `useAI` also sends an extra `query` field for the custom-question mutation (not in the type — payload is typed `any` at the call site).

---

## `types/database.ts` — Supabase schema

Standard generated-style Supabase `Database` type with one table:

### `profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | `string` (PK) | References `auth.users.id` (1:1) |
| `full_name` | `string \| null` | |
| `age` | `number \| null` | |
| `location` | `string \| null` | Free-text place |
| `metadata` | `Json` | Arbitrary JSON |
| `created_at` / `updated_at` | `string` | Timestamps |

Exports:

```ts
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
```

---

## `types/svg.d.ts` — SVG module declaration

```ts
declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
```

Allows importing `.svg` files as React components (`react-native-svg-transformer` handles the bundling).

---

## `nativewind-env.d.ts` (root, not in `types/`)

```ts
/// <reference types="nativewind/types" />
```

Generated by NativeWind; brings in typings for Tailwind class names on RN components. Do not edit.
