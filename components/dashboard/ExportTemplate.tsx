import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Svg,
  Path,
  Line,
  Circle,
  Text as SvgText,
  Rect,
} from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useForecast } from "@/hooks/useForecast";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { useAI } from "@/hooks/useAI";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useCalendar } from "@/hooks/useCalendar";
import { useLocationContext } from "@/providers/LocationProvider";
import { useCropContext } from "@/providers/CropProvider";
import type { SavedField } from "@/types/fields";
import { Icon } from "@/components/ui/Icon";
import {
  Leaf02Icon,
  Location01Icon,
  Calendar03Icon,
  BotIcon,
  TrendingUpDownIcon,
  DropletIcon,
  CloudRainWindIcon,
  FlameIcon,
  Bug01Icon,
  FlashIcon,
  WindPowerIcon,
  SnowIcon,
  CloudFastWindIcon,
  SunCloud01Icon,
  RainDropIcon,
} from "@hugeicons/core-free-icons";

export const calculateTimelineSegments = (start: number, end: number) => {
  if (end < start) {
    return [
      {
        left: ((start - 1) / 12) * 100,
        width: ((12 - start + 1) / 12) * 100,
        isVisible: true,
      },
      { left: 0, width: (end / 12) * 100, isVisible: true },
    ];
  }
  return [
    {
      left: ((start - 1) / 12) * 100,
      width: ((end - start + 1) / 12) * 100,
      isVisible: true,
    },
  ];
};

const BRAND = "#059669";
const BRAND_DARK = "#064e3b";
const BG = "#ffffff";
const TEXT_DARK = "#1e293b"; // slate-800
const TEXT_MID = "#475569"; // slate-600
const TEXT_LIGHT = "#64748b"; // slate-500
const BORDER = "#cbd5e1"; // slate-300

const MONTHS_LABELS = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

const getRiskColor = (band: string) => {
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
      return "#94a3b8"; // slate-400
    default:
      return "#94a3b8";
  }
};

const getMoistureColor = (pct: number) => {
  if (pct > 70) return "#0ea5e9";
  if (pct > 30) return "#64748b";
  return "#f97316";
};

const getWeatherIcon = (pcp: number) => {
  if (pcp > 5.0) return CloudRainWindIcon;
  if (pcp > 1.0) return RainDropIcon;
  if (pcp > 0.1) return CloudFastWindIcon;
  return SunCloud01Icon;
};

const HAZARD_KEYS = [
  "heavy_rain",
  "heat_stress",
  "pest",
  "lightning",
  "wind",
  "frost",
] as const;

interface Props {
  selectedFarm?: SavedField | null;
}

export default function ExportTemplate({ selectedFarm }: Props) {
  const { t, i18n } = useTranslation([
    "dashboard",
    "fields",
    "calendar",
    "weather",
  ]);
  const { location } = useLocationContext();
  const { selectedCrop } = useCropContext();
  const { forecastRows } = useForecast();
  const { data: soilData } = useSoilMoisture();
  const { data: aiText } = useAI(selectedCrop || "general", i18n.language);
  const { data: riskData } = useRiskScore();
  const { data: calendarData } = useCalendar(selectedCrop || "general");

  const now = new Date();
  const dateStr = now.toLocaleDateString(
    i18n.language === "hi" ? "hi-IN" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
  const timeStr = now.toLocaleTimeString(
    i18n.language === "hi" ? "hi-IN" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const hazardName = (key: (typeof HAZARD_KEYS)[number]): string => {
    switch (key) {
      case "heavy_rain":
        return t("heavyRain");
      case "heat_stress":
        return t("heatStress");
      case "pest":
        return t("pestDisease");
      case "lightning":
        return t("lightning", { ns: "weather" });
      case "wind":
        return t("highWind");
      case "frost":
        return t("frost");
      default:
        return key;
    }
  };

  const getHazardIcon = (key: string) => {
    switch (key) {
      case "heavy_rain":
        return CloudRainWindIcon;
      case "heat_stress":
        return FlameIcon;
      case "pest":
        return Bug01Icon;
      case "lightning":
        return FlashIcon;
      case "wind":
        return WindPowerIcon;
      case "frost":
        return SnowIcon;
      default:
        return Bug01Icon;
    }
  };

  const translateBand = (band: string) => {
    switch (band) {
      case "Extreme":
        return t("riskExtreme") || "Extreme";
      case "High":
        return t("riskHigh") || "High";
      case "Moderate":
        return t("riskModerate") || "Moderate";
      case "Low":
        return t("riskLow") || "Low";
      case "Minimal":
        return t("riskMinimal") || "Minimal";
      default:
        return band;
    }
  };

  const translateCropName = (crop: string) => {
    const cropId = crop?.toLowerCase() || "general";
    switch (cropId) {
      case "general":
        return t("cropGeneral");
      case "cotton":
        return t("cropCotton");
      case "wheat":
        return t("cropWheat");
      case "rice":
        return t("cropRice");
      case "fodder":
        return t("cropFodder");
      case "pearlmillet":
        return t("cropPearlmillet");
      case "oilseeds":
        return t("cropOilseeds");
      case "castor":
        return t("cropCastor");
      case "sorghum":
        return t("cropSorghum");
      case "kharifsorghum":
        return t("cropKharifsorghum");
      case "chickpea":
        return t("cropChickpea");
      default:
        return crop;
    }
  };

  const forecastDays = useMemo(
    () => (forecastRows || []).slice(0, 16),
    [forecastRows],
  );

  const soilChartPoints = useMemo(() => {
    const rawArray = Array.isArray(soilData)
      ? soilData
      : soilData?.soil_moisture || [];
    const sortedRows = [...rawArray].sort((a: any, b: any) => {
      const ta = new Date(
        a.date.includes("T") ? a.date : a.date.replace(/-/g, "/"),
      ).getTime();
      const tb = new Date(
        b.date.includes("T") ? b.date : b.date.replace(/-/g, "/"),
      ).getTime();
      return ta - tb;
    });
    const last30 = sortedRows.slice(-30);
    if (last30.length === 0) return [];
    const W = 700,
      H = 110,
      PAD_L = 32,
      PAD_R = 25,
      PAD_T = 15,
      PAD_B = 20;
    const cW = W - PAD_L - PAD_R;
    const cH = H - PAD_T - PAD_B;
    return last30.map((d: any, i: number) => {
      const x = PAD_L + (i / (last30.length - 1)) * cW;
      const val = Math.min(100, Math.max(0, d.sm_percentile ?? 0));
      const y = PAD_T + ((100 - val) / 100) * cH;
      return { x, y, val, date: d.date };
    });
  }, [soilData]);

  const soilChartPath = useMemo(() => {
    if (soilChartPoints.length === 0) return "";
    return soilChartPoints
      .map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [soilChartPoints]);

  const tempBounds = useMemo(() => {
    if (forecastDays.length === 0) return { min: 0, max: 40 };
    const mins = forecastDays.map((d: any) => d.tmin_corrected);
    const maxs = forecastDays.map((d: any) => d.tmax_corrected);
    const min = Math.min(...mins);
    const max = Math.max(...maxs);
    return { min, max: max === min ? min + 5 : max };
  }, [forecastDays]);

  const calendar = calendarData?.calendar || [];

  return (
    <View style={s.root}>
      {/* 1. HEADER */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Icon icon={Leaf02Icon} size={28} color={BRAND} />
          <View>
            <Text style={s.brandTitle}>FARMRISK ADVISORY</Text>
            <Text style={s.brandSub}>CLIMATE INTELLIGENCE & RISK REPORT</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <View style={s.cropBadgeRow}>
            <Text style={s.cropBadgeLabel}>CROP: </Text>
            <View style={s.cropBadge}>
              <Text style={s.cropBadgeText}>
                {translateCropName(selectedCrop || "general")}
              </Text>
            </View>
          </View>
          <View style={s.officialBadge}>
            <Text style={s.officialBadgeText}>OFFICIAL DIAGNOSTIC PDF</Text>
          </View>
        </View>
      </View>

      {/* 2. TARGET LOCATION & TIMESTAMP */}
      <View style={s.infoCol}>
        <View style={s.infoTitleRow}>
          <Icon icon={Location01Icon} size={14} color={BRAND} />
          <Text style={s.infoTitle}>TARGET LOCATION</Text>
        </View>
        <Text style={s.infoValue} numberOfLines={1}>
          {selectedFarm
            ? selectedFarm.name
            : location?.displayName || location?.name || "—"}
        </Text>
        {location?.lat && location?.lng && (
          <Text style={s.infoSub}>
            {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
          </Text>
        )}
      </View>
      <View style={s.infoDivider} />
      <View style={s.infoCol}>
        <View style={s.infoTitleRow}>
          <Icon icon={Calendar03Icon} size={14} color={BRAND} />
          <Text style={s.infoTitle}>COMPILATION TIMESTAMP</Text>
        </View>
        <Text style={s.infoValue}>{dateStr}</Text>
        <Text style={s.infoSub}>{timeStr}</Text>
      </View>

      {/* 3. AI AGRONOMIST ADVISORY OVERVIEW */}
      <View style={s.aiBox}>
        <View style={s.sectionHeader}>
          <Icon icon={BotIcon} size={18} color={BRAND} />
          <Text style={s.sectionTitle}>AI AGRONOMIST ADVISORY OVERVIEW</Text>
        </View>
        <View style={s.aiDivider} />
        <Text style={s.aiText}>
          {aiText || "No advisory available for this period."}
        </Text>
      </View>

      {/* 4. AGRICULTURAL RISK */}
      {riskData && (
        <View style={s.section}>
          <View style={s.sectionHeader2}>
            <View style={s.sectionTitleGroup}>
              <Icon
                icon={TrendingUpDownIcon}
                size={20}
                color={BRAND}
                style={{ transform: [{ rotate: "45deg" }] }}
              />
              <Text style={s.sectionTitle2}>AGRICULTURAL RISK</Text>
              <View
                style={[
                  s.riskOverallBadge,
                  {
                    backgroundColor: `${getRiskColor(riskData.overall.band)}15`,
                  },
                ]}
              >
                <Text
                  style={[
                    s.riskOverallBadgeText,
                    { color: getRiskColor(riskData.overall.band) },
                  ]}
                >
                  {Math.round(riskData.overall.score)} ·{" "}
                  {translateBand(riskData.overall.band)}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.riskGrid}>
            {HAZARD_KEYS.map((key) => {
              const hazard = (riskData as any)[key];
              if (!hazard) return null;
              const color = getRiskColor(hazard.band);
              return (
                <View key={key} style={s.riskCard}>
                  <Text style={s.riskName} numberOfLines={1}>
                    {hazardName(key)}
                  </Text>
                  <Text style={[s.riskScore, { color }]}>
                    {Math.round(hazard.score)}
                  </Text>
                  <View
                    style={[s.riskBandPill, { backgroundColor: `${color}15` }]}
                  >
                    <Text style={[s.riskBand, { color }]}>
                      {translateBand(hazard.band)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 5. 16-DAY WEATHER FORECAST TIMELINE */}
      <View style={s.section}>
        <View style={s.sectionHeader2}>
          <View style={s.sectionTitleGroup}>
            <Icon icon={TrendingUpDownIcon} size={20} color={BRAND} />
            <Text style={s.sectionTitle2}>
              16-DAY WEATHER FORECAST TIMELINE
            </Text>
          </View>
        </View>

        {forecastDays.length === 0 ? (
          <Text style={s.noData}>No forecast data available</Text>
        ) : (
          <View style={s.forecastContainer}>
            <View style={s.forecastGrid}>
              {forecastDays.map((day: any, idx: number) => {
                const maxT = Math.round(day.tmax_corrected);
                const minT = Math.round(day.tmin_corrected);
                const span = tempBounds.max - tempBounds.min || 1;
                const barH = 46;
                const fillH = Math.max(((maxT - minT) / span) * barH, 2);
                const topOffset = Math.min(
                  ((tempBounds.max - maxT) / span) * barH,
                  barH - fillH,
                );
                const rain = day.pcp_corrected;
                const d = new Date(day.date);
                const dayName = d.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const dayNum = d.getDate();
                const monthShort = d
                  .toLocaleDateString("en-US", { month: "short" })
                  .toUpperCase();

                return (
                  <View
                    key={idx}
                    style={[s.forecastCol, idx === 0 && s.forecastColFirst]}
                  >
                    <Text style={s.fcMonthNum}>
                      {monthShort} {dayNum}
                    </Text>
                    <Text style={s.fcDayName}>{dayName}</Text>
                    <View style={{ marginVertical: 4 }}>
                      <Icon
                        icon={getWeatherIcon(rain)}
                        size={16}
                        color={BRAND}
                      />
                    </View>
                    <Text style={s.fcMax}>{maxT}°</Text>

                    {/* Range Bar */}
                    <View style={s.fcBarTrack}>
                      {/* We use SVG to draw gradients since RN Views don't support it directly without expo-linear-gradient */}
                      <Svg width={6} height={barH}>
                        <Rect
                          x={0}
                          y={0}
                          width={6}
                          height={barH}
                          fill="#f1f5f9"
                          rx={3}
                        />
                        <Rect
                          x={0}
                          y={topOffset}
                          width={6}
                          height={fillH}
                          fill={BRAND}
                          rx={3}
                        />
                      </Svg>
                    </View>

                    <Text style={s.fcMin}>{minT}°</Text>
                    <Text style={[s.fcRain, rain > 0.1 && s.fcRainActive]}>
                      {rain > 0.1 ? rain.toFixed(1) : "—"}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* 6. SOIL HYDROLOGY & HYDROMETRY */}
      <View style={s.section}>
        <View style={s.sectionHeader2}>
          <View style={s.sectionTitleGroup}>
            <Icon icon={DropletIcon} size={20} color={BRAND} />
            <Text style={s.sectionTitle2}>
              SOIL HYDROLOGY & HYDROMETRY (30-DAY TREND)
            </Text>
          </View>
        </View>

        {soilChartPoints.length === 0 ? (
          <Text style={s.noData}>No soil moisture data available</Text>
        ) : (
          <View style={s.soilContainer}>
            <Svg width={700} height={110} viewBox="0 0 700 110">
              {/* Background bands */}
              <Rect
                x={32}
                y={15}
                width={643}
                height={30}
                fill="#0ea5e9"
                fillOpacity={0.06}
              />
              <Rect
                x={32}
                y={65}
                width={643}
                height={30}
                fill="#f97316"
                fillOpacity={0.06}
              />
              {/* Grid lines */}
              {[15, 55, 95].map((y, i) => (
                <React.Fragment key={i}>
                  <Line
                    x1={32}
                    y1={y}
                    x2={675}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                  />
                  <SvgText
                    x={26}
                    y={y + 3}
                    textAnchor="end"
                    fontSize={9}
                    fill="#94a3b8"
                    fontWeight="bold"
                  >
                    {i === 0 ? "100" : i === 1 ? "50" : "0"}
                  </SvgText>
                </React.Fragment>
              ))}
              {/* Line */}
              <Path
                d={soilChartPath}
                fill="none"
                stroke={BRAND}
                strokeWidth={2}
              />
              {/* Dots */}
              {soilChartPoints.map((p: any, i: number) => (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill={getMoistureColor(p.val)}
                  stroke="#1e293b"
                  strokeWidth={1}
                />
              ))}
              {/* X-axis labels (just taking a few points) */}
              {[0, 9, 19, 29].map((idx) => {
                const p = soilChartPoints[idx];
                if (!p) return null;
                const dateLabel = new Date(p.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                return (
                  <SvgText
                    key={idx}
                    x={p.x}
                    y={108}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#475569"
                    fontWeight="bold"
                  >
                    {dateLabel}
                  </SvgText>
                );
              })}
            </Svg>
            <View style={s.soilLegend}>
              {[
                { l: "DRY", c: "#f97316" },
                { l: "NORMAL", c: "#64748b" },
                { l: "WET", c: "#0ea5e9" },
              ].map((x) => (
                <View key={x.l} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: x.c }]} />
                  <Text style={s.legendText}>{x.l}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 7. CROP SEASONAL CALENDAR CYCLES */}
      <View style={s.section}>
        <View style={s.sectionHeader2}>
          <View style={s.sectionTitleGroup}>
            <Icon icon={Leaf02Icon} size={20} color={BRAND} />
            <Text style={s.sectionTitle2}>CROP SEASONAL CALENDAR CYCLES</Text>
          </View>
        </View>

        {calendar.length === 0 ? (
          <View style={s.emptyCalendar}>
            <Text style={s.emptyCalendarText}>
              No crop cycle calendar configured.
            </Text>
          </View>
        ) : (
          <View style={s.calendarContainer}>
            {calendar.map((event: any, idx: any) => {
              const startSow = event.sowFromMon || 6;
              const endSow = event.sowToMon || startSow;
              const startHarv = event.harvFromMon || 11;
              const endHarv = event.harvToMon || startHarv;
              const sowingSegments = calculateTimelineSegments(
                startSow,
                endSow,
              );
              const harvestingSegments = calculateTimelineSegments(
                startHarv,
                endHarv,
              );
              const growingSegments = calculateTimelineSegments(
                startSow,
                endHarv,
              );

              return (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <View style={s.calEventHeader}>
                    <Text style={s.calEventTitle}>
                      {event.season} LIFECYCLE
                    </Text>
                    <Text style={s.calEventSub}>
                      SOW: MON {startSow}-{endSow} • HARVEST: MON {startHarv}-
                      {endHarv}
                    </Text>
                  </View>
                  <View style={s.calTrack}>
                    <Svg width={700} height={18} viewBox="0 0 700 18">
                      <Rect
                        x={0}
                        y={0}
                        width={700}
                        height={18}
                        fill="#f1f5f9"
                      />

                      {/* Growing segments (yellow/amber) */}
                      {growingSegments.map(
                        (seg, sIdx) =>
                          seg.isVisible && (
                            <Rect
                              key={`g-${sIdx}`}
                              x={`${seg.left}%`}
                              y={0}
                              width={`${seg.width}%`}
                              height={18}
                              fill="#fef3c7"
                            />
                          ),
                      )}

                      {/* Sowing segments (green) */}
                      {sowingSegments.map(
                        (seg, sIdx) =>
                          seg.isVisible && (
                            <Rect
                              key={`s-${sIdx}`}
                              x={`${seg.left}%`}
                              y={0}
                              width={`${seg.width}%`}
                              height={18}
                              fill={BRAND}
                            />
                          ),
                      )}

                      {/* Harvesting segments (red) */}
                      {harvestingSegments.map(
                        (seg, sIdx) =>
                          seg.isVisible && (
                            <Rect
                              key={`h-${sIdx}`}
                              x={`${seg.left}%`}
                              y={0}
                              width={`${seg.width}%`}
                              height={18}
                              fill="#ef4444"
                            />
                          ),
                      )}

                      {/* Month dividers & Labels */}
                      {MONTHS_LABELS.map((m, mIdx) => (
                        <React.Fragment key={mIdx}>
                          {mIdx > 0 && (
                            <Line
                              x1={`${(mIdx / 12) * 100}%`}
                              y1={0}
                              x2={`${(mIdx / 12) * 100}%`}
                              y2={18}
                              stroke="#cbd5e1"
                              strokeWidth={1}
                            />
                          )}
                          <SvgText
                            x={`${(mIdx / 12 + 1 / 24) * 100}%`}
                            y={12}
                            textAnchor="middle"
                            fontSize={9}
                            fill="#64748b"
                            fontWeight="bold"
                          >
                            {m}
                          </SvgText>
                        </React.Fragment>
                      ))}
                    </Svg>
                  </View>
                </View>
              );
            })}
            <View style={s.calLegend}>
              <View style={s.legendItem}>
                <View
                  style={[
                    s.legendDot,
                    { backgroundColor: BRAND, borderRadius: 2 },
                  ]}
                />
                <Text style={s.legendText}>SOWING</Text>
              </View>
              <View style={s.legendItem}>
                <View
                  style={[
                    s.legendDot,
                    { backgroundColor: "#fef3c7", borderRadius: 2 },
                  ]}
                />
                <Text style={s.legendText}>GROWING</Text>
              </View>
              <View style={s.legendItem}>
                <View
                  style={[
                    s.legendDot,
                    { backgroundColor: "#ef4444", borderRadius: 2 },
                  ]}
                />
                <Text style={s.legendText}>HARVESTING</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 8. FOOTER */}
      <View style={s.footer}>
        <Text style={s.footerLeft}>© 2026 FARMRISK CORPORATION</Text>
        <Text style={s.footerRight}>
          DATA VERIFIED AGAINST SATELLITE HYDROLOGY AND BIAS CORRECTIONS{"\n"}
          GENERATED LOCALLY - NOT FOR REGULATORY SUBMISSION
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    width: 794,
    backgroundColor: BG,
    padding: 32,
    borderTopWidth: 10,
    borderTopColor: BRAND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0", // emerald-200
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: BRAND_DARK,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 11,
    color: BRAND,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },
  headerRight: { alignItems: "flex-end", gap: 8 },
  cropBadgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cropBadgeLabel: { fontSize: 10, fontWeight: "700", color: TEXT_LIGHT },
  cropBadge: {
    backgroundColor: "#ecfdf5", // emerald-50
    borderWidth: 1,
    borderColor: "#6ee7b7", // emerald-300
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cropBadgeText: {
    color: BRAND_DARK,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  officialBadge: {
    backgroundColor: BRAND,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  officialBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  infoBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e2e8f0", // slate-200
    borderRadius: 12,
    backgroundColor: "#f8fafc", // slate-50
    marginBottom: 24,
  },
  infoCol: { flex: 1, padding: 16 },
  infoDivider: { width: 1, backgroundColor: "#e2e8f0" },
  infoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: TEXT_MID,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  infoSub: { fontSize: 11, color: TEXT_LIGHT, fontFamily: "monospace" },

  aiBox: {
    borderWidth: 1,
    borderColor: "#a7f3d0", // emerald-200
    backgroundColor: "#ecfdf5", // emerald-50
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: BRAND_DARK,
    letterSpacing: 0.5,
  },
  aiDivider: {
    height: 1,
    backgroundColor: "#6ee7b7",
    opacity: 0.5,
    marginBottom: 12,
  },
  aiText: { fontSize: 12, color: BRAND_DARK, lineHeight: 18 },

  section: { marginBottom: 24 },
  sectionHeader2: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
    marginBottom: 16,
  },
  sectionTitleGroup: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle2: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: 0.5,
  },

  riskContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
  },
  riskOverallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  riskOverallText: {
    fontSize: 10,
    fontWeight: "800",
    color: TEXT_MID,
    letterSpacing: 0.5,
  },
  riskOverallBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  riskOverallBadgeText: { fontSize: 11, fontWeight: "800" },
  riskGrid: { flexDirection: "row", gap: 8 },
  riskCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  riskName: {
    fontSize: 9,
    fontWeight: "800",
    color: TEXT_DARK,
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  riskScore: { fontSize: 18, fontWeight: "900", marginBottom: 6 },
  riskBandPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  riskBand: { fontSize: 8, fontWeight: "800" },

  forecastContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
  },
  forecastGrid: { flexDirection: "row" },
  forecastCol: {
    flex: 1,
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#f1f5f9",
  },
  forecastColFirst: {
    borderLeftWidth: 0,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: -8,
    marginBottom: -8,
  },
  fcMonthNum: {
    fontSize: 8,
    fontWeight: "800",
    color: TEXT_LIGHT,
    letterSpacing: 0.5,
  },
  fcDayName: {
    fontSize: 11,
    fontWeight: "900",
    color: TEXT_DARK,
    marginTop: 2,
    marginBottom: 2,
  },
  fcMax: { fontSize: 12, fontWeight: "900", color: "#e11d48" }, // rose-600
  fcBarTrack: { marginVertical: 4, height: 46, alignItems: "center" },
  fcMin: { fontSize: 11, fontWeight: "800", color: "#0369a1" }, // sky-700
  fcRain: { fontSize: 9, fontWeight: "700", color: TEXT_LIGHT, marginTop: 4 },
  fcRainActive: { color: "#0369a1" },

  soilContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
  },
  soilLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  emptyCalendar: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyCalendarText: { fontSize: 11, color: TEXT_LIGHT, fontStyle: "italic" },
  calendarContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
  },
  calEventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6,
  },
  calEventTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: TEXT_MID,
    letterSpacing: 0.5,
  },
  calEventSub: { fontSize: 9, fontWeight: "700", color: TEXT_LIGHT },
  calTrack: {
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  calLegend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#64748b",
  },
  legendText: {
    fontSize: 9,
    fontWeight: "800",
    color: TEXT_MID,
    letterSpacing: 0.5,
  },

  noData: {
    fontSize: 11,
    color: TEXT_LIGHT,
    fontStyle: "italic",
    textAlign: "center",
    padding: 24,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  footerLeft: { fontSize: 9, fontWeight: "800", color: TEXT_MID },
  footerRight: {
    fontSize: 8,
    fontWeight: "700",
    color: TEXT_MID,
    textAlign: "right",
    lineHeight: 12,
  },
});
