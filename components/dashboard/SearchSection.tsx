/**
 * components/dashboard/SearchSection.tsx
 * Keeps the dashboard clean — no dropdowns, no floating windows.
 */
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useLocationContext } from "@/providers/LocationProvider";
import { Search, MapPin, Map } from "lucide-react-native";

export function SearchSection() {
  const router = useRouter();
  const { location } = useLocationContext();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const surface = isDark ? "#18181b" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textMuted = isDark ? "#9f9fa9" : "#71717a";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const accent = "#006045";
  const accentBg = isDark ? "#052e16" : "#ecfdf5";

  return (
    <View style={{ flexDirection: "row", gap: 8, marginVertical: 16 }}>
      {/* Tappable fake search bar */}
      <TouchableOpacity
        onPress={() => router.push("/search")}
        activeOpacity={0.75}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: border,
          paddingHorizontal: 14,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Search size={18} color={textMuted} />
        <View style={{ flex: 1 }}>
          {location?.name ? (
            <>
              <Text
                style={{ fontSize: 15, fontWeight: "500", color: textPrimary }}
                numberOfLines={1}
              >
                {location.name}
              </Text>
              <Text
                style={{ fontSize: 12, color: textMuted, marginTop: 1 }}
                numberOfLines={1}
              >
                {location.displayName}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 15, color: textMuted }}>
              Search city, district...
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity
        onPress={() => router.push("/search")}
        activeOpacity={0.75}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: accentBg,
          borderWidth: 1,
          borderColor: isDark ? "#064e3b" : "#bbf7d0",
          alignItems: "center",
          justifyContent: "center",
        }}
        accessibilityRole="button"
        accessibilityLabel="Select from map"
      >
        <Map size={20} color={accent} />
      </TouchableOpacity>
    </View>
  );
}
