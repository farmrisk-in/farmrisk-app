import React from "react";
import { Image } from "expo-image";
import { StyleProp, ImageStyle } from "react-native";

const WEATHER_ICON_MAP: Record<string, any> = {
  "blizzard.svg": require("@/assets/images/weathericons/blizzard.svg"),
  "blizzard": require("@/assets/images/weathericons/blizzard.svg"),
  "blowing_snow.svg": require("@/assets/images/weathericons/blowing_snow.svg"),
  "blowing_snow": require("@/assets/images/weathericons/blowing_snow.svg"),
  "clear_day.svg": require("@/assets/images/weathericons/clear_day.svg"),
  "clear_day": require("@/assets/images/weathericons/clear_day.svg"),
  "clear_night.svg": require("@/assets/images/weathericons/clear_night.svg"),
  "clear_night": require("@/assets/images/weathericons/clear_night.svg"),
  "cloud.svg": require("@/assets/images/weathericons/cloud.svg"),
  "cloud": require("@/assets/images/weathericons/cloud.svg"),
  "cloudy_with_snow.svg": require("@/assets/images/weathericons/cloudy_with_snow.svg"),
  "cloudy_with_snow": require("@/assets/images/weathericons/cloudy_with_snow.svg"),
  "drizzle.svg": require("@/assets/images/weathericons/drizzle.svg"),
  "drizzle": require("@/assets/images/weathericons/drizzle.svg"),
  "flurries.svg": require("@/assets/images/weathericons/flurries.svg"),
  "flurries": require("@/assets/images/weathericons/flurries.svg"),
  "haze_fog_dust_smoke.svg": require("@/assets/images/weathericons/haze_fog_dust_smoke.svg"),
  "haze_fog_dust_smoke": require("@/assets/images/weathericons/haze_fog_dust_smoke.svg"),
  "fog": require("@/assets/images/weathericons/haze_fog_dust_smoke.svg"),
  "heavy_rain.svg": require("@/assets/images/weathericons/heavy_rain.svg"),
  "heavy_rain": require("@/assets/images/weathericons/heavy_rain.svg"),
  "heavy_snow.svg": require("@/assets/images/weathericons/heavy_snow.svg"),
  "heavy_snow": require("@/assets/images/weathericons/heavy_snow.svg"),
  "isolated_thunderstorms.svg": require("@/assets/images/weathericons/isolated_thunderstorms.svg"),
  "isolated_thunderstorms": require("@/assets/images/weathericons/isolated_thunderstorms.svg"),
  "mostly_clear_day.svg": require("@/assets/images/weathericons/mostly_clear_day.svg"),
  "mostly_clear_day": require("@/assets/images/weathericons/mostly_clear_day.svg"),
  "mostly_clear_night.svg": require("@/assets/images/weathericons/mostly_clear_night.svg"),
  "mostly_clear_night": require("@/assets/images/weathericons/mostly_clear_night.svg"),
  "mostly_cloudy_day.svg": require("@/assets/images/weathericons/mostly_cloudy_day.svg"),
  "mostly_cloudy_day": require("@/assets/images/weathericons/mostly_cloudy_day.svg"),
  "mostly_cloudy_night.svg": require("@/assets/images/weathericons/mostly_cloudy_night.svg"),
  "mostly_cloudy_night": require("@/assets/images/weathericons/mostly_cloudy_night.svg"),
  "partly_cloudy_day.svg": require("@/assets/images/weathericons/partly_cloudy_day.svg"),
  "partly_cloudy_day": require("@/assets/images/weathericons/partly_cloudy_day.svg"),
  "partly_cloudy_night.svg": require("@/assets/images/weathericons/partly_cloudy_night.svg"),
  "partly_cloudy_night": require("@/assets/images/weathericons/partly_cloudy_night.svg"),
  "scattered_showers_day.svg": require("@/assets/images/weathericons/scattered_showers_day.svg"),
  "scattered_showers_day": require("@/assets/images/weathericons/scattered_showers_day.svg"),
  "scattered_showers_night.svg": require("@/assets/images/weathericons/scattered_showers_night.svg"),
  "scattered_showers_night": require("@/assets/images/weathericons/scattered_showers_night.svg"),
  "showers_rain.svg": require("@/assets/images/weathericons/showers_rain.svg"),
  "showers_rain": require("@/assets/images/weathericons/showers_rain.svg"),
  "showers_snow.svg": require("@/assets/images/weathericons/showers_snow.svg"),
  "showers_snow": require("@/assets/images/weathericons/showers_snow.svg"),
  "strong_thunderstorms.svg": require("@/assets/images/weathericons/strong_thunderstorms.svg"),
  "strong_thunderstorms": require("@/assets/images/weathericons/strong_thunderstorms.svg"),
  "thunderstorms.svg": require("@/assets/images/weathericons/thunderstorms.svg"),
  "thunderstorms": require("@/assets/images/weathericons/thunderstorms.svg"),
};

interface WeatherIconProps {
  name?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

export function WeatherIcon({ name, size = 48, style }: WeatherIconProps) {
  const cleanName = (name || "clear_day.svg").trim().toLowerCase();
  const iconSource =
    WEATHER_ICON_MAP[cleanName] ||
    WEATHER_ICON_MAP[`${cleanName}.svg`] ||
    WEATHER_ICON_MAP["clear_day.svg"];

  return (
    <Image
      source={iconSource}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}
