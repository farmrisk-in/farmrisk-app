import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useForecast } from "@/hooks/useForecast";
import { useWeather } from "@/hooks/useWeather";
import { useAI } from "@/hooks/useAI";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import {
  CloudOffIcon,
  CheckmarkBadge01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";

const RAINY_DAY_THRESHOLD_MM = 2.5;

const formatDateText = (dateStr: string, locale: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" });
};

type SoilWordKey =
  | "smExceptionalWet"
  | "smExtremeWet"
  | "smSevereWet"
  | "smModerateWet"
  | "smAbnormallyWet"
  | "smNormal"
  | "smAbnormallyDry"
  | "smModerateDry"
  | "smExtremeDry"
  | "smSevereDry"
  | "smExceptionalDry";

const soilWord = (pct: number): SoilWordKey => {
  if (pct > 98) return "smExceptionalWet";
  if (pct > 95) return "smExtremeWet";
  if (pct > 90) return "smSevereWet";
  if (pct > 80) return "smModerateWet";
  if (pct > 70) return "smAbnormallyWet";
  if (pct > 30) return "smNormal";
  if (pct > 20) return "smAbnormallyDry";
  if (pct > 10) return "smModerateDry";
  if (pct > 5) return "smExtremeDry";
  if (pct > 2) return "smSevereDry";
  return "smExceptionalDry";
};

type OutlookKey = "outlookFavorable" | "outlookCautionary" | "outlookUnfavorable";

const extractOutlook = (text?: string): OutlookKey | "" => {
  if (!text) return "";
  const outlookMatch = text.match(
    /agricultural\s+outlook\s+for this period is\s+\*?(favorable|cautionary|unfavorable)\*?/i,
  );
  if (!outlookMatch) return "";
  const outlook = outlookMatch[1];
  return `outlook${outlook.charAt(0).toUpperCase()}${outlook.slice(1)}` as OutlookKey;
};

export function ModelSummarySection() {
  const { t: tDash, i18n } = useTranslation(["dashboard"]);
  const locale = i18n.language || "en";

  const { data: report, isLoading: isForecastLoading } = useForecast();
  const predictions = report?.forecast || [];

  const { data: weatherData } = useWeather();
  const daily = weatherData?.daily;

  const fallbackPredictions = daily
    ? daily.time.map((time: string, idx: number) => ({
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

  const finalPredictions = predictions.length > 0 ? predictions : fallbackPredictions;
  const isFallbackUsed = predictions.length === 0 && fallbackPredictions.length > 0;

  // Assuming cropId logic isn't needed right away, we pass "general" for now. 
  // In a real app we'd get this from a context.
  const cropId = "general";
  const { data: advisory, isLoading: isAdvisoryLoading, isError: isAdvisoryError } = useAI(cropId, "en");
  const outlook = extractOutlook(advisory);
  const outlookLabel = outlook ? tDash(outlook) : "";
  const advisoryPending = isAdvisoryLoading && !advisory && !isAdvisoryError;

  const daysBefore = undefined;
  const { data: soilResponse, isLoading: isSoilLoading } = useSoilMoisture(cropId, daysBefore);

  const soilTrend = useMemo(() => {
    const soilRows = soilResponse?.soil_moisture ?? [];
    const forecastDays = soilRows
      .filter((row: any) => row.is_forecast === 1)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    if (forecastDays.length === 0) return "";
    const startPct = forecastDays[0].sm_percentile;
    const endPct = forecastDays[forecastDays.length - 1].sm_percentile;
    if (startPct == null || endPct == null) return "";
    const startWord = tDash(soilWord(startPct) as any) as string;
    const endWord = tDash(soilWord(endPct) as any) as string;
    return startWord === endWord ? startWord : `${startWord} → ${endWord}`;
  }, [soilResponse, tDash]);

  const soilPending = isSoilLoading && !soilTrend;

  const metrics = useMemo(() => {
    if (finalPredictions.length === 0) return null;
    const totalRainfall = finalPredictions.reduce(
      (sum: number, day: any) => sum + (day.pcp_corrected ?? 0),
      0,
    );
    const rainyDays = finalPredictions.filter(
      (day: any) => (day.pcp_corrected ?? 0) >= RAINY_DAY_THRESHOLD_MM,
    ).length;

    let peak = finalPredictions[0];
    for (const day of finalPredictions) {
      if ((day.pcp_corrected ?? 0) > (peak.pcp_corrected ?? 0)) peak = day;
    }

    const maxTemp = Math.max(...finalPredictions.map((day: any) => day.tmax_corrected));
    const minTemp = Math.min(...finalPredictions.map((day: any) => day.tmin_corrected));

    return {
      totalRainfall,
      rainyDays,
      peakRain: peak.pcp_corrected ?? 0,
      peakDate: peak.date,
      maxTemp,
      minTemp,
    };
  }, [finalPredictions]);

  if (finalPredictions.length === 0 && !isForecastLoading) {
    return (
      <View className="my-6 px-3">
        <SectionHeader icon={Analytics01Icon} title={tDash("forecast16Day") as string} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 py-8 items-center justify-center shadow-sm">
          <Icon icon={CloudOffIcon} size={40} className="text-muted-foreground/60 mb-3" />
          <Text className="font-semibold text-[15px] text-foreground text-center">
            {tDash("modelSummaryLoadError")}
          </Text>
        </View>
      </View>
    );
  }

  if (isForecastLoading || !metrics) {
    return (
      <View className="my-6 px-3">
        <SectionHeader icon={Analytics01Icon} title={tDash("forecast16Day") as string} />
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-5 shadow-sm">
          {[...Array(4)].map((_, i) => (
            <View key={i} className="flex-row py-3 border-b border-border/50 last:border-b-0">
              <Skeleton width="100%" height={14} borderRadius={4} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const rows: [string, string, string, string][] = [
    [
      tDash("totalRainfall") as string,
      `${metrics.totalRainfall.toFixed(1)} mm`,
      tDash("rainyDays") as string,
      `${metrics.rainyDays} ${tDash("daysUnit")}`,
    ],
    [
      tDash("peakDayRain") as string,
      `${metrics.peakRain.toFixed(1)} mm`,
      tDash("peakDate") as string,
      formatDateText(metrics.peakDate, locale),
    ],
    [
      tDash("maxTemp") as string,
      `${Math.round(metrics.maxTemp)}°`,
      tDash("minTemp") as string,
      `${Math.round(metrics.minTemp)}°`,
    ],
    [
      tDash("soilTrend") as string,
      soilTrend || "—",
      tDash("outlook") as string,
      outlookLabel || "—",
    ],
  ];

  return (
    <View className="my-6 px-3">
      <SectionHeader
        icon={Analytics01Icon}
        title={tDash("forecast16Day") as string}
        rightContent={
          <View className="flex-row items-center gap-2">
            <View className="px-2 py-1 rounded-lg bg-muted flex-row items-center">
              <Text className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {tDash("modelSummary")}
              </Text>
            </View>
            {!isFallbackUsed && (
              <View className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex-row items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                <Icon icon={CheckmarkBadge01Icon} size={10} className="text-emerald-700 dark:text-emerald-300" />
                <Text className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                  {tDash("biasCorrected")}
                </Text>
              </View>
            )}
          </View>
        }
      />
      <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl px-5 py-2 shadow-sm">
        <View className="flex-row py-2.5 border-b border-border/50">
          <Text className="flex-1 text-muted-foreground text-[10.5px] font-bold uppercase tracking-wide">
            {tDash("metric")}
          </Text>
          <Text className="flex-[0.8] text-muted-foreground text-[10.5px] font-bold uppercase tracking-wide text-right">
            {tDash("value")}
          </Text>
          <View className="w-4" />
          <Text className="flex-1 text-muted-foreground text-[10.5px] font-bold uppercase tracking-wide pl-2">
            {tDash("metric")}
          </Text>
          <Text className="flex-[0.8] text-muted-foreground text-[10.5px] font-bold uppercase tracking-wide text-right">
            {tDash("value")}
          </Text>
        </View>

        {rows.map(([k1, v1, k2, v2], ri) => {
          const isLast = ri === rows.length - 1;
          return (
            <View
              key={ri}
              className={`flex-row py-3.5 items-center ${
                !isLast ? "border-b border-border/40" : ""
              }`}
            >
              <Text className="flex-1 text-muted-foreground text-[11.5px]" numberOfLines={1}>
                {k1}
              </Text>
              <View className="flex-[0.8] items-end">
                {ri === 3 && soilPending ? (
                  <Skeleton width={40} height={12} borderRadius={4} />
                ) : (
                  <Text className="text-[13px] font-bold tabular-nums text-foreground" numberOfLines={1}>
                    {v1}
                  </Text>
                )}
              </View>

              <View className="w-4" />

              <Text className="flex-1 text-muted-foreground text-[11.5px] pl-2" numberOfLines={1}>
                {k2}
              </Text>
              <View className="flex-[0.8] items-end">
                {ri === 3 && advisoryPending ? (
                  <Skeleton width={40} height={12} borderRadius={4} />
                ) : (
                  <Text className="text-[13px] font-bold tabular-nums text-foreground" numberOfLines={1}>
                    {v2}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
