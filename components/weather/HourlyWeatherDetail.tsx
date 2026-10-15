import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, {
  Path,
  Rect,
  Circle,
  Line,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useColorScheme } from "nativewind";
import { Icon } from "@/components/ui/Icon";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  ThermometerIcon,
  RainDropIcon,
  FastWindIcon,
  Sun01Icon,
  DropletIcon,
  CloudIcon,
  Plant01Icon,
} from "@hugeicons/core-free-icons";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useTranslation } from "react-i18next";

const COL_WIDTH = 60;
const CHART_WIDTH = 24 * COL_WIDTH; // 1440px
const CHART_HEIGHT = 130;
const TOP_PAD = 24;
const BOT_PAD = 22;
const DRAW_HEIGHT = CHART_HEIGHT - TOP_PAD - BOT_PAD;

function formatHour(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const h = date.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")} ${ampm}`;
}

function niceCeil(x: number): number {
  if (x <= 0) return 1;
  const m = Math.pow(10, Math.floor(Math.log10(x)));
  const f = [1, 2, 2.5, 5, 10];
  for (let k = 0; k < f.length; k++) {
    if (f[k] * m >= x) return f[k] * m;
  }
  return 10 * m;
}

function getUvCategory(uv: number) {
  const r = Math.round(uv);
  if (r < 3)
    return {
      name: "Low",
      bg: "rgba(34, 197, 94, 0.15)",
      fg: "#15803d",
      bar: "#22C55E",
    };
  if (r < 6)
    return {
      name: "Moderate",
      bg: "rgba(234, 179, 8, 0.18)",
      fg: "#a16207",
      bar: "#EAB308",
    };
  if (r < 8)
    return {
      name: "High",
      bg: "rgba(249, 115, 22, 0.18)",
      fg: "#c2410c",
      bar: "#F97316",
    };
  if (r < 11)
    return {
      name: "Very High",
      bg: "rgba(220, 38, 38, 0.18)",
      fg: "#b91c1c",
      bar: "#DC2626",
    };
  return {
    name: "Extreme",
    bg: "rgba(147, 51, 234, 0.18)",
    fg: "#7e22ce",
    bar: "#9333EA",
  };
}

interface HourlySlot {
  index: number;
  time: string;
  hourLabel: string;
  isDay: boolean;
  icon: string;
  temp: number;
  apparentTemp: number;
  rainChance: number;
  rainfall: number;
  windSpeed: number;
  windGusts: number;
  humidity: number;
  uvIndex: number;
  cloudCover: number;
  et0: number;
}

export function HourlyWeatherDetail() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { location, isResolving } = useLocationContext();
  const { data: weatherData, isLoading } = useWeather();
  const { t: tDash } = useTranslation(["dashboard"]);

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
          <NoLocationCard message="Select a location to view detailed hourly weather data." />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !weatherData?.hourly) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#007a55" />
      </SafeAreaView>
    );
  }

  const hourly = weatherData.hourly;
  const rawTimes = (hourly.time || []).slice(0, 24);
  const slots: HourlySlot[] = rawTimes.map((timeVal: any, i: number) => {
    const temp = hourly.temperature_2m ? Number(hourly.temperature_2m[i] ?? 0) : 0;
    const apparentTemp = hourly.apparent_temperature
      ? Number(hourly.apparent_temperature[i] ?? temp)
      : temp;
    const rainChance = hourly.precipitation_probability
      ? Number(hourly.precipitation_probability[i] ?? 0)
      : 0;
    const rainfall = hourly.rain
      ? Number(hourly.rain[i] ?? 0)
      : 0;
    const windSpeed = hourly.wind_speed_10m
      ? Number(hourly.wind_speed_10m[i] ?? 0)
      : 0;
    const windGusts = hourly.wind_gusts_10m
      ? Number(hourly.wind_gusts_10m[i] ?? (windSpeed * 1.3))
      : windSpeed * 1.3;
    const humidity = hourly.relative_humidity_2m
      ? Number(hourly.relative_humidity_2m[i] ?? 0)
      : 0;
    const uvIndex = hourly.uv_index ? Number(hourly.uv_index[i] ?? 0) : 0;
    const cloudCover = hourly.cloud_cover ? Number(hourly.cloud_cover[i] ?? 0) : 0;
    const et0 = hourly.et0_fao_evapotranspiration
      ? Number(hourly.et0_fao_evapotranspiration[i] ?? 0)
      : 0;
    const icon = hourly.icon ? (hourly.icon[i] || "clear_day.svg") : "clear_day.svg";

    const dateObj = new Date(timeVal);
    const hourNum = dateObj.getUTCHours();
    const isDay =
      hourly.is_day && hourly.is_day[i] !== undefined
        ? Boolean(hourly.is_day[i])
        : hourNum >= 6 && hourNum <= 18;

    return {
      index: i,
      time: String(timeVal),
      hourLabel: formatHour(timeVal),
      isDay,
      icon,
      temp,
      apparentTemp,
      rainChance,
      rainfall,
      windSpeed,
      windGusts,
      humidity,
      uvIndex,
      cloudCover,
      et0,
    };
  });

  if (!slots.length) return null;

  // --- STATISTICAL CALCULATIONS ---
  // 1. Temperature & Feels Like
  const temps = slots.map((s) => s.temp);
  const appTemps = slots.map((s) => s.apparentTemp);
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const maxTempIdx = temps.indexOf(maxTemp);
  const minTempIdx = temps.indexOf(minTemp);
  let maxDiff = 0;
  let maxDiffIdx = 0;
  slots.forEach((s, idx) => {
    const diff = s.apparentTemp - s.temp;
    if (Math.abs(diff) > Math.abs(maxDiff)) {
      maxDiff = diff;
      maxDiffIdx = idx;
    }
  });

  // 2. Precipitation
  const rainChances = slots.map((s) => s.rainChance);
  const rainfalls = slots.map((s) => s.rainfall);
  const maxRainChance = Math.max(...rainChances);
  const maxRainChanceIdx = rainChances.indexOf(maxRainChance);
  const totalRain = rainfalls.reduce((acc, v) => acc + v, 0);
  const maxRain = Math.max(...rainfalls);

  // 3. Wind & Gusts
  const winds = slots.map((s) => s.windSpeed);
  const gusts = slots.map((s) => s.windGusts);
  const maxWind = Math.max(...winds);
  const maxGust = Math.max(...gusts);
  const maxGustIdx = gusts.indexOf(maxGust);

  // 4. UV Index
  const uvs = slots.map((s) => s.uvIndex);
  const maxUv = Math.max(...uvs);
  const maxUvIdx = uvs.indexOf(maxUv);
  const peakUvCat = getUvCategory(maxUv);

  // 5. Humidity
  const humidities = slots.map((s) => s.humidity);
  const maxHum = Math.max(...humidities);
  const minHum = Math.min(...humidities);
  const maxHumIdx = humidities.indexOf(maxHum);
  const minHumIdx = humidities.indexOf(minHum);

  // 6. Cloud Cover
  const clouds = slots.map((s) => s.cloudCover);
  const maxCloud = Math.max(...clouds);
  const maxCloudIdx = clouds.indexOf(maxCloud);

  // 7. Evapotranspiration
  const ets = slots.map((s) => s.et0);
  const totalEt = ets.reduce((acc, v) => acc + v, 0);
  const maxEt = Math.max(...ets);
  const maxEtIdx = ets.indexOf(maxEt);

  // --- REUSABLE CHART RENDERERS ---
  const renderNightBands = () => {
    return slots.map((s, i) =>
      !s.isDay ? (
        <Rect
          key={`night-${i}`}
          x={i * COL_WIDTH}
          y={0}
          width={COL_WIDTH}
          height={CHART_HEIGHT}
          fill={
            isDark ? "rgba(255, 255, 255, 0.035)" : "rgba(100, 116, 139, 0.06)"
          }
        />
      ) : null
    );
  };

  const renderGridLines = (
    lo: number,
    hi: number,
    unit: string,
    decimals = 0
  ) => {
    const levels = [lo, (lo + hi) / 2, hi];
    const getY = (val: number) =>
      CHART_HEIGHT -
      BOT_PAD -
      ((val - lo) / Math.max(hi - lo, 0.001)) * DRAW_HEIGHT;

    return levels.map((lvl, k) => {
      const y = getY(lvl);
      const labelText = `${lvl.toFixed(decimals)}${unit}`;
      return (
        <G key={`grid-${k}`}>
          <Line
            x1={0}
            y1={y}
            x2={CHART_WIDTH}
            y2={y}
            stroke={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
          <SvgText
            x={10}
            y={y - 4}
            fontSize="10"
            fill={isDark ? "#94a3b8" : "#64748b"}
            fontWeight="500"
          >
            {labelText}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <View className="px-5 pt-6 pb-4">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              icon={ArrowLeft01Icon}
              size={30}
              className="text-foreground"
            />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: isDark
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(16, 185, 129, 0.12)",
              borderColor: isDark
                ? "rgba(16, 185, 129, 0.3)"
                : "rgba(16, 185, 129, 0.25)",
            }}
            className="px-3 py-1.5 rounded-xl border"
          >
            <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              {tDash("next24Hours") || "NEXT 24 HOURS"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <Icon
            icon={Clock01Icon}
            size={28}
            strokeWidth={2}
            className="text-foreground"
          />
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Hourly Weather
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              Swipe charts horizontally to inspect each hour · Shaded = Night
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================== */}
        {/* 1. TEMPERATURE & FEELS LIKE */}
        {/* ============================================================== */}
        {(() => {
          const allTemps = [...temps, ...appTemps];
          const mn = Math.min(...allTemps);
          const mx = Math.max(...allTemps);
          const pad = Math.max((mx - mn) * 0.16, 2);
          const lo = Math.floor(mn - pad);
          const hi = Math.ceil(mx + pad);

          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - ((v - lo) / Math.max(hi - lo, 1)) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const tempPoints = temps.map((v, i) => ({ x: getX(i), y: getY(v) }));
          const tempPathD =
            "M " + tempPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
          const tempAreaD = `${tempPathD} L ${tempPoints[tempPoints.length - 1].x},${
            CHART_HEIGHT - BOT_PAD
          } L ${tempPoints[0].x},${CHART_HEIGHT - BOT_PAD} Z`;

          const appPoints = appTemps.map((v, i) => ({ x: getX(i), y: getY(v) }));
          const appPathD =
            "M " + appPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

          const note =
            Math.abs(maxDiff) >= 0.5
              ? `Feels up to ${Math.abs(maxDiff).toFixed(1)}°C ${
                  maxDiff > 0 ? "warmer" : "cooler"
                } than air temperature (${slots[maxDiffIdx].hourLabel})`
              : "Apparent temperature closely matches actual air temperature";

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(249, 115, 22, 0.15)"
                          : "rgba(249, 115, 22, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={ThermometerIcon}
                        size={18}
                        className="text-orange-600 dark:text-orange-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      Temperature & Feels Like
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      °C
                    </Text>
                  </View>
                </View>

                {/* Summary & Legend */}
                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Max {Math.round(maxTemp)}°C ({slots[maxTempIdx].hourLabel})
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium">·</Text>
                    <Text className="text-xs text-foreground font-semibold">
                      Min {Math.round(minTemp)}°C ({slots[minTempIdx].hourLabel})
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3 ml-auto">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-3.5 h-0.5 bg-orange-600 dark:bg-orange-500 rounded" />
                      <Text className="text-[11px] font-medium text-muted-foreground">
                        Air
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-3.5 h-0.5 border-t border-dashed border-amber-600 dark:border-amber-400" />
                      <Text className="text-[11px] font-medium text-muted-foreground">
                        Feels Like
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                      <LinearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#ea580c" stopOpacity="0.25" />
                        <Stop offset="1" stopColor="#ea580c" stopOpacity="0.0" />
                      </LinearGradient>
                    </Defs>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "°", 0)}

                    <Path d={tempAreaD} fill="url(#tempGrad)" />
                    <Path
                      d={appPathD}
                      stroke="#d97706"
                      strokeWidth={2}
                      strokeDasharray="5,4"
                      fill="none"
                    />
                    <Path
                      d={tempPathD}
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {tempPoints.map((p, i) => {
                      const isPeak = i === maxTempIdx || i === minTempIdx;
                      return (
                        <Circle
                          key={`pt-${i}`}
                          cx={p.x}
                          cy={p.y}
                          r={isPeak ? 4.5 : 2.5}
                          fill={
                            isPeak
                              ? "#ea580c"
                              : isDark
                              ? "#1e293b"
                              : "#ffffff"
                          }
                          stroke="#ea580c"
                          strokeWidth={2}
                        />
                      );
                    })}

                    <SvgText
                      x={tempPoints[maxTempIdx].x}
                      y={tempPoints[maxTempIdx].y - 9}
                      fontSize="11"
                      fontWeight="bold"
                      fill={isDark ? "#fb923c" : "#c2410c"}
                      textAnchor="middle"
                    >
                      {Math.round(maxTemp)}°
                    </SvgText>
                    {minTempIdx !== maxTempIdx && (
                      <SvgText
                        x={tempPoints[minTempIdx].x}
                        y={tempPoints[minTempIdx].y + 17}
                        fontSize="11"
                        fontWeight="bold"
                        fill={isDark ? "#38bdf8" : "#0284c7"}
                        textAnchor="middle"
                      >
                        {Math.round(minTemp)}°
                      </SvgText>
                    )}
                  </Svg>

                  {/* Hourly Columns */}
                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => (
                      <View
                        key={i}
                        style={{ width: COL_WIDTH }}
                        className="items-center px-1"
                      >
                        <WeatherIcon name={s.icon} size={24} />
                        <Text className="text-xs font-semibold text-muted-foreground mt-1">
                          {s.hourLabel}
                        </Text>
                        <Text className="text-sm font-bold text-foreground mt-0.5">
                          {Math.round(s.temp)}°
                        </Text>
                        <Text className="text-[10px] text-muted-foreground font-medium">
                          {Math.round(s.apparentTemp)}°
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* ============================================================== */}
        {/* 2. PRECIPITATION & RAIN CHANCE */}
        {/* ============================================================== */}
        {(() => {
          const lo = 0;
          const hi = 100;
          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - (v / hi) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const note =
            totalRain === 0 && maxRainChance === 0
              ? "No rain expected in the next 24 hours"
              : totalRain > 0
              ? `Expected total ${totalRain.toFixed(1)} mm rainfall · Peak chance ${maxRainChance}% (${slots[maxRainChanceIdx].hourLabel})`
              : `Peak rain chance ${maxRainChance}% at ${slots[maxRainChanceIdx].hourLabel}`;

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(59, 130, 246, 0.15)"
                          : "rgba(59, 130, 246, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={RainDropIcon}
                        size={18}
                        className="text-blue-600 dark:text-blue-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      Precipitation & Rain Chance
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      % / mm
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Peak Chance: {maxRainChance}%
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium">·</Text>
                    <Text className="text-xs text-foreground font-semibold">
                      Total Rain: {totalRain.toFixed(1)} mm
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "%", 0)}

                    {slots.map((s, i) => {
                      const h = (s.rainChance / 100) * DRAW_HEIGHT;
                      const y = CHART_HEIGHT - BOT_PAD - h;
                      const x = getX(i) - 13;
                      return (
                        <Rect
                          key={`bar-${i}`}
                          x={x}
                          y={y}
                          width={26}
                          height={Math.max(h, 0)}
                          rx={4}
                          fill="#2563eb"
                          opacity={s.rainChance > 0 ? 0.85 : 0.08}
                        />
                      );
                    })}

                    {maxRainChance > 0 ? (
                      <SvgText
                        x={getX(maxRainChanceIdx)}
                        y={getY(maxRainChance) - 6}
                        fontSize="11"
                        fontWeight="bold"
                        fill={isDark ? "#60a5fa" : "#1d4ed8"}
                        textAnchor="middle"
                      >
                        {maxRainChance}%
                      </SvgText>
                    ) : (
                      <SvgText
                        x={CHART_WIDTH / 2}
                        y={CHART_HEIGHT / 2}
                        fontSize="13"
                        fontWeight="600"
                        fill={isDark ? "#94a3b8" : "#64748b"}
                        textAnchor="middle"
                      >
                        No rain expected in the next 24 hours
                      </SvgText>
                    )}
                  </Svg>

                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => (
                      <View
                        key={i}
                        style={{ width: COL_WIDTH }}
                        className="items-center px-1"
                      >
                        <WeatherIcon name={s.icon} size={24} />
                        <Text className="text-xs font-semibold text-muted-foreground mt-1">
                          {s.hourLabel}
                        </Text>
                        <Text className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                          {s.rainChance}%
                        </Text>
                        <Text className="text-[10px] text-muted-foreground font-medium">
                          {s.rainfall > 0 ? `${s.rainfall.toFixed(1)}mm` : "0mm"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* ============================================================== */}
        {/* 3. WIND SPEED & WIND GUSTS */}
        {/* ============================================================== */}
        {(() => {
          const allWinds = [...winds, ...gusts];
          const mx = Math.max(...allWinds);
          const hi = Math.max(niceCeil(mx * 1.15), 10);
          const lo = 0;

          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - (v / hi) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const windPoints = winds.map((v, i) => ({ x: getX(i), y: getY(v) }));
          const windPathD =
            "M " + windPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
          const windAreaD = `${windPathD} L ${windPoints[windPoints.length - 1].x},${
            CHART_HEIGHT - BOT_PAD
          } L ${windPoints[0].x},${CHART_HEIGHT - BOT_PAD} Z`;

          const gustPoints = gusts.map((v, i) => ({ x: getX(i), y: getY(v) }));
          const gustPathD =
            "M " + gustPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");

          const note = `Peak gust ${Math.round(maxGust)} km/h vs ${Math.round(
            winds[maxGustIdx]
          )} km/h sustained wind (${slots[maxGustIdx].hourLabel})`;

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(20, 184, 166, 0.15)"
                          : "rgba(20, 184, 166, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={FastWindIcon}
                        size={18}
                        className="text-teal-600 dark:text-teal-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      Wind Speed & Gusts
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      km/h
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Max Sustained: {Math.round(maxWind)} km/h
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium">·</Text>
                    <Text className="text-xs text-foreground font-semibold">
                      Peak Gust: {Math.round(maxGust)} km/h
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3 ml-auto">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-3.5 h-0.5 bg-teal-600 dark:bg-teal-400 rounded" />
                      <Text className="text-[11px] font-medium text-muted-foreground">
                        Wind
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-3.5 h-0.5 border-t border-dashed border-blue-600 dark:border-blue-400" />
                      <Text className="text-[11px] font-medium text-muted-foreground">
                        Gusts
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                      <LinearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#0f766e" stopOpacity="0.25" />
                        <Stop offset="1" stopColor="#0f766e" stopOpacity="0.0" />
                      </LinearGradient>
                    </Defs>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "kph", 0)}

                    <Path d={windAreaD} fill="url(#windGrad)" />
                    <Path
                      d={gustPathD}
                      stroke="#2563eb"
                      strokeWidth={2}
                      strokeDasharray="5,4"
                      fill="none"
                    />
                    <Path
                      d={windPathD}
                      stroke="#0f766e"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {windPoints.map((p, i) => (
                      <Circle
                        key={`wpt-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={i === maxGustIdx ? 4 : 2.5}
                        fill={
                          i === maxGustIdx
                            ? "#0f766e"
                            : isDark
                            ? "#1e293b"
                            : "#ffffff"
                        }
                        stroke="#0f766e"
                        strokeWidth={2}
                      />
                    ))}

                    <SvgText
                      x={gustPoints[maxGustIdx].x}
                      y={gustPoints[maxGustIdx].y - 8}
                      fontSize="11"
                      fontWeight="bold"
                      fill={isDark ? "#60a5fa" : "#1d4ed8"}
                      textAnchor="middle"
                    >
                      {Math.round(maxGust)}
                    </SvgText>
                  </Svg>

                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => (
                      <View
                        key={i}
                        style={{ width: COL_WIDTH }}
                        className="items-center px-1"
                      >
                        <WeatherIcon name={s.icon} size={24} />
                        <Text className="text-xs font-semibold text-muted-foreground mt-1">
                          {s.hourLabel}
                        </Text>
                        <Text className="text-sm font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                          {Math.round(s.windSpeed)}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground font-medium">
                          G {Math.round(s.windGusts)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* ============================================================== */}
        {/* 4. UV INDEX */}
        {/* ============================================================== */}
        {(() => {
          const hi = Math.max(niceCeil(maxUv * 1.15), 10);
          const lo = 0;
          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - (v / hi) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const note = `Peak category: ${peakUvCat.name} (${maxUv.toFixed(
            1
          )}) at ${slots[maxUvIdx].hourLabel}`;

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(245, 158, 11, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={Sun01Icon}
                        size={18}
                        className="text-amber-600 dark:text-amber-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      UV Index
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      Index 0-12
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Peak: {maxUv.toFixed(1)} ({peakUvCat.name})
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "", 0)}

                    {slots.map((s, i) => {
                      const cat = getUvCategory(s.uvIndex);
                      const h = (s.uvIndex / hi) * DRAW_HEIGHT;
                      const y = CHART_HEIGHT - BOT_PAD - h;
                      const x = getX(i) - 13;
                      return (
                        <Rect
                          key={`uv-${i}`}
                          x={x}
                          y={y}
                          width={26}
                          height={Math.max(h, 0)}
                          rx={4}
                          fill={cat.bar}
                          opacity={s.uvIndex > 0 ? 0.9 : 0.08}
                        />
                      );
                    })}

                    {maxUv > 0 && (
                      <SvgText
                        x={getX(maxUvIdx)}
                        y={getY(maxUv) - 6}
                        fontSize="11"
                        fontWeight="bold"
                        fill={peakUvCat.bar}
                        textAnchor="middle"
                      >
                        {maxUv.toFixed(1)}
                      </SvgText>
                    )}
                  </Svg>

                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => {
                      const cat = getUvCategory(s.uvIndex);
                      return (
                        <View
                          key={i}
                          style={{ width: COL_WIDTH }}
                          className="items-center px-1"
                        >
                          <WeatherIcon name={s.icon} size={24} />
                          <Text className="text-xs font-semibold text-muted-foreground mt-1">
                            {s.hourLabel}
                          </Text>
                          <View
                            style={{
                              backgroundColor: s.uvIndex > 0 ? cat.bg : "transparent",
                            }}
                            className="px-1.5 py-0.5 rounded-full mt-1"
                          >
                            <Text
                              style={{
                                color: s.uvIndex > 0 ? cat.fg : "#94a3b8",
                              }}
                              className="text-[10px] font-bold text-center"
                            >
                              {s.uvIndex > 0 ? s.uvIndex.toFixed(1) : "0"}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* ============================================================== */}
        {/* 5. RELATIVE HUMIDITY */}
        {/* ============================================================== */}
        {(() => {
          const lo = 0;
          const hi = 100;
          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - (v / hi) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const humPoints = humidities.map((v, i) => ({
            x: getX(i),
            y: getY(v),
          }));
          const humPathD =
            "M " + humPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
          const humAreaD = `${humPathD} L ${humPoints[humPoints.length - 1].x},${
            CHART_HEIGHT - BOT_PAD
          } L ${humPoints[0].x},${CHART_HEIGHT - BOT_PAD} Z`;

          const note = `Relative humidity ranges from ${minHum}% (${slots[minHumIdx].hourLabel}) to ${maxHum}% (${slots[maxHumIdx].hourLabel})`;

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(6, 182, 212, 0.15)"
                          : "rgba(6, 182, 212, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={DropletIcon}
                        size={18}
                        className="text-cyan-600 dark:text-cyan-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      Relative Humidity
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      %
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Max: {maxHum}%
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium">·</Text>
                    <Text className="text-xs text-foreground font-semibold">
                      Min: {minHum}%
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    <Defs>
                      <LinearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#0891b2" stopOpacity="0.25" />
                        <Stop offset="1" stopColor="#0891b2" stopOpacity="0.0" />
                      </LinearGradient>
                    </Defs>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "%", 0)}

                    <Path d={humAreaD} fill="url(#humGrad)" />
                    <Path
                      d={humPathD}
                      stroke="#0891b2"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />

                    {humPoints.map((p, i) => (
                      <Circle
                        key={`hpt-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={i === maxHumIdx || i === minHumIdx ? 4 : 2.5}
                        fill={
                          i === maxHumIdx || i === minHumIdx
                            ? "#0891b2"
                            : isDark
                            ? "#1e293b"
                            : "#ffffff"
                        }
                        stroke="#0891b2"
                        strokeWidth={2}
                      />
                    ))}

                    <SvgText
                      x={humPoints[maxHumIdx].x}
                      y={humPoints[maxHumIdx].y - 8}
                      fontSize="11"
                      fontWeight="bold"
                      fill={isDark ? "#22d3ee" : "#0e7490"}
                      textAnchor="middle"
                    >
                      {maxHum}%
                    </SvgText>
                  </Svg>

                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => (
                      <View
                        key={i}
                        style={{ width: COL_WIDTH }}
                        className="items-center px-1"
                      >
                        <WeatherIcon name={s.icon} size={24} />
                        <Text className="text-xs font-semibold text-muted-foreground mt-1">
                          {s.hourLabel}
                        </Text>
                        <Text className="text-sm font-bold text-cyan-700 dark:text-cyan-400 mt-0.5">
                          {s.humidity}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* ============================================================== */}
        {/* 6. CLOUD COVER */}
        {/* ============================================================== */}
        {(() => {
          const lo = 0;
          const hi = 100;
          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - (v / hi) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const note =
            maxCloud === 0
              ? "Clear skies: 0% cloud cover all day"
              : `Peak cloud cover ${maxCloud}% at ${slots[maxCloudIdx].hourLabel}`;

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(100, 116, 139, 0.15)"
                          : "rgba(100, 116, 139, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={CloudIcon}
                        size={18}
                        className="text-slate-600 dark:text-slate-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      Cloud Cover
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      %
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Max Cover: {maxCloud}%
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "%", 0)}

                    {slots.map((s, i) => {
                      const h = (s.cloudCover / 100) * DRAW_HEIGHT;
                      const y = CHART_HEIGHT - BOT_PAD - h;
                      const x = getX(i) - 13;
                      return (
                        <Rect
                          key={`cloud-${i}`}
                          x={x}
                          y={y}
                          width={26}
                          height={Math.max(h, 0)}
                          rx={4}
                          fill="#64748b"
                          opacity={s.cloudCover > 0 ? 0.85 : 0.08}
                        />
                      );
                    })}

                    {maxCloud > 0 ? (
                      <SvgText
                        x={getX(maxCloudIdx)}
                        y={getY(maxCloud) - 6}
                        fontSize="11"
                        fontWeight="bold"
                        fill={isDark ? "#cbd5e1" : "#475569"}
                        textAnchor="middle"
                      >
                        {maxCloud}%
                      </SvgText>
                    ) : (
                      <SvgText
                        x={CHART_WIDTH / 2}
                        y={CHART_HEIGHT / 2}
                        fontSize="13"
                        fontWeight="600"
                        fill={isDark ? "#94a3b8" : "#64748b"}
                        textAnchor="middle"
                      >
                        Clear skies: 0% cloud cover all day
                      </SvgText>
                    )}
                  </Svg>

                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => (
                      <View
                        key={i}
                        style={{ width: COL_WIDTH }}
                        className="items-center px-1"
                      >
                        <WeatherIcon name={s.icon} size={24} />
                        <Text className="text-xs font-semibold text-muted-foreground mt-1">
                          {s.hourLabel}
                        </Text>
                        <Text className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                          {s.cloudCover}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}

        {/* ============================================================== */}
        {/* 7. EVAPOTRANSPIRATION (ET₀) */}
        {/* ============================================================== */}
        {(() => {
          const hi = Math.max(niceCeil(maxEt * 1.2), 0.5);
          const lo = 0;
          const getY = (v: number) =>
            CHART_HEIGHT - BOT_PAD - (v / hi) * DRAW_HEIGHT;
          const getX = (i: number) => i * COL_WIDTH + COL_WIDTH / 2;

          const note = `Total reference evapotranspiration: ${totalEt.toFixed(
            2
          )} mm · Peak ${maxEt.toFixed(2)} mm (${slots[maxEtIdx].hourLabel})`;

          return (
            <View className="bg-card border border-border rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm">
              <View className="p-4 border-b border-border">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2.5">
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(16, 185, 129, 0.12)",
                      }}
                      className="w-8 h-8 rounded-lg items-center justify-center"
                    >
                      <Icon
                        icon={Plant01Icon}
                        size={18}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      Evapotranspiration (ET₀)
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-md bg-muted">
                    <Text className="text-xs font-semibold text-muted-foreground">
                      mm
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap items-center gap-2 mt-1">
                  <View className="px-2.5 py-1 rounded-lg bg-muted flex-row items-center gap-1.5">
                    <Text className="text-xs text-foreground font-semibold">
                      Total 24h: {totalEt.toFixed(2)} mm
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium">·</Text>
                    <Text className="text-xs text-foreground font-semibold">
                      Peak: {maxEt.toFixed(2)} mm
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(0, 0, 0, 0.03)",
                  }}
                  className="mt-2.5 px-3 py-2 rounded-xl"
                >
                  <Text className="text-xs font-medium text-foreground">
                    {note}
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 12 }}
              >
                <View style={{ width: CHART_WIDTH }}>
                  <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                    {renderNightBands()}
                    {renderGridLines(lo, hi, "mm", 1)}

                    {slots.map((s, i) => {
                      const h = (s.et0 / hi) * DRAW_HEIGHT;
                      const y = CHART_HEIGHT - BOT_PAD - h;
                      const x = getX(i) - 13;
                      return (
                        <Rect
                          key={`et-${i}`}
                          x={x}
                          y={y}
                          width={26}
                          height={Math.max(h, 0)}
                          rx={4}
                          fill="#15803d"
                          opacity={s.et0 > 0 ? 0.9 : 0.08}
                        />
                      );
                    })}

                    {maxEt > 0 && (
                      <SvgText
                        x={getX(maxEtIdx)}
                        y={getY(maxEt) - 6}
                        fontSize="11"
                        fontWeight="bold"
                        fill={isDark ? "#4ade80" : "#15803d"}
                        textAnchor="middle"
                      >
                        {maxEt.toFixed(2)}
                      </SvgText>
                    )}
                  </Svg>

                  <View className="flex-row pt-2 border-t border-border">
                    {slots.map((s, i) => (
                      <View
                        key={i}
                        style={{ width: COL_WIDTH }}
                        className="items-center px-1"
                      >
                        <WeatherIcon name={s.icon} size={24} />
                        <Text className="text-xs font-semibold text-muted-foreground mt-1">
                          {s.hourLabel}
                        </Text>
                        <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {s.et0.toFixed(2)}
                        </Text>
                        <Text className="text-[10px] text-muted-foreground font-medium">
                          mm
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}
