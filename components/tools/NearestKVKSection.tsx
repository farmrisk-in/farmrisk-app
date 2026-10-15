import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";
import { useNearestKVK } from "@/hooks/useNearestKVK";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import {
  LandmarkIcon,
  Location01Icon,
  Building01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import type { KVKDetail } from "@/lib/api";

export function NearestKVKSection() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { kvkData, isLoading, isError } = useNearestKVK();

  if (isLoading) {
    return (
      <View className="mb-6 px-3">
        <SectionHeader
          icon={LandmarkIcon}
          title="Local Agricultural Guidance (KVK)"
        />
        <View className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex-row items-center justify-center gap-3">
          <ActivityIndicator size="small" color="#10b981" />
          <Text className="text-xs sm:text-sm text-muted-foreground font-medium">
            Locating your nearest Krishi Vigyan Kendra (KVK)...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !kvkData || !kvkData.nearest) {
    return null;
  }

  const { nearest, district_kvk, same_district } = kvkData;
  const hasTwoKVKs = !same_district && Boolean(district_kvk);

  const renderKVKItem = (
    kvk: KVKDetail,
    badgeLabel: string,
    isDistrictKVK: boolean,
  ) => {
    return (
      <View key={kvk.kvk} className="py-1 gap-2">
        {/* KVK Title */}
        <Text className="text-sm sm:text-base font-bold text-foreground leading-snug mb-2">
          {kvk.kvk}
        </Text>

        {/* Location Row */}
        <View className="flex-row items-center gap-2 mb-1.5">
          <Icon
            icon={Location01Icon}
            size={15}
            className="text-emerald-600 dark:text-emerald-400"
          />
          <Text className="text-sm text-muted-foreground font-medium flex-1">
            {kvk.district}, {kvk.state}
          </Text>
        </View>

        {/* Host Row */}
        {kvk.host ? (
          <View className="flex-row items-start gap-2">
            <Icon
              icon={Building01Icon}
              size={15}
              className="text-blue-500 mt-0.5"
            />
            <Text className="text-sm text-muted-foreground flex-1 leading-relaxed">
              <Text className="font-semibold text-foreground">Host: </Text>
              {kvk.host}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View className="mb-6 px-1">
      {/* Global Section Header */}
      <SectionHeader
        icon={LandmarkIcon}
        title="Local Agricultural Guidance (KVK)"
        rightContent={
          <View
            style={{
              backgroundColor: isDark
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(16, 185, 129, 0.12)",
            }}
            className="px-2.5 py-1 rounded-xl"
          >
            <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Nearest KVK
            </Text>
          </View>
        }
      />
      <Text className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Visit your nearest Krishi Vigyan Kendra (KVK) for certified and expert
        agronomic advice.
      </Text>

      {/* Main KVK Card */}
      <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
        {/* Cross-district boundary warning if query falls in border zone */}
        {hasTwoKVKs && (
          <View
            className="flex-row items-start gap-2.5 p-3.5 mb-3.5 rounded-2xl border"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              borderColor: "rgba(245, 158, 11, 0.25)",
            }}
          >
            <Icon
              icon={Shield01Icon}
              size={16}
              className="text-amber-600 dark:text-amber-400 mt-0.5"
            />
            <Text className="flex-1 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              Agricultural extension and state subsidies typically follow
              administrative district boundaries. We recommend contacting your
              district&apos;s designated KVK first.
            </Text>
          </View>
        )}

        {/* KVK Items Inside Single Card */}
        <View>
          {district_kvk &&
            renderKVKItem(
              district_kvk,
              "Your District's KVK (Recommended)",
              true,
            )}

          {hasTwoKVKs && district_kvk && nearest && (
            <View className="border-t border-border my-3.5" />
          )}

          {nearest &&
            renderKVKItem(
              nearest,
              hasTwoKVKs
                ? "Nearest KVK (Neighbouring District)"
                : "Nearest KVK",
              !hasTwoKVKs,
            )}
        </View>
      </View>
    </View>
  );
}

export default NearestKVKSection;
