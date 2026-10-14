import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import {
  SunCloudIcon,
  CloudOffIcon,
  ThermometerWarmIcon,
  RainDropIcon,
  Clock01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";

const getWindDirection = (deg: number): string => {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const val = Math.floor(deg / 22.5 + 0.5);
  return directions[val % 16];
};

export function ClimateReadoutSection() {
  const { t: tDash } = useTranslation(["dashboard"]);
  const { location, isResolving } = useLocationContext();
  const { data, isLoading, isError, error } = useWeather();
  const current = data?.current;
  const errorMessage = error?.message;

  if (!location && !isResolving) {
    return (
      <View className="my-6 px-3">
        <NoLocationCard message="Select a location to see the current climate readout." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="my-6 px-3">
        <SectionHeader
          icon={Analytics01Icon}
          title={tDash("forecast16Day") as string}
        />
        <View className="bg-card border border-border rounded-3xl p-5">
          {[...Array(7)].map((_, i) => (
            <View
              key={i}
              className="flex-row py-3 border-b border-border last:border-b-0"
            >
              <Skeleton width="100%" height={20} borderRadius={8} />
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
        <View className="bg-card border border-border rounded-3xl p-5 py-8 items-center justify-center shadow-sm">
          <Icon icon={CloudOffIcon} size={40} className="text-destructive" />
          <Text className="font-semibold text-[15px] mt-3 text-foreground text-center">
            {tDash("weatherLoadError")}
          </Text>
          <Text className="text-[13px] text-muted-foreground text-center mt-1">
            {errorMessage || tDash("weatherLoadErrorDesc")}
          </Text>
        </View>
      </View>
    );
  }

  const rows = [
    {
      label: tDash("temperature"),
      value: `${current.temperature_2m}°C`,
      icon: ThermometerWarmIcon,
    },
    {
      label: tDash("feelsLike"),
      value: `${current.apparent_temperature}°C`,
      icon: ThermometerWarmIcon,
    },
    {
      label: tDash("clouds"),
      value: `${current.cloud_cover}%`,
      icon: SunCloudIcon,
    },
    {
      label: tDash("humidity"),
      value: `${current.relative_humidity_2m}%`,
      icon: RainDropIcon,
    },
    {
      label: tDash("wind"),
      value: `${current.wind_speed_10m} km/h`,
      icon: Clock01Icon,
    },
    {
      label: tDash("direction"),
      value: `${current.wind_direction_10m}° ${getWindDirection(current.wind_direction_10m)}`,
      icon: Clock01Icon,
    },
    {
      label: tDash("gusts"),
      value: `${current.wind_gusts_10m} km/h`,
      icon: Clock01Icon,
    },
    {
      label: tDash("rainfall"),
      value: `${current.precipitation} mm`,
      icon: RainDropIcon,
    },
    {
      label: tDash("pressureMsl"),
      value: `${current.pressure_msl} hPa`,
      icon: Analytics01Icon,
    },
    {
      label: tDash("pressureSurf"),
      value: `${current.surface_pressure} hPa`,
      icon: Analytics01Icon,
    },
  ];

  return (
    <View className="my-6 px-3">
      <SectionHeader
        icon={SunCloudIcon}
        title={tDash("currentClimate")}
        rightContent={
          <View className="px-2.5 py-1 rounded-lg items-center justify-center bg-muted">
            <Text className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              {tDash("fullReadout")}
            </Text>
          </View>
        }
      />
      <View className="bg-card border border-border rounded-3xl px-5 py-2">
        {rows.map((row, ri) => {
          const isLast = ri === rows.length - 1;
          return (
            <View
              key={ri}
              className={`flex-row justify-between py-4 items-center ${
                !isLast ? "border-b border-border" : ""
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Icon
                  icon={row.icon}
                  size={18}
                  className="text-muted-foreground"
                />
                <Text className="text-muted-foreground text-sm font-bold uppercase tracking-wide">
                  {row.label}
                </Text>
              </View>
              <Text className="text-lg font-extrabold text-foreground text-right tabular-nums">
                {row.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
