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
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import Svg from "react-native-svg";
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
      return "gray"; // blue-500
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
  onPress,
}: {
  hazard: string;
  icon: any;
  data: any;
  isDark: boolean;
  color: string;
  onPress: () => void;
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
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-full items-center justify-center">
            <Icon icon={icon} size={22} strokeWidth={2} color={color} />
          </View>
          <Text
            style={{ color: color }}
            className="font-semibold text-md flex-1"
          >
            {hazard}
          </Text>
          <Icon
            icon={ChevronRightIcon}
            size={22}
            strokeWidth={2}
            color={color}
          />
        </View>
      </TouchableOpacity>

      <View className="items-center justify-center relative w-full h-28">
        <Svg viewBox="0 0 100 100" className="w-full h-full">
          <VictoryPie
            data={chartData}
            standalone={false}
            animate={true}
            startAngle={-110}
            endAngle={110}
            innerRadius={40}
            radius={60}
            colorScale={[riskcolor, isDark ? "#27272a80" : "#e4e4e780"]}
            labels={() => null}
            width={100}
            height={130}
            cornerRadius={10}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center pt-2">
          <Text className="font-bold text-sm" style={{ color: riskcolor }}>
            {band}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function RiskSection() {
  const { data, isLoading, isError } = useRiskScore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  type SelectedRiskData = {
    hazard: string;
    majorFactor: string;
    reasons: string[];
    band: string;
    color: string;
    riskcolor: string;
    icon: any;
  };
  const [selectedRisk, setSelectedRisk] = useState<SelectedRiskData | null>(
    null,
  );

  const handlePress = (h: any) => {
    setSelectedRisk({
      hazard: h.name,
      icon: h.icon,
      majorFactor: h.scoreData?.major_factor ?? "",
      reasons: h.scoreData?.reasons ?? [],
      band: h.scoreData?.band ?? "Minimal",
      color: h.color,
      riskcolor: getRiskColor(h.scoreData?.band ?? "Minimal"),
    });
  };

  if (isLoading) {
    return (
      <View className="mt-6 mb-2">
        <Skeleton className="mb-4" />
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
      icon: RainIcon,
      scoreData: heavy_rain,
      color: "#00A6F4",
    },
    {
      id: "heat_stress",
      name: "Heat Stress",
      icon: ThermometerWarmIcon,
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
      icon: Tornado02Icon,
      scoreData: wind,
      color: "#625FFF",
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
        <Text className="text-xl grow text-foreground font-light">
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
            onPress={() => handlePress(hazards[0])}
          />
          <RiskGauge
            key={hazards[1].id}
            hazard={hazards[1].name}
            icon={hazards[1].icon}
            data={hazards[1].scoreData}
            isDark={isDark}
            color={hazards[1].color}
            onPress={() => handlePress(hazards[1])}
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
            onPress={() => handlePress(hazards[2])}
          />
          <RiskGauge
            key={hazards[3].id}
            hazard={hazards[3].name}
            icon={hazards[3].icon}
            data={hazards[3].scoreData}
            isDark={isDark}
            color={hazards[3].color}
            onPress={() => handlePress(hazards[3])}
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
            onPress={() => handlePress(hazards[4])}
          />
          <RiskGauge
            key={hazards[5].id}
            hazard={hazards[5].name}
            icon={hazards[5].icon}
            data={hazards[5].scoreData}
            isDark={isDark}
            color={hazards[5].color}
            onPress={() => handlePress(hazards[5])}
          />
        </View>
      </View>

      {/* Details Modal */}
      <Modal
        visible={!!selectedRisk}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedRisk(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center px-5"
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
                    Risk Level
                  </Text>
                  {selectedRisk?.band && (
                    <Icon
                      icon={getRiskIcon(selectedRisk?.band)}
                      size={20}
                      strokeWidth={1.5}
                      color={getRiskColor(selectedRisk?.band)}
                    />
                  )}
                  <Text
                    className="font-bold text-md uppercase"
                    style={{ color: selectedRisk?.riskcolor }}
                  >
                    {selectedRisk?.band}
                  </Text>
                </View>

                {selectedRisk?.majorFactor ? (
                  <View className="mb-5 px-3">
                    <Text className="text-base font-bold text-foreground mb-2">
                      Major Factor
                    </Text>
                    <Text className="text-[15px] text-muted-foreground leading-6">
                      {selectedRisk.majorFactor}
                    </Text>
                  </View>
                ) : null}

                {selectedRisk?.reasons && selectedRisk.reasons.length > 0 ? (
                  <View className="mb-2 px-3">
                    <Text className="text-base font-bold text-foreground mb-3">
                      Analysis
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
