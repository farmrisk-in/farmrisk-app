import { useQuery } from "@tanstack/react-query";
import { getWeatherSummary } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useCalendar } from "./useCalendar";
import { useWeather } from "./useWeather";
import { useForecast } from "./useForecast";
import { useSoilMoisture } from "./useSoilMoisture";

export function useWeatherSummary(language: string = "en") {
  const { location, isResolving } = useLocationContext();

  const calendar = useCalendar("general");
  const weather = useWeather();
  const { forecastRows, isLoading: isForecastLoading } = useForecast();
  const soilMoisture = useSoilMoisture("general");

  const calendarData = calendar.data;
  const weatherData = weather.data;
  const soilMoistureResponse = soilMoisture.data;

  // Construct exact VillageReportAPIResponse schema for AI backend compatibility
  const villageReport =
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

  const forecastHash =
    forecastRows.length > 0
      ? forecastRows.map((d: any) => `${d.date}:${d.pcp_corrected}`).join(",")
      : "none";

  const query = useQuery({
    queryKey: [
      "weather-summary",
      location?.lat,
      location?.lng,
      language,
      forecastHash,
    ],
    queryFn: () => {
      if (!calendarData || !weatherData || !location) {
        throw new Error("Context data not available for weather summary generation");
      }
      return getWeatherSummary({
        location,
        cropId: "general",
        calendarData,
        weatherData,
        forecastData: villageReport,
        language,
      });
    },
    enabled:
      !isResolving &&
      !isForecastLoading &&
      !calendar.isLoading &&
      !weather.isLoading &&
      !!location?.lat &&
      !!location?.lng &&
      !!language &&
      !!calendarData &&
      !!weatherData,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  return {
    data: query.data?.weather_summary,
    isLoading:
      isResolving ||
      !location ||
      query.isLoading ||
      isForecastLoading ||
      calendar.isLoading ||
      weather.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useWeatherSummary;
