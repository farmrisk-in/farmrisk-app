import { useQuery } from "@tanstack/react-query";
import { getSoilType, type DetectedSoilResponse } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";

export function useSoilDetection() {
  const { location, isResolving } = useLocationContext();

  const lat = location?.lat;
  const lon = location?.lng;

  const query = useQuery<DetectedSoilResponse | null, Error>({
    queryKey: ["soil-detection", lat, lon],
    queryFn: async () => {
      if (lat === undefined || lon === undefined) return null;
      return getSoilType(lat, lon);
    },
    enabled: !isResolving && lat !== undefined && lon !== undefined,
    staleTime: Infinity,
  });

  return {
    ...query,
    detectedSoil: query.data,
    isDetectingSoil: query.isLoading,
  };
}

export default useSoilDetection;
