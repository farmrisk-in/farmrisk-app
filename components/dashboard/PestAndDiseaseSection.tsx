import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { i18n } from "@/i18n";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { usePestDisease } from "@/hooks/usePestDisease";
import { useCropContext } from "@/providers/CropProvider";
import { useForecast } from "@/hooks/useForecast";
import { useWeather } from "@/hooks/useWeather";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import {
  Bug01Icon,
  Book02Icon,
  Cancel01Icon,
  EyeIcon,
  CloudFastWindIcon,
  RainDropIcon,
  Delete01Icon,
  Leaf01Icon,
  Plant01Icon,
  ThermometerWarmIcon,
} from "@hugeicons/core-free-icons";
import type { PestDiseaseCardResponse } from "@/types/pestDisease";

interface PestAndDiseaseSectionProps {
  crop?: string;
}

function getRiskColor(band?: string) {
  switch (band?.toLowerCase()) {
    case "extreme":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "moderate":
      return "#eab308";
    case "low":
      return "#10b981";
    case "minimal":
    default:
      return "#10b981";
  }
}

/** Controlled agricultural entity phrases for summary & action highlight. */
const ENV_RISK_TERMS = [
  "high humidity",
  "low humidity",
  "warm temperatures",
  "warm temperature",
  "high temperature",
  "high temperatures",
  "wet soil",
  "wet soil conditions",
  "prolonged wetness",
  "heavy rainfall",
  "heavy rain",
  "high rainfall",
  "waterlogging",
  "waterlogged",
  "soil moisture",
  "drought stress",
  "excess moisture",
  "excessive moisture",
  "prolonged rain",
  "rainy conditions",
];

const PEST_DISEASE_TERMS = [
  "sucking pests",
  "sucking pest",
  "bollworms",
  "bollworm",
  "fall armyworm",
  "aphids",
  "aphid",
  "jassids",
  "jassid",
  "whiteflies",
  "whitefly",
  "thrips",
  "stem borers",
  "stem borer",
  "shoot borers",
  "shoot borer",
  "fruit borers",
  "fruit borer",
  "pod borers",
  "pod borer",
  "leaf hoppers",
  "leaf hopper",
  "leaf miner",
  "spider mites",
  "cutworms",
  "earworms",
  "root and stem rot",
  "root rot",
  "stem rot",
  "leaf spot",
  "alternaria",
  "anthracnose",
  "powdery mildew",
  "downy mildew",
  "fungal diseases",
  "fungal disease",
  "fungal pathogens",
  "fungal pathogen",
  "bacterial diseases",
  "bacterial disease",
  "viral diseases",
  "viral disease",
  "blight",
  "wilt",
  "rust",
  "smut",
  "mildew",
];

const STAGE_SEASON_TERMS = [
  "kharif",
  "rabi",
  "zaid",
  "flowering stage",
  "boll formation stage",
  "vegetative stage",
  "fruiting stage",
  "sowing stage",
  "seedling stage",
];

const CROP_NAME_TERMS = [
  "castor",
  "cotton",
  "maize",
  "pearlmillet",
  "pearl millet",
  "wheat",
  "rice",
  "sorghum",
  "groundnut",
  "soybean",
  "sugarcane",
  "pigeonpea",
  "chickpea",
  "mungbean",
  "blackgram",
  "mustard",
];

function buildHighlightTerms(
  card: PestDiseaseCardResponse | undefined,
  isGeneral: boolean,
): string[] {
  const set = new Set<string>();
  if (!isGeneral && card?.crop_name) set.add(card.crop_name);

  for (const p of card?.potential ?? []) {
    const v = String(p ?? "").trim();
    if (v) set.add(v);
  }

  if (card?.season) set.add(card.season);

  const stage = String(card?.crop_stage ?? "").trim();
  if (stage && !/unknown|not known|n\/a/i.test(stage)) set.add(stage);

  for (const t of [
    ...CROP_NAME_TERMS,
    ...PEST_DISEASE_TERMS,
    ...ENV_RISK_TERMS,
    ...STAGE_SEASON_TERMS,
  ]) {
    set.add(t);
  }

  return Array.from(set);
}

function getActionIcon(title: string) {
  const t = (title || "").toLowerCase();
  if (/air|flow|spacing|prun|foliage|ventilat|wind/i.test(t))
    return CloudFastWindIcon;
  if (/inspect|scout|check|monitor|look|underside|examin|sign|watch/i.test(t))
    return EyeIcon;
  if (/drain|waterlog|water|moisture|drainage|irrigat|rain/i.test(t))
    return RainDropIcon;
  if (/pest|insect|bug|bollworm|aphid|jassid|whitefly|suck|infest/i.test(t))
    return Bug01Icon;
  if (/weed|residue|remove|clean|destroy/i.test(t)) return Delete01Icon;
  return Leaf01Icon;
}

function renderHighlightedText(text: string, terms: string[]) {
  if (!text) return null;
  const unique = Array.from(
    new Set(
      terms
        .map((t) => t.trim())
        .filter((t) => t.length >= 2)
        .sort((a, b) => b.length - a.length),
    ),
  );

  if (unique.length === 0) {
    return <Text className="text-sm text-foreground leading-6">{text}</Text>;
  }

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${unique.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <Text className="text-sm text-foreground leading-6">
      {parts.map((part, i) => {
        const isMatch = unique.some(
          (t) => t.toLowerCase() === part.toLowerCase(),
        );
        if (isMatch) {
          return (
            <Text
              key={i}
              className="font-bold text-emerald-600 dark:text-emerald-400"
            >
              {part}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
}

export function PestAndDiseaseSection({ crop }: PestAndDiseaseSectionProps) {
  const { t: tDash } = useTranslation(["dashboard"]);
  const { selectedCrop } = useCropContext();
  const activeCrop = crop || selectedCrop || "general";

  const {
    data: card,
    isLoading: isCardLoading,
    isFetching,
    error: cardError,
  } = usePestDisease(activeCrop, i18n.language);

  // Forecast, weather and soil data for live conditions pills
  const { forecastRows, isLoading: isForecastLoading } = useForecast();
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const { data: soilData, isLoading: isSoilLoading } =
    useSoilMoisture(activeCrop);

  const [modalVisible, setModalVisible] = useState(false);

  const isStaleCrop =
    isFetching && card?.crop_id && card.crop_id !== activeCrop;
  const isLoading = isCardLoading || isStaleCrop;

  const band = card?.risk || "LOW";
  const color = getRiskColor(band);
  const isGeneral = card?.is_general ?? activeCrop.toLowerCase() === "general";
  const sources = card?.potential_sources || card?.sources || [];
  const actions = card?.actions || [];
  const potential = card?.potential || [];

  const summaryTerms = useMemo(
    () => buildHighlightTerms(card, isGeneral),
    [card, isGeneral],
  );

  // Live environmental metrics
  // API returns either a raw SoilMoistureRow[] or { soil_moisture: SoilMoistureRow[] }
  const soilRows: any[] = Array.isArray(soilData)
    ? soilData
    : (soilData?.soil_moisture ?? []);
  // Filter to historical rows (is_forecast == 0 or false). Fall back to last row if none found.
  const historicalRows = soilRows.filter(
    // eslint-disable-next-line eqeqeq
    (r: any) => r.is_forecast == 0 || r.is_forecast === false,
  );
  const latestHistoricalRow = (
    historicalRows.length > 0 ? historicalRows : soilRows
  ).at(-1);
  const soilPercentile = (latestHistoricalRow as any)?.sm_percentile ?? null;

  const next5Rows = forecastRows.slice(0, 5);
  const rainNext5 =
    next5Rows.length > 0
      ? next5Rows.map((r: any) => r.pcp_corrected ?? r.pcp ?? 0)
      : (weatherData?.daily?.precipitation_sum?.slice(0, 5) ?? null);

  const avgMaxTemp =
    next5Rows.length > 0
      ? next5Rows.reduce(
          (sum: number, r: any) => sum + (r.tmax_corrected ?? r.tmax ?? 0),
          0,
        ) / next5Rows.length
      : weatherData?.daily?.temperature_2m_max &&
          weatherData.daily.temperature_2m_max.length > 0
        ? weatherData.daily.temperature_2m_max.reduce(
            (a: number, b: number) => a + b,
            0,
          ) / weatherData.daily.temperature_2m_max.length
        : null;

  const humidity = weatherData?.current?.relative_humidity_2m ?? null;
  const rainTotal = rainNext5
    ? rainNext5.reduce((a: number, b: number) => a + (b ?? 0), 0)
    : null;
  const rainyDays = rainNext5
    ? rainNext5.filter((v: number) => v != null && v >= 1).length
    : null;

  const wetDaysLabel =
    rainyDays != null && rainyDays === 1
      ? tDash("pestWetDay")
      : tDash("pestWetDays");

  const Pill = ({
    icon,
    label,
    value,
    sub,
    colorTheme,
  }: {
    icon: any;
    label: string;
    value: string;
    sub?: string;
    colorTheme: { bg: string; text: string; icon: string };
  }) => (
    <View
      className={`flex flex-col gap-1.5 rounded-3xl p-3.5 w-[48%] ${colorTheme.bg}`}
    >
      <View className="flex-row items-center gap-1.5">
        <Icon icon={icon} size={16} className={`shrink-0 ${colorTheme.icon}`} />
        <Text
          className={`uppercase tracking-wide text-xs font-bold flex-1 ${colorTheme.icon}`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        className={`text-lg font-extrabold leading-none mt-1 ${colorTheme.text}`}
      >
        {value}
      </Text>
      {sub && (
        <Text
          className={`text-xs font-medium leading-none opacity-80 ${colorTheme.text}`}
        >
          {sub}
        </Text>
      )}
    </View>
  );

  return (
    <View className="my-6 px-2">
      {/* Section Header */}
      <SectionHeader
        icon={Bug01Icon}
        title={tDash("hazardPest")}
        rightContent={
          <View className="flex-row items-center gap-2">
            {!isGeneral && sources.length > 0 && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <View className="flex-row rounded-xl gap-1 px-2.5 py-1 items-center bg-emerald-100 dark:bg-emerald-900/50">
                  <Icon icon={Book02Icon} size={13} color="#059669" />
                  <Text className="font-bold text-[10px] uppercase text-emerald-700 dark:text-emerald-300">
                    {tDash("sources")}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            <View
              style={{ backgroundColor: color + "20" }}
              className="px-2.5 py-1 rounded-lg items-center justify-center"
            >
              <Text
                style={{ color }}
                className="text-xs font-extrabold uppercase tracking-widest leading-none"
              >
                {tDash(`risk${band}` as any, band)}
              </Text>
            </View>
          </View>
        }
      />

      {/* Main Advisory Box */}
      <View className="gap-4">
        {isLoading ? (
          <View className="py-8 items-center justify-center gap-3">
            <ActivityIndicator size="small" color="#059669" />
          </View>
        ) : cardError ? (
          <View className="py-3">
            <Text className="text-xs text-muted-foreground">
              {tDash("advisoryError") || "Could not generate pest advisory."}
            </Text>
          </View>
        ) : (
          <>
            {/* Driver / Major Factor */}
            {card?.driver && (
              <View
                className="p-3 rounded-2xl"
                style={{ backgroundColor: color + "20" }}
              >
                <Text className="text-xs font-semibold text-foreground">
                  {card.driver}
                </Text>
              </View>
            )}

            {/* Summary Narrative with Term Highlighting */}
            {card?.summary && (
              <View
                className="border-l-4 pl-3 py-1"
                style={{ borderColor: color }}
              >
                {renderHighlightedText(card.summary, summaryTerms)}
              </View>
            )}

            {/* Potential Pests & Diseases Tags */}
            {potential.length > 0 && (
              <View className="gap-1.5">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tDash("pestPotential") || "Potential Pests & Diseases"}
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {potential.map((p, idx) => (
                    <View
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30"
                    >
                      <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {p}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Recommended Actions */}
            {actions.length > 0 && (
              <View className="gap-2.5 pt-1">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {tDash("pestActions") || "Recommended Actions"}
                </Text>
                <View className="gap-2.5">
                  {actions.map((action, i) => {
                    const ActionIcon = getActionIcon(action.title);
                    return (
                      <View
                        key={i}
                        className="flex-row items-start gap-3 p-3 rounded-2xl bg-card border border-border"
                      >
                        <Icon icon={ActionIcon} size={22} color={color} />

                        <View className="flex-1 gap-0.5">
                          <Text className="text-sm font-bold text-foreground">
                            {action.title}
                          </Text>
                          {action.detail && (
                            <View className="mt-0.5">
                              {renderHighlightedText(
                                action.detail,
                                summaryTerms,
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* CURRENT CONDITIONS PILLS */}
      {/*<View className="mt-4">
        <Text className="text-sm font-extrabold text-foreground my-2.5 pl-1">
          {tDash("pestCurrentConditions")}
        </Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          <Pill
            icon={ThermometerWarmIcon}
            label={tDash("pestAvgMaxTemp")}
            value={avgMaxTemp != null ? `${avgMaxTemp.toFixed(1)}°C` : "–"}
            sub={tDash("pestNext5Days")}
            colorTheme={{
              bg: "bg-orange-500/10 dark:bg-orange-500/15",
              text: "text-orange-700 dark:text-orange-300",
              icon: "text-orange-600 dark:text-orange-400",
            }}
          />
          <Pill
            icon={RainDropIcon}
            label={tDash("pestHumidity")}
            value={humidity != null ? `${Math.round(humidity)}%` : "–"}
            sub={tDash("pestCurrent")}
            colorTheme={{
              bg: "bg-purple-500/10 dark:bg-purple-500/15",
              text: "text-purple-700 dark:text-purple-300",
              icon: "text-purple-600 dark:text-purple-400",
            }}
          />
          <Pill
            icon={RainDropIcon}
            label={tDash("pestRain")}
            value={rainTotal != null ? `${rainTotal.toFixed(1)} mm` : "–"}
            sub={rainyDays != null ? `${rainyDays} ${wetDaysLabel}` : undefined}
            colorTheme={{
              bg: "bg-sky-500/10 dark:bg-sky-500/15",
              text: "text-sky-700 dark:text-sky-300",
              icon: "text-sky-600 dark:text-sky-400",
            }}
          />
          <Pill
            icon={Plant01Icon}
            label={tDash("pestSoilMoisture")}
            value={
              soilPercentile != null ? `${Math.round(soilPercentile)}%` : "–"
            }
            sub={tDash("pestPercentile")}
            colorTheme={{
              bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
              text: "text-emerald-700 dark:text-emerald-300",
              icon: "text-emerald-600 dark:text-emerald-400",
            }}
          />
        </View>
      </View>*/}

      {/* Sources Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center px-4"
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View className="bg-card w-full max-h-[80%] rounded-3xl p-5 border border-border shadow-lg">
              <View className="flex flex-row gap-3 mb-3">
                <View className="w-10 h-10 rounded-xl items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                  <Icon icon={Book02Icon} size={22} color="#059669" />
                </View>
                <View className="flex-row items-center gap-3 grow">
                  <View>
                    <Text className="text-lg font-bold text-foreground">
                      {tDash("retrievedSources") || "Retrieved Sources"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="p-2 bg-muted rounded-full ml-auto"
                >
                  <Icon
                    icon={Cancel01Icon}
                    size={18}
                    className="text-foreground"
                  />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} className="mb-1">
                <View className="gap-2 mt-2">
                  {Array.from(
                    new Set(
                      sources.map(
                        (s: any) =>
                          s.source ||
                          tDash("icarGuideline") ||
                          "ICAR Guideline",
                      ),
                    ),
                  ).map((sourceName: string, idx: number) => (
                    <View
                      key={idx}
                      className="p-3 rounded-xl border border-border bg-emerald-50/10 dark:bg-emerald-950/20 flex-row items-center gap-2.5"
                    >
                      <View className="w-2 h-2 rounded-full bg-emerald-500" />
                      <Text className="text-xs font-mono text-foreground flex-1">
                        {sourceName}
                      </Text>
                    </View>
                  ))}
                  {sources.length === 0 && (
                    <Text className="text-muted-foreground text-center py-4 text-xs">
                      {tDash("noSources") || "No specific sources cited."}
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
