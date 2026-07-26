import { useMutation, useQuery } from "@tanstack/react-query";
import { getAIAdvisory } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useCalendar } from "./useCalendar";
import { useWeather } from "./useWeather";
import { useForecast } from "./useForecast";
import { useSoilMoisture } from "./useSoilMoisture";

export function useAI(cropId?: string, language: string = "en") {
  const { location, isResolving } = useLocationContext();

  const calendar = useCalendar(cropId);
  const weather = useWeather();
  const forecast = useForecast();
  const soilMoisture = useSoilMoisture(cropId);

  // Automatic AI advisory query for selected crop & location
  const query = useQuery({
    queryKey: [
      "ai",
      location?.lat,
      location?.lng,
      cropId,
      language,
      forecast.forecastRows.length,
    ],
    queryFn: () =>
      getAIAdvisory({
        location,
        cropId: cropId || "general",
        calendarData: calendar.data,
        weatherData: weather.data,
        forecastData: forecast.forecastRows,
        soilMoistureData: soilMoisture.data,
        language,
      }),
    enabled:
      !isResolving &&
      !!location?.lat &&
      !!location?.lng &&
      !weather.isLoading &&
      !forecast.isLoading,
    staleTime: 60 * 60 * 1000,
  });

  // Manual mutation for user custom questions
  const askMutation = useMutation({
    mutationFn: (userQuery: string) =>
      getAIAdvisory({
        query: userQuery,
        location,
        cropId: cropId || "general",
        language,
      }),
  });

  return {
    data: query.data?.advisory_summary ?? askMutation.data?.advisory_summary,
    sources: query.data?.sources || [],
    isLoading: isResolving || query.isLoading || askMutation.isPending,
    isError: query.isError || askMutation.isError,
    error: query.error || askMutation.error,
    askAdvisory: askMutation.mutate,
    refetch: query.refetch,
  };
}
export default useAI;
