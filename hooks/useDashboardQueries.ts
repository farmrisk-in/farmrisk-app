/**
 * hooks/useWeather.ts
 * TanStack Query hooks for all FarmRisk API endpoints.
 * All hooks take lat/lng from LocationProvider context.
 */
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getWeather,
  getForecast,
  getSoilMoisture,
  getAIAdvisory,
  getWeatherSummary,
  getCrops,
  getCalendar,
  searchLocations,
} from "@/lib/api";

// ─── Weather (current + hourly + daily + lightning) ────────────────────────
export function useWeather(lat: number, lng: number) {
  return useQuery({
    queryKey: ["weather", lat, lng],
    queryFn: () => getWeather(lat, lng),
    enabled: !!lat && !!lng,
  });
}

// ─── Forecast (deep-learning model) ────────────────────────────────────────
export function useForecast(lat: number, lng: number) {
  return useQuery({
    queryKey: ["forecast", lat, lng],
    queryFn: () => getForecast(lat, lng),
    enabled: !!lat && !!lng,
  });
}

// ─── Soil Moisture ──────────────────────────────────────────────────────────
export function useSoilMoisture(
  lat: number,
  lng: number,
  crop?: string,
  daysbefore?: number,
) {
  return useQuery({
    queryKey: ["soil-moisture", lat, lng, crop, daysbefore],
    queryFn: () => getSoilMoisture(lat, lng, crop, daysbefore),
    enabled: !!lat && !!lng,
  });
}

// ─── Crops list ─────────────────────────────────────────────────────────────
export function useCrops(lat: number, lng: number) {
  return useQuery({
    queryKey: ["crops", lat, lng],
    queryFn: () => getCrops(lat, lng),
    enabled: !!lat && !!lng,
  });
}

// ─── Crop Calendar ──────────────────────────────────────────────────────────
export function useCalendar(crop: string, lat: number, lng: number) {
  return useQuery({
    queryKey: ["calendar", crop, lat, lng],
    queryFn: () => getCalendar(crop, lat, lng),
    enabled: !!lat && !!lng && !!crop,
  });
}

// ─── AI Advisory (mutation, triggered on demand) ───────────────────────────
export function useAIAdvisory() {
  return useMutation({
    mutationFn: (query: string) => getAIAdvisory({ query }),
  });
}

// ─── Weather Summary (mutation, triggered after forecast loads) ─────────────
export function useWeatherSummary() {
  return useMutation({
    mutationFn: (forecast_data: any) => getWeatherSummary({ forecast_data }),
  });
}

// ─── Location Search (query, driven by debounced input) ────────────────────
export function useLocationSearch(q: string) {
  return useQuery({
    queryKey: ["location-search", q],
    queryFn: () => searchLocations(q),
    enabled: typeof q === "string" && q.trim().length > 2, // only search when at least 3 chars
    staleTime: 1000 * 30, // cache search results 30s
  });
}
