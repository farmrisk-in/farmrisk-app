/**
 * components/dashboard/SearchSection.tsx
 * Keeps the dashboard clean — no dropdowns, no floating windows.
 */
import React from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useLocationContext } from "@/providers/LocationProvider";
import { useFarmContext } from "@/providers/FarmProvider";
import { Icon } from "@/components/ui/Icon";
import { Search01Icon, Gps01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { useTranslation } from "react-i18next";

export function SearchSection() {
  const router = useRouter();
  const { t } = useTranslation(["search", "fields"]);
  const { t: tCommon } = useTranslation(["common"]);
  const { location, requestCurrentLocation, isResolving } =
    useLocationContext();
  const { selectedFarm, clearFarm } = useFarmContext();

  const handleGPSPress = async () => {
    // If a farm is active, switching to GPS means clearing the farm selection.
    if (selectedFarm) {
      await clearFarm();
    } else {
      await requestCurrentLocation();
    }
  };

  return (
    <View className="flex flex-row gap-2 my-4">
      {/* Tappable fake search bar */}
      <TouchableOpacity
        onPress={() => router.push("/search")}
        activeOpacity={0.75}
        className="flex flex-row items-center grow gap-3 bg-card rounded-3xl border border-border px-3 py-3"
      >
        <Icon icon={Search01Icon} size={20} className="text-foreground" />
        <View style={{ flex: 1 }}>
          {selectedFarm ? (
            <>
              <View className="flex flex-row items-center gap-2">
                <Text
                  className="text-md font-medium text-foreground"
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {selectedFarm.name}
                </Text>
                <View className="rounded-full bg-emerald-600/20 px-2 py-0.5">
                  <Text className="text-[10px] font-semibold text-emerald-600">
                    {t("fields:farmBadge")}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {t("fields:active")}
              </Text>
            </>
          ) : location?.name ? (
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
              {t("searchPrompt")}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleGPSPress}
          disabled={isResolving}
          activeOpacity={0.75}
          className="justify-center p-1"
          accessibilityRole="button"
          accessibilityLabel={tCommon("useCurrentLocation")}
          hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
        >
          {isResolving ? (
            <ActivityIndicator size="small" className="text-primary" />
          ) : (
            <Icon
              icon={Gps01Icon}
              size={25}
              className="text-foreground opacity-70"
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Map button */}
      <TouchableOpacity
        onPress={() => router.push("/map")}
        activeOpacity={0.75}
        className="aspect-square rounded-3xl bg-emerald-800 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={t("selectOnMap")}
      >
        <Icon icon={Location01Icon} size={25} className="text-primary-foreground" />
      </TouchableOpacity>
    </View>
  );
}
