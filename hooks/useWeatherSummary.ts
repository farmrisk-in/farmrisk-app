import { useQuery } from "@tanstack/react-query";
import { getWeatherSummary } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useCalendar } from "./useCalendar";
import { useWeather } from "./useWeather";
import { useSoilMoisture } from "./useSoilMoisture";

export function useWeatherSummary(language: string = "en") {
  const { location, isResolving } = useLocationContext();

  const calendar = useCalendar("general");
  const weather = useWeather();
  const soilMoisture = useSoilMoisture("general");

  const calendarData = calendar.data;
  const weatherData = weather.data;
  const soilMoistureResponse = soilMoisture.data;

  // Extract forecast directly from useWeather instead of useForecast
  const dailyForecastRows =
    weatherData?.daily?.time?.map((timeStr: any, idx: number) => {
      const dateObj = new Date(timeStr);
      return {
        date: dateObj.toISOString().split("T")[0],
        tmax: weatherData.daily.temperature_2m_max[idx] ?? 0,
        tmin: weatherData.daily.temperature_2m_min[idx] ?? 0,
        pcp: weatherData.daily.precipitation_sum[idx] ?? 0,
      };
    }) || [];

  // Construct exact VillageReportAPIResponse schema for AI backend compatibility
  const villageReport =
    dailyForecastRows.length > 0 && location
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
            forecast_source: "open-meteo",
            forecast: dailyForecastRows.map((row: any) => ({
              date: row.date,
              tmax_raw: row.tmax,
              tmax_corrected: row.tmax,
              tmin_raw: row.tmin,
              tmin_corrected: row.tmin,
              pcp_raw: row.pcp,
              pcp_corrected: row.pcp,
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
    dailyForecastRows.length > 0
      ? dailyForecastRows.map((d: any) => `${d.date}:${d.pcp}`).join(",")
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
      calendar.isLoading ||
      weather.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useWeatherSummary;
