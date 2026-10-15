import { useQuery } from "@tanstack/react-query";
import { getNearestKVK, type KVKResponse } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";

export function useNearestKVK() {
  const { location, isResolving } = useLocationContext();

  const lat = location?.lat;
  const lon = location?.lng;

  const query = useQuery<KVKResponse, Error>({
    queryKey: ["nearest-kvk", lat, lon],
    queryFn: async () => {
      if (lat === undefined || lon === undefined) {
        throw new Error("Missing coordinates for KVK query");
      }
      return getNearestKVK(lat, lon);
    },
    enabled: !isResolving && lat !== undefined && lon !== undefined,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  return {
    ...query,
    kvkData: query.data,
  };
}

export default useNearestKVK;
