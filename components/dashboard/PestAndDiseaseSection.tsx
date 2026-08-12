import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useForecast } from "@/hooks/useForecast";
import { useWeather } from "@/hooks/useWeather";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import {
  Bug01Icon,
  ThermometerWarmIcon,
  RainDropIcon,
  PercentIcon,
  Plant01Icon,
  CloudRainIcon
} from "@hugeicons/core-free-icons";

// Basic fallback mapping for icons, in case PercentIcon/CloudRainIcon don't exist
// We will test and adjust if tsc fails.

function getRiskColor(band: string) {
  switch (band?.toLowerCase()) {
    case "extreme":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "moderate":
      return "#eab308";
    case "low":
      return "#10b981";
    case "minimal":
    default:
      return "gray";
  }
}

export function PestAndDiseaseSection() {
  const { t: tDash } = useTranslation(["dashboard"]);
  const { data: riskData, isLoading: isRiskLoading } = useRiskScore();
  const { forecastRows, isLoading: isForecastLoading } = useForecast();
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const { data: soilData, isLoading: isSoilLoading } = useSoilMoisture("general");

  const hazard = riskData?.pest;
  const title = tDash("hazardPest");

  // ---- same inputs the pest score is built from ----
  const soilRows = soilData?.soil_moisture ?? [];
  const latestHistoricalRow = [...soilRows]
    .filter((r) => (r as any).is_forecast === 0)
    .at(-1);
  const soilPercentile = (latestHistoricalRow as any)?.sm_percentile ?? null;

  const next5Rows = forecastRows.slice(0, 5);

  const rainNext5 =
    next5Rows.length > 0
      ? next5Rows.map((r: any) => r.pcp_corrected ?? r.pcp ?? 0)
      : (weatherData?.daily?.precipitation_sum?.slice(0, 5) ?? null);

  const avgMaxTemp =
    next5Rows.length > 0
      ? next5Rows.reduce(
          (sum: number, r: any) => sum + (r.tmax_corrected ?? r.tmax ?? 0),
          0,
        ) / next5Rows.length
      : weatherData?.daily?.temperature_2m_max &&
        weatherData.daily.temperature_2m_max.length > 0
      ? weatherData.daily.temperature_2m_max.reduce((a: number, b: number) => a + b, 0) /
        weatherData.daily.temperature_2m_max.length
      : null;

  const humidity = weatherData?.current?.relative_humidity_2m ?? null;

  const rainTotal = rainNext5
    ? rainNext5.reduce((a: number, b: number) => a + (b ?? 0), 0)
    : null;
  const rainyDays = rainNext5
    ? rainNext5.filter((v: number) => v != null && v >= 1).length
    : null;

  if (
    isRiskLoading ||
    isWeatherLoading ||
    isForecastLoading ||
    isSoilLoading ||
    !hazard
  ) {
    return (
      <View className="my-6 px-3">
        <SectionHeader icon={Bug01Icon} title={title} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-2xl p-5 gap-3">
          <Skeleton width={150} height={12} borderRadius={4} />
          <Skeleton width={180} height={12} borderRadius={4} />
          <Skeleton width={160} height={12} borderRadius={4} />
        </View>
      </View>
    );
  }

  const color = getRiskColor(hazard.band);

  const factors: string[] = [];
  if (avgMaxTemp != null && avgMaxTemp >= 25 && avgMaxTemp <= 35) {
    factors.push(tDash("pestFactorWarm"));
  }
  if (humidity != null && humidity >= 70) {
    factors.push(tDash("pestFactorHumidity"));
  }
  if (rainyDays != null && rainyDays >= 1) {
    factors.push(tDash("pestFactorRainyDays", { n: rainyDays }));
  } else if (rainTotal != null && rainTotal >= 5) {
    factors.push(tDash("pestFactorFreshRain"));
  }
  if (soilPercentile != null && soilPercentile >= 70) {
    factors.push(tDash("pestFactorWetSoil"));
  }

  const factorsLabel = factors.join(", ");

  const interpKey =
    hazard.score >= 60
      ? factors.length > 0
        ? "pestInterpHigh"
        : "pestInterpHighNoFact"
      : hazard.score >= 40
        ? factors.length > 0
          ? "pestInterpModerate"
          : "pestInterpModerateNoFact"
        : factors.length > 0
          ? "pestInterpLow"
          : "pestInterpLowNoFact";

  const interpretation = tDash(interpKey, { factors: factorsLabel });

  const Pill = ({
    icon,
    label,
    value,
    sub,
    colorTheme,
  }: {
    icon: any;
    label: string;
    value: string;
    sub?: string;
    colorTheme: { bg: string; text: string; icon: string };
  }) => (
    <View className={`w-[48%] flex flex-col gap-1.5 rounded-2xl p-3.5 mb-2 ${colorTheme.bg}`}>
      <View className="flex-row items-center gap-1.5">
        <Icon icon={icon} size={16} className={`shrink-0 ${colorTheme.icon}`} />
        <Text className={`uppercase tracking-wide text-[10px] font-bold flex-1 ${colorTheme.icon}`} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text className={`text-lg font-extrabold leading-none mt-1 ${colorTheme.text}`}>
        {value}
      </Text>
      {sub && (
        <Text className={`text-[10px] font-medium leading-none opacity-80 ${colorTheme.text}`}>
          {sub}
        </Text>
      )}
    </View>
  );

  const wetDaysLabel =
    rainyDays != null && rainyDays === 1
      ? tDash("pestWetDay")
      : tDash("pestWetDays");

  return (
    <View className="my-6 px-3">
      <SectionHeader
        icon={Bug01Icon}
        title={title}
        rightContent={
          <View
            style={{ backgroundColor: color + "20" }}
            className="px-2.5 py-1 rounded-lg items-center justify-center self-center"
          >
            <Text style={{ color }} className="text-[10px] font-extrabold uppercase tracking-widest leading-none">
              {tDash(`risk${hazard.band}` as any, hazard.band)}
            </Text>
          </View>
        }
      />
      <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 shadow-sm space-y-5">
        {/* Major factor description */}
        {hazard.major_factor && (
          <View className="border-l-4 pl-3 py-1" style={{ borderLeftColor: color }}>
            <Text className="text-[13px] text-muted-foreground leading-relaxed italic font-medium">
              {hazard.major_factor}
            </Text>
          </View>
        )}

        {/* Bullet list of reasons */}
        {hazard.reasons && hazard.reasons.length > 0 && (
          <View className="space-y-2.5 mb-2">
            {hazard.reasons.map((r: string, i: number) => (
              <View key={i} className="flex-row items-start gap-2.5">
                <View
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <Text className="text-[13px] font-medium text-foreground/90 leading-snug flex-1">
                  {r}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CURRENT CONDITIONS */}
        <View>
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-3">
            {tDash("pestCurrentConditions")}
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <Pill
              icon={ThermometerWarmIcon}
              label={tDash("pestAvgMaxTemp")}
              value={avgMaxTemp != null ? `${avgMaxTemp.toFixed(1)}°C` : "–"}
              sub={tDash("pestNext5Days")}
              colorTheme={{
                bg: "bg-orange-500/10 dark:bg-orange-500/15",
                text: "text-orange-700 dark:text-orange-300",
                icon: "text-orange-600 dark:text-orange-400"
              }}
            />
            <Pill
              icon={RainDropIcon} // using RainDrop for humidity fallback
              label={tDash("pestHumidity")}
              value={humidity != null ? `${Math.round(humidity)}%` : "–"}
              sub={tDash("pestCurrent")}
              colorTheme={{
                bg: "bg-purple-500/10 dark:bg-purple-500/15",
                text: "text-purple-700 dark:text-purple-300",
                icon: "text-purple-600 dark:text-purple-400"
              }}
            />
            <Pill
              icon={RainDropIcon}
              label={tDash("pestRain")}
              value={rainTotal != null ? `${rainTotal.toFixed(1)} mm` : "–"}
              sub={rainyDays != null ? `${rainyDays} ${wetDaysLabel}` : undefined}
              colorTheme={{
                bg: "bg-sky-500/10 dark:bg-sky-500/15",
                text: "text-sky-700 dark:text-sky-300",
                icon: "text-sky-600 dark:text-sky-400"
              }}
            />
            <Pill
              icon={Plant01Icon}
              label={tDash("pestSoilMoisture")}
              value={soilPercentile != null ? `${Math.round(soilPercentile)}%` : "–"}
              sub={tDash("pestPercentile")}
              colorTheme={{
                bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
                text: "text-emerald-700 dark:text-emerald-300",
                icon: "text-emerald-600 dark:text-emerald-400"
              }}
            />
          </View>
        </View>

        {/* Interpretation */}
        <View className="pt-2">
          <Text className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground mb-3">
            {tDash("pestInterpretation")}
          </Text>
          <View className="bg-muted/40 p-4 rounded-2xl border border-border/50">
            <Text className="text-[13.5px] font-medium text-foreground/90 leading-relaxed">
              {interpretation}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
