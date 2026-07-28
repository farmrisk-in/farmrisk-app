/**
 * components/dashboard/SearchSection.tsx
 * Keeps the dashboard clean — no dropdowns, no floating windows.
 */
import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icons } from "@/components/iconLoader";

export function SearchSection() {
  const router = useRouter();
  const { location, requestCurrentLocation, isResolving } = useLocationContext();

  const handleGPSPress = async () => {
    await requestCurrentLocation();
  };

  return (
    <View className="flex flex-row gap-2 my-4">
      {/* Tappable fake search bar */}
      <TouchableOpacity
        onPress={() => router.push("/search")}
        activeOpacity={0.75}
        className="flex flex-row items-center grow gap-3 bg-card rounded-2xl border border-border px-3 py-2"
      >
        <Icons.Search size={20} className="text-foreground" />
        <View style={{ flex: 1 }}>
          {location?.name ? (
            <>
              <Text
                className="text-md font-medium text-foreground"
                numberOfLines={1}
              >
                {location.name}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {location.displayName}
              </Text>
            </>
          ) : (
            <Text className="text-xl text-foreground opacity-80">
              Search city, district...
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleGPSPress}
          disabled={isResolving}
          activeOpacity={0.75}
          className="justify-center p-1"
          accessibilityRole="button"
          accessibilityLabel="Use Current Location"
          hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
        >
          {isResolving ? (
            <ActivityIndicator size="small" className="text-primary" />
          ) : (
            <Icons.LocateFixed size={25} className="text-foreground opacity-80" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity
        onPress={() => router.push("/map")}
        activeOpacity={0.75}
        className="aspect-square rounded-2xl bg-emerald-600 dark:bg-emerald-800 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Select from map"
      >
        <Icons.MapPin size={25} className="text-primary-foreground" />
      </TouchableOpacity>
    </View>
  );
}
