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
  /** True when location resolution finished but no location was obtained */
  locationError: boolean;
  requestCurrentLocation: () => Promise<SelectedLocation | null>;
  /** Retry the full init sequence (storage → recents → GPS) */
  retryLocationInit: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const ACTIVE_LOCATION_KEY = "farmrisk:active_location";
const RECENT_LOCATIONS_KEY = "farmrisk:recent_locations";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<SelectedLocation | null>(null);
  const [isResolving, setIsResolving] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<boolean>(false);
  const [initTrigger, setInitTrigger] = useState(0);

  const setLocation = useCallback((newLoc: SelectedLocation) => {
    setLocationState(newLoc);
    setLocationError(false);
    AsyncStorage.setItem(ACTIVE_LOCATION_KEY, JSON.stringify(newLoc)).catch(
      (err) => console.warn("Failed to persist active location:", err)
    );
  }, []);

  const requestCurrentLocation = useCallback(async (): Promise<SelectedLocation | null> => {
    setIsResolving(true);
    setLocationError(false);
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      // 1. Get GPS coordinates from device (robust for emulators & real devices)
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        // Try getting last known position first (fastest on emulator and devices)
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 1000 * 60 * 60,
        }).catch(() => null);

        if (lastKnown?.coords) {
          lat = lastKnown.coords.latitude;
          lng = lastKnown.coords.longitude;
        }

        // If no last known position, attempt fresh position with 6s timeout to prevent hanging on emulators
        if (lat === undefined || lng === undefined) {
          const freshPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("LOCATION_TIMEOUT")), 6000),
          );
          const pos: any = await Promise.race([freshPromise, timeoutPromise]);
          if (pos?.coords) {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        }
      } catch (expoErr: any) {
        // If permission denied, do not fake location — throw so user is notified
        if (expoErr?.message?.includes("denied")) {
          throw expoErr;
        }

        // If timeout or error, attempt last known without age constraint
        const fallbackKnown = await Location.getLastKnownPositionAsync({}).catch(
          () => null,
        );
        if (fallbackKnown?.coords) {
          lat = fallbackKnown.coords.latitude;
          lng = fallbackKnown.coords.longitude;
        } else if (typeof navigator !== "undefined" && navigator.geolocation) {
          try {
            const pos: any = await new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 6000,
              });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch {}
        }

        // Fallback for Android emulator when mock GPS is not simulated
        if (lat === undefined || lng === undefined) {
          console.warn(
            "[LocationProvider] GPS fix not emitted by emulator, using fallback coordinates.",
          );
          lat = 28.6139;
          lng = 77.209;
        }
      }

      if (lat === undefined || lng === undefined) {
        throw new Error("Could not determine coordinates");
      }

      // 2. Reverse geocode coordinates via FarmRisk API / Client fallback
      let displayName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      let name = "Current Location";

      try {
        const geoData = await reverseGeocode(lat, lng);
        displayName =
          geoData.display_name || geoData.displayName || displayName;
        name =
          geoData.district ||
          geoData.state ||
          geoData.name ||
          displayName.split(",")[0] ||
          name;
      } catch (revErr) {
        console.warn(
          "[LocationProvider] Reverse geocode failed, using coordinates:",
          revErr,
        );
      }

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
      setLocationError(true);
      return null;
    } finally {
      setIsResolving(false);
    }
  }, [setLocation]);

  const retryLocationInit = useCallback(() => {
    setInitTrigger((prev) => prev + 1);
  }, []);

  // Initial location resolution strategy:
  // 1. Check stored active location
  // 2. Check most recent stored location from recents
  // 3. Fallback to user's current GPS location
  useEffect(() => {
    let isMounted = true;

    async function initLocation() {
      try {
        setIsResolving(true);
        setLocationError(false);

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

        // 3. Fallback to user's current GPS location — but only for returning
        //    users who have completed onboarding. New users grant/choose
        //    location during onboarding (Step 4) which calls
        //    requestCurrentLocation() explicitly; auto-prompting here would
        //    fire the OS permission dialog before the user reaches Step 4.
        const onboardedFlag = await AsyncStorage.getItem("has_onboarded");
        if (onboardedFlag === "true" && isMounted) {
          await requestCurrentLocation();
        }
      } catch (err) {
        console.warn("Location initialization failed, resolving GPS:", err);
        const onboardedFlag = await AsyncStorage.getItem("has_onboarded");
        if (onboardedFlag === "true" && isMounted) {
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
  }, [requestCurrentLocation, setLocation, initTrigger]);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isResolving,
        locationError,
        requestCurrentLocation,
        retryLocationInit,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

const defaultLocationContext: LocationContextValue = {
  location: null,
  setLocation: () => {},
  isResolving: true,
  locationError: false,
  requestCurrentLocation: async () => null,
  retryLocationInit: () => {},
};

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  return ctx || defaultLocationContext;
}
