import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
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
  Alert01Icon,
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

function RiskGauge({ hazard, icon, data, isDark }: { hazard: string; icon: any; data: any; isDark: boolean }) {
  if (!data) return null;

  const score = data.score ?? 0;
  const band = data.band ?? "Minimal";
  const color = getRiskColor(band);

  const r = 36;
  const cx = cardWidth / 2;
  const cy = 60; // adjust based on arc position
  const strokeWidth = 8;
  const arcLength = Math.PI * r;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <View className="bg-card border border-border rounded-3xl p-4 mb-4" style={{ width: cardWidth }}>
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: color + "20" }}>
          <Icon icon={icon} size={16} color={color} />
        </View>
        <Text className="text-foreground font-semibold text-sm flex-1">{hazard}</Text>
      </View>

      <View className="items-center justify-center relative h-[50px]">
        <Svg width={cardWidth - 32} height={r + strokeWidth} viewBox={`0 0 ${cardWidth} ${r + strokeWidth}`}>
          <Defs>
            <LinearGradient id={`grad-${hazard}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={color} stopOpacity="1" />
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
        <Text className="text-xl font-bold text-foreground mb-4 font-[Fraunces_600SemiBold]">
          Risk Analysis
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={cardWidth} height={140} borderRadius={24} className="mb-4" />
          ))}
        </View>
      </View>
    );
  }

  if (isError || !data || !data.success) {
    return null;
  }

  const { overall, heavy_rain, heat_stress, pest, lightning, wind, frost } = data;
  const overallColor = getRiskColor(overall.band);

  const hazards = [
    { id: "heavy_rain", name: "Heavy Rain", icon: RainDropIcon, scoreData: heavy_rain },
    { id: "heat_stress", name: "Heat Stress", icon: SunCloud01Icon, scoreData: heat_stress },
    { id: "pest", name: "Pest / Disease", icon: Bug01Icon, scoreData: pest },
    { id: "lightning", name: "Lightning", icon: FlashIcon, scoreData: lightning },
    { id: "wind", name: "High Wind", icon: CloudFastWindIcon, scoreData: wind },
    { id: "frost", name: "Frost", icon: SnowIcon, scoreData: frost },
  ];

  return (
    <View className="mt-6 mb-2">
      <Text className="text-xl font-bold text-foreground mb-4 font-[Fraunces_600SemiBold]">
        Risk Analysis
      </Text>

      {/* Overall Risk Card */}
      <View className="bg-card border border-border rounded-3xl p-5 mb-4 relative overflow-hidden">
        <View className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: overallColor, transform: [{ translateX: 16 }, { translateY: -16 }] }} />
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: overallColor + "20" }}>
            <Icon icon={Alert01Icon} size={20} color={overallColor} />
          </View>
          <View>
            <Text className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Overall Risk</Text>
            <Text className="text-foreground text-lg font-bold" style={{ color: overallColor }}>{overall.band}</Text>
          </View>
        </View>
        <Text className="text-foreground text-sm leading-relaxed opacity-90">{overall.summary}</Text>
      </View>

      {/* 2-Column Hazard Grid */}
      <View className="flex-row flex-wrap justify-between">
        {hazards.map((h) => (
          <RiskGauge key={h.id} hazard={h.name} icon={h.icon} data={h.scoreData} isDark={isDark} />
        ))}
      </View>
    </View>
  );
}
