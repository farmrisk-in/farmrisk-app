import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useForecast } from "@/hooks/useForecast";
import type { ForecastRow } from "@/types/forecast";
import { Icon } from "../ui/Icon";
import {
  ChevronRightIcon,
  TickDouble01Icon,
  TrendingUpDownIcon,
  CloudOffIcon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWeather } from "@/hooks/useWeather";
import { WeatherIcon } from "../WeatherIcon";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

// Helper to determine the right weather icon based on rain volume thresholds
const getWeatherIcon = (pcp: number) => {
  if (pcp > 5.0) return "heavy_rain.svg";
  if (pcp > 1.0) return "showers_rain.svg";
  if (pcp > 0.1) return "drizzle.svg";
  return "cloud.svg";
};

// Day-of-week keys, indexed by JS Date#getDay() (0 = Sunday … 6 = Saturday)
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

// Simple day name formatting helper (returns a translation key)
const formatDayName = (dateStr: string) => {
  const date = new Date(dateStr);
  return DAY_KEYS[date.getDay()];
};

// Simple date text formatting helper
const formatDateText = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

export function ForecastSection() {
  const router = useRouter();
  const { t: tDash } = useTranslation(["dashboard"]);
  const { t: tWeather } = useTranslation(["weather"]);
  const { forecastRows, isLoading, isError } = useForecast();
  const { data: weatherData } = useWeather();
  const daily = weatherData?.daily;

  const fallbackPredictions: ForecastRow[] = daily
    ? daily.time.map((time: string | Date, idx: number) => ({
        date: new Date(time).toISOString().split("T")[0],
        tmax: daily.temperature_2m_max[idx],
        tmax_corrected: daily.temperature_2m_max[idx],
        tmin: daily.temperature_2m_min[idx],
        tmin_corrected: daily.temperature_2m_min[idx],
        pcp: daily.precipitation_sum[idx],
        pcp_corrected: daily.precipitation_sum[idx],
        is_forecast: 1 as const,
      }))
    : [];

  const finalPredictions =
    forecastRows.length > 0 ? forecastRows : fallbackPredictions;
  const isFallbackUsed =
    forecastRows.length === 0 && fallbackPredictions.length > 0;

  if (isLoading) {
    return (
      <View className="my-6 px-3">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={TrendingUpDownIcon}
            className="text-foreground"
            strokeWidth={2}
            size={26}
          />
          <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {tDash("forecast16Day")}
          </Text>
        </View>
        <View className="relative bg-card dark:bg-muted/20 border border-border rounded-2xl overflow-hidden py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="shrink-0 w-20 flex border-r border-border last:border-0 flex-col items-center gap-1"
              >
                <Skeleton width={36} height={12} borderRadius={4} />
                <Skeleton width={32} height={18} borderRadius={4} />
                <Skeleton
                  width={28}
                  height={28}
                  borderRadius={14}
                  className="my-2"
                />
                <Skeleton width={24} height={18} borderRadius={4} />
                <Skeleton
                  width={8}
                  height={48}
                  borderRadius={4}
                  className="my-1"
                />
                <Skeleton width={24} height={18} borderRadius={4} />
                <Skeleton
                  width={28}
                  height={12}
                  borderRadius={4}
                  className="mt-1"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  if (isError && forecastRows.length === 0) {
    return (
      <View className="my-6 px-3">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={TrendingUpDownIcon}
            className="text-foreground"
            strokeWidth={2}
            size={26}
          />
          <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {tDash("forecast16Day")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted/20 border border-border rounded-2xl p-6 items-center justify-center">
          <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
          <Text className="mt-4 text-muted-foreground font-medium">
            {tDash("forecastUnavailable")}
          </Text>
        </View>
      </View>
    );
  }

  if (!forecastRows.length) return null;

  return (
    <View className="my-6 px-3">
      <View className="flex pb-4 flex-row gap-2 items-center">
        <Icon
          icon={TrendingUpDownIcon}
          className="text-foreground"
          strokeWidth={2}
          size={26}
        />
        <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {tDash("forecast16Day")}
        </Text>
        <TouchableOpacity
          className="flex-row flex gap-1 items-center"
          onPress={() => {
            router.push("/weather-table?type=forecast");
          }}
        >
          {!isFallbackUsed && (
            <View className="px-3 flex flex-row gap-1 items-center py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50">
              <Icon
                icon={TickDouble01Icon}
                className="text-emerald-800 dark:text-emerald-300"
                size={18}
              />
              <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                {tDash("biasCorrected")}
              </Text>
            </View>
          )}
          <Icon icon={ChevronRightIcon} size={28} className="text-foreground" />
        </TouchableOpacity>
      </View>

      <View className="relative bg-card dark:bg-muted/20 border border-border rounded-2xl overflow-hidden py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {finalPredictions.map((day: ForecastRow, idx: number) => {
            const maxTemp = Math.round(day.tmax_corrected);
            const minTemp = Math.round(day.tmin_corrected);
            const rainVolume = day.pcp_corrected;

            return (
              <View
                key={day.date}
                className="shrink-0 w-20 flex border-r border-border last:border-0 flex-col items-center gap-1"
              >
                {/* Numeric Calendar Label */}
                <Text className="text-xs text-muted-foreground font-semibold">
                  {formatDateText(day.date)}
                </Text>

                {/* Day Word Label */}
                <Text className="text-base font-bold text-foreground">
                  {tWeather(formatDayName(day.date))}
                </Text>

                {/* Status Graphic Icon */}
                <View className="my-2">
                  <WeatherIcon name={getWeatherIcon(rainVolume)} size={28} />
                </View>

                {/* Tmax Layout Digit */}
                <Text className="text-base font-bold text-orange-600 dark:text-orange-500">
                  {maxTemp}°
                </Text>

                {/* Height bar graphic */}
                <LinearGradient
                  colors={["#f97316", "#fbbf24", "#0ea5e9"]}
                  className="w-2 h-12 my-1 opacity-80 rounded-xl"
                  style={{ borderRadius: 20 }}
                />

                {/* Tmin Layout Digit */}
                <Text className="text-base font-bold text-sky-600 dark:text-sky-400">
                  {minTemp}°
                </Text>

                {/* Total Precipitation Metrics Label */}
                <Text className="text-[11px] font-semibold text-muted-foreground font-mono mt-1">
                  {rainVolume > 0 ? `${rainVolume.toFixed(1)}mm` : "—"}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Floating Scroll Indicator */}
      </View>
    </View>
  );
}
