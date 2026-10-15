import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { i18n } from "@/i18n";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarkdownViewer } from "@/components/ui/MarkdownViewer";
import { LockedCard } from "@/components/ui/LockedCard";
import { usePreSowingAdvisory } from "@/hooks/usePreSowingAdvisory";
import { useSoilDetection } from "@/hooks/useSoilDetection";
import { useLocked } from "@/hooks/useLocked";
import { useCropContext } from "@/providers/CropProvider";
import { useLocationContext } from "@/providers/LocationProvider";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { NearestKVKSection } from "@/components/tools/NearestKVKSection";
import { useNearestKVK } from "@/hooks/useNearestKVK";
import { generatePreSowingPDF } from "@/lib/pdf/presowingPdf";
import { getCleanCropName } from "@/constants/categorizedCrops";

// Icons
import Calendar01Icon from "@hugeicons/core-free-icons/Calendar01Icon";
import Plant01Icon from "@hugeicons/core-free-icons/Plant01Icon";
import File01Icon from "@hugeicons/core-free-icons/File01Icon";
import AnalyticsUpIcon from "@hugeicons/core-free-icons/AnalyticsUpIcon";
import CloudRainIcon from "@hugeicons/core-free-icons/CloudRainIcon";
import Alert01Icon from "@hugeicons/core-free-icons/Alert01Icon";
import Shield01Icon from "@hugeicons/core-free-icons/Shield01Icon";
import SparklesIcon from "@hugeicons/core-free-icons/SparklesIcon";
import Download01Icon from "@hugeicons/core-free-icons/Download01Icon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import ArrowUp01Icon from "@hugeicons/core-free-icons/ArrowUp01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";
import Location01Icon from "@hugeicons/core-free-icons/Location01Icon";
import Layers01Icon from "@hugeicons/core-free-icons/Layers01Icon";
import Globe02Icon from "@hugeicons/core-free-icons/Globe02Icon";
import { Icon } from "@/components/ui/Icon";

const INDIAN_STATES = [
  "Andaman & Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra & Nagar Haveli",
  "Daman & Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function extractStateFromLocation(displayName?: string): string {
  if (!displayName) return "Gujarat";
  const lower = displayName.toLowerCase();
  for (const st of INDIAN_STATES) {
    if (lower.includes(st.toLowerCase())) {
      return st;
    }
  }
  const parts = displayName.split(",").map((p) => p.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part.toLowerCase() === "india" || /^\d{5,6}$/.test(part)) continue;
    const match = INDIAN_STATES.find(
      (s) => s.toLowerCase() === part.toLowerCase(),
    );
    if (match) return match;
  }
  return "Gujarat";
}

export const SOIL_TYPE_OPTIONS = [
  { value: "black cotton soil", label: "Black Cotton Soil (Regur)" },
  { value: "alluvial", label: "Alluvial Soil" },
  { value: "red soil", label: "Red Soil" },
  { value: "loam", label: "Loam Soil" },
  { value: "sandy loam", label: "Sandy Loam" },
  { value: "clay", label: "Clay Soil" },
  { value: "laterite", label: "Laterite Soil" },
  { value: "saline", label: "Saline Soil" },
  { value: "alkaline", label: "Alkaline Soil" },
];

const SEASONS = [
  { value: "Kharif", label: "Kharif (Monsoon / Summer)" },
  { value: "Rabi", label: "Rabi (Winter)" },
  { value: "Zaid", label: "Zaid (Summer)" },
];

const IRRIGATION_TYPES = [
  { value: "flood", label: "Flood / Furrow" },
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "rainfed", label: "Rainfed (No Irrigation)" },
];

// Dropdown component with floating overlay
function DropdownSelector({
  label,
  options,
  selected,
  onSelect,
  isOpen,
  onToggle,
  zIndex = 1,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  zIndex?: number;
}) {
  const selectedLabel =
    options.find((opt) => opt.value === selected)?.label || selected;

  return (
    <View
      className="mb-3.5"
      style={{
        position: "relative",
        zIndex: isOpen ? 100 : zIndex,
        elevation: isOpen ? 10 : zIndex,
      }}
    >
      <Text className="text-xs font-semibold text-muted-foreground mb-1.5 px-0.5 uppercase tracking-wider">
        {label}
      </Text>

      {/* Trigger Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        className="w-full bg-background border border-border rounded-2xl px-4 py-3 flex-row items-center justify-between"
      >
        <Text className="text-sm font-semibold text-foreground flex-1 pr-2">
          {selectedLabel}
        </Text>
        <Icon
          icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
          size={18}
          className="text-muted-foreground"
        />
      </TouchableOpacity>

      {/* Floating Dropdown Options List */}
      {isOpen && (
        <View
          className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 4,
            zIndex: 1000,
            elevation: 20,
          }}
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 200 }}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {options.map((item) => {
              const isSelected = selected === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item.value);
                    onToggle();
                  }}
                  className={`flex-row items-center justify-between px-4 py-3 border-b border-border last:border-b-0 ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Text>

                  {isSelected && (
                    <Icon
                      icon={Tick02Icon}
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export function PreSowingSection() {
  const { t } = useTranslation(["common"]);
  const { isLocked } = useLocked();
  const { selectedCrop } = useCropContext();
  const { location, isResolving } = useLocationContext();

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Derived state from location
  const selectedState = useMemo(() => {
    return extractStateFromLocation(location?.displayName || location?.name);
  }, [location?.displayName, location?.name]);

  // Auto-detect soil from GPS
  const { detectedSoil, isDetectingSoil } = useSoilDetection();

  const [soilType, setSoilType] = useState<string>("black cotton soil");
  const [season, setSeason] = useState<string>("Kharif");
  const [irrigationType, setIrrigationType] = useState<string>("flood");

  // Submitted parameters (only populated when clicking Generate Advisory; default empty)
  const [submittedParams, setSubmittedParams] = useState<{
    crop: string;
    state: string;
    soilType: string;
    season: string;
    irrigationType: string;
    language: string;
  } | null>(null);

  // Automatically update soilType when GPS soil detection completes
  useEffect(() => {
    if (detectedSoil?.soil_type) {
      const detected = detectedSoil.soil_type.toLowerCase();
      const match = SOIL_TYPE_OPTIONS.find(
        (opt) =>
          detected.includes(opt.value.toLowerCase()) ||
          opt.value.toLowerCase().includes(detected),
      );
      if (match) {
        setSoilType(match.value);
      } else {
        setSoilType(detected);
      }
    }
  }, [detectedSoil]);

  const effectiveCrop = getCleanCropName(selectedCrop) || "Cotton";

  const { data, isLoading, isFetching, isError, refetch } = usePreSowingAdvisory({
    crop: submittedParams?.crop ?? effectiveCrop,
    state: submittedParams?.state ?? selectedState,
    soil_type: submittedParams?.soilType ?? soilType,
    season: submittedParams?.season ?? season,
    irrigation_type: submittedParams?.irrigationType ?? irrigationType,
    language: submittedParams?.language ?? i18n.language,
    enabled: Boolean(submittedParams),
  });

  const isGenerating = Boolean(submittedParams) && (isLoading || isFetching);
  const sectionsData = data?.sections || {};

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const { kvkData } = useNearestKVK();

  const hasAdvisoryData = Boolean(
    sectionsData &&
      Object.values(sectionsData).some(
        (val) => typeof val === "string" && val.trim().length > 0,
      ),
  );

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf || !hasAdvisoryData) return;
    setIsDownloadingPdf(true);
    try {
      const kvkItem = kvkData?.district_kvk || kvkData?.nearest;
      await generatePreSowingPDF({
        cropName: effectiveCrop,
        stateName: submittedParams?.state || selectedState,
        soilType: submittedParams?.soilType || currentSoilLabel,
        season: submittedParams?.season || season,
        irrigationType: submittedParams?.irrigationType || irrigationType,
        language: submittedParams?.language || i18n.language,
        ragSourcesUsed: data?.rag_sources_used || 6,
        sections: sectionsData,
        kvk: kvkItem
          ? {
              name: kvkItem.kvk,
              district: kvkItem.district,
              state: kvkItem.state,
              host: kvkItem.host,
              email: kvkItem.email,
              phone: kvkItem.phone,
            }
          : null,
      });
    } catch (err) {
      console.error("Failed to generate Pre-Sowing PDF", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    setOpenDropdown(null);
    const newParams = {
      crop: effectiveCrop,
      state: selectedState,
      soilType: soilType,
      season: season,
      irrigationType: irrigationType,
      language: i18n.language,
    };
    const isSameParams =
      submittedParams &&
      submittedParams.crop === newParams.crop &&
      submittedParams.state === newParams.state &&
      submittedParams.soilType === newParams.soilType &&
      submittedParams.season === newParams.season &&
      submittedParams.irrigationType === newParams.irrigationType &&
      submittedParams.language === newParams.language;

    setSubmittedParams(newParams);
    if (isSameParams) {
      refetch();
    }
  };

  if (isLocked) {
    return (
      <View className="mt-2 pb-12">
        <LockedCard
          title="Pre-Sowing Agronomic Intelligence"
          description="Sowing window calculations, seed variety recommendations, personalized fertilizer and irrigation schedules, and downloadable advisory reports are exclusive to registered accounts. Please sign in to access."
        />
      </View>
    );
  }

  if (!location && !isResolving) {
    return (
      <View className="mt-2 pb-12">
        <NoLocationCard message="Select a location to calculate optimal sowing window and moisture readiness." />
      </View>
    );
  }

  const currentSoilLabel =
    SOIL_TYPE_OPTIONS.find((s) => s.value === soilType)?.label ||
    detectedSoil?.soil_type ||
    soilType;

  return (
    <View className="mt-2 pb-12" style={{ position: "relative" }}>
      {/* Tap outside backdrop when dropdown is open */}
      {openDropdown && (
        <TouchableWithoutFeedback onPress={() => setOpenDropdown(null)}>
          <View
            style={{
              position: "absolute",
              top: -500,
              bottom: -2000,
              left: -500,
              right: -500,
              zIndex: 30,
            }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Parameters Configuration Panel */}
      <View
        className="bg-card border border-border rounded-3xl p-4 my-4 mb-5"
        style={{
          zIndex: openDropdown ? 50 : 1,
          elevation: openDropdown ? 5 : 1,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-3.5 pb-3.5 border-b border-border">
          <View
            className="w-11 h-11 rounded-2xl items-center justify-center border border-border"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}
          >
            <Icon
              icon={Plant01Icon}
              size={22}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {t("preSowing")}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              Configure season and irrigation to generate ICAR agronomic guidance.
            </Text>
          </View>
        </View>

        {/* Context Badges Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          className="mb-4"
        >
          {/* Crop Badge */}
          <View
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: "rgba(16, 185, 129, 0.12)",
              borderColor: "rgba(16, 185, 129, 0.25)",
            }}
          >
            <Icon
              icon={Plant01Icon}
              size={13}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {effectiveCrop}
            </Text>
          </View>

          {/* Region / State Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
            <Icon
              icon={Location01Icon}
              size={13}
              className="text-muted-foreground"
            />
            <Text className="text-xs font-semibold text-foreground">
              {selectedState}
            </Text>
          </View>

          {/* Detected Soil Badge */}
          <View
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.12)",
              borderColor: "rgba(245, 158, 11, 0.25)",
            }}
          >
            <Icon
              icon={Layers01Icon}
              size={13}
              className="text-amber-600 dark:text-amber-500"
            />
            {isDetectingSoil ? (
              <ActivityIndicator
                size="small"
                color="#d97706"
                style={{ transform: [{ scale: 0.65 }] }}
              />
            ) : (
              <Text className="text-xs font-semibold text-amber-700 dark:text-amber-300 capitalize">
                {currentSoilLabel}
              </Text>
            )}
          </View>

          {/* Language Badge */}
          <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
            <Icon
              icon={Globe02Icon}
              size={13}
              className="text-muted-foreground"
            />
            <Text className="text-xs font-semibold text-muted-foreground uppercase">
              {i18n.language}
            </Text>
          </View>
        </ScrollView>

        {/* Input Selectors (Unhidden from settings) */}
        <View style={{ zIndex: openDropdown ? 60 : 1 }}>
          {/* Season Dropdown */}
          <DropdownSelector
            label="Season"
            options={SEASONS}
            selected={season}
            onSelect={setSeason}
            isOpen={openDropdown === "season"}
            onToggle={() => toggleDropdown("season")}
            zIndex={openDropdown === "season" ? 100 : 20}
          />

          {/* Irrigation Dropdown */}
          <DropdownSelector
            label="Irrigation Method"
            options={IRRIGATION_TYPES}
            selected={irrigationType}
            onSelect={setIrrigationType}
            isOpen={openDropdown === "irrigation"}
            onToggle={() => toggleDropdown("irrigation")}
            zIndex={openDropdown === "irrigation" ? 100 : 10}
          />
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row items-center gap-2.5 mt-2.5">
          {/* Download PDF Button */}
          <TouchableOpacity
            onPress={handleDownloadPdf}
            disabled={isGenerating || isDownloadingPdf || !hasAdvisoryData}
            activeOpacity={0.8}
            className="flex-1 rounded-2xl py-3.5 px-3 flex-row items-center justify-center gap-1.5 border"
            style={{
              opacity: isGenerating || isDownloadingPdf || !hasAdvisoryData ? 0.45 : 1,
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              borderColor: "rgba(16, 185, 129, 0.35)",
            }}
          >
            {isDownloadingPdf ? (
              <>
                <ActivityIndicator size="small" color="#059669" />
                <Text
                  className="font-bold text-xs text-emerald-700 dark:text-emerald-400"
                  numberOfLines={1}
                >
                  Preparing PDF...
                </Text>
              </>
            ) : (
              <>
                <Icon
                  icon={Download01Icon}
                  size={17}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <Text
                  className="font-bold text-xs text-emerald-700 dark:text-emerald-400"
                  numberOfLines={1}
                >
                  Download PDF
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Generate Advisory Button */}
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.8}
            className="flex-1 rounded-2xl py-3.5 px-3 flex-row items-center justify-center gap-1.5 bg-emerald-600 shadow-sm"
            style={{ opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text
                  className="text-white font-bold text-xs"
                  numberOfLines={1}
                >
                  Generating...
                </Text>
              </>
            ) : (
              <>
                <Icon icon={SparklesIcon} size={17} color="#ffffff" />
                <Text
                  className="text-white font-bold text-xs"
                  numberOfLines={1}
                >
                  Generate Advisory
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 1. Sowing window/timeline */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Calendar01Icon} title="Sowing window/timeline" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.sowing_window}
            isLoading={isGenerating}
            isError={isError}
            errorMessage="Failed to load sowing window guidelines."
            emptyMessage="No sowing window available yet"
            emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
          />
        </View>
      </View>

      {/* 2. Seed selection */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Plant01Icon} title="Seed selection" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.seed_selection}
            isLoading={isGenerating}
            isError={isError}
            errorMessage="Failed to load seed selection guidelines."
            emptyMessage="No seed recommendations yet"
            emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
          />
        </View>
      </View>

      {/* 3. Field preparation */}
      <View className="mb-6 px-3">
        <SectionHeader icon={File01Icon} title="Field preparation" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.field_preparation}
            isLoading={isGenerating}
            isError={isError}
            errorMessage="Failed to load field preparation guidelines."
            emptyMessage="No field preparation data yet"
            emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
          />
        </View>
      </View>

      {/* 4. Fertilizer plan (Pro Feature) */}
      <View className="mb-6 px-3">
        <SectionHeader icon={AnalyticsUpIcon} title="Fertilizer plan" />
        {isLocked ? (
          <LockedCard
            title="Pro Feature"
            description="Unlock advanced Fertilizer Plans tailored to your soil data."
          />
        ) : (
          <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
            <MarkdownViewer
              content={sectionsData.fertilizer_plan}
              isLoading={isGenerating}
              isError={isError}
              errorMessage="Failed to load fertilizer plan."
              emptyMessage="No fertilizer plan yet"
              emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
            />
          </View>
        )}
      </View>

      {/* 5. Irrigation schedule (Pro Feature) */}
      <View className="mb-6 px-3">
        <SectionHeader icon={CloudRainIcon} title="Irrigation schedule" />
        {isLocked ? (
          <LockedCard
            title="Pro Feature"
            description="Unlock smart Irrigation Schedules based on hyper-local weather."
          />
        ) : (
          <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
            <MarkdownViewer
              content={sectionsData.irrigation}
              isLoading={isGenerating}
              isError={isError}
              errorMessage="Failed to load irrigation schedule."
              emptyMessage="No irrigation schedule yet"
              emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
            />
          </View>
        )}
      </View>

      {/* 6. Weed management */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Alert01Icon} title="Weed management" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.weed_management}
            isLoading={isGenerating}
            isError={isError}
            errorMessage="Failed to load weed management guidelines."
            emptyMessage="No weed management guidelines yet"
            emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
          />
        </View>
      </View>

      {/* 7. Pest & disease calendar */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Shield01Icon} title="Pest & disease calendar" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.pest_disease}
            isLoading={isGenerating}
            isError={isError}
            errorMessage="Failed to load pest & disease calendar."
            emptyMessage="No pest & disease calendar yet"
            emptySubtext="Choose season & irrigation method above, then tap 'Generate Advisory'."
          />
        </View>
      </View>

      {/* 8. Nearest Krishi Vigyan Kendra (KVK) Guidance */}
      <NearestKVKSection />
    </View>
  );
}

export default PreSowingSection;
