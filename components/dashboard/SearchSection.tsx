/**
 * components/dashboard/SearchSection.tsx
 * Keeps the dashboard clean — no dropdowns, no floating windows.
 */
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icons } from "@/components/iconLoader";

export function SearchSection() {
  const router = useRouter();
  const { location } = useLocationContext();

  return (
    <View className="flex flex-row gap-2 my-4">
      {/* Tappable fake search bar */}
      <TouchableOpacity
        onPress={() => router.push("/search")}
        activeOpacity={0.75}
        className="flex flex-row items-center grow gap-3 bg-card rounded-3xl border border-border p-3 elevation"
      >
        <Icons.Search size={25} className="text-foreground" />
        <View style={{ flex: 1 }}>
          {location?.name ? (
            <>
              <Text
                className="text-xl font-medium text-foreground"
                numberOfLines={1}
              >
                {location.name}
              </Text>
              <Text className="text-md text-muted-foreground" numberOfLines={1}>
                {location.displayName}
              </Text>
            </>
          ) : (
            <Text className="text-2xl text-foreground opacity-80">
              Search city, district...
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => console.log("GPS")}
          activeOpacity={0.75}
          className="justify-center"
          accessibilityRole="button"
          accessibilityLabel="Use Current Location"
          hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
        >
          <Icons.LocateFixed size={25} className="text-foreground opacity-80" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity
        onPress={() => console.log("MAPS")}
        activeOpacity={0.75}
        className="aspect-square rounded-3xl bg-emerald-600 dark:bg-emerald-800 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Select from map"
      >
        <Icons.MapPin size={25} className="text-primary-foreground" />
      </TouchableOpacity>
    </View>
  );
}
