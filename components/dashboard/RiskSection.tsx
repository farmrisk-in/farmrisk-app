import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useColorScheme } from "nativewind";
import { useRiskScore } from "@/hooks/useRiskScore";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import {
  RainDropIcon,
  SunCloud01Icon,
  Bug01Icon,
  FlashIcon,
  CloudFastWindIcon,
  SnowIcon,
  SecurityWarningIcon,
  DangerIcon,
  Alert02Icon,
  Plant01Icon,
  TractorIcon,
} from "@hugeicons/core-free-icons";

const { width } = Dimensions.get("window");
// 2 columns with padding
const cardWidth = (width - 32 - 16) / 2;

function getRiskColor(band: string) {
  switch (band?.toLowerCase()) {
    case "extreme":
      return "#ef4444"; // red-500
    case "high":
      return "#f97316"; // orange-500
    case "moderate":
      return "#eab308"; // yellow-500
    case "low":
      return "#10b981"; // emerald-500
    case "minimal":
    default:
      return "#3b82f6"; // blue-500
  }
}

function getRiskIcon(band: string) {
  switch (band?.toLowerCase()) {
    case "extreme":
      return DangerIcon; // red-500
    case "high":
      return Alert02Icon; // orange-500
    case "moderate":
      return SecurityWarningIcon; // yellow-500
    case "low":
      return Plant01Icon; // emerald-500
    case "minimal":
    default:
      return TractorIcon; // blue-500
  }
}

function RiskGauge({
  hazard,
  icon,
  data,
  isDark,
  color,
}: {
  hazard: string;
  icon: any;
  data: any;
  isDark: boolean;
  color: string;
}) {
  if (!data) return null;

  const score = data.score ?? 0;
  const band = data.band ?? "Minimal";
  const riskcolor = getRiskColor(band);

  const r = 36;
  const cx = cardWidth / 2;
  const cy = 60; // adjust based on arc position
  const strokeWidth = 8;
  const arcLength = Math.PI * r;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;
  return (
    <View
      className="p-4 mb-4 rounded-[30px]"
      style={{ backgroundColor: color + 20 }}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center">
          <Icon icon={icon} size={16} />
        </View>
        <Text className="text-foreground font-semibold text-sm flex-1">
          {hazard}
        </Text>
      </View>

      <View className="items-center justify-center relative h-[50px]">
        <Svg
          width={cardWidth - 32}
          height={r + strokeWidth}
          viewBox={`0 0 ${cardWidth} ${r + strokeWidth}`}
        >
          <Defs>
            <LinearGradient id={`grad-${hazard}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={riskcolor} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={riskcolor} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Background Arc */}
          <Path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke={isDark ? "#27272a" : "#e4e4e7"} // border color essentially
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <Path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            stroke={`url(#grad-${hazard})`}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        <View className="absolute bottom-0 items-center">
          <Text className="text-foreground font-bold text-sm">{band}</Text>
        </View>
      </View>
    </View>
  );
}

export function RiskSection() {
  const { data, isLoading, isError } = useRiskScore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoading) {
    return (
      <View className="mt-6 mb-2">
        <Text
          style={{ fontFamily: "Fraunces_600SemiBold" }}
          className="text-xl text-foreground mb-4 font-fraunces-semibold"
        >
          Agriculture Risk
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              width={cardWidth}
              height={140}
              borderRadius={24}
              className="mb-4"
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
      name: "Heavy Rain",
      icon: RainDropIcon,
      scoreData: heavy_rain,
      color: "#00A6F4",
    },
    {
      id: "heat_stress",
      name: "Heat Stress",
      icon: SunCloud01Icon,
      scoreData: heat_stress,
      color: "darkgreen",
    },
    {
      id: "pest",
      name: "Pest / Disease",
      icon: Bug01Icon,
      scoreData: pest,
      color: "orange",
    },
    {
      id: "lightning",
      name: "Lightning",
      icon: FlashIcon,
      scoreData: lightning,
      color: "yellow",
    },
    {
      id: "wind",
      name: "High Wind",
      icon: CloudFastWindIcon,
      scoreData: wind,
      color: "pink",
    },
    {
      id: "frost",
      name: "Frost",
      icon: SnowIcon,
      scoreData: frost,
      color: "violet",
    },
  ];

  return (
    <View>
      <View className="flex flex-row gap-2 mt-6 mb-3 px-3 items-center">
        <Icon icon={SecurityWarningIcon} size={25} />
        <Text className="text-xl grow text-foreground font-fraunces-semibold">
          Agriculture Risk
        </Text>
        <View
          style={{ backgroundColor: overallColor + 20 }}
          className="flex flex-row rounded-xl gap-1 px-3 py-1.5 h-min"
        >
          <Icon icon={overallIcon} size={18} color={overallColor} />
          <Text
            style={{ color: overallColor }}
            className="font-semibold text-sm uppercase"
          >
            {overall.band.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* 2-Column Hazard Grid */}
      <View className="flex flex-row flex-wrap justify-around">
        {hazards.map((h) => (
          <RiskGauge
            key={h.id}
            hazard={h.name}
            icon={h.icon}
            data={h.scoreData}
            isDark={isDark}
            color={h.color}
          />
        ))}
      </View>
    </View>
  );
}
