import { useQuery } from "@tanstack/react-query";
import { getCrops } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";

export function useCrops() {
  const { location, isResolving } = useLocationContext();

  const query = useQuery({
    queryKey: ["crops", location?.lat, location?.lng],
    queryFn: () => getCrops(location!.lat, location!.lng),
    enabled: !isResolving && !!location?.lat && !!location?.lng,
    staleTime: 60 * 60 * 1000,
  });

  return {
    data: query.data,
    crops: query.data?.crops || [],
    district: query.data?.district,
    state: query.data?.state,
    isLoading: isResolving || (!!location && query.isLoading),
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
export default useCrops;
