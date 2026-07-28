import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import * as Location from "expo-location";
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
  requestCurrentLocation: () => Promise<SelectedLocation | null>;
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

  const requestCurrentLocation = useCallback(async (): Promise<SelectedLocation | null> => {
    setIsResolving(true);
    try {
      let lat: number;
      let lng: number;

      // 1. Get GPS coordinates from device
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } else {
          throw new Error("Location permission denied");
        }
      } catch (expoErr) {
        // Fallback for Web/Browser geolocation
        const pos: any = await new Promise((resolve, reject) => {
          if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
            });
          } else {
            reject(expoErr);
          }
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      // 2. Reverse geocode coordinates via FarmRisk API
      const geoData = await reverseGeocode(lat, lng);
      const displayName =
        geoData.display_name || geoData.displayName || `${lat}, ${lng}`;
      const name =
        geoData.district || geoData.state || displayName.split(",")[0] || "My Location";

      const resolvedLoc: SelectedLocation = {
        lat,
        lng,
        name,
        displayName,
      };

      setLocation(resolvedLoc);
      return resolvedLoc;
    } catch (err) {
      console.warn("Failed to obtain current location:", err);
      return null;
    } finally {
      setIsResolving(false);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, isResolving, requestCurrentLocation }}
    >
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
