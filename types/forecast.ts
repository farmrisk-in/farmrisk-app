export interface Location {
  lat: number;
  lon: number;
}

export interface RuntimeMetrics {
  forecast_seconds?: number;
  soil_moisture_seconds?: number;
  total_seconds: number;
}

export interface ForecastRow {
  date: string; // Format: "YYYY-MM-DD"
  tmax: number;
  tmin: number;
  pcp: number;
  // Aliases for compatibility
  tmax_corrected: number;
  tmin_corrected: number;
  pcp_corrected: number;
  is_forecast: 0 | 1;
}

export interface SoilMoistureRow {
  date: string; // Format: "YYYY-MM-DD"
  village: string;
  taluka: string;
  lat: number;
  lon: number;
  P_obs: number | null; // Observed precipitation (mm)
  Tmean: number; // Mean temperature (°C)
  PE: number; // Reference crop evapotranspiration (mm/day)
  P_eff: number; // Effective precipitation/moisture entering soil (mm)
  irrig: number; // Sown irrigation amount applied (mm)
  snowpack: number; // Equivalent snow water storage (mm)
  w: number; // Active soil moisture storage (mm)
  E: number; // Actual evapotranspiration loss (mm/day)
  R: number; // Runoff loss (mm/day)
  G: number; // Groundwater loss (mm/day)
  w_frac: number; // Storage ratio (w / WMAX)
  is_forecast: 0 | 1; // 0 = historical observation, 1 = forecast day
  sm_percentile: number | null; // Percentile of moisture relative to historical climatology
}

export interface ForecastResponse {
  success: boolean;
  location: Location;
  cold_start: boolean;
  forecast: ForecastRow[];
  runtime: RuntimeMetrics;
}

export interface SoilMoistureResponse {
  success: boolean;
  location: Location;
  cold_start: boolean;
  history_days: number;
  forecast_days: number;
  days_computed: number;
  checkpoint_last_date: string;
  soil_moisture: SoilMoistureRow[];
  runtime: RuntimeMetrics;
}

// ==============================================================================
// ORIGINAL SPEC FOR RAG / AI TEAM COMPATIBILITY (DO NOT MODIFY SCHEMA OR NAMES)
// ==============================================================================

export interface DailyForecastCorrection {
  date: string;
  tmax_raw: number;
  tmax_corrected: number;
  tmin_raw: number;
  tmin_corrected: number;
  pcp_raw: number;
  pcp_corrected: number;
}

export interface ForecastBlock {
  success: boolean;
  location: {
    lat: number;
    lon: number;
    elevation_m: number;
  };
  grids_used: any[];
  forecast_source: string;
  forecast: DailyForecastCorrection[];
  runtime_seconds: number;
}

export interface SoilMoistureRecord {
  date: string;
  P_obs: number;
  Tmean: number;
  PE: number;
  P_eff: number;
  snowpack: number;
  w: number;
  E: number;
  R: number;
  G: number;
  w_frac: number;
  sm_percentile: number;
  is_forecast: number;
}

export interface SoilMoistureBlock {
  success: boolean;
  location: {
    lat: number;
    lon: number;
  };
  cold_start: boolean;
  days_computed: number;
  checkpoint_last_date: string;
  soil_moisture: SoilMoistureRecord[];
  runtime_seconds: number;
}

export interface VillageReportAPIResponse {
  requested_lat: number;
  requested_lon: number;
  village_id: number;
  forecast: ForecastBlock;
  soil_moisture: SoilMoistureBlock;
  cache_hit: boolean;
  total_runtime_seconds: number;
  cache_key: string | null;
}
