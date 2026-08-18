import { useLocationContext } from "@/providers/LocationProvider";
import { useCalendar } from "./useCalendar";
import { useWeather } from "./useWeather";
import { useForecast } from "./useForecast";
import { useSoilMoisture } from "./useSoilMoisture";
import { AIAdvisoryRequestPayload } from "@/types/ai";
import { VillageReportAPIResponse } from "@/types/forecast";

/**
 * Shared builder for the exact backend advisory payload (location + crop +
 * calendar + weather + bias-corrected forecast + soil moisture). Used by both
 * the text advisory (`useAI`) and the crop-specific Pest & Disease card
 * (`usePestDisease`) so both hit the same context and the same RAG pipeline.
 *
 * Also exposes readiness flags (`isDataReady`, `isLoading`) and a stable
 * `forecastHash` fingerprint for cache-key uniqueness.
 */
export function useAIRequestPayload(cropId?: string, language: string = "en") {
  const { location, isResolving } = useLocationContext();
  const activeCrop = cropId || "general";

  const calendar = useCalendar(activeCrop);
  const weather = useWeather();
  const forecast = useForecast();
  const { forecastRows, isLoading: isForecastLoading } = forecast;
  const soilMoisture = useSoilMoisture(activeCrop);

  const calendarData = calendar.data;
  const weatherData = weather.data;
  const soilMoistureResponse = soilMoisture.data;

  // Construct exact VillageReportAPIResponse schema for AI backend compatibility
  const mockVillageReport: VillageReportAPIResponse | undefined =
    forecastRows.length > 0 && location
      ? {
          requested_lat: location.lat,
          requested_lon: location.lng,
          village_id: 12345,
          forecast: {
            success: true,
            location: {
              lat: location.lat,
              lon: location.lng,
              elevation_m: weatherData?.elevation || 0,
            },
            grids_used: [],
            forecast_source: "bias-corrected",
            forecast: forecastRows.map((row: any) => ({
              date: row.date,
              tmax_raw: row.tmax ?? row.tmax_corrected ?? 0,
              tmax_corrected: row.tmax_corrected ?? row.tmax ?? 0,
              tmin_raw: row.tmin ?? row.tmin_corrected ?? 0,
              tmin_corrected: row.tmin_corrected ?? row.tmin ?? 0,
              pcp_raw: row.pcp ?? row.pcp_corrected ?? 0,
              pcp_corrected: row.pcp_corrected ?? row.pcp ?? 0,
            })),
            runtime_seconds: 0,
          },
          soil_moisture: {
            success: true,
            location: {
              lat: location.lat,
              lon: location.lng,
            },
            cold_start: false,
            days_computed: soilMoistureResponse?.soil_moisture?.length || 0,
            checkpoint_last_date: "",
            soil_moisture: (soilMoistureResponse?.soil_moisture || []).map(
              (row: any) => ({
                date: row.date,
                P_obs: row.P_obs ?? 0,
                Tmean: row.Tmean ?? 0,
                PE: row.PE ?? 0,
                P_eff: row.P_eff ?? 0,
                snowpack: row.snowpack ?? 0,
                w: row.w ?? 0,
                E: row.E ?? 0,
                R: row.R ?? 0,
                G: row.G ?? 0,
                w_frac: row.w_frac ?? 0,
                sm_percentile: row.sm_percentile ?? 0,
                is_forecast: row.is_forecast ?? 1,
              })
            ),
            runtime_seconds: 0,
          },
          cache_hit: false,
          total_runtime_seconds: 0,
          cache_key: null,
        }
      : undefined;

  // Create a stable fingerprint of the forecast data to ensure cache uniqueness
  const forecastHash =
    forecastRows.length > 0
      ? forecastRows.map((d: any) => `${d.date}:${d.pcp_corrected}`).join(",")
      : "none";

  const isDataReady =
    !isResolving &&
    !isForecastLoading &&
    !calendar.isLoading &&
    !weather.isLoading &&
    !!location?.lat &&
    !!location?.lng &&
    !!activeCrop &&
    !!calendarData &&
    !!weatherData;

  const isLoading =
    isResolving ||
    !location ||
    calendar.isLoading ||
    weather.isLoading ||
    isForecastLoading ||
    soilMoisture.isLoading;

  const payload: AIAdvisoryRequestPayload | undefined = isDataReady
    ? {
        location: location!,
        cropId: activeCrop,
        calendarData: calendarData!,
        weatherData: weatherData!,
        forecastData: mockVillageReport,
        language,
      }
    : undefined;

  return {
    payload,
    location,
    activeCrop,
    isDataReady,
    calendarData,
    weatherData,
    mockVillageReport,
    isLoading,
    isFetching:
      calendar.isFetching ||
      weather.isFetching ||
      forecast.isFetching ||
      soilMoisture.isFetching,
    forecastHash,
    errors: {
      calendar: calendar.error,
      weather: weather.error,
    },
  };
}
