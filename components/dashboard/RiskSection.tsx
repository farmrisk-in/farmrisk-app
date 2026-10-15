import React, { useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { VictoryPie } from "victory-native";
import { useColorScheme } from "nativewind";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useLocationContext } from "@/providers/LocationProvider";
import { Skeleton } from "@/components/ui/Skeleton";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import Svg from "react-native-svg";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Bug01Icon,
  FlashIcon,
  SnowIcon,
  SecurityWarningIcon,
  ChevronRightIcon,
  DangerIcon,
  Alert02Icon,
  Plant01Icon,
  TractorIcon,
  Cancel01Icon,
  ThermometerWarmIcon,
  RainIcon,
  Tornado02Icon,
} from "@hugeicons/core-free-icons";

const { width } = Dimensions.get("window");
// 3 columns with padding
const cardWidth = (width - 32 - 16) / 3;

// Risk band keys (dashboard ns) for translatable bands.
type RiskBandKey =
  | "riskLow"
  | "riskModerate"
  | "riskHigh"
  | "riskSevere"
  | "riskMinimal"
  | "riskExtreme"
  | "hazardBandNoRisk";

const getBandKey = (band: string): RiskBandKey | null => {
  switch (band?.toLowerCase()) {
    case "no risk":
      return "hazardBandNoRisk";
    case "minimal":
      return "riskMinimal";
    case "low":
      return "riskLow";
    case "moderate":
      return "riskModerate";
    case "high":
      return "riskHigh";
    case "severe":
      return "riskSevere";
    case "extreme":
      return "riskExtreme";
    default:
      return null;
  }
};

const formatBand = (t: TFunction<"dashboard">, band: string): string => {
  const key = getBandKey(band);
  return key ? t(key) : band;
};

function getRiskColor(band: string) {
  switch (band?.toLowerCase()) {
    case "extreme":
    case "severe":
      return "#FF040E";
    case "high":
      return "#FF4116";
    case "moderate":
      return "#FF9C04";
    case "low":
      return "#006045";
    case "no risk":
    case "minimal":
    default:
      return "#718096";
  }
}

function getRiskIcon(band: string) {
  switch (band?.toLowerCase()) {
    case "extreme":
    case "severe":
      return DangerIcon;
    case "high":
      return Alert02Icon;
    case "moderate":
      return SecurityWarningIcon;
    case "low":
      return Plant01Icon;
    case "no risk":
    case "minimal":
    default:
      return TractorIcon;
  }
}

function RiskGauge({
  hazard,
  icon,
  data,
  isDark,
  color,
  customBand,
  customColor,
  onPress,
}: {
  hazard: string;
  icon: any;
  data: any;
  isDark: boolean;
  color: string;
  customBand?: string;
  customColor?: string;
  onPress: () => void;
}) {
  const { t } = useTranslation(["dashboard"]);
  if (!data) return null;

  const score = Math.max(0, Math.min(100, data.score ?? 0));
  const band = data.band ?? "Minimal";
  const riskcolor = customColor ?? getRiskColor(band);

  const chartData = [
    { x: "score", y: score },
    { x: "remainder", y: 100 - score },
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ width: cardWidth }}
      className="bg-card border border-border p-2.5 rounded-2xl items-center justify-between"
    >
      {/* Top Hazard Title */}
      <Text
        className="text-xs text-foreground text-center mb-2 w-full"
        numberOfLines={1}
      >
        {hazard}
      </Text>

      {/* Center Semi-Circle Gauge with Centered Icon */}
      <View className="items-center justify-center relative w-full h-[52px] overflow-hidden">
        <Svg viewBox="0 0 100 65" className="w-full h-full">
          <VictoryPie
            data={chartData}
            standalone={false}
            animate={true}
            startAngle={-120}
            endAngle={120}
            innerRadius={32}
            radius={45}
            colorScale={[riskcolor, isDark ? "#27272a" : "#e4e4e7"]}
            labels={() => null}
            width={100}
            height={90}
            cornerRadius={10}
          />
        </Svg>
        {/* Icon placed in the center cavity of the gauge */}
        <View className="absolute inset-0 items-center justify-end pb-2 pointer-events-none">
          <Icon icon={icon} size={20} color={riskcolor} />
        </View>
      </View>

      {/* Bottom Risk Band Pill */}
      <Text
        className="font-bold pt-2 text-[10px] uppercase text-center"
        style={{ color: riskcolor }}
        numberOfLines={1}
      >
        {customBand ?? formatBand(t, band)}
      </Text>
    </TouchableOpacity>
  );
}

export function RiskSection() {
  const { t } = useTranslation(["dashboard"]);
  const { t: tW } = useTranslation(["weather"]);
  const { location, isResolving } = useLocationContext();
  const { data, isLoading, isError } = useRiskScore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  type SelectedRiskData = {
    hazard: string;
    majorFactor: string;
    reasons: string[];
    band: string;
    displayBand?: string;
    color: string;
    riskcolor: string;
    icon: any;
  };
  const [selectedRisk, setSelectedRisk] = useState<SelectedRiskData | null>(
    null,
  );

  const handlePress = (h: any, customBand?: string, customColor?: string) => {
    const band = h.scoreData?.band ?? "Minimal";
    setSelectedRisk({
      hazard: h.name,
      icon: h.icon,
      majorFactor: h.scoreData?.major_factor ?? "",
      reasons: h.scoreData?.reasons ?? [],
      band,
      displayBand: customBand ?? formatBand(t, band),
      color: h.color,
      riskcolor: customColor ?? getRiskColor(band),
    });
  };

  if (!location && !isResolving) {
    return (
      <View className="my-4">
        <View className="flex flex-row gap-2 mt-2 mb-3 px-3 items-center">
          <Icon
            icon={SecurityWarningIcon}
            size={25}
            strokeWidth={2}
            className="text-foreground"
          />
          <Text className="text-lg text-foreground font-semibold">
            {t("agricultureRisk")}
          </Text>
        </View>
        <NoLocationCard message="Select a location to view field risk scores and climate hazard alerts." />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View>
        <View className="flex flex-row gap-2 mt-6 mb-3 px-3 items-center">
          <Icon
            icon={SecurityWarningIcon}
            size={25}
            strokeWidth={2}
            className="text-foreground"
          />
          <Text
            className="flex-1 shrink text-lg text-foreground font-semibold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("agricultureRisk")}
          </Text>
        </View>
        <Skeleton className="mb-4" />
        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              width={cardWidth}
              height={108}
              borderRadius={16}
            />
          ))}
        </View>
      </View>
    );
  }

  if (isError || !data || !data.success) {
    return null;
  }

  const { overall, heavy_rain, heat_stress, pest, lightning, wind, frost } =
    data;
  const overallColor = getRiskColor(overall.band);
  const overallIcon = getRiskIcon(overall.band);
  const hazards = [
    {
      id: "heavy_rain",
      name: t("heavyRain"),
      icon: RainIcon,
      scoreData: heavy_rain,
      color: "#00A6F4",
    },
    {
      id: "heat_stress",
      name: t("heatStress"),
      icon: ThermometerWarmIcon,
      scoreData: heat_stress,
      color: "#009966",
    },
    {
      id: "pest",
      name: t("pestDisease"),
      icon: Bug01Icon,
      scoreData: pest,
      color: "#F54A00",
    },
    {
      id: "lightning",
      name: tW("lightning"),
      icon: FlashIcon,
      scoreData: lightning,
      color: "#D08700",
    },
    {
      id: "wind",
      name: t("highWind"),
      icon: Tornado02Icon,
      scoreData: wind,
      color: "#625FFF",
    },
    {
      id: "frost",
      name: t("frost"),
      icon: SnowIcon,
      scoreData: frost,
      color: "#C800DE",
    },
  ];

  return (
    <View>
      <SectionHeader
        icon={SecurityWarningIcon}
        title={t("agricultureRisk")}
        containerClassName="flex flex-row gap-2 mt-6 mb-3 items-center"
        rightContent={
          <View className="flex flex-row rounded-xl gap-1.5 px-3 py-1.5 h-min items-center bg-card border border-border">
            <Icon icon={overallIcon} size={16} color={overallColor} />
            <Text
              style={{ color: overallColor }}
              className="font-bold text-xs uppercase"
            >
              {formatBand(t, overall.band).toUpperCase()}
            </Text>
          </View>
        }
      />

      {/* 3-Column (3x2) Hazard Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-3">
        {hazards.map((hazard) => {
          let customBand: string | undefined;
          let customColor: string | undefined;

          if (hazard.id === "lightning") {
            const rawCat = hazard.scoreData?.band;
            if (rawCat === "Severe") {
              customBand = t("riskSevere");
              customColor = "#FF040E";
            } else if (rawCat === "High") {
              customBand = t("riskHigh");
              customColor = "#FF4116";
            } else if (rawCat === "Moderate") {
              customBand = t("riskModerate");
              customColor = "#FF9C04";
            } else if (rawCat === "Low") {
              customBand = t("riskLow");
              customColor = "#006045";
            } else {
              customBand = t("hazardBandNoRisk");
              customColor = "#718096";
            }
          }

          return (
            <RiskGauge
              key={hazard.id}
              hazard={hazard.name}
              icon={hazard.icon}
              data={hazard.scoreData}
              isDark={isDark}
              color={hazard.color}
              customBand={customBand}
              customColor={customColor}
              onPress={() => handlePress(hazard, customBand, customColor)}
            />
          );
        })}
      </View>

      {/* Details Modal */}
      <Modal
        visible={!!selectedRisk}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRisk(null)}
      >
        <TouchableOpacity
          className="flex-1 justify-center px-5"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          activeOpacity={1}
          onPressOut={() => setSelectedRisk(null)}
        >
          <TouchableWithoutFeedback>
            <View className="bg-card w-full max-h-[80%] rounded-[35px] p-5 pb-1 shadow-lg">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: (selectedRisk?.color || "#000") + "20",
                    }}
                  >
                    <Icon
                      icon={selectedRisk?.icon}
                      size={28}
                      color={selectedRisk?.color}
                    />
                  </View>
                  <Text className="text-xl font-bold text-foreground">
                    {selectedRisk?.hazard}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedRisk(null)}
                  className="p-2 bg-muted rounded-full"
                >
                  <Icon
                    icon={Cancel01Icon}
                    size={20}
                    className="text-foreground"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-2">
                <View className="mb-5 flex-row items-center justify-between p-5 rounded-3xl border border-border gap-1">
                  <Text className="grow text-muted-foreground font-semibold text-base">
                    {tW("riskLevel")}
                  </Text>
                  {selectedRisk?.band && (
                    <Icon
                      icon={getRiskIcon(selectedRisk?.band)}
                      size={20}
                      strokeWidth={1.5}
                      color={selectedRisk?.riskcolor}
                    />
                  )}
                  <Text
                    className="font-bold text-md uppercase"
                    style={{ color: selectedRisk?.riskcolor }}
                  >
                    {selectedRisk?.displayBand ??
                      (selectedRisk?.band && formatBand(t, selectedRisk.band))}
                  </Text>
                </View>

                {selectedRisk?.majorFactor ? (
                  <View className="mb-5 px-3">
                    <Text className="text-base font-bold text-foreground mb-2">
                      {t("majorFactor")}
                    </Text>
                    <Text className="text-[15px] text-muted-foreground leading-6">
                      {selectedRisk.majorFactor}
                    </Text>
                  </View>
                ) : null}

                {selectedRisk?.reasons && selectedRisk.reasons.length > 0 ? (
                  <View className="mb-2 px-3">
                    <Text className="text-base font-bold text-foreground mb-3">
                      {t("analysis")}
                    </Text>
                    {selectedRisk.reasons.map((r, i) => (
                      <View key={i} className="flex-row gap-3 mb-3 pr-2">
                        <View
                          className="w-2 h-2 rounded-full mt-2"
                          style={{ backgroundColor: selectedRisk.color }}
                        />
                        <Text className="text-[15px] text-muted-foreground leading-6 flex-1">
                          {r}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
