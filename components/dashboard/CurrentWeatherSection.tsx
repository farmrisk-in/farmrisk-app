import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
} from "react-native-svg";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { WeatherIcon } from "@/components/WeatherIcon";

/**
 * Skeleton Loader Component matching the exact Current Weather card layout
 * with slow left-to-right shimmer animation powered by react-native-reanimated.
 */
function CurrentWeatherSkeleton() {
  return (
    <View className="rounded-3xl border border-border bg-card p-6 my-2">
      {/* Location Header Row */}
      <View className="flex-row items-center justify-between mb-4">
        <Skeleton width={140} height={18} borderRadius={6} />
        <Skeleton width={45} height={18} borderRadius={12} />
      </View>

      {/* Main Temperature & Weather Icon Row */}
      <View className="flex-row items-center justify-between my-2">
        {/* Left: Temperature & Feels Like */}
        <View className="gap-2">
          <Skeleton width={110} height={64} borderRadius={12} />
          <Skeleton width={90} height={16} borderRadius={6} />
        </View>

        {/* Right: Icon & Condition Code */}
        <View className="items-end gap-2">
          <Skeleton width={56} height={56} borderRadius={28} />
          <Skeleton width={80} height={18} borderRadius={6} />
        </View>
      </View>

      {/* Bottom Metrics Row */}
      <View className="flex-row items-center gap-4 mt-5 pt-3 border-t border-border/40">
        <Skeleton width={85} height={16} borderRadius={6} />
        <Skeleton width={95} height={16} borderRadius={6} />
      </View>
    </View>
  );
}

export function CurrentWeatherSection() {
  const { location } = useLocationContext();
  const { data, isLoading, isError } = useWeather();

  if (isLoading) {
    return <CurrentWeatherSkeleton />;
  }

  if (isError) {
    return (
      <View className="rounded-3xl border border-destructive/30 bg-destructive/10 p-5 my-2">
        <Text className="text-destructive font-semibold text-center">
          Failed to load current weather data
        </Text>
      </View>
    );
  }

  const current = data?.current;
  if (!current) return null;

  const temp = Math.round(current.temperature_2m ?? 0);
  const feelsLike = Math.round(
    current.apparent_temperature ?? current.feels_like ?? temp + 1
  );
  const conditionText = current.condition?.en || "Overcast";
  const iconName = current.icon;

  return (
    <View className="my-2 rounded-3xl overflow-hidden shadow-xl elevation-6 border border-emerald-500/30 relative bg-emerald-950">
      {/* SVG Radial Spotlight Gradient Background */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgRadialGradient
            id="weatherSpotlight"
            cx="85%"
            cy="25%"
            rx="85%"
            ry="85%"
            fx="85%"
            fy="25%"
          >
            <Stop offset="0%" stopColor="#10b981" stopOpacity={1} />
            <Stop offset="35%" stopColor="#047857" stopOpacity={1} />
            <Stop offset="70%" stopColor="#064e3b" stopOpacity={1} />
            <Stop offset="100%" stopColor="#022c22" stopOpacity={1} />
          </SvgRadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#weatherSpotlight)" />
      </Svg>

      {/* Card Content Overlay */}
      <View className="p-6 z-10">
        {/* Header Row: Location Name + LIVE Badge */}
        <View className="flex-row items-center justify-between">
          <Text
            className="text-sm font-medium text-emerald-100/90"
            numberOfLines={1}
          >
            {location?.displayName || location?.name || "Current Location"}
          </Text>
          <View className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40">
            <Text className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
              LIVE
            </Text>
          </View>
        </View>

        {/* Main Weather Display Row */}
        <View className="flex-row items-center justify-between mt-4 mb-2">
          {/* Left Column: Big Temperature & Feels Like */}
          <View>
            <Text className="text-6xl font-extrabold text-white tracking-tighter">
              {temp}°
            </Text>
            <Text className="text-sm font-medium text-emerald-200/90 mt-1">
              Feels like {feelsLike}°C
            </Text>
          </View>

          {/* Right Column: Large Custom SVG Weather Icon & Condition Code */}
          <View className="items-end">
            <View className="w-16 h-16 rounded-2xl bg-white/15 items-center justify-center mb-1.5 border border-white/20 shadow-md overflow-hidden">
              <WeatherIcon name={iconName} size={44} />
            </View>
            <Text className="text-base font-bold text-white capitalize text-right">
              {conditionText}
            </Text>
          </View>
        </View>

        {/* Bottom Details Row: Humidity & Wind */}
        <View className="flex-row items-center gap-4 mt-4 pt-3 border-t border-emerald-400/20">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xs text-emerald-300/80">💧 Humidity</Text>
            <Text className="text-xs font-semibold text-emerald-100">
              {current.relative_humidity_2m ?? 0}%
            </Text>
          </View>

          {current.wind_speed_10m !== undefined && (
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs text-emerald-300/80">💨 Wind</Text>
              <Text className="text-xs font-semibold text-emerald-100">
                {current.wind_speed_10m} km/h
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
