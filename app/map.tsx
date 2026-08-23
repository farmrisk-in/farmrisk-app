import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { useLocationContext } from "@/providers/LocationProvider";
import { reverseGeocode } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import {
  Cancel01Icon,
  ChevronLeft,
  Location01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { LeafletMapView, LeafletMapEvent } from "@/components/LeafletMapView";

export default function MapScreen() {
  const { t } = useTranslation(["search"]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { location, setLocation } = useLocationContext();

  const mapRef = useRef<WebView>(null);

  // Start from current active location or a default center
  const initialLat = location?.lat ?? 23.0225;
  const initialLng = location?.lng ?? 72.5714;

  const [centerLat, setCenterLat] = useState(initialLat);
  const [centerLng, setCenterLng] = useState(initialLng);
  const [placeName, setPlaceName] = useState<string | null>(
    location?.displayName || null,
  );
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Debounced reverse geocode when map stops moving
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMapMove = useCallback((event: LeafletMapEvent) => {
    setCenterLat(event.lat);
    setCenterLng(event.lng);

    // Debounce reverse geocode (500ms after user stops panning)
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }
    geocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const geo = await reverseGeocode(event.lat, event.lng);
        const name =
          geo.display_name ||
          geo.displayName ||
          `${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`;
        setPlaceName(name);
      } catch {
        setPlaceName(`${event.lat.toFixed(4)}, ${event.lng.toFixed(4)}`);
      }
    }, 500);
  }, []);

  // "My Location" button — fly to current GPS position
  const goToCurrentLocation = useCallback(async () => {
    setIsGeolocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Send flyTo command to the Leaflet WebView
      mapRef.current?.injectJavaScript(`
        try {
          document.dispatchEvent(new MessageEvent('message', {
            data: JSON.stringify({ action: 'flyTo', lat: ${pos.coords.latitude}, lng: ${pos.coords.longitude}, zoom: 15 })
          }));
        } catch(e) {}
        true;
      `);
    } catch (err: any) {
      console.warn("Failed to get current location:", err);
      Alert.alert(
        t("locationErrorTitle" as any) || "Location Error",
        t("locationErrorDesc" as any) ||
          "Could not get your current location. Please check your GPS and permissions.",
      );
    } finally {
      setIsGeolocating(false);
    }
  }, []);

  // Confirm crosshair location — reverse geocode & push to LocationProvider
  const confirmLocation = useCallback(async () => {
    setIsConfirming(true);
    try {
      const geo = await reverseGeocode(centerLat, centerLng);
      const displayName =
        geo.display_name ||
        geo.displayName ||
        `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;
      const name =
        geo.district ||
        geo.state ||
        displayName.split(",")[0] ||
        t("selectedLocation");

      setLocation({
        lat: centerLat,
        lng: centerLng,
        name,
        displayName,
      });

      router.back();
    } catch {
      // Even if geocode fails, still set the raw coords
      setLocation({
        lat: centerLat,
        lng: centerLng,
        name: `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`,
        displayName: `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`,
      });
      Alert.alert(
        t("geocodeErrorTitle" as any) || "Network Error",
        t("geocodeErrorDesc" as any) ||
          "Could not fetch place name. Saving coordinates instead.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } finally {
      setIsConfirming(false);
    }
  }, [centerLat, centerLng, setLocation, router, t]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
    };
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* ====== Leaflet WebView Map ====== */}
      <LeafletMapView
        ref={mapRef}
        initialCenter={{ lat: initialLat, lng: initialLng }}
        initialZoom={13}
        isDark={isDark}
        showZoomControl={false}
        showCrosshair={true}
        enableDrawing={false}
        onMove={onMapMove}
      />

      {/* ====== Top Header Bar ====== */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.topBarButton]}
        >
          <Icon
            icon={ChevronLeft}
            size={28}
            color={isDark ? "#ffffff" : "#09090b"}
          />
        </TouchableOpacity>

        <Text className="text-lg text-foreground font-bold">
          {t("chooseLocation")}
        </Text>

        <TouchableOpacity
          onPress={goToCurrentLocation}
          disabled={isGeolocating}
          style={[
            styles.topBarButton,
            {
              backgroundColor: isDark
                ? "rgba(52, 211, 153, 0.2)"
                : "rgba(5, 150, 105, 0.1)",
            },
          ]}
        >
          {isGeolocating ? (
            <ActivityIndicator
              size="small"
              color={isDark ? "#34d399" : "#059669"}
            />
          ) : (
            <Icon
              icon={Location01Icon}
              size={24}
              color={isDark ? "#34d399" : "#059669"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ====== Bottom Info Panel & Confirm Button ====== */}
      <View
        style={[
          styles.bottomPanel,
          {
            paddingBottom: Math.max(insets.bottom + 12, 24),
            backgroundColor: isDark
              ? "rgba(9, 9, 11, 0.92)"
              : "rgba(255, 255, 255, 0.94)",
          },
        ]}
      >
        {/* Coordinates + Place Name */}
        <View style={styles.bottomInfoRow}>
          <View style={styles.coordsContainer}>
            <Text
              style={[
                styles.coordsLabel,
                { color: isDark ? "#a1a1aa" : "#71717a" },
              ]}
            >
              {t("coordinates")}
            </Text>
            <Text
              style={[
                styles.coordsValue,
                { color: isDark ? "#ffffff" : "#09090b" },
              ]}
            >
              {centerLat.toFixed(5)}, {centerLng.toFixed(5)}
            </Text>
            {placeName && (
              <Text
                style={[
                  styles.placeName,
                  { color: isDark ? "#a1a1aa" : "#71717a" },
                ]}
                numberOfLines={2}
              >
                {placeName}
              </Text>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={confirmLocation}
            disabled={isConfirming}
            activeOpacity={0.85}
            style={[
              styles.confirmButton,
              {
                backgroundColor: isDark ? "#059669" : "#047857",
                opacity: isConfirming ? 0.7 : 1,
              },
            ]}
          >
            {isConfirming ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon icon={Tick02Icon} size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>{t("confirm")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Top Header Bar */
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Bottom Panel */
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  coordsContainer: {
    flex: 1,
    gap: 2,
  },
  coordsLabel: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  coordsValue: {
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  placeName: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 16,
  },

  /* Confirm Button */
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
