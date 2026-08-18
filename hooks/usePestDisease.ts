import { useQuery } from "@tanstack/react-query";
import { getPestDiseaseCard } from "@/lib/api/pestDisease";
import { PestDiseaseCardResponse } from "@/types/pestDisease";
import { useAIRequestPayload } from "@/hooks/useAIRequestPayload";

/**
 * Fetch the crop-specific Pest & Disease card for the active crop and location.
 *
 * Uses the complete advisory context (location, calendar, weather, bias-corrected
 * forecast, soil moisture) so the risk score and retrieved ICAR guidelines
 * are crop-specific and deterministic.
 */
export function usePestDisease(cropId?: string, language: string = "en") {
  const {
    payload,
    location,
    activeCrop,
    isDataReady,
    isLoading: isContextLoading,
    isFetching: isContextFetching,
    forecastHash,
    errors,
  } = useAIRequestPayload(cropId, language);

  const query = useQuery<PestDiseaseCardResponse, Error>({
    queryKey: [
      "pest-disease",
      location?.lat,
      location?.lng,
      activeCrop,
      language,
      forecastHash,
    ],
    queryFn: () => {
      if (!payload) {
        throw new Error("Context data not available for pest & disease card");
      }
      return getPestDiseaseCard(payload);
    },
    enabled: isDataReady,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 70 * 60 * 1000, // 70 minutes
  });

  return {
    data: query.data,
    isLoading: isContextLoading || query.isLoading,
    isFetching: isContextFetching || query.isFetching,
    error: query.error || errors.calendar || errors.weather,
    isError: query.isError || !!errors.calendar || !!errors.weather,
    refetch: query.refetch,
  };
}
