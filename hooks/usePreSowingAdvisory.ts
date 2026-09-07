import { useQuery } from "@tanstack/react-query";
import { getPreSowingAdvisory } from "@/lib/api";

export interface PreSowingPayload {
  crop: string;
  state: string;
  soil_type: string;
  season?: string;
  irrigation_type?: string;
  language?: string;
}

export function usePreSowingAdvisory(payload: PreSowingPayload) {
  return useQuery({
    queryKey: ["preSowingAdvisory", payload],
    queryFn: () => getPreSowingAdvisory(payload),
    enabled: !!payload.crop && !!payload.state && !!payload.soil_type,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
  });
}
