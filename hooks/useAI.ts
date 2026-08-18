import { useMutation, useQuery } from "@tanstack/react-query";
import { getAIAdvisory } from "@/lib/api";
import { useAIRequestPayload } from "./useAIRequestPayload";

export function useAI(cropId?: string, language: string = "en") {
  const {
    payload,
    location,
    activeCrop,
    isDataReady,
    calendarData,
    weatherData,
    mockVillageReport,
    isLoading: isContextLoading,
    isFetching: isContextFetching,
    forecastHash,
    errors,
  } = useAIRequestPayload(cropId, language);

  // Automatic query for general crop advisory
  const query = useQuery({
    queryKey: [
      "ai",
      location?.lat,
      location?.lng,
      activeCrop,
      language,
      forecastHash,
    ],
    queryFn: () => {
      if (!payload) {
        throw new Error("Context data not available for AI generation");
      }
      return getAIAdvisory(payload);
    },
    enabled: isDataReady,
    staleTime: 60 * 60 * 1000,
  });

  // Mutation for user's custom question
  const askMutation = useMutation({
    mutationFn: (userQuery: string) => {
      if (!calendarData || !weatherData || !location) {
        throw new Error("Context data not available for AI generation");
      }
      return getAIAdvisory({
        query: userQuery,
        location,
        cropId: activeCrop,
        calendarData,
        weatherData,
        forecastData: mockVillageReport,
        language,
      });
    },
  });

  return {
    data: query.data?.advisory_summary ?? askMutation.data?.advisory_summary,
    sources: query.data?.sources || [],
    isLoading: isContextLoading || query.isLoading || askMutation.isPending,
    isFetching: isContextFetching || query.isFetching,
    isError:
      query.isError ||
      askMutation.isError ||
      !!errors.calendar ||
      !!errors.weather,
    error:
      query.error ||
      askMutation.error ||
      errors.calendar ||
      errors.weather,
    askAdvisory: askMutation.mutate,
    refetch: query.refetch,
  };
}

export default useAI;
