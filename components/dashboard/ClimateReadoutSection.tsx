import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import { useWeather } from "@/hooks/useWeather";
import { SunCloudIcon, CloudOffIcon } from "@hugeicons/core-free-icons";

const getWindDirection = (deg: number): string => {
  const directions = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  const val = Math.floor(deg / 22.5 + 0.5);
  return directions[val % 16];
};

type MetricPair = [string, string, string, string];

export function ClimateReadoutSection() {
  const { t: tDash } = useTranslation(["dashboard"]);
  const { data, isLoading, isError, error } = useWeather();
  const current = data?.current;
  const errorMessage = error?.message;

  if (isLoading) {
    return (
      <View className="my-6 px-3">
        <SectionHeader icon={SunCloudIcon} title={tDash("currentClimate")} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 shadow-sm">
          {[...Array(5)].map((_, i) => (
            <View
              key={i}
              className="flex-row justify-between py-3 border-b border-border last:border-b-0"
            >
              <View className="flex-row justify-between w-[48%]">
                <Skeleton width={60} height={14} borderRadius={4} />
                <Skeleton width={40} height={14} borderRadius={4} />
              </View>
              <View className="flex-row justify-between w-[48%]">
                <Skeleton width={60} height={14} borderRadius={4} />
                <Skeleton width={40} height={14} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError || !current) {
    return (
      <View className="my-6 px-3">
        <SectionHeader icon={SunCloudIcon} title={tDash("currentClimate")} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 py-8 items-center justify-center shadow-sm">
          <Icon icon={CloudOffIcon} size={40} className="text-muted-foreground/60 mb-3" />
          <Text className="font-semibold text-[15px] text-foreground text-center">
            {tDash("weatherLoadError")}
          </Text>
          <Text className="text-[13px] text-muted-foreground text-center mt-1">
            {errorMessage || tDash("weatherLoadErrorDesc")}
          </Text>
        </View>
      </View>
    );
  }

  const rows: MetricPair[] = [
    [
      tDash("temperature"),
      `${current.temperature_2m}°C`,
      tDash("feelsLike"),
      `${current.apparent_temperature}°C`,
    ],
    [
      tDash("clouds"),
      `${current.cloud_cover}%`,
      tDash("humidity"),
      `${current.relative_humidity_2m}%`,
    ],
    [
      tDash("wind"),
      `${current.wind_speed_10m} km/h`,
      tDash("direction"),
      `${current.wind_direction_10m}° ${getWindDirection(current.wind_direction_10m)}`,
    ],
    [
      tDash("gusts"),
      `${current.wind_gusts_10m} km/h`,
      tDash("rainfall"),
      `${current.precipitation} mm`,
    ],
    [
      tDash("pressureMsl"),
      `${current.pressure_msl} hPa`,
      tDash("pressureSurf"),
      `${current.surface_pressure} hPa`,
    ],
  ];

  return (
    <View className="my-6 px-3">
      <SectionHeader
        icon={SunCloudIcon}
        title={tDash("currentClimate")}
        rightContent={
          <View className="px-2.5 py-1 rounded-lg items-center justify-center bg-muted">
            <Text className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
              {tDash("fullReadout")}
            </Text>
          </View>
        }
      />
      <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl px-5 py-2 shadow-sm">
        {rows.map(([k1, v1, k2, v2], ri) => {
          const isLast = ri === rows.length - 1;
          return (
            <View
              key={ri}
              className={`flex-row justify-between py-3.5 ${
                !isLast ? "border-b border-border/60" : ""
              }`}
            >
              {/* Left Column */}
              <View className="flex-row items-center justify-between w-[48%] pr-1">
                <Text className="text-muted-foreground text-[11px] font-bold uppercase tracking-wide flex-shrink" numberOfLines={1}>
                  {k1}
                </Text>
                <Text className="text-[13px] font-extrabold text-foreground ml-2 text-right tabular-nums">
                  {v1}
                </Text>
              </View>

              {/* Right Column */}
              <View className="flex-row items-center justify-between w-[48%] pl-1">
                <Text className="text-muted-foreground text-[11px] font-bold uppercase tracking-wide flex-shrink" numberOfLines={1}>
                  {k2}
                </Text>
                <Text className="text-[13px] font-extrabold text-foreground ml-2 text-right tabular-nums">
                  {v2}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
