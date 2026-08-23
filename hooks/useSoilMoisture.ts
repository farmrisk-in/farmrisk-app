import { useQuery } from "@tanstack/react-query";
import { getSoilMoisture } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useForecast } from "./useForecast";
import { useLocked } from "./useLocked";

export function useSoilMoisture(crop?: string, daysbefore?: number) {
  const { location, isResolving } = useLocationContext();
  const { isLoading: isForecastLoading } = useForecast();
  const { isLocked } = useLocked();

  const activeCrop = crop && crop !== "general" ? crop : undefined;

  const query = useQuery({
    queryKey: [
      "soil-moisture",
      location?.lat,
      location?.lng,
      activeCrop,
      daysbefore,
    ],
    queryFn: () =>
      getSoilMoisture(location!.lat, location!.lng, activeCrop, daysbefore),
    enabled: !isLocked && !isResolving && !!location?.lat && !!location?.lng,
    staleTime: 60 * 60 * 1000,
  });

  return {
    data: query.data,
    isLoading: isResolving || !location || isForecastLoading || query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useSoilMoisture;
