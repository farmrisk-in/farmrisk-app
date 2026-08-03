import React, { useMemo, useState } from "react";
import {
  View,
  Dimensions,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Switch,
  TextInput,
} from "react-native";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { Icon } from "../ui/Icon";
import {
  Settings01Icon,
  Cancel01Icon,
  Calendar01Icon,
  SoilMoistureFieldIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import {
  VictoryChart,
  VictoryLine,
  VictoryBar,
  VictoryAxis,
  VictoryScatter,
} from "victory-native";

interface Props {
  crop?: string;
}

const screenWidth = Dimensions.get("window").width;

export function SoilMoistureSection({ crop }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [daysbeforeInput, setDaysbeforeInput] = useState<string>("");
  const [daysbefore, setDaysbefore] = useState<number | undefined>(undefined);

  const [charts, setCharts] = useState({
    sm_percentile: true,
    P_obs: true,
    PE: false,
    E: false,
    R: false,
    G: false,
  });

  const { data, isLoading, isError } = useSoilMoisture(crop, daysbefore);

  // The API returns the raw array directly, not wrapped inside { soil_moisture: [...] }
  const soilMoistureData = Array.isArray(data)
    ? data
    : data?.soil_moisture || [];

  const chartData = useMemo(() => {
    if (!soilMoistureData || soilMoistureData.length === 0) return [];

    // Sort by date just to be safe, then take the last 30 data points provided by the API
    const sortedData = [...soilMoistureData].sort((a: any, b: any) => {
      const dateA = new Date(
        a.date.includes("T") ? a.date : a.date.replace(/-/g, "/"),
      ).getTime();
      const dateB = new Date(
        b.date.includes("T") ? b.date : b.date.replace(/-/g, "/"),
      ).getTime();
      return dateA - dateB;
    });

    const recentData = sortedData.slice(-30);

    return recentData.map((d: any) => {
      const safeDateStr = d.date.includes("T")
        ? d.date
        : d.date.replace(/-/g, "/");
      const dDate = new Date(safeDateStr);

      const displayDate = isNaN(dDate.getTime())
        ? d.date
        : dDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      return {
        date: displayDate,
        fullDate: d.date,
        sm_percentile: d.sm_percentile || 0,
        P_obs: d.P_obs || 0,
        PE: d.PE || 0,
        E: d.E || 0,
        R: d.R || 0,
        G: d.G || 0,
      };
    });
  }, [soilMoistureData]);

  const toggleChart = (key: keyof typeof charts) => {
    setCharts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyIrrigation = () => {
    const parsed = parseInt(daysbeforeInput, 10);
    setDaysbefore(isNaN(parsed) ? undefined : parsed);
    setSettingsOpen(false);
  };

  if (isLoading && !chartData.length)
    return <ActivityIndicator style={{ marginVertical: 16 }} color="#007a55" />;
  if (isError && !chartData.length)
    return (
      <Text className="text-muted-foreground text-center my-4">
        Soil moisture data unavailable
      </Text>
    );

  if (!chartData.length) {
    return (
      <View className="my-6 px-3">
        <View className="bg-card border border-border/50 rounded-2xl p-4 shadow-xs items-center justify-center">
          <Text className="text-muted-foreground">
            No recent soil moisture data.
          </Text>
        </View>
      </View>
    );
  }

  const chartWidth = Math.max(screenWidth - 48, chartData.length * 35);

  return (
    <View className="my-6 px-4">
      {/* Title */}
      <View className="flex pb-4 flex-row gap-2 items-center">
        <Icon
          icon={SoilMoistureFieldIcon}
          size={28}
          className="text-foreground"
        />
        <Text
          
          className="grow text-xl text-foreground"
        >
          Soil Moisture
        </Text>
        <View className="flex-row flex">
          <TouchableOpacity className="border-r-2 border-border px-3">
            <Icon icon={Calendar03Icon} size={22} className="text-foreground" />
            {/*<Text>Irrigation</Text>*/}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            className="pl-3"
          >
            <Icon icon={Settings01Icon} size={22} className="text-foreground" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-card border border-border rounded-3xl p-3 shadow-xs">
        {/* Chart */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: chartWidth, height: 240, marginLeft: -10 }}>
            {isLoading && (
              <View className="absolute z-10 top-0 left-0 right-0 bottom-0 items-center justify-center bg-background/50">
                <ActivityIndicator color="#007a55" />
              </View>
            )}
            <VictoryChart
              height={240}
              width={chartWidth}
              padding={{ top: 20, bottom: 40, left: 35, right: 20 }}
              domain={{ y: [0, 100] }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: { fontSize: 10, fill: "#71717a", padding: 5 },
                  grid: { stroke: "transparent" },
                }}
                fixLabelOverlap={true}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: "transparent" },
                  tickLabels: { fontSize: 10, fill: "#71717a", padding: 5 },
                  grid: { stroke: "#e4e4e7", strokeDasharray: "4, 4" },
                }}
              />

              {/* Rain Bar */}
              {charts.P_obs && (
                <VictoryBar
                  data={chartData}
                  x="date"
                  y="P_obs"
                  style={{ data: { fill: "#60a5fa" } }}
                  barWidth={8}
                  cornerRadius={{ top: 2, bottom: 2 }}
                />
              )}

              {/* Additional Metric Lines */}
              {charts.PE && (
                <VictoryLine
                  data={chartData}
                  x="date"
                  y="PE"
                  style={{ data: { stroke: "#fbbf24", strokeWidth: 2 } }}
                />
              )}
              {charts.E && (
                <VictoryLine
                  data={chartData}
                  x="date"
                  y="E"
                  style={{ data: { stroke: "#a855f7", strokeWidth: 2 } }}
                />
              )}
              {charts.R && (
                <VictoryLine
                  data={chartData}
                  x="date"
                  y="R"
                  style={{ data: { stroke: "#f43f5e", strokeWidth: 2 } }}
                />
              )}
              {charts.G && (
                <VictoryLine
                  data={chartData}
                  x="date"
                  y="G"
                  style={{ data: { stroke: "#14b8a6", strokeWidth: 2 } }}
                />
              )}

              {/* Moisture Line */}
              {charts.sm_percentile && (
                <VictoryLine
                  data={chartData}
                  x="date"
                  y="sm_percentile"
                  style={{ data: { stroke: "#10b981", strokeWidth: 2.5 } }}
                  interpolation="monotoneX"
                />
              )}

              {/* Scatter for Moisture dots */}
              {charts.sm_percentile && (
                <VictoryScatter
                  data={chartData}
                  x="date"
                  y="sm_percentile"
                  size={3.5}
                  style={{
                    data: {
                      fill: "#10b981",
                      stroke: "#ffffff",
                      strokeWidth: 1.5,
                    },
                  }}
                />
              )}
            </VictoryChart>
          </View>
        </ScrollView>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center px-4"
          activeOpacity={1}
          onPressOut={() => setSettingsOpen(false)}
        >
          <TouchableWithoutFeedback>
            <View className="bg-card w-full rounded-3xl p-5 border border-border shadow-lg">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-xl font-bold text-foreground">
                  Moisture Settings
                </Text>
                <TouchableOpacity
                  onPress={() => setSettingsOpen(false)}
                  className="p-2 bg-muted rounded-full"
                >
                  <Icon
                    icon={Cancel01Icon}
                    size={20}
                    className="text-foreground"
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-bold uppercase text-muted-foreground mb-3 tracking-wider">
                Metrics to Display
              </Text>
              <View className="gap-3 mb-6 bg-muted/30 p-4 rounded-xl border border-border/50">
                <View className="flex-row justify-between items-center">
                  <Text className="text-[15px] font-medium text-foreground">
                    Soil Percentile (%)
                  </Text>
                  <Switch
                    value={charts.sm_percentile}
                    onValueChange={() => toggleChart("sm_percentile")}
                    trackColor={{ true: "#10b981" }}
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-[15px] font-medium text-foreground">
                    Precipitation (mm)
                  </Text>
                  <Switch
                    value={charts.P_obs}
                    onValueChange={() => toggleChart("P_obs")}
                    trackColor={{ true: "#60a5fa" }}
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-[15px] font-medium text-foreground">
                    Potential Evap (PE)
                  </Text>
                  <Switch
                    value={charts.PE}
                    onValueChange={() => toggleChart("PE")}
                    trackColor={{ true: "#fbbf24" }}
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-[15px] font-medium text-foreground">
                    Actual Evap (E)
                  </Text>
                  <Switch
                    value={charts.E}
                    onValueChange={() => toggleChart("E")}
                    trackColor={{ true: "#a855f7" }}
                  />
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-[15px] font-medium text-foreground">
                    Runoff (R)
                  </Text>
                  <Switch
                    value={charts.R}
                    onValueChange={() => toggleChart("R")}
                    trackColor={{ true: "#f43f5e" }}
                  />
                </View>
              </View>

              <Text className="text-sm font-bold uppercase text-muted-foreground mb-3 tracking-wider">
                Irrigation Model
              </Text>
              <View className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <Text className="text-[14px] text-muted-foreground mb-3">
                  Adjust the AI model by specifying when you last irrigated your
                  crop.
                </Text>
                <View className="flex-row items-center gap-3">
                  <Icon
                    icon={Calendar01Icon}
                    size={20}
                    className="text-emerald-600"
                  />
                  <TextInput
                    value={daysbeforeInput}
                    onChangeText={setDaysbeforeInput}
                    placeholder="Days ago (e.g. 15)"
                    keyboardType="number-pad"
                    className="flex-1 border border-border bg-background rounded-lg px-3 py-2 text-foreground font-medium"
                    placeholderTextColor="#71717a"
                  />
                  <TouchableOpacity
                    onPress={applyIrrigation}
                    className="bg-emerald-600 px-4 py-2.5 rounded-lg"
                  >
                    <Text className="text-white font-bold text-sm">Apply</Text>
                  </TouchableOpacity>
                </View>
                {daysbefore !== undefined && (
                  <TouchableOpacity
                    onPress={() => {
                      setDaysbefore(undefined);
                      setDaysbeforeInput("");
                      setSettingsOpen(false);
                    }}
                    className="mt-3 py-2"
                  >
                    <Text className="text-center text-rose-500 font-semibold text-xs">
                      Clear Irrigation Data
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
