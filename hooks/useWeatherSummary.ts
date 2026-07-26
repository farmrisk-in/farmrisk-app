import { useQuery } from "@tanstack/react-query";
import { getWeatherSummary } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useForecast } from "./useForecast";
import { useWeather } from "./useWeather";

export function useWeatherSummary(language: string = "en") {
  const { location, isResolving } = useLocationContext();
  const { data: weatherData } = useWeather();
  const { forecastRows, isLoading: isForecastLoading } = useForecast();

  const query = useQuery({
    queryKey: [
      "weather-summary",
      location?.lat,
      location?.lng,
      language,
      forecastRows.length,
    ],
    queryFn: () =>
      getWeatherSummary({
        location,
        weatherData,
        forecast_data: forecastRows,
        language,
      }),
    enabled:
      !isResolving &&
      !isForecastLoading &&
      !!location?.lat &&
      !!location?.lng &&
      forecastRows.length > 0,
    staleTime: 60 * 60 * 1000,
  });

  return {
    data: query.data?.weather_summary,
    isLoading: isResolving || !location || isForecastLoading || query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useWeatherSummary;
