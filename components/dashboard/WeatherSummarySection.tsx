import React from "react";
import { View, Text } from "react-native";
import { useWeatherSummary } from "@/hooks/useWeatherSummary";
import { Icon } from "@/components/ui/Icon";
import { AiContentGenerator01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton Loader matching the exact AI Weather Summary card geometry
 * with slow left-to-right shimmer animation.
 */
function WeatherSummarySkeleton() {
  return (
    <View className="bg-card rounded-2xl border border-border p-4 my-2 gap-2.5">
      <View className="flex-row items-center gap-2.5 mb-1">
        <Skeleton width={28} height={28} borderRadius={8} />
        <Skeleton width={180} height={22} borderRadius={6} />
      </View>
      <Skeleton width="100%" height={14} borderRadius={4} />
      <Skeleton width="92%" height={14} borderRadius={4} />
      <Skeleton width="65%" height={14} borderRadius={4} />
    </View>
  );
}

export function WeatherSummarySection() {
  const { data, isLoading, isError } = useWeatherSummary("en");

  // Error state is hidden cleanly without cluttering the UI
  if (isError) {
    return null;
  }

  // Render shimmer skeleton while weather summary is generating or fetching
  if (isLoading || !data) {
    return <WeatherSummarySkeleton />;
  }

  return (
    <View className="border-border border rounded-3xl relative pt-5 mt-3 rounded-ss-none">
      {/* Title Header Row */}
      <View className="flex-row items-center gap-1 absolute left-2 -top-5 bg-background p-2 pl-0">
        <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
          <Icon
            icon={AiContentGenerator01Icon}
            className="text-foreground"
            size={18}
          />
        </View>
        <Text
          style={{ fontFamily: "Fraunces_600SemiBold" }}
          className="font-fraunces-semibold text-foreground text-md"
        >
          Weather Summary
        </Text>
      </View>

      {/* Summary Text Content */}
      <Text className="text-sm px-4 leading-relaxed text-foreground">
        {data}
      </Text>
    </View>
  );
}
