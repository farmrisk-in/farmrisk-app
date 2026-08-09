import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocationContext } from "@/providers/LocationProvider";
import type { SavedField } from "@/types/fields";

const SELECTED_FARM_KEY = "farmrisk:selected_farm";

interface FarmContextValue {
  selectedFarm: SavedField | null;
  isLoading: boolean;
  selectFarm: (farm: SavedField) => Promise<void>;
  clearFarm: () => Promise<void>;
}

const FarmContext = createContext<FarmContextValue | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [selectedFarm, setSelectedFarm] = useState<SavedField | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setLocation, requestCurrentLocation } = useLocationContext();

  // Restore selected farm from AsyncStorage on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SELECTED_FARM_KEY);
        if (raw && mounted) {
          setSelectedFarm(JSON.parse(raw));
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const selectFarm = useCallback(async (farm: SavedField) => {
    setSelectedFarm(farm);
    await AsyncStorage.setItem(SELECTED_FARM_KEY, JSON.stringify(farm));
    // Update active location to farm center
    if (farm.centerLat != null && farm.centerLng != null) {
      setLocation({
        lat: farm.centerLat,
        lng: farm.centerLng,
        name: farm.name || "Farm",
        displayName: farm.name || "Farm",
      });
    }
  }, [setLocation]);

  const clearFarm = useCallback(async () => {
    setSelectedFarm(null);
    await AsyncStorage.removeItem(SELECTED_FARM_KEY);
    // Re-resolve GPS location
    await requestCurrentLocation();
  }, [requestCurrentLocation]);

  return (
    <FarmContext.Provider value={{ selectedFarm, isLoading, selectFarm, clearFarm }}>
      {children}
    </FarmContext.Provider>
  );
}

const defaultFarmContext: FarmContextValue = {
  selectedFarm: null,
  isLoading: false,
  selectFarm: async () => {},
  clearFarm: async () => {},
};

export function useFarmContext(): FarmContextValue {
  const ctx = useContext(FarmContext);
  return ctx || defaultFarmContext;
}
