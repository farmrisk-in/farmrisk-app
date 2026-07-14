import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { reverseGeocode } from "@/lib/api";

export type SelectedLocation = {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
};

type LocationContextValue = {
  location: SelectedLocation;
  setLocation: (location: SelectedLocation) => void;
  isResolving: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const DEFAULT_LOCATION: SelectedLocation = {
  lat: 22.7214,
  lng: 72.2741,
  name: "Dholka",
  displayName: "Dholka, Ahmedabad, Gujarat, India",
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<SelectedLocation>(DEFAULT_LOCATION);
  const [isResolving, setIsResolving] = useState(false);

  // We can skip browser geolocation on native for simplicity, 
  // or attempt to reverse-geocode the default on mount if needed.
  return (
    <LocationContext.Provider value={{ location, setLocation, isResolving }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error(
      "useLocationContext must be used inside <LocationProvider>"
    );
  }
  return ctx;
}
