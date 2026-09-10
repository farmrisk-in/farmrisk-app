import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  useColorScheme,
} from "react-native";
import { useTranslation } from "react-i18next";
import { i18n } from "@/i18n";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MarkdownViewer } from "@/components/ui/MarkdownViewer";
import { LockedCard } from "@/components/ui/LockedCard";
import { usePreSowingAdvisory } from "@/hooks/usePreSowingAdvisory";
import { useLocked } from "@/hooks/useLocked";
import { useCropContext } from "@/providers/CropProvider";
import { useLocationContext } from "@/providers/LocationProvider";

// Icons
import Calendar01Icon from "@hugeicons/core-free-icons/Calendar01Icon";
import Plant01Icon from "@hugeicons/core-free-icons/Plant01Icon";
import File01Icon from "@hugeicons/core-free-icons/File01Icon";
import AnalyticsUpIcon from "@hugeicons/core-free-icons/AnalyticsUpIcon";
import CloudRainIcon from "@hugeicons/core-free-icons/CloudRainIcon";
import Alert01Icon from "@hugeicons/core-free-icons/Alert01Icon";
import Shield01Icon from "@hugeicons/core-free-icons/Shield01Icon";
import Settings01Icon from "@hugeicons/core-free-icons/Settings01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import ArrowUp01Icon from "@hugeicons/core-free-icons/ArrowUp01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";
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

const SOIL_TYPES = [
  "black cotton soil",
  "sandy loam",
  "clay",
  "loam",
  "laterite",
  "alluvial",
  "red soil",
  "saline",
  "alkaline",
];

const SEASONS = ["Kharif", "Rabi", "Zaid"];
const IRRIGATION_TYPES = ["flood", "drip", "sprinkler", "rainfed"];

// Dropdown component inside the modal
function DropdownSelector({
  label,
  options,
  selected,
  onSelect,
  isOpen,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mb-3.5">
      <Text className="text-xs font-semibold text-muted-foreground mb-1.5 px-0.5 uppercase tracking-wider">
        {label}
      </Text>

      {/* Trigger Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        className="flex-row items-center justify-between p-3.5 rounded-2xl bg-muted border border-border"
      >
        <Text className="text-sm font-semibold text-foreground capitalize">
          {selected}
        </Text>
        <Icon
          icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
          size={18}
          className="text-muted-foreground"
        />
      </TouchableOpacity>

      {/* Dropdown Options List */}
      {isOpen && (
        <View className="mt-1.5 rounded-2xl bg-card border border-border overflow-hidden max-h-48">
          <ScrollView nestedScrollEnabled={true}>
            {options.map((opt, idx) => {
              const isSelected = selected === opt;
              const isLast = idx === options.length - 1;

              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(opt);
                    onToggle();
                  }}
                  style={
                    isSelected
                      ? {
                          backgroundColor: isDark
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(16, 185, 129, 0.1)",
                        }
                      : undefined
                  }
                  className={`flex-row items-center justify-between px-4 py-3.5 ${
                    !isLast ? "border-b border-border" : ""
                  }`}
                >
                  <Text
                    className={`text-sm capitalize ${
                      isSelected
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-foreground font-medium"
                    }`}
                  >
                    {opt}
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
  const { location } = useLocationContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const initialLocationState = React.useMemo(() => {
    return extractStateFromLocation(location?.displayName || location?.name);
  }, [location?.displayName, location?.name]);

  const [selectedState, setSelectedState] = useState(initialLocationState);
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [season, setSeason] = useState(SEASONS[0]);
  const [irrigationType, setIrrigationType] = useState(IRRIGATION_TYPES[0]);

  React.useEffect(() => {
    if (initialLocationState) {
      setSelectedState(initialLocationState);
    }
  }, [initialLocationState]);

  const { data, isLoading, isError } = usePreSowingAdvisory({
    crop: selectedCrop || "Cotton",
    state: selectedState,
    soil_type: soilType,
    season: season,
    irrigation_type: irrigationType,
    language: i18n.language,
  });

  const sectionsData = data?.sections || {};

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <View className="mt-2 pb-12">
      {/* Top Title Card with Settings Icon */}
      <View className="bg-card border border-border rounded-3xl p-3 my-4 mb-6 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-11 h-11 rounded-2xl bg-muted items-center justify-center">
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
              Preparation before sowing
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="p-2.5 ml-2"
          activeOpacity={0.7}
        >
          <Icon icon={Settings01Icon} size={20} className="text-foreground" />
        </TouchableOpacity>
      </View>

      {/* Settings Modal with Dropdowns */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpenDropdown(null);
          setModalVisible(false);
        }}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-center px-4"
          activeOpacity={1}
          onPressOut={() => {
            setOpenDropdown(null);
            setModalVisible(false);
          }}
        >
          <TouchableWithoutFeedback>
            <View className="bg-card w-full rounded-[35px] p-5 border border-border shadow-lg max-h-[85%]">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-1">
                  <View className="w-11 h-11 rounded-xl items-center justify-center">
                    <Icon
                      icon={Settings01Icon}
                      size={22}
                      className="text-foreground"
                    />
                  </View>
                  <Text className="text-lg font-bold text-foreground">
                    Advisory Settings
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setOpenDropdown(null);
                    setModalVisible(false);
                  }}
                  className="p-2 bg-muted rounded-full"
                >
                  <Icon
                    icon={Cancel01Icon}
                    size={18}
                    className="text-foreground"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="py-1">
                {/* State Dropdown */}
                <DropdownSelector
                  label="State"
                  options={INDIAN_STATES}
                  selected={selectedState}
                  onSelect={setSelectedState}
                  isOpen={openDropdown === "state"}
                  onToggle={() => toggleDropdown("state")}
                />

                {/* Season Dropdown */}
                <DropdownSelector
                  label="Season"
                  options={SEASONS}
                  selected={season}
                  onSelect={setSeason}
                  isOpen={openDropdown === "season"}
                  onToggle={() => toggleDropdown("season")}
                />

                {/* Soil Type Dropdown */}
                <DropdownSelector
                  label="Soil Type"
                  options={SOIL_TYPES}
                  selected={soilType}
                  onSelect={setSoilType}
                  isOpen={openDropdown === "soil"}
                  onToggle={() => toggleDropdown("soil")}
                />

                {/* Irrigation Dropdown */}
                <DropdownSelector
                  label="Irrigation Type"
                  options={IRRIGATION_TYPES}
                  selected={irrigationType}
                  onSelect={setIrrigationType}
                  isOpen={openDropdown === "irrigation"}
                  onToggle={() => toggleDropdown("irrigation")}
                />
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* 1. Sowing window/timeline */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Calendar01Icon} title="Sowing window/timeline" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.sowing_window}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Failed to load sowing window guidelines."
          />
        </View>
      </View>

      {/* 2. Seed selection */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Plant01Icon} title="Seed selection" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.seed_selection}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Failed to load seed selection guidelines."
          />
        </View>
      </View>

      {/* 3. Field preparation */}
      <View className="mb-6 px-3">
        <SectionHeader icon={File01Icon} title="Field preparation" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.field_preparation}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Failed to load field preparation guidelines."
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
              isLoading={isLoading}
              isError={isError}
              errorMessage="Failed to load fertilizer plan."
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
              isLoading={isLoading}
              isError={isError}
              errorMessage="Failed to load irrigation schedule."
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
            isLoading={isLoading}
            isError={isError}
            errorMessage="Failed to load weed management guidelines."
          />
        </View>
      </View>

      {/* 7. Pest & disease calendar */}
      <View className="mb-6 px-3">
        <SectionHeader icon={Shield01Icon} title="Pest & disease calendar" />
        <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
          <MarkdownViewer
            content={sectionsData.pest_disease}
            isLoading={isLoading}
            isError={isError}
            errorMessage="Failed to load pest & disease calendar."
          />
        </View>
      </View>
    </View>
  );
}

export default PreSowingSection;
