import React from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { useWeather } from "@/hooks/useWeather";
import type { HourlyWeather } from "@/types/weather";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Icon } from "../ui/Icon";
import { Clock01Icon } from "@hugeicons/core-free-icons";

const formatHour = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const h = date.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")} ${ampm}`;
};

export function HourlyWeatherSection() {
  const { data, isLoading, isError } = useWeather();

  if (isLoading)
    return <ActivityIndicator style={{ marginVertical: 16 }} color="#007a55" />;
  if (isError)
    return (
      <Text className="text-muted-foreground text-center my-4">
        Failed to load hourly weather
      </Text>
    );

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
    <View className="my-6 px-3">
      <View className="flex pb-4 flex-row gap-2 items-center">
        <Icon icon={Clock01Icon} className="text-foreground" size={26} />
        <Text
          
          className="grow text-xl text-foreground"
        >
          Hourly Weather
        </Text>
        <View className="px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50">
          <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
            Next 24 Hours
          </Text>
        </View>
      </View>

      <View className="bg-card dark:bg-muted/50 border border-border rounded-2xl overflow-hidden py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {slots.map((slot, i) => {
            return (
              <View
                key={i}
                className="px-3 border-r border-border last:border-0 flex flex-col items-center gap-2 min-w-[72px]"
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
      </View>
    </View>
  );
}
