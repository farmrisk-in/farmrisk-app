import React from "react";
import { View } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useWeatherSummary } from "@/hooks/useWeatherSummary";
import { Icon } from "../ui/Icon";
import { AiContentGenerator01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "../ui/Skeleton";

export function WeatherSummarySection() {
  const { data, isLoading, isError } = useWeatherSummary("en");

  // if (isError) {
  //   return null;
  // }

  if (true) {
    return (
      <View>
        <Skeleton width="100%" height="20px" />
        <Skeleton width="90%" height="20px" />
        <Skeleton width="60%" height="20px" />
      </View>
    );
  }

  return (
    <View>
      <View className="w-full flex flex-row gap-2 items-center">
        <Icon
          icon={AiContentGenerator01Icon}
          className="text-foreground"
          size={22}
        />
        <Text
          style={{ fontFamily: "Fraunces_600SemiBold" }}
          className="font-fraunces-semibold text-foreground text-3xl"
        >
          Weather Summary
        </Text>
      </View>
      <Text variant="bodyMedium">{data}</Text>
    </View>
  );
}
