import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getPreSowingAdvisory } from "@/lib/api";

export interface PreSowingPayload {
  crop: string;
  state: string;
  soil_type: string;
  season?: string;
  irrigation_type?: string;
  language?: string;
  enabled?: boolean;
}

export interface PreSowingSections {
  sowing_window?: string;
  seed_selection?: string;
  field_preparation?: string;
  fertilizer_plan?: string;
  irrigation?: string;
  weed_management?: string;
  pest_disease?: string;
  [key: string]: string | undefined;
}

export interface PreSowingResponse {
  crop: string;
  state: string;
  season: string;
  soil_type: string;
  irrigation_type: string;
  language?: string;
  generated_at: string;
  rag_sources_used: number;
  runtime_seconds: number;
  sections: PreSowingSections;
}

export function usePreSowingAdvisory(payload: PreSowingPayload) {
  const isParamsValid = Boolean(
    payload.crop?.trim() && payload.state?.trim() && payload.soil_type?.trim(),
  );
  const isEnabled =
    payload.enabled !== undefined ? payload.enabled && isParamsValid : isParamsValid;

  return useQuery<PreSowingResponse, Error>({
    queryKey: [
      "preSowingAdvisory",
      payload.crop?.toLowerCase().trim(),
      payload.state?.toLowerCase().trim(),
      payload.soil_type?.toLowerCase().trim(),
      payload.season,
      payload.irrigation_type,
      payload.language,
    ],
    queryFn: () => getPreSowingAdvisory(payload),
    enabled: isEnabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}

export default usePreSowingAdvisory;
