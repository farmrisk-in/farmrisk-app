import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { reverseGeocode } from "@/lib/api";

export type SelectedLocation = {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
};

type LocationContextValue = {
  location: SelectedLocation | null;
  setLocation: (location: SelectedLocation) => void;
  isResolving: boolean;
  requestCurrentLocation: () => Promise<SelectedLocation | null>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const ACTIVE_LOCATION_KEY = "farmrisk:active_location";
const RECENT_LOCATIONS_KEY = "farmrisk:recent_locations";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<SelectedLocation | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(true);

  const setLocation = useCallback((newLoc: SelectedLocation) => {
    setLocationState(newLoc);
    AsyncStorage.setItem(ACTIVE_LOCATION_KEY, JSON.stringify(newLoc)).catch(
      (err) => console.warn("Failed to persist active location:", err)
    );
  }, []);

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
        geoData.district ||
        geoData.state ||
        displayName.split(",")[0] ||
        "My Location";

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
  }, [setLocation]);

  // Initial location resolution strategy:
  // 1. Check stored active location
  // 2. Check most recent stored location from recents
  // 3. Fallback to user's current GPS location
  useEffect(() => {
    let isMounted = true;

    async function initLocation() {
      try {
        setIsResolving(true);

        // 1. Try active stored location
        const storedActive = await AsyncStorage.getItem(ACTIVE_LOCATION_KEY);
        if (storedActive) {
          const parsed = JSON.parse(storedActive);
          if (parsed?.lat && parsed?.lng && isMounted) {
            setLocationState(parsed);
            setIsResolving(false);
            return;
          }
        }

        // 2. Try most recent stored location from recents list
        const storedRecents = await AsyncStorage.getItem(RECENT_LOCATIONS_KEY);
        if (storedRecents) {
          const recentsList = JSON.parse(storedRecents);
          if (Array.isArray(recentsList) && recentsList.length > 0) {
            const mostRecent = recentsList[0];
            if (mostRecent?.lat && mostRecent?.lng && isMounted) {
              setLocation(mostRecent);
              setIsResolving(false);
              return;
            }
          }
        }

        // 3. Fallback to user's current GPS location
        if (isMounted) {
          await requestCurrentLocation();
        }
      } catch (err) {
        console.warn("Location initialization failed, resolving GPS:", err);
        if (isMounted) {
          await requestCurrentLocation();
        }
      } finally {
        if (isMounted) {
          setIsResolving(false);
        }
      }
    }

    initLocation();

    return () => {
      isMounted = false;
    };
  }, [requestCurrentLocation, setLocation]);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, isResolving, requestCurrentLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

const defaultLocationContext: LocationContextValue = {
  location: null,
  setLocation: () => {},
  isResolving: true,
  requestCurrentLocation: async () => null,
};

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  return ctx || defaultLocationContext;
}
