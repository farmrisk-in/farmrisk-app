import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
} from "react-native-svg";
import { useColorScheme } from "nativewind";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Icon } from "@/components/ui/Icon";
import {
  RainDropIcon,
  CloudFastWindIcon,
  SunCloud01Icon,
  CloudIcon,
  DropletIcon,
  WindPowerIcon,
  Compass01Icon,
  DashboardCircleIcon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { useWeatherSummary } from "@/hooks/useWeatherSummary";

/**
 * Converts wind direction degrees to cardinal direction (e.g. 356° N)
 */
function getWindDirectionCardinal(deg?: number): string {
  if (deg === undefined || deg === null) return "N";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

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

      {/* Bottom 2x4 Grid Skeleton */}
      <View className="flex-row flex-wrap mt-5 pt-4 border-t border-border gap-y-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <View key={idx} className="w-1/2 flex-row items-center gap-2.5 px-1">
            <Skeleton width={32} height={32} borderRadius={10} />
            <View className="gap-1 flex-1">
              <Skeleton width={60} height={12} borderRadius={4} />
              <Skeleton width={45} height={14} borderRadius={4} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function CurrentWeatherSection() {
  const { location } = useLocationContext();
  const { data, isLoading, isError } = useWeather();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    data: dataWS,
    isLoading: isLoadingWS,
    isError: isErrorWS,
  } = useWeatherSummary("en");

  if (isLoading || !data) {
    return <CurrentWeatherSkeleton />;
  }

  if (isError) {
    return (
      <View className="rounded-3xl border border-border p-5 my-2">
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
    current.apparent_temperature ?? current.feels_like ?? temp + 1,
  );
  const conditionText = current.condition?.en || "Overcast";
  const iconName = current.icon;

  const windDirDeg = current.wind_direction_10m ?? 356;
  const windCardinal = getWindDirectionCardinal(windDirDeg);

  // 8 Weather Metrics for the 2x4 Grid
  const gridMetrics = [
    {
      label: "Rainfall",
      value: `${current.precipitation ?? 0} mm`,
      icon: RainDropIcon,
    },
    {
      label: "Wind",
      value: `${current.wind_speed_10m ?? 3} km/h`,
      icon: CloudFastWindIcon,
    },
    {
      label: "Clouds",
      value: `${current.cloud_cover ?? current.cloudcover ?? 74}%`,
      icon: CloudIcon,
    },
    {
      label: "Humidity",
      value: `${current.relative_humidity_2m ?? 94}%`,
      icon: DropletIcon,
    },
    {
      label: "Gusts",
      value: `${current.wind_gusts_10m ?? 5} km/h`,
      icon: WindPowerIcon,
    },
    {
      label: "Direction",
      value: `${windDirDeg}° ${windCardinal}`,
      icon: Compass01Icon,
    },
    {
      label: "Pressure (MSL)",
      value: `${current.pressure_msl ?? 1002} hPa`,
      icon: DashboardCircleIcon,
    },
    {
      label: "Press (Surf)",
      value: `${current.surface_pressure ?? 935} hPa`,
      icon: Layers01Icon,
    },
  ];

  // Theme-dependent SVG Radial Spotlight Gradient Colors
  const spotlightStops = isDark
    ? [
        { offset: "5%", color: "#047857" },
        { offset: "40%", color: "#064e3b" },
        { offset: "100%", color: "#022c22" },
      ]
    : [
        { offset: "5%", color: "#a7f3d0" },
        { offset: "40%", color: "#d1fae5" },
        { offset: "100%", color: "#ecfdf5" },
      ];

  return (
    <View
      className={`my-2 rounded-3xl overflow-hidden border relative ${
        isDark
          ? "border-emerald-500/30 bg-emerald-950"
          : "border-emerald-300/80 bg-emerald-50"
      }`}
    >
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
            {spotlightStops.map((stop, idx) => (
              <Stop
                key={idx}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity={1}
              />
            ))}
          </SvgRadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#weatherSpotlight)"
        />
      </Svg>

      {/* Card Content Overlay */}
      <View className="p-6 z-10">
        {/* Header Row: Location Name + LIVE Badge */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-1 items-center">
            <Icon
              icon={SunCloud01Icon}
              className={`${
                isDark ? "text-emerald-100/90" : "text-emerald-900/90"
              }`}
              size={25}
            />
            <Text
              className={`text-sm font-medium  ${
                isDark ? "text-emerald-100/90" : "text-emerald-900/90"
              }`}
              numberOfLines={1}
            >
              Current Weather
            </Text>
          </View>
          <View
            className={`px-2.5 py-0.5 rounded-full border ${
              isDark
                ? "bg-emerald-400/20 border-emerald-300/40"
                : "bg-emerald-600/15 border-emerald-600/30"
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-widest ${
                isDark ? "text-emerald-300" : "text-emerald-800"
              }`}
            >
              {location?.lat &&
                location?.lng &&
                `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </Text>
          </View>
        </View>

        {/* Main Weather Display Row */}
        <View className="flex-row items-center justify-between mt-2 mb-0">
          {/* Left Column: Big Temperature & Feels Like */}
          <View className="items-start">
            <Text
              style={{ fontFamily: "Fraunces_700Bold" }}
              className={`text-7xl tracking-tighter font-fraunces-bold ${
                isDark ? "text-white" : "text-emerald-950"
              }`}
            >
              {temp}°
            </Text>
            <Text
              className={`text-sm font-medium mt-1 ${
                isDark ? "text-emerald-200/90" : "text-emerald-800/90"
              }`}
            >
              Feels like {feelsLike}°C
            </Text>
          </View>

          {/* Right Column: Large Custom SVG Weather Icon & Condition Code */}
          <View className="items-center gap-2">
            <WeatherIcon name={iconName} size={60} />
            <Text
              className={`text-base font-fraunces capitalize text-right ${
                isDark ? "text-emerald-200/90" : "text-emerald-900/90"
              }`}
            >
              {conditionText}
            </Text>
          </View>
        </View>

        {/*Summary Section*/}
        {!isErrorWS && !isLoadingWS && (
          <View
            className={`flex-row flex-wrap mt-2 pt-2 border-t ${
              isDark ? "border-emerald-400/20" : "border-emerald-500/60"
            }`}
          >
            {/* Summary Text Content */}
            <Text
              className={`text-sm leading-relaxed font-semibold ${
                isDark ? "text-emerald-200/90" : "text-emerald-900/90"
              }`}
            >
              {dataWS}
            </Text>
          </View>
        )}

        {/* Bottom Details Row: 2x4 Grid with Proper Hugeicons */}
        <View
          className={`flex-row flex-wrap mt-3 pt-3 border-t gap-y-3 ${
            isDark ? "border-emerald-400/20" : "border-emerald-500/60"
          }`}
        >
          {gridMetrics.map((item, idx) => (
            <View
              key={idx}
              className="w-1/2 flex-row items-center gap-2.5 px-1"
            >
              <Icon
                icon={item.icon}
                size={25}
                className={isDark ? "text-emerald-300" : "text-emerald-700"}
              />
              <View className="flex-1">
                <Text
                  className={`text-[11px] font-medium ${
                    isDark ? "text-emerald-300/80" : "text-emerald-800/90"
                  }`}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Text
                  className={`text-sm font-semibold mt-0.5 ${
                    isDark ? "text-white" : "text-emerald-950"
                  }`}
                  numberOfLines={1}
                >
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
