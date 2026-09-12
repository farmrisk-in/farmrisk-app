import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import {
  generateAdvisoryHtml,
  AdvisoryReportData,
} from "@farmrisk/advisory-template";
import { useLocationContext } from "@/providers/LocationProvider";
import { useCropContext } from "@/providers/CropProvider";
import { useForecast } from "@/hooks/useForecast";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { useAI } from "@/hooks/useAI";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useCalendar } from "@/hooks/useCalendar";
import { useWhatToDo } from "@/hooks/useWhatToDo";
import { useTranslation } from "react-i18next";
import { getCleanCropName } from "@/constants/categorizedCrops";
import type { SavedField } from "@/types/fields";

interface Props {
  selectedFarm?: SavedField | null;
  onLoadEnd?: () => void;
}

export default function ExportTemplate({ selectedFarm, onLoadEnd }: Props) {
  const { i18n } = useTranslation();
  const { location } = useLocationContext();
  const { selectedCrop } = useCropContext();
  const activeCrop = selectedCrop || "general";

  const { forecastRows } = useForecast();
  const { data: soilData } = useSoilMoisture();
  const { data: aiText } = useAI(activeCrop, i18n.language);
  const { data: riskData } = useRiskScore();
  const { data: calendarData } = useCalendar(activeCrop);
  const { recommendations } = useWhatToDo(activeCrop, i18n.language);

  const reportData = useMemo<AdvisoryReportData>(() => {
    const now = new Date();
    const issuedDate = now.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const cropName = getCleanCropName(selectedCrop).toUpperCase();
    const activeSeason =
      calendarData?.calendar?.[0]?.season?.toUpperCase() || "KHARIF";

    // 1. What to do today items
    const whatToDoItems =
      recommendations && recommendations.length > 0
        ? recommendations.map((rec) => ({
            icon:
              rec.category === "pest"
                ? "scout"
                : rec.category === "irrigation"
                  ? "irrigation"
                  : "drainage",
            title: rec.title,
            description: rec.hint || rec.title,
          }))
        : [
            {
              icon: "scout",
              title: "Field Scouting",
              description: "Inspect crops regularly for early pest and disease detection.",
            },
            {
              icon: "irrigation",
              title: "Irrigation Check",
              description: "Assess topsoil moisture before scheduling deep irrigation.",
            },
          ];

    // 2. Weather risks
    const weatherRisks = [
      {
        type: "heat" as const,
        title: "Heat Stress",
        level: (riskData?.heat_stress?.band?.toUpperCase() || "LOW") as any,
        description: `Risk score: ${Math.round(riskData?.heat_stress?.score ?? 0)} · ${riskData?.heat_stress?.band || "Low"}`,
      },
      {
        type: "wind" as const,
        title: "Wind",
        level: (riskData?.wind?.band?.toUpperCase() || "LOW") as any,
        description: `Risk score: ${Math.round(riskData?.wind?.score ?? 0)} · ${riskData?.wind?.band || "Low"}`,
      },
      {
        type: "lightning" as const,
        title: "Lightning",
        level: (riskData?.lightning?.band?.toUpperCase() || "LOW") as any,
        description: `Risk score: ${Math.round(riskData?.lightning?.score ?? 0)} · ${riskData?.lightning?.band || "Low"}`,
      },
      {
        type: "rain" as const,
        title: "Heavy Rain",
        level: (riskData?.heavy_rain?.band?.toUpperCase() || "LOW") as any,
        description: `Risk score: ${Math.round(riskData?.heavy_rain?.score ?? 0)} · ${riskData?.heavy_rain?.band || "Low"}`,
      },
      {
        type: "frost" as const,
        title: "Frost",
        level: (riskData?.frost?.band?.toUpperCase() || "NONE") as any,
        description: `Risk score: ${Math.round(riskData?.frost?.score ?? 0)} · ${riskData?.frost?.band || "None"}`,
      },
    ];

    // 3. 16-Day Forecast
    const forecast16Day = (forecastRows || []).slice(0, 16).map((day: any) => {
      const d = new Date(day.date);
      return {
        dateStr: `${d.getDate()} ${d
          .toLocaleDateString("en-US", { month: "short" })
          .toUpperCase()}`,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        tmax: Math.round(day.tmax_corrected ?? 0),
        tmin: Math.round(day.tmin_corrected ?? 0),
        pcp: Number(day.pcp_corrected ?? 0),
      };
    });

    const totalRain = forecast16Day.reduce(
      (acc: number, curr: { pcp: number }) => acc + curr.pcp,
      0,
    );
    const rainyDays = forecast16Day.filter(
      (d: { pcp: number }) => d.pcp >= 1,
    ).length;

    // 4. Soil moisture transition
    const soilSummary = Array.isArray(soilData)
      ? soilData
      : soilData?.soil_moisture || [];
    const latestSoil = soilSummary[soilSummary.length - 1]?.sm_percentile ?? 50;
    const soilState =
      latestSoil > 70
        ? "Abnormally Wet"
        : latestSoil > 30
          ? "Moderate Wet"
          : "Dry";

    return {
      header: {
        farmName: selectedFarm?.name || "Main Field",
        locationStr: location?.displayName || location?.name || "Local Region",
        coordinates: location?.lat
          ? `${location.lat.toFixed(2)}°N, ${location.lng.toFixed(2)}°E`
          : "—",
        issuedDate,
        outlookPeriod: `16-day outlook · ${activeSeason} season`,
        crop: cropName,
      },
      whatToDoToday: whatToDoItems,
      aiOverview:
        aiText ||
        "Over the next 16 days, local climate conditions remain favorable. Monitor hydrometry trends and maintain recommended crop protection routines.",
      cropCalendar: {
        season: activeSeason,
        cropName,
        currentStage: "Active Crop Growth Cycle",
        activeStageType: "growing",
      },
      weatherRisks,
      farmRisk: {
        overallLevel: (riskData?.overall?.band?.toUpperCase() || "LOW") as any,
        contextText: `Overall climate and biological risk index is rated ${riskData?.overall?.band || "Low"} (${Math.round(riskData?.overall?.score ?? 0)}/100). Current pest risk is ${riskData?.pest?.band || "Low"}.`,
        actions: [
          {
            icon: "scout",
            title: "Pest & Disease Scouting",
            description: `Pest risk is currently ${riskData?.pest?.band || "Low"}. Regular scouting recommended.`,
          },
          {
            icon: "irrigation",
            title: "Hydrometry Check",
            description: "Assess soil moisture saturation prior to scheduling irrigation runs.",
          },
          {
            icon: "remove",
            title: "Crop Health Routine",
            description: "Remove weed hosts and debris to suppress disease vectors.",
          },
        ],
        irrigationNote:
          latestSoil > 60
            ? "Soil moisture is sufficient — hold irrigation for 5–7 days."
            : "Irrigate lightly in the evening to maintain optimum root zone moisture.",
        soilTransition: {
          fromState: soilState,
          toState: totalRain > 10 ? "Abnormally Wet" : soilState,
          trendSummary: `Hydrometry trend shows ${totalRain.toFixed(1)} mm rainfall expected across ${rainyDays} rain events.`,
        },
      },
      forecast16Day,
      forecastSummaryFooter: `Blue-tinted days = rain expected. Total forecast precipitation: ${totalRain.toFixed(1)} mm over 16 days.`,
    };
  }, [
    selectedFarm,
    location,
    selectedCrop,
    forecastRows,
    soilData,
    aiText,
    riskData,
    calendarData,
    recommendations,
  ]);

  const htmlContent = useMemo(() => {
    return generateAdvisoryHtml(reportData);
  }, [reportData]);

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        onLoadEnd={onLoadEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 794,
    height: 1123,
    backgroundColor: "#ffffff",
  },
  webView: {
    width: 794,
    height: 1123,
    backgroundColor: "#ffffff",
  },
});
