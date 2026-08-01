import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { VictoryPie } from "victory-native";
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
  ChevronRightIcon,
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

  const chartData = [
    { x: "score", y: score },
    { x: "remainder", y: 100 - score },
  ];

  return (
    <View
      className="p-4 rounded-[30px] grow"
      style={{ backgroundColor: color + 10 }}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-full items-center justify-center">
          <Icon icon={icon} size={22} strokeWidth={2} color={color} />
        </View>
        <Text style={{ color: color }} className="font-semibold text-md flex-1">
          {hazard}
        </Text>
        <Icon icon={ChevronRightIcon} size={22} strokeWidth={2} color={color} />
      </View>

      <View className="items-center justify-center relative">
        <View style={{ marginTop: -25 }}>
          <VictoryPie
            data={chartData}
            startAngle={-90}
            endAngle={90}
            innerRadius={28}
            radius={36}
            colorScale={[riskcolor, isDark ? "#27272a" : "#e4e4e7"]}
            labels={() => null}
            padding={0}
            width={100}
            height={100}
          />
        </View>
        <View className="absolute bottom-0 items-center w-full">
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
      color: "#009966",
    },
    {
      id: "pest",
      name: "Pest / Disease",
      icon: Bug01Icon,
      scoreData: pest,
      color: "#F54A00",
    },
    {
      id: "lightning",
      name: "Lightning",
      icon: FlashIcon,
      scoreData: lightning,
      color: "#D08700",
    },
    {
      id: "wind",
      name: "High Wind",
      icon: CloudFastWindIcon,
      scoreData: wind,
      color: "#4F39F6",
    },
    {
      id: "frost",
      name: "Frost",
      icon: SnowIcon,
      scoreData: frost,
      color: "#C800DE",
    },
  ];

  return (
    <View>
      <View className="flex flex-row gap-2 mt-6 mb-3 px-3 items-center">
        <Icon
          icon={SecurityWarningIcon}
          size={25}
          className="text-foreground"
        />
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
      <View className="flex gap-4 px-2">
        <View className="flex flex-row gap-3">
          <RiskGauge
            key={hazards[0].id}
            hazard={hazards[0].name}
            icon={hazards[0].icon}
            data={hazards[0].scoreData}
            isDark={isDark}
            color={hazards[0].color}
          />
          <RiskGauge
            key={hazards[1].id}
            hazard={hazards[1].name}
            icon={hazards[1].icon}
            data={hazards[1].scoreData}
            isDark={isDark}
            color={hazards[1].color}
          />
        </View>
        <View className="flex flex-row gap-3">
          <RiskGauge
            key={hazards[2].id}
            hazard={hazards[2].name}
            icon={hazards[2].icon}
            data={hazards[2].scoreData}
            isDark={isDark}
            color={hazards[2].color}
          />
          <RiskGauge
            key={hazards[3].id}
            hazard={hazards[3].name}
            icon={hazards[3].icon}
            data={hazards[3].scoreData}
            isDark={isDark}
            color={hazards[3].color}
          />
        </View>
        <View className="flex flex-row gap-3">
          <RiskGauge
            key={hazards[4].id}
            hazard={hazards[4].name}
            icon={hazards[4].icon}
            data={hazards[4].scoreData}
            isDark={isDark}
            color={hazards[4].color}
          />
          <RiskGauge
            key={hazards[5].id}
            hazard={hazards[5].name}
            icon={hazards[5].icon}
            data={hazards[5].scoreData}
            isDark={isDark}
            color={hazards[5].color}
          />
        </View>
      </View>
    </View>
  );
}
