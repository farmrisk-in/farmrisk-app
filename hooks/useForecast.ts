import { useQuery } from "@tanstack/react-query";
import { getForecast } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useWeather } from "./useWeather";

export function useForecast() {
  const { location, isResolving } = useLocationContext();
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const daily = weatherData?.daily;

  // Fallback raw forecast rows from open-meteo daily weather if model is loading/offline
  const rawForecastRows = daily?.time
    ? daily.time.map((time: string, idx: number) => ({
        date: new Date(time).toISOString().split("T")[0],
        tmax: daily.temperature_2m_max?.[idx],
        tmax_corrected: daily.temperature_2m_max?.[idx],
        tmin: daily.temperature_2m_min?.[idx],
        tmin_corrected: daily.temperature_2m_min?.[idx],
        pcp: daily.precipitation_sum?.[idx],
        pcp_corrected: daily.precipitation_sum?.[idx],
        is_forecast: 1,
      }))
    : [];

  const query = useQuery({
    queryKey: ["forecast", location?.lat, location?.lng],
    queryFn: () => getForecast(location!.lat, location!.lng),
    enabled: !isResolving && !!location?.lat && !!location?.lng,
    staleTime: 60 * 60 * 1000,
  });

  const forecastRows =
    Array.isArray(query.data) && query.data.length > 0
      ? query.data.map((row: any) => ({
          ...row,
          tmax_corrected: row.tmax !== undefined ? row.tmax : row.tmax_corrected,
          tmin_corrected: row.tmin !== undefined ? row.tmin : row.tmin_corrected,
          pcp_corrected: row.pcp !== undefined ? row.pcp : row.pcp_corrected,
          is_forecast: row.is_forecast !== undefined ? row.is_forecast : 1,
        }))
      : rawForecastRows;

  return {
    data: query.data,
    forecastRows,
    isLoading: isResolving || !location || isWeatherLoading || query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError && rawForecastRows.length === 0,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useForecast;
