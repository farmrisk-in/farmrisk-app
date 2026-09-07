import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useWeather } from "@/hooks/useWeather";
import type { HourlyWeather } from "@/types/weather";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  ChevronRightIcon,
  Clock01Icon,
  CloudOffIcon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

const formatHour = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const h = date.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")} ${ampm}`;
};

export function HourlyWeatherSection() {
  const router = useRouter();
  const { t } = useTranslation(["dashboard", "weather"]);
  const { data, isLoading, isError } = useWeather();

  if (isLoading) {
    return (
      <View className="my-6">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={Clock01Icon}
            className="text-foreground"
            strokeWidth={2}
            size={24}
          />
          <Text
            className="flex-1 shrink text-lg text-foreground font-semibold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("hourlyTitle")}
          </Text>
        </View>
        <View className="relative bg-card dark:bg-muted/20 border border-border rounded-2xl overflow-hidden py-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="px-3 border-r border-border last:border-0 flex flex-col items-center gap-2 min-w-[72px]"
              >
                <Skeleton width={40} height={16} borderRadius={4} />
                <Skeleton
                  width={28}
                  height={28}
                  borderRadius={14}
                  className="my-1"
                />
                <Skeleton width={32} height={24} borderRadius={4} />
                <View className="flex flex-col items-center gap-1 mt-1">
                  <Skeleton width={24} height={12} borderRadius={2} />
                  <Skeleton width={36} height={12} borderRadius={2} />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="my-6">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={Clock01Icon}
            className="text-foreground"
            strokeWidth={2}
            size={26}
          />
          <Text
            className="flex-1 shrink text-xl text-foreground font-semibold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("hourlyTitle")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted/20 border border-border rounded-2xl p-6 items-center justify-center">
          <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
          <Text className="mt-4 text-muted-foreground font-medium">
            {t("failedToLoadHourly")}
          </Text>
        </View>
      </View>
    );
  }

  const hourly: HourlyWeather = data?.hourly;

  const slots = hourly
    ? hourly.time.map((time, idx) => ({
        time: formatHour(time),
        temp: Math.round(hourly.temperature_2m[idx]),
        rainChance: hourly.precipitation_probability[idx] ?? 0,
        windKph: Math.round(hourly.wind_speed_10m[idx]),
        icon: hourly.icon[idx] || "clear_day.svg",
        rainfall: hourly.rain[idx] ?? 0,
      }))
    : [];

  if (!slots.length) return null;

  return (
    <View className="my-6">
      <SectionHeader
        icon={Clock01Icon}
        title={t("hourlyTitle")}
        rightContent={
          <TouchableOpacity
            className="flex-row items-center gap-1"
            onPress={() => {
              router.push("/weather-table?type=hourly");
            }}
          >
            <View className="px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50">
              <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                {t("next24Hours")}
              </Text>
            </View>
            <Icon
              icon={ChevronRightIcon}
              size={28}
              className="text-foreground"
            />
          </TouchableOpacity>
        }
      />

      <View className="relative bg-card dark:bg-muted/20 border border-border rounded-2xl overflow-hidden py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {slots.map((slot, i) => {
            return (
              <View
                key={i}
                className={`px-3 border-r border-border last:border-0 flex flex-col items-center gap-2 min-w-[72px]`}
              >
                {/* 1. Time Label */}
                <Text className="text-sm text-muted-foreground font-semibold">
                  {slot.time}
                </Text>

                {/* 2. Weather Icon (Above Temperature) */}
                <WeatherIcon name={slot.icon} size={28} />

                {/* 3. Temperature (Main metrics label) */}
                <Text className="text-lg font-bold text-foreground">
                  {slot.temp}°
                </Text>

                {/* 4. Precipitation & Wind (Below Temperature) */}
                <View className="flex flex-col items-center gap-1 mt-1">
                  <Text className="text-xs font-semibold text-blue-500">
                    {slot.rainChance}%
                  </Text>
                  {slot.rainfall > 0 && (
                    <Text className="text-[11px] text-muted-foreground font-medium">
                      {slot.rainfall.toFixed(1)}mm
                    </Text>
                  )}
                  <Text className="text-[11px] text-muted-foreground font-medium text-center">
                    {slot.windKph}km/h
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Floating Scroll Indicator */}
      </View>
      <View
        pointerEvents="none"
        className="absolute right-0 top-0 bottom-0 w-8 justify-center items-center bg-card/60 dark:bg-background/60"
      ></View>
    </View>
  );
}
