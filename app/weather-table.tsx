import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  TrendingUpDownIcon,
  TickDouble01Icon,
  ThermometerIcon,
  RainDropIcon,
  FastWindIcon,
  Calendar01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { useLocationContext } from "@/providers/LocationProvider";
import { HourlyWeatherDetail } from "@/components/weather/HourlyWeatherDetail";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useTranslation } from "react-i18next";

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
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export default function WeatherTableScreen() {
  const { t } = useTranslation(["weather"]);
  const { t: tDash } = useTranslation(["dashboard"]);
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const { location, isResolving } = useLocationContext();

  const { data: weatherData, isLoading: weatherLoading } = useWeather();
  const { forecastRows, isLoading: forecastLoading } = useForecast();

  const isHourly = type === "hourly";

  if (isHourly) {
    return <HourlyWeatherDetail />;
  }

  if (!location && !isResolving) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="px-5 pt-6 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Icon
              icon={ArrowLeft01Icon}
              size={32}
              className="text-foreground"
            />
          </TouchableOpacity>
        </View>
        <View className="px-5 mt-6">
          <NoLocationCard message="Select a location to view detailed weather tables." />
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity onPress={() => router.back()}>
            <Icon
              icon={ArrowLeft01Icon}
              size={32}
              className="text-foreground"
            />
          </TouchableOpacity>
        </View>

        {/* Row 2: Title and Badge */}
        <View className="flex-row items-center justify-between">
          {isHourly ? (
            <>
              <View className="flex-row items-center gap-3">
                <Icon
                  icon={Clock01Icon}
                  size={28}
                  strokeWidth={2}
                  className="text-foreground"
                />
                <Text className="text-2xl font-bold text-foreground">
                  {tDash("hourlyTitle")}
                </Text>
              </View>
              <View className="px-3 py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                  {tDash("next24Hours")}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-3">
                <Icon
                  icon={TrendingUpDownIcon}
                  size={28}
                  strokeWidth={2}
                  className="text-foreground"
                />
                <Text className="text-2xl font-bold text-foreground">
                  {t("forecast")}
                </Text>
              </View>
              <View className="px-3 flex-row gap-1 items-center py-1.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                <Icon
                  icon={TickDouble01Icon}
                  size={16}
                  className="text-emerald-800 dark:text-emerald-300"
                />
                <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                  {tDash("biasCorrected")}
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
      <View className="bg-card border border-border rounded-xl mx-4 my-2 overflow-hidden shadow-sm">
        {/* Table Header */}
        <View className="flex-row items-center border-b border-border bg-muted p-5">
          <View className="flex-[0.5]" />
          <View className="flex-[1.2] flex-row items-center justify-start gap-1.5 pl-2">
            <Icon
              icon={Clock01Icon}
              size={15}
              className="text-muted-foreground"
            />
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("timeCol")}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center gap-1.5">
            <Icon
              icon={ThermometerIcon}
              size={15}
              className="text-muted-foreground"
            />
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("tempCol")}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center gap-1.5">
            <Icon
              icon={RainDropIcon}
              size={15}
              className="text-muted-foreground"
            />
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("rainCol")}
            </Text>
          </View>
          <View className="flex-1 flex-row items-center justify-end gap-1.5">
            <Icon
              icon={FastWindIcon}
              size={15}
              className="text-muted-foreground"
            />
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t("windCol")}
            </Text>
          </View>
        </View>

        {/* Rows */}
        {slots.map((slot: any, i: number) => (
          <View
            key={i}
            className="flex-row items-center border-b border-border p-5 last:border-0"
          >
            <View className="flex-[0.5] items-center justify-center">
              <WeatherIcon name={slot.icon} size={32} />
            </View>
            <View className="flex-[1.2] justify-center pl-2">
              <Text className="text-base font-bold text-foreground">
                {slot.time}
              </Text>
            </View>
            <Text className="flex-1 text-xl font-bold text-foreground text-center">
              {slot.temp}°
            </Text>
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm font-bold text-blue-500">
                {slot.rainChance}%
              </Text>
              {slot.rainfall > 0 && (
                <Text className="text-xs font-medium text-muted-foreground mt-0.5">
                  {slot.rainfall.toFixed(1)} mm
                </Text>
              )}
            </View>
            <Text className="flex-1 text-sm font-semibold text-muted-foreground text-right">
              {slot.windKph} km/h
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const getRainCategoryKey = (rain: number) => {
    if (rain >= 204.5) return "rainCatExtremelyHeavy";
    if (rain >= 115.6) return "rainCatVeryHeavy";
    if (rain >= 64.5) return "rainCatHeavy";
    if (rain >= 15.6) return "rainCatModerate";
    if (rain >= 2.5) return "rainCatLight";
    if (rain > 0) return "rainCatVeryLight";
    return "None";
  };

  const getCategoryColor = (categoryKey: string) => {
    switch (categoryKey) {
      case "rainCatLight":
        return {
          bg: "bg-sky-500/15 dark:bg-sky-500/20",
          border: "border-sky-500/30",
          text: "text-sky-700 dark:text-sky-300",
        };
      case "rainCatModerate":
        return {
          bg: "bg-yellow-500/15 dark:bg-yellow-500/20",
          border: "border-yellow-500/30",
          text: "text-yellow-700 dark:text-yellow-300",
        };
      case "rainCatHeavy":
        return {
          bg: "bg-orange-500/15 dark:bg-orange-500/20",
          border: "border-orange-500/30",
          text: "text-orange-700 dark:text-orange-300",
        };
      case "rainCatVeryHeavy":
      case "rainCatExtremelyHeavy":
        return {
          bg: "bg-red-500/15 dark:bg-red-500/20",
          border: "border-red-500/30",
          text: "text-red-700 dark:text-red-300",
        };
      default:
        return null;
    }
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

    // 1. Find the maximum daily rainfall across the 16 days
    let maxRainIndex = -1;
    let maxRainValue = -1;

    finalPredictions.forEach((day: any, idx: number) => {
      if (day.pcp_corrected > maxRainValue) {
        maxRainValue = day.pcp_corrected;
        maxRainIndex = idx;
      }
    });

    const maxCategoryKey = getRainCategoryKey(maxRainValue);
    let highlightedIndices: number[] = [];
    let totalHighlightedRain = 0;

    if (
      maxCategoryKey !== "None" &&
      maxCategoryKey !== "rainCatVeryLight" &&
      maxRainIndex !== -1
    ) {
      // Scan left and right
      let left = maxRainIndex;
      while (
        left >= 0 &&
        getRainCategoryKey(finalPredictions[left].pcp_corrected) ===
          maxCategoryKey
      ) {
        left--;
      }
      left++;

      let right = maxRainIndex;
      while (
        right < finalPredictions.length &&
        getRainCategoryKey(finalPredictions[right].pcp_corrected) ===
          maxCategoryKey
      ) {
        right++;
      }
      right--;

      for (let i = left; i <= right; i++) {
        highlightedIndices.push(i);
        totalHighlightedRain += finalPredictions[i].pcp_corrected;
      }
    }

    const startDateText =
      highlightedIndices.length > 0
        ? formatDateText(finalPredictions[highlightedIndices[0]].date)
        : "";
    const endDateText =
      highlightedIndices.length > 0
        ? formatDateText(
            finalPredictions[highlightedIndices[highlightedIndices.length - 1]]
              .date,
          )
        : "";

    return (
      <View>
        {/* Summary Sentence Alert */}
        {highlightedIndices.length > 0 && (
          <View
            className={`mx-4 mb-4 p-4 flex-row gap-3 rounded-xl border ${
              getCategoryColor(maxCategoryKey)?.bg
            } ${getCategoryColor(maxCategoryKey)?.border}`}
          >
            <View className="mt-0.5">
              <Icon
                icon={Alert02Icon}
                size={20}
                className={getCategoryColor(maxCategoryKey)?.text}
              />
            </View>
            <Text
              className={`text-sm flex-1 leading-5 ${
                getCategoryColor(maxCategoryKey)?.text
              }`}
            >
              {startDateText === endDateText
                ? t("peakRainAlertSingle", {
                    category: t(maxCategoryKey as any),
                    amount: totalHighlightedRain.toFixed(1),
                    date: startDateText,
                  })
                : t("peakRainAlertRange", {
                    category: t(maxCategoryKey as any),
                    amount: totalHighlightedRain.toFixed(1),
                    startDate: startDateText,
                    endDate: endDateText,
                  })}
            </Text>
          </View>
        )}

        <View className="bg-card border border-border rounded-xl mx-4 my-2 overflow-hidden shadow-sm">
          {/* Table Header */}
          <View className="flex-row items-center border-b border-border bg-muted p-5">
            <View className="flex-[0.5]" />
            <View className="flex-[1.5] flex-row items-center justify-start gap-1.5 pl-2">
              <Icon
                icon={Calendar01Icon}
                size={15}
                className="text-muted-foreground"
              />
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("dateCol")}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center justify-center gap-1.5">
              <Icon
                icon={ThermometerIcon}
                size={15}
                className="text-muted-foreground"
              />
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("highLowCol")}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center justify-end gap-1.5">
              <Icon
                icon={RainDropIcon}
                size={15}
                className="text-muted-foreground"
              />
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("rainCol")}
              </Text>
            </View>
          </View>

          {/* Rows */}
          {finalPredictions.map((day: any, i: number) => {
            const maxTemp = Math.round(day.tmax_corrected);
            const minTemp = Math.round(day.tmin_corrected);
            const rainVolume = day.pcp_corrected;

            const isHighlighted = highlightedIndices.includes(i);
            const highlightStyle = isHighlighted
              ? getCategoryColor(maxCategoryKey)
              : null;

            return (
              <View
                key={day.date}
                className={`flex-row items-center border-b border-border p-5 last:border-0 ${
                  isHighlighted ? highlightStyle?.bg : ""
                }`}
              >
                <View className="flex-[0.5] items-center justify-center">
                  <WeatherIcon name={getWeatherIcon(rainVolume)} size={36} />
                </View>
                <View className="flex-[1.5] justify-center pl-2">
                  <Text className="text-base font-bold text-foreground">
                    {formatDateText(day.date)}
                  </Text>
                </View>
                <View className="flex-1 flex-row items-center justify-center gap-1.5">
                  <Text className="text-base font-bold text-orange-600 dark:text-orange-500">
                    {maxTemp}°
                  </Text>
                  <Text className="text-sm text-muted-foreground/60 font-medium">
                    /
                  </Text>
                  <Text className="text-base font-bold text-sky-600 dark:text-sky-400">
                    {minTemp}°
                  </Text>
                </View>
                <Text className="flex-1 text-sm font-bold text-muted-foreground text-right">
                  {rainVolume > 0 ? `${rainVolume.toFixed(1)} mm` : "—"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {renderHeader()}
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {isHourly ? renderHourlyRows() : renderForecastRows()}
      </ScrollView>
    </SafeAreaView>
  );
}
