import React from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icon } from "@/components/ui/Icon";
import {
  Location01Icon,
  Search01Icon,
  RotateClockwiseIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

/**
 * LocationRequired — Renders a full-screen prompt when no location is
 * available (GPS denied / device settings unsatisfied). Shows:
 *  - Message explaining the issue
 *  - "Search Location" button → opens /search
 *  - "Open Settings" button → opens device location settings
 *  - "Retry" button → re-triggers location init
 *
 * Wrap your tab screen content with this:
 *   if (!location && !isResolving && locationError) return <LocationRequired />;
 */
export function LocationRequired() {
  const router = useRouter();
  const { retryLocationInit, isResolving } = useLocationContext();

  const openSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:");
    } else {
      Linking.openSettings();
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-8">
      {/* Icon */}
      <View className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 items-center justify-center mb-6 border border-amber-500/20 dark:border-amber-400/20">
        <Icon
          icon={Location01Icon}
          size={36}
          className="text-amber-500 dark:text-amber-400"
        />
      </View>

      {/* Title */}
      <Text
        
        className="text-2xl text-foreground text-center mb-2"
      >
        Location Required
      </Text>

      {/* Description */}
      <Text className="text-sm text-muted-foreground text-center leading-relaxed mb-8 max-w-[300px]">
        FarmRisk needs your location to show weather, forecasts, and crop
        advisories. Please enable location access or search for your area.
      </Text>

      {/* Action Buttons */}
      <View className="w-full gap-3 max-w-[300px]">
        {/* Primary: Search for a location */}
        <TouchableOpacity
          onPress={() => router.push("/search")}
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-2.5 bg-primary py-3.5 rounded-2xl"
        >
          <Icon icon={Search01Icon} size={20} color="#ffffff" />
          <Text className="text-white font-bold text-base">
            Search Location
          </Text>
        </TouchableOpacity>

        {/* Secondary: Open device settings */}
        <TouchableOpacity
          onPress={openSettings}
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-2.5 bg-card border border-border py-3.5 rounded-2xl"
        >
          <Icon
            icon={Settings01Icon}
            size={20}
            className="text-foreground"
          />
          <Text className="text-foreground font-semibold text-base">
            Open Settings
          </Text>
        </TouchableOpacity>

        {/* Tertiary: Retry */}
        <TouchableOpacity
          onPress={retryLocationInit}
          disabled={isResolving}
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-2 py-3"
        >
          <Icon
            icon={RotateClockwiseIcon}
            size={18}
            className="text-muted-foreground"
          />
          <Text className="text-muted-foreground font-medium text-sm">
            {isResolving ? "Retrying…" : "Retry"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
