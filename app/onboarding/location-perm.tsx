import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useLocationContext } from "@/providers/LocationProvider";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { Icon } from "@/components/ui/Icon";
import {
  PinLocation01Icon,
  Search01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

/**
 * Step 3 of 4 — Geolocation permission screen.
 *
 * Full-screen layout with OnboardingProgress bar.
 * Actions:
 *   - "Allow Location Access" → requestForegroundPermissionsAsync + resolve GPS.
 *   - "Select Location Manually" → push to /search.
 *   - "Continue" → advances to farm-select (Step 4 of 4).
 */
import { useAuth } from "@/hooks/useAuth";
import { markOnboarded } from "@/lib/onboarding";

export default function LocationPerm() {
  const router = useRouter();
  const { t } = useTranslation(["onboarding"]);
  const { location, requestCurrentLocation } = useLocationContext();
  const { user } = useAuth();

  const [granting, setGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = !!location;

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      // fallback
    }
    router.replace("/onboarding/auth");
  };

  const goNext = async () => {
    if (!user) {
      // Skip farm select if guest
      await markOnboarded();
      router.replace("/");
      return;
    }
    try {
      router.push("/onboarding/farm-select");
    } catch {
      router.replace("/onboarding/farm-select");
    }
  };

  const allowLocation = async () => {
    setGranting(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === "granted") {
        const resolved = await requestCurrentLocation();
        if (resolved) {
          goNext();
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

  const selectManually = () => router.push("/search");

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Progress bar — Step 3 of 4 */}
      <OnboardingProgress
        currentStep={3}
        totalSteps={4}
        onBack={handleBack}
        stepLabel={t("step") ?? "Step"}
        ofLabel={t("of") ?? "of"}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 32,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Header & Icon */}
          <View className="items-center my-6">
            <View className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary items-center justify-center mb-6">
              <Icon
                icon={PinLocation01Icon}
                size={40}
                className="text-primary"
              />
            </View>

            <Text className="text-3xl font-bold text-foreground text-center leading-tight">
              {t("enableTelemetryTitle")}
            </Text>

            <Text className="text-base text-muted-foreground text-center mt-3 leading-7 px-2">
              {t("enableTelemetryDesc")}
            </Text>
          </View>

          {/* Current Location Badge if already acquired */}
          {hasLocation && (
            <View className="bg-primary/10 border border-primary rounded-2xl p-4 flex-row items-center gap-3 my-2">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Icon
                  icon={Tick02Icon}
                  size={18}
                  className="text-primary-foreground"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Location Set
                </Text>
                <Text
                  className="text-sm font-bold text-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {location.displayName || location.name}
                </Text>
              </View>
            </View>
          )}

          {/* Error message */}
          {error && (
            <View className="bg-destructive/10 border border-destructive rounded-2xl p-4 my-2">
              <Text className="text-sm text-destructive font-medium text-center">
                {error}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons pinned towards bottom */}
        <View className="gap-3 mt-8">
          {/* Primary CTA */}
          <TouchableOpacity
            onPress={hasLocation && !error ? goNext : allowLocation}
            disabled={granting}
            activeOpacity={0.85}
            className="rounded-2xl bg-primary items-center justify-center py-4 disabled:opacity-60"
            accessibilityRole="button"
          >
            {granting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-primary-foreground text-lg font-bold">
                {hasLocation && !error
                  ? t("continueToDashboard")
                  : t("allowLocation")}
              </Text>
            )}
          </TouchableOpacity>

          {/* Secondary CTA — Manual search */}
          <TouchableOpacity
            onPress={selectManually}
            disabled={granting}
            activeOpacity={0.75}
            className="rounded-2xl border border-border bg-card flex-row items-center justify-center py-4 gap-2"
            accessibilityRole="button"
          >
            <Icon
              icon={Search01Icon}
              size={18}
              className="text-muted-foreground"
            />
            <Text className="text-foreground text-base font-semibold">
              {t("selectManually")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
