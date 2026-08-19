import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getWhatToDo, WhatToDoResponse } from "@/lib/api/whatToDo";
import { useAIRequestPayload } from "@/hooks/useAIRequestPayload";

/**
 * Fetch the "What To Do Today" card for the selected crop + location.
 *
 * Uses the same full advisory payload (weather + bias-corrected forecast +
 * soil moisture) as useAI / usePestDisease. The backend deterministically
 * picks the best Pest & Disease action + best Irrigation recommendation,
 * using weather actions as a fallback for empty slots.
 */
export function useWhatToDo(cropId?: string, language: string = "en") {
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

  const query = useQuery<WhatToDoResponse, Error>({
    queryKey: [
      "what-to-do",
      location?.lat,
      location?.lng,
      activeCrop,
      language,
      forecastHash,
    ],
    queryFn: () => {
      if (!payload) {
        throw new Error("Context data not available for what-to-do card");
      }
      return getWhatToDo(payload);
    },
    enabled: isDataReady,
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 70 * 60 * 1000,    // 70 minutes
  });

  return {
    data: query.data,
    recommendations: query.data?.recommendations ?? [],
    isLoading: isContextLoading || query.isLoading,
    isFetching: isContextFetching || query.isFetching,
    error: query.error || errors.calendar || errors.weather,
    isError: query.isError || !!errors.calendar || !!errors.weather,
    refetch: query.refetch,
  };
}
