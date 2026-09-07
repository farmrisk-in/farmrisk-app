import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { useWeather } from "@/hooks/useWeather";
import { useRiskScore } from "@/hooks/useRiskScore";
import { WeatherIcon } from "@/components/WeatherIcon";
import {
  Clock01Icon,
  CloudOffIcon,
  ThermometerWarmIcon,
  RainDropIcon,
  FlashIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";

// formatHour logic
const formatHour = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const h = date.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")} ${ampm}`;
};

type Trend = "up" | "down" | null;

function getTrend(
  current: number | undefined,
  next: number | undefined,
): Trend {
  if (current === undefined || next === undefined) return null;
  if (next > current) return "up";
  if (next < current) return "down";
  return null;
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (!trend) return null;
  const up = trend === "up";
  const IconComponent = up ? ArrowUp01Icon : ArrowDown01Icon;
  return (
    <Icon
      icon={IconComponent}
      strokeWidth={2}
      size={16}
      className="text-foreground"
    />
  );
}

export function CompactHourlySection({
  hourCount = 6,
}: {
  hourCount?: number;
}) {
  const { t: tDash } = useTranslation(["dashboard"]);
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const { data: riskData, isLoading: isRiskLoading } = useRiskScore();

  const hourly = weatherData?.hourly;
  const current = weatherData?.current;

  const slots = hourly
    ? hourly.time.map((time: any, idx: number) => ({
        time: formatHour(time),
        temp: Math.round(hourly.temperature_2m[idx]),
        rainChance: hourly.precipitation_probability[idx] ?? 0,
        windKph: Math.round(hourly.wind_speed_10m[idx]),
        icon: hourly.icon[idx] || "clear_day.svg",
        rainfall: hourly.rain[idx] ?? 0,
      }))
    : [];

  const visible = slots.slice(0, hourCount);
  const first = visible[0];
  const last = visible[visible.length - 1];

  const summaryItems = [
    {
      key: "temperature",
      label: tDash("hourlyTemperature"),
      value: `${Math.round(current?.temperature_2m ?? first?.temp ?? 0)}°C`,
      icon: ThermometerWarmIcon,
      trend: getTrend(first?.temp, last?.temp),
    },
    {
      key: "rain",
      label: tDash("hourlyRainChance"),
      value: `${first?.rainChance ?? 0}%`,
      icon: RainDropIcon,
      trend: getTrend(first?.rainChance, last?.rainChance),
    },
    {
      key: "lightning",
      label: tDash("hourlyLightning"),
      value: tDash(
        `risk${riskData?.lightning?.band || "Minimal"}` as any,
        riskData?.lightning?.band || "Minimal",
      ),
      icon: FlashIcon,
      trend: null,
    },
  ];

  if (isWeatherLoading || isRiskLoading) {
    return (
      <View className="my-6">
        <SectionHeader icon={Clock01Icon} title={tDash("hourlyNextHours")} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 shadow-sm">
          <View className="flex-row justify-between mb-4">
            {[...Array(hourCount)].map((_, i) => (
              <View key={i} className="flex-col items-center gap-2">
                <Skeleton width={32} height={12} borderRadius={4} />
                <Skeleton width={28} height={28} borderRadius={14} />
                <Skeleton width={24} height={16} borderRadius={4} />
              </View>
            ))}
          </View>
          <View className="flex-row justify-between border-t border-border pt-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} width={60} height={20} borderRadius={4} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (!hourly) {
    return (
      <View className="my-6">
        <SectionHeader icon={Clock01Icon} title={tDash("hourlyNextHours")} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 items-center justify-center">
          <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
          <Text className="text-muted-foreground font-medium mt-3">
            {tDash("hourlyLoadError")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="my-6">
      <SectionHeader
        icon={Clock01Icon}
        title={tDash("hourlyNextHours")}
        rightContent={
          <View className="px-2.5 py-1 rounded-lg items-center justify-center bg-muted">
            <Text className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
              {tDash("hourlyNext6")}
            </Text>
          </View>
        }
      />

      <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl px-2 py-4 shadow-sm">
        {/* HOURLY TILES */}
        <View className="flex-row justify-between pb-4">
          {visible.map((slot: any, i: number) => (
            <View key={i} className="flex-col items-center gap-1.5 flex-1">
              <Text className="text-[11px] text-muted-foreground font-semibold">
                {slot.time}
              </Text>

              <View className="my-1">
                <WeatherIcon name={slot.icon} size={28} />
              </View>

              <Text className="text-sm font-extrabold tracking-tight text-foreground">
                {slot.temp}°
              </Text>

              <Text className="text-[10.5px] font-extrabold text-sky-600 dark:text-sky-400">
                {slot.rainChance}%
              </Text>
            </View>
          ))}
        </View>

        {/* SUMMARY ROW */}
        <View className="flex-row items-center justify-between border-t border-border pt-4">
          {summaryItems.map(({ key, label, value, icon, trend }) => (
            <View
              key={key}
              className="flex-1 flex-row items-center justify-center gap-1.5"
            >
              {/*<Icon
                icon={icon}
                size={16}
                className="text-muted-foreground shrink-0"
              />*/}
              <View className="flex-col min-w-0">
                <Text
                  className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider"
                  numberOfLines={1}
                >
                  {label}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Text className="text-[13px] font-extrabold text-foreground">
                    {value}
                  </Text>
                  <TrendArrow trend={trend} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
