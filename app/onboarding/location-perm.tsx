import { useState } from "react";
import { View, Text, Pressable, Modal, Image } from "react-native";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import * as Location from "expo-location";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icon } from "@/components/ui/Icon";
import { ChevronLeftIcon, PinLocation01Icon } from "@hugeicons/core-free-icons";

/**
 * Step 4 — Geolocation permission dialog.
 *
 * Renders as a transparent modal overlay. Two actions:
 *   - "Allow Location Access" → requestForegroundPermissionsAsync + resolve GPS.
 *   - "Select Location Manually" → push to /search.
 *
 * Once a location is available (either path), the "Continue to Dashboard"
 * primary button appears. Tapping it completes onboarding (Step 5).
 */
export default function LocationPerm() {
  const { t } = useTranslation(["onboarding"]);
  const { location } = useLocationContext();

  const [granting, setGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { requestCurrentLocation } = useLocationContext();

  const hasLocation = !!location;

  /* ──────────────────────────────────────────────────────────
   * Android back button — treat as "stay", since leaving
   * without a location would land the user on an empty tabs.
   * The user must tap one of the two primary actions.
   * ────────────────────────────────────────────────────────── */
  const handleBack = () => router.replace("/onboarding/auth");

  /* ──────────────────────────────────────────────────────────
   * Mark onboarded and jump to the main Dashboard.
   * ────────────────────────────────────────────────────────── */
  const complete = async () => {
    router.replace("/onboarding/farm-select");
  };

  /* ──────────────────────────────────────────────────────────
   * "Allow Location Access" — request permission → GPS → geocode.
   * If the user already has a location from the manual flow,
   * we still allow the "Continue" button (no extra prompt).
   * ────────────────────────────────────────────────────────── */
  const allowLocation = async () => {
    setGranting(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const resolved = await requestCurrentLocation();
        if (resolved) {
          await complete();
        } else {
          setError(t("permissionError"));
        }
      } else {
        setError(t("permissionDenied"));
      }
    } catch (e: any) {
      console.warn("Location request failed:", e);
      setError(e?.message || t("permissionError"));
    } finally {
      setGranting(false);
    }
  };

  /* ──────────────────────────────────────────────────────────
   * "Select Location Manually" — push to the existing search
   * screen.  When the user selects a village/city there, the
   * LocationProvider's `setLocation` is called, which updates
   * the `location` context variable we watch above.  When the
   * user returns, the primary CTA will reflect the new state.
   * ────────────────────────────────────────────────────────── */
  const selectManually = () => router.push("/search");

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleBack}>
      {/* Full-screen dark backdrop */}
      <View className="flex-1 bg-background">
        <Image
          source={require("../../assets/images/splash.png")}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* Blurred underlay */}
        <BlurView
          intensity={60}
          tint="dark"
          style={{ position: "absolute", inset: 0 }}
        />

        {/* Centered card */}
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.delay(150).duration(500).springify()}
            className="w-full max-w-sm rounded-3xl overflow-hidden border border-border"
          >
            <BlurView intensity={20} tint="dark">
              <View className="p-7 items-center bg-card">
                {/* Icon */}
                <Animated.View
                  entering={FadeIn.delay(300).duration(400)}
                  className="w-16 h-16 rounded-full bg-emerald-600/20 items-center justify-center mb-5"
                >
                  <Icon
                    icon={PinLocation01Icon}
                    size={32}
                    className="text-emerald-500"
                  />
                </Animated.View>

                {/* Title */}
                <Text className="text-xl font-bold text-foreground text-center">
                  {t("enableTelemetryTitle")}
                </Text>

                {/* Description */}
                <Text className="mt-3 text-sm leading-5 text-muted-foreground text-center">
                  {t("enableTelemetryDesc")}
                </Text>

                {/* Error */}
                {error && (
                  <Text className="mt-3 text-sm text-destructive text-center">
                    {error}
                  </Text>
                )}

                {/* Primary CTA — conditionally changes based on state */}
                <Pressable
                  onPress={hasLocation && !error ? complete : allowLocation}
                  disabled={granting}
                  className="mt-6 w-full rounded-2xl bg-primary items-center justify-center py-4 disabled:opacity-50"
                  accessibilityRole="button"
                >
                  <Text className="text-white text-base font-semibold">
                    {hasLocation && !error
                      ? t("continueToDashboard")
                      : t("allowLocation")}
                  </Text>
                </Pressable>

                {/* Secondary CTA */}
                <Pressable
                  onPress={selectManually}
                  disabled={granting}
                  className="mt-3 w-full rounded-2xl border border-border bg-card items-center justify-center py-4"
                  accessibilityRole="button"
                >
                  <Text className="text-muted-foreground text-sm font-medium w-full text-center">
                    {t("selectManually")}
                  </Text>
                </Pressable>

                {/* Back link */}
                <Pressable
                  onPress={handleBack}
                  className="mt-4 flex flex-row items-center gap-0.5"
                  accessibilityRole="button"
                >
                  <Icon
                    icon={ChevronLeftIcon}
                    size={20}
                    className="text-muted-foreground"
                  />
                  <Text className="text-muted-foreground text-sm">
                    Back to auth
                  </Text>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
