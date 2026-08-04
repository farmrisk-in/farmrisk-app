import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from "@/components/ui/Icon";
import { ArrowLeft01Icon, Clock01Icon, TrendingUpDownIcon, TickDouble01Icon } from "@hugeicons/core-free-icons";
import { useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { WeatherIcon } from "@/components/WeatherIcon";

const formatHour = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const h = date.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")} ${ampm}`;
};

const getWeatherIcon = (pcp: number) => {
  if (pcp > 5.0) return "heavy_rain.svg";
  if (pcp > 1.0) return "showers_rain.svg";
  if (pcp > 0.1) return "drizzle.svg";
  return "cloud.svg";
};

const formatDateText = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
};

export default function WeatherTableScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();

  const { data: weatherData, isLoading: weatherLoading } = useWeather();
  const { forecastRows, isLoading: forecastLoading } = useForecast();

  const isHourly = type === 'hourly';
  
  if ((isHourly && weatherLoading) || (!isHourly && forecastLoading)) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#007a55" />
      </SafeAreaView>
    );
  }

  const renderHeader = () => {
    return (
      <View className="px-5 pt-6 pb-4">
        {/* Row 1: Back Button */}
        <View className="mb-6 flex-row">
          <TouchableOpacity onPress={() => router.back()} className="p-2.5 rounded-full bg-muted/70 border border-border/50">
            <Icon icon={ArrowLeft01Icon} size={22} className="text-foreground" />
          </TouchableOpacity>
        </View>
        
        {/* Row 2: Title and Badge */}
        <View className="flex-row items-center justify-between">
          {isHourly ? (
            <>
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl">
                  <Icon icon={Clock01Icon} size={28} className="text-blue-600 dark:text-blue-400" />
                </View>
                <Text className="text-2xl font-bold text-foreground">Hourly Weather</Text>
              </View>
              <View className="px-3 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                  Next 24 Hours
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-3">
                <View className="p-2 bg-orange-100/50 dark:bg-orange-900/30 rounded-xl">
                  <Icon icon={TrendingUpDownIcon} size={28} className="text-orange-600 dark:text-orange-400" />
                </View>
                <Text className="text-2xl font-bold text-foreground">Forecast</Text>
              </View>
              <View className="px-3 flex-row gap-1 items-center py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                <Icon icon={TickDouble01Icon} size={16} className="text-emerald-800 dark:text-emerald-300" />
                <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                  Bias Corrected
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderHourlyRows = () => {
    const hourly = weatherData?.hourly;
    if (!hourly) return null;

    const slots = hourly.time.map((time: any, idx: number) => ({
      time: formatHour(time),
      temp: Math.round(hourly.temperature_2m[idx]),
      rainChance: hourly.precipitation_probability[idx] ?? 0,
      windKph: Math.round(hourly.wind_speed_10m[idx]),
      icon: hourly.icon[idx] || "clear_day.svg",
      rainfall: hourly.rain[idx] ?? 0,
    }));

    return (
      <View className="bg-card border border-border/50 rounded-3xl mx-4 my-2 overflow-hidden shadow-sm">
        {/* Table Header */}
        <View className="flex-row items-center border-b border-border/60 bg-muted/40 p-5">
          <Text className="flex-[1.2] text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</Text>
          <Text className="flex-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Temp</Text>
          <Text className="flex-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Rain</Text>
          <Text className="flex-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Wind</Text>
        </View>

        {/* Rows */}
        {slots.map((slot: any, i: number) => (
          <View key={i} className="flex-row items-center border-b border-border/30 p-5 last:border-0">
            <View className="flex-[1.2] flex-row items-center gap-3">
              <WeatherIcon name={slot.icon} size={32} />
              <Text className="text-base font-bold text-foreground">{slot.time}</Text>
            </View>
            <Text className="flex-1 text-xl font-bold text-foreground text-center">{slot.temp}°</Text>
            <View className="flex-1 items-center justify-center">
               <Text className="text-sm font-bold text-blue-500">{slot.rainChance}%</Text>
               {slot.rainfall > 0 && <Text className="text-xs font-medium text-muted-foreground mt-0.5">{slot.rainfall.toFixed(1)} mm</Text>}
            </View>
            <Text className="flex-1 text-sm font-semibold text-muted-foreground text-right">{slot.windKph} km/h</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderForecastRows = () => {
    let finalPredictions = forecastRows;
    if (forecastRows.length === 0 && weatherData?.daily) {
      const daily = weatherData.daily;
      finalPredictions = daily.time.map((time: any, idx: number) => ({
        date: new Date(time).toISOString().split("T")[0],
        tmax: daily.temperature_2m_max[idx],
        tmax_corrected: daily.temperature_2m_max[idx],
        tmin: daily.temperature_2m_min[idx],
        tmin_corrected: daily.temperature_2m_min[idx],
        pcp: daily.precipitation_sum[idx],
        pcp_corrected: daily.precipitation_sum[idx],
      }));
    }

    if (!finalPredictions.length) return null;

    return (
      <View className="bg-card border border-border/50 rounded-3xl mx-4 my-2 overflow-hidden shadow-sm">
        {/* Table Header */}
        <View className="flex-row items-center border-b border-border/60 bg-muted/40 p-5">
          <Text className="flex-[1.5] text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</Text>
          <Text className="flex-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">High / Low</Text>
          <Text className="flex-1 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Rain</Text>
        </View>

        {/* Rows */}
        {finalPredictions.map((day: any, i: number) => {
          const maxTemp = Math.round(day.tmax_corrected);
          const minTemp = Math.round(day.tmin_corrected);
          const rainVolume = day.pcp_corrected;

          return (
            <View key={day.date} className="flex-row items-center border-b border-border/30 p-5 last:border-0">
              <View className="flex-[1.5] flex-row items-center gap-4">
                <WeatherIcon name={getWeatherIcon(rainVolume)} size={36} />
                <Text className="text-base font-bold text-foreground">{formatDateText(day.date)}</Text>
              </View>
              <View className="flex-1 flex-row items-center justify-center gap-1.5">
                <Text className="text-base font-bold text-orange-600 dark:text-orange-500">{maxTemp}°</Text>
                <Text className="text-sm text-muted-foreground/60 font-medium">/</Text>
                <Text className="text-base font-bold text-sky-600 dark:text-sky-400">{minTemp}°</Text>
              </View>
              <Text className="flex-1 text-sm font-bold text-muted-foreground text-right">
                {rainVolume > 0 ? `${rainVolume.toFixed(1)} mm` : "—"}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {renderHeader()}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {isHourly ? renderHourlyRows() : renderForecastRows()}
      </ScrollView>
    </SafeAreaView>
  );
}
