import React, { useMemo, useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Switch,
  TextInput,
  ScrollView,
} from "react-native";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { Icon } from "../ui/Icon";
import {
  Settings01Icon,
  SoilMoistureFieldIcon,
  Calendar03Icon,
  ChevronRightIcon,
  Cancel,
  CloudOffIcon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  VictoryChart,
  VictoryLine,
  VictoryBar,
  VictoryAxis,
  VictoryScatter,
} from "victory-native";
import { useTranslation } from "react-i18next";

interface Props {
  crop?: string;
}

// ── constants ────────────────────────────────────────────────────────────────
const screenWidth = Dimensions.get("window").width;
const CHART_H = 240;
const PAD = { left: 6, right: 6, top: 16, bottom: 20 };

// ── helpers ──────────────────────────────────────────────────────────────────
const getMoistureColor = (v: number) =>
  v <= 30 ? "#ef4444" : v <= 70 ? "#94a3b8" : "#3b82f6";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Manually parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:..." → "Aug 6"
// Avoids Hermes new Date() Invalid Date issues with ISO strings
const formatShortDate = (raw: string): string => {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return raw;
  const month = parseInt(match[2], 10) - 1; // 0-indexed
  const day = parseInt(match[3], 10);
  return `${MONTHS[month]} ${day}`;
};

// ── component ────────────────────────────────────────────────────────────────
export function SoilMoistureSection({ crop }: Props) {
  const router = useRouter();
  const { t } = useTranslation(["dashboard"]);
  const { t: tW } = useTranslation(["weather"]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [irrigationOpen, setIrrigationOpen] = useState(false);
  const [daysbeforeInput, setDaysbeforeInput] = useState("");
  const [daysbefore, setDaysbefore] = useState<number | undefined>(undefined);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    datum: any;
    x: number;
    y: number;
  }>({ visible: false, datum: null, x: 0, y: 0 });

  const [charts, setCharts] = useState({
    sm_percentile: true,
    P_obs: true,
    PE: false,
    E: false,
    R: false,
    G: false,
  });

  // ── refs for closures ──────────────────────────────────────────────────
  const visibleDataRef = useRef<any[]>([]);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // tap detection: track touch start position to distinguish tap vs drag
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  // ── data ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useSoilMoisture(crop, daysbefore);
  const rawArray = Array.isArray(data) ? data : (data?.soil_moisture ?? []);

  const chartData = useMemo(() => {
    if (!rawArray.length) return [];
    const sorted = [...rawArray].sort((a: any, b: any) => {
      const ta = new Date(
        a.date.includes("T") ? a.date : a.date.replace(/-/g, "/"),
      ).getTime();
      const tb = new Date(
        b.date.includes("T") ? b.date : b.date.replace(/-/g, "/"),
      ).getTime();
      return ta - tb;
    });
    return sorted.slice(-30).map((d: any) => ({
      date: formatShortDate(d.date),
      sm_percentile: d.sm_percentile ?? 0,
      P_obs: d.P_obs ?? 0,
      PE: d.PE ?? 0,
      E: d.E ?? 0,
      R: d.R ?? 0,
      G: d.G ?? 0,
    }));
  }, [rawArray]);

  visibleDataRef.current = chartData;

  // ── chart dimensions ──────────────────────────────────────────────────────
  const chartWidth = Math.max(screenWidth - 32, chartData.length * 28);
  const plotW = chartWidth - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;

  // ── tooltip helpers ───────────────────────────────────────────────────────
  const showTooltipAt = (locX: number) => {
    const vd = visibleDataRef.current;
    if (!vd.length) return;
    const step = plotW / Math.max(1, vd.length - 1);
    const idx = Math.max(
      0,
      Math.min(vd.length - 1, Math.round((locX - PAD.left) / step)),
    );
    const datum = vd[idx];
    if (!datum) return;
    const dotX = PAD.left + idx * step;
    const dotY = PAD.top + (1 - datum.sm_percentile / 100) * plotH;
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip({ visible: true, datum, x: dotX, y: dotY });

    // // Auto-hide tooltip after 2.5 seconds
    // tooltipTimer.current = setTimeout(
    //   () => setTooltip((t) => ({ ...t, visible: false })),
    //   2500,
    // );
  };

  const hideTooltip = () => setTooltip((t) => ({ ...t, visible: false }));

  // ── guards ────────────────────────────────────────────────────────────────
  if (isLoading && !chartData.length) {
    return (
      <View className="my-6 px-4">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={SoilMoistureFieldIcon}
            size={28}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {tW("soilMoisture")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted/20 rounded-3xl overflow-hidden pt-4 pb-5 px-4 h-[240px] justify-end">
          <View className="flex-row items-end justify-between w-full h-[180px] gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton
                key={i}
                width={36}
                height={Math.max(40, Math.random() * 160)}
                borderRadius={6}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (isError && !chartData.length) {
    return (
      <View className="my-6 px-4">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={SoilMoistureFieldIcon}
            size={28}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {tW("soilMoisture")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted/20 border border-border rounded-2xl p-6 items-center justify-center h-[240px]">
          <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
          <Text className="mt-4 text-muted-foreground font-medium">
            {t("soilMoistureUnavailable")}
          </Text>
        </View>
      </View>
    );
  }
  if (!chartData.length)
    return (
      <View className="my-6 px-3">
        <View className="bg-card border border-border/50 rounded-2xl p-4 items-center">
          <Text className="text-muted-foreground">
            {t("noRecentSoilMoisture")}
          </Text>
        </View>
      </View>
    );

  const toggleChart = (key: keyof typeof charts) =>
    setCharts((p) => ({ ...p, [key]: !p[key] }));

  const applyIrrigation = () => {
    const parsed = parseInt(daysbeforeInput, 10);
    setDaysbefore(isNaN(parsed) ? undefined : parsed);
    setIrrigationOpen(false);
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <View className="my-6 px-4">
      {/* ── Header ── */}
      <View className="flex pb-4 flex-row gap-2 items-center">
        <Icon
          icon={SoilMoistureFieldIcon}
          size={28}
          strokeWidth={1.5}
          className="text-foreground"
        />
        <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {tW("soilMoisture")}
        </Text>
        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            onPress={() => setIrrigationOpen(true)}
            className="border px-3 flex-row gap-1 items-center rounded-xl py-1.5 bg-emerald-100/80 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/50"
          >
            <Icon
              icon={Calendar03Icon}
              size={16}
              className="text-emerald-800 dark:text-emerald-300"
            />
            <Text className="text-sm text-emerald-800 dark:text-emerald-300 font-bold">
              {t("irrigation")}
            </Text>
            {daysbefore !== undefined && (
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSettingsOpen(true)}
            className="pl-1"
          >
            <Icon icon={Settings01Icon} size={22} className="text-foreground" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/soil-detail")}
            className="pl-1"
          >
            <Icon
              icon={ChevronRightIcon}
              size={24}
              className="text-foreground"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chart Area ── */}
      <View>
        {/* Refresh spinner overlay */}
        {isLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
            className="items-center justify-center bg-background/50"
          >
            <ActivityIndicator color="#007a55" />
          </View>
        )}

        {/* Scrollable Chart */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={hideTooltip}
        >
          {/* Raw touch events to distinguish tap (tooltip) from drag (native ScrollView pan) */}
          <View
            style={{ width: chartWidth, height: CHART_H }}
            onTouchStart={(e) => {
              touchStartX.current = e.nativeEvent.pageX;
              touchStartY.current = e.nativeEvent.pageY;
              touchMoved.current = false;
            }}
            onTouchMove={(e) => {
              const dx = Math.abs(e.nativeEvent.pageX - touchStartX.current);
              const dy = Math.abs(e.nativeEvent.pageY - touchStartY.current);
              if (dx > 6 || dy > 6) touchMoved.current = true;
            }}
            onTouchEnd={(e) => {
              if (!touchMoved.current) {
                // genuine tap → show tooltip
                showTooltipAt(e.nativeEvent.locationX);
              }
              touchMoved.current = false;
            }}
          >
            {/* Colored background bands */}
            <View
              style={{
                position: "absolute",
                top: PAD.top,
                left: PAD.left,
                right: PAD.right,
                bottom: PAD.bottom,
                flexDirection: "column",
              }}
              pointerEvents="none"
            >
              <View
                style={{ flex: 30, backgroundColor: "rgba(59,130,246,0.10)" }}
              />
              <View
                style={{ flex: 40, backgroundColor: "rgba(120,120,120,0.05)" }}
              />
              <View
                style={{ flex: 30, backgroundColor: "rgba(239,68,68,0.10)" }}
              />
            </View>

            <VictoryChart
              height={CHART_H}
              width={chartWidth}
              padding={PAD}
              domain={{ y: [0, 100] }}
            >
              {/* X axis */}
              <VictoryAxis
                style={{
                  axis: { stroke: "#71717a", strokeWidth: 1 },
                  ticks: { stroke: "#71717a", size: 4 },
                  tickLabels: { fontSize: 9, fill: "#71717a", padding: 3 },
                  grid: { stroke: "transparent" },
                }}
                fixLabelOverlap
              />
              {/* Y axis */}
              <VictoryAxis
                dependentAxis
                tickValues={[0, 20, 40, 60, 80, 100]}
                tickFormat={() => ""}
                style={{
                  axis: { stroke: "#71717a", strokeWidth: 1 },
                  ticks: { stroke: "#71717a", size: 4 },
                  tickLabels: { fill: "transparent" },
                  grid: {
                    stroke: "rgba(113,113,122,0.25)",
                    strokeDasharray: "4,4",
                  },
                }}
              />

              {/* Rain bars */}
              {charts.P_obs && (
                <VictoryBar
                  data={chartData}
                  x="date"
                  y="P_obs"
                  style={{ data: { fill: "#60a5fa", opacity: 0.65 } }}
                  barWidth={12}
                  cornerRadius={{ top: 6, bottom: 0 }}
                />
              )}
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

              {/* Moisture line – dashed */}
              {charts.sm_percentile && (
                <VictoryLine
                  data={chartData}
                  x="date"
                  y="sm_percentile"
                  style={{
                    data: {
                      stroke: "#10b981",
                      strokeWidth: 2.5,
                      strokeDasharray: "6,4",
                    },
                  }}
                  interpolation="monotoneX"
                />
              )}

              {/* Color-coded dots */}
              {charts.sm_percentile &&
                chartData.map((d: any, i: number) => (
                  <VictoryScatter
                    key={`dot-${i}`}
                    data={[d]}
                    x="date"
                    y="sm_percentile"
                    size={5}
                    style={{
                      data: {
                        fill: getMoistureColor(d.sm_percentile),
                        stroke: "#fff",
                        strokeWidth: 1,
                      },
                    }}
                  />
                ))}
            </VictoryChart>

            {/* ── Tooltip overlay ── */}
            {tooltip.visible && tooltip.datum && (
              <>
                {/* crosshair line */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: tooltip.x,
                    top: PAD.top,
                    bottom: PAD.bottom,
                    width: 1.5,
                    backgroundColor: "rgba(16,185,129,0.6)",
                    borderRadius: 1,
                  }}
                />
                {/* dot highlight */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: tooltip.x - 6,
                    top: tooltip.y - 6,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: getMoistureColor(
                      tooltip.datum.sm_percentile,
                    ),
                    borderWidth: 2,
                    borderColor: "#fff",
                  }}
                />
                {/* bubble */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: Math.min(
                      tooltip.x + 10,
                      chartWidth - PAD.right - 155,
                    ),
                    top: Math.max(PAD.top + 4, tooltip.y - 55),
                    backgroundColor: "rgba(15,15,15,0.92)",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    minWidth: 148,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Text
                    style={{ color: "#9ca3af", fontSize: 11, marginBottom: 5 }}
                  >
                    {tooltip.datum.date}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: getMoistureColor(
                          tooltip.datum.sm_percentile,
                        ),
                      }}
                    />
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                    >
                      {tW("percentMoisture", { value: Math.round(tooltip.datum.sm_percentile) })}
                    </Text>
                  </View>
                  {charts.P_obs && tooltip.datum.P_obs > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 3,
                      }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "#60a5fa",
                        }}
                      />
                      <Text style={{ color: "#d1d5db", fontSize: 11 }}>
                        {tW("rainTooltip", {
                          mm: tooltip.datum.P_obs.toFixed(1),
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>

      {/* ── Settings Modal ── */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center px-3"
          activeOpacity={1}
          onPressOut={() => setSettingsOpen(false)}
        >
          <TouchableWithoutFeedback>
            <View className="bg-card w-full rounded-3xl p-5 border border-border shadow-lg">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-xl font-bold text-foreground">
                  {t("moistureSettings")}
                </Text>
                <TouchableOpacity
                  onPress={() => setSettingsOpen(false)}
                  className="p-2 bg-muted rounded-full"
                >
                  <Icon icon={Cancel} size={20} className="text-foreground" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">
                {t("metricsToDisplay")}
              </Text>
              <View className="gap-3 py-4">
                {(
                  [
                    {
                      key: "sm_percentile",
                      label: t("soilPercentile"),
                      color: "#10b981",
                    },
                    {
                      key: "P_obs",
                      label: t("precipitationMm"),
                      color: "#60a5fa",
                    },
                    {
                      key: "PE",
                      label: t("potentialEvap"),
                      color: "#fbbf24",
                    },
                    {
                      key: "E",
                      label: t("actualEvap"),
                      color: "#a855f7",
                    },
                    { key: "R", label: t("runoff"), color: "#f43f5e" },
                  ] as const
                ).map(({ key, label, color }) => (
                  <View
                    key={key}
                    className="flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: color,
                        }}
                      />
                      <Text className="text-[15px] font-medium text-foreground">
                        {label}
                      </Text>
                    </View>
                    <Switch
                      value={charts[key]}
                      onValueChange={() => toggleChart(key)}
                      trackColor={{ true: color + "30" }}
                      thumbColor={color}
                    />
                  </View>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* ── Irrigation Modal ── */}
      <Modal
        visible={irrigationOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIrrigationOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center px-3"
          activeOpacity={1}
          onPressOut={() => setIrrigationOpen(false)}
        >
          <TouchableWithoutFeedback>
            <View className="bg-card w-full rounded-3xl p-6 border border-border shadow-2xl pb-10">
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-3">
                  <View className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                    <Icon
                      icon={Calendar03Icon}
                      size={24}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </View>
                  <Text className="text-xl font-bold text-foreground">
                    {t("irrigationLog")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIrrigationOpen(false)}
                  className="p-2 bg-muted rounded-full"
                >
                  <Icon icon={Cancel} size={20} className="text-foreground" />
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-muted-foreground mb-4">
                {t("irrigationDesc")}
              </Text>
              <View className="py-4">
                <Text className="text-xs font-bold uppercase text-foreground mb-3 tracking-wider">
                  {t("daysSinceLastIrrigation")}
                </Text>
                <View className="flex-row items-center gap-3">
                  <TextInput
                    value={daysbeforeInput}
                    onChangeText={setDaysbeforeInput}
                    placeholder={t("daysPlaceholder")}
                    keyboardType="number-pad"
                    className="flex-1 border-2 border-emerald-500/30 bg-background rounded-xl px-4 py-3.5 text-foreground font-bold text-lg"
                    placeholderTextColor="#71717a"
                  />
                  <TouchableOpacity
                    onPress={applyIrrigation}
                    className="bg-emerald-600 px-6 py-4 rounded-xl"
                  >
                    <Text className="text-white font-bold text-base">
                      {t("save")}
                    </Text>
                  </TouchableOpacity>
                </View>
                {daysbefore !== undefined && (
                  <TouchableOpacity
                    onPress={() => {
                      setDaysbefore(undefined);
                      setDaysbeforeInput("");
                      setIrrigationOpen(false);
                    }}
                    className="mt-4 pt-4 border-t border-border/60 items-center"
                  >
                    <Text className="text-rose-500 font-bold text-sm">
                      {t("removeIrrigationEntry")}
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
