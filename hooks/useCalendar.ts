import { useQuery } from "@tanstack/react-query";
import { getCalendar } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";

export function useCalendar(crop?: string) {
  const { location, isResolving } = useLocationContext();
  const activeCrop = crop || "general";

  const query = useQuery({
    queryKey: ["calendar", activeCrop, location?.lat, location?.lng],
    queryFn: () => getCalendar(activeCrop, location!.lat, location!.lng),
    enabled: !isResolving && !!location?.lat && !!location?.lng && !!activeCrop,
    staleTime: 60 * 60 * 1000,
  });

  return {
    data: query.data,
    calendar: query.data?.calendar || [],
    district: query.data?.district,
    state: query.data?.state,
    isLoading: isResolving || !location || query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useCalendar;
