import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CATEGORIZED_CROPS,
  ALL_CATEGORIZED_CROPS,
  CategorizedCrop,
} from "@/constants/categorizedCrops";
import { Icon } from "@/components/ui/Icon";
import {
  Search01Icon,
  Cancel01Icon,
  Tick02Icon,
  Plant01Icon,
  WheatIcon,
  Leaf01Icon,
  DropletIcon,
  SparklesIcon,
  FlameIcon,
  Coffee01Icon,
} from "@hugeicons/core-free-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectCrop: (cropId: string, cropName: string) => void;
  currentSelectedCropId?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  cereals: WheatIcon,
  pulses: Leaf01Icon,
  oilseeds: DropletIcon,
  cash_crops: SparklesIcon,
  vegetables: Plant01Icon,
  fruits: Plant01Icon,
  spices: FlameIcon,
  plantation: Coffee01Icon,
  medicinal_flowers: Plant01Icon,
  fodder: WheatIcon,
};

export function OtherCropModal({
  visible,
  onClose,
  onSelectCrop,
  currentSelectedCropId,
}: Props) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return CATEGORIZED_CROPS.map((cat) => {
      if (selectedCategory !== "all" && cat.id !== selectedCategory) {
        return null;
      }

      const matchingCrops = cat.crops.filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.hindiName && c.hindiName.toLowerCase().includes(q)) ||
          c.category.toLowerCase().includes(q)
        );
      });

      if (matchingCrops.length === 0) return null;

      return {
        ...cat,
        crops: matchingCrops,
      };
    }).filter(Boolean);
  }, [searchQuery, selectedCategory]);

  const totalResultsCount = useMemo(() => {
    return filteredCategories.reduce(
      (sum, cat) => sum + (cat ? cat.crops.length : 0),
      0,
    );
  }, [filteredCategories]);

  const handlePickCrop = (crop: CategorizedCrop) => {
    const cleanName = crop.name.split(" (")[0].trim();
    onSelectCrop(`custom_${crop.id}`, cleanName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-background"
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        {/* Top Header */}
        <View className="px-4 pb-3 border-b border-border">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-muted items-center justify-center">
                <Icon
                  icon={Plant01Icon}
                  size={22}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </View>
              <View>
                <Text className="text-lg font-bold text-foreground">
                  Browse All Crops
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {totalResultsCount} crops in catalog
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-muted items-center justify-center border border-border"
              activeOpacity={0.7}
            >
              <Icon
                icon={Cancel01Icon}
                size={18}
                className="text-foreground"
              />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-muted border border-border rounded-2xl px-3 py-2.5">
            <Icon
              icon={Search01Icon}
              size={18}
              className="text-muted-foreground mr-2"
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search (e.g. Tomato, Haldi, Mango)..."
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              className="flex-1 text-sm text-foreground p-0"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="p-1"
              >
                <Icon
                  icon={Cancel01Icon}
                  size={16}
                  className="text-muted-foreground"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory("all")}
              activeOpacity={0.8}
              style={[
                {
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  borderWidth: 1,
                },
                selectedCategory === "all"
                  ? { backgroundColor: "#10b981", borderColor: "#059669" }
                  : {
                      backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                      borderColor: isDark ? "#334155" : "#e2e8f0",
                    },
              ]}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: selectedCategory === "all" ? "700" : "500",
                  color:
                    selectedCategory === "all"
                      ? "#ffffff"
                      : isDark
                        ? "#94a3b8"
                        : "#64748b",
                }}
              >
                All ({ALL_CATEGORIZED_CROPS.length})
              </Text>
            </TouchableOpacity>

            {CATEGORIZED_CROPS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                  style={[
                    {
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      borderWidth: 1,
                    },
                    isSelected
                      ? { backgroundColor: "#10b981", borderColor: "#059669" }
                      : {
                          backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                          borderColor: isDark ? "#334155" : "#e2e8f0",
                        },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? "700" : "500",
                      color: isSelected
                        ? "#ffffff"
                        : isDark
                          ? "#94a3b8"
                          : "#64748b",
                    }}
                  >
                    {cat.name} ({cat.crops.length})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Crops List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-3"
        >
          {filteredCategories.length === 0 ? (
            <View className="items-center justify-center py-16 px-4">
              <View className="w-14 h-14 rounded-full bg-muted items-center justify-center mb-3">
                <Icon
                  icon={Search01Icon}
                  size={24}
                  className="text-muted-foreground"
                />
              </View>
              <Text className="text-base font-bold text-foreground text-center">
                No crops found matching "{searchQuery}"
              </Text>
              <Text className="text-xs text-muted-foreground text-center mt-1">
                Try searching with an alternative English or Hindi name.
              </Text>
            </View>
          ) : (
            filteredCategories.map((cat) => {
              if (!cat) return null;
              const CatIcon = CATEGORY_ICONS[cat.id] || Plant01Icon;

              return (
                <View key={cat.id} className="mb-6">
                  {/* Category Title */}
                  <View className="flex-row items-center justify-between pb-2 mb-3 border-b border-border">
                    <View className="flex-row items-center gap-2">
                      <Icon
                        icon={CatIcon}
                        size={16}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                      <Text className="text-sm font-bold text-foreground">
                        {cat.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground font-medium">
                        ({cat.crops.length})
                      </Text>
                    </View>
                  </View>

                  {/* Crop Cards Grid (2-columns) */}
                  <View className="flex-row flex-wrap gap-2.5">
                    {cat.crops.map((crop) => {
                      const isSelected =
                        currentSelectedCropId === `custom_${crop.id}` ||
                        currentSelectedCropId?.toLowerCase() ===
                          crop.id.toLowerCase() ||
                        currentSelectedCropId?.toLowerCase() ===
                          crop.name.split(" (")[0].toLowerCase();

                      const cleanName = crop.name.split(" (")[0].trim();
                      const subtitle = crop.name.includes("(")
                        ? crop.name.split("(")[1]?.replace(")", "")
                        : "";

                      return (
                        <TouchableOpacity
                          key={crop.id}
                          activeOpacity={0.7}
                          onPress={() => handlePickCrop(crop)}
                          style={[
                            {
                              width: "48.5%",
                              padding: 12,
                              borderRadius: 16,
                              borderWidth: 1,
                              minHeight: 74,
                              justifyContent: "space-between",
                            },
                            isSelected
                              ? {
                                  backgroundColor: isDark
                                    ? "rgba(16, 185, 129, 0.15)"
                                    : "rgba(16, 185, 129, 0.1)",
                                  borderColor: "#10b981",
                                }
                              : {
                                  backgroundColor: isDark
                                    ? "#1e293b"
                                    : "#ffffff",
                                  borderColor: isDark ? "#334155" : "#e2e8f0",
                                },
                          ]}
                        >
                          <View className="flex-row items-start justify-between">
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: isSelected
                                  ? isDark
                                    ? "#34d399"
                                    : "#059669"
                                  : isDark
                                    ? "#f8fafc"
                                    : "#0f172a",
                                flex: 1,
                              }}
                              numberOfLines={1}
                            >
                              {cleanName}
                            </Text>
                            {isSelected && (
                              <View className="w-4 h-4 rounded-full bg-emerald-600 items-center justify-center ml-1">
                                <Icon
                                  icon={Tick02Icon}
                                  size={10}
                                  color="#ffffff"
                                />
                              </View>
                            )}
                          </View>

                          <View className="mt-1">
                            {crop.hindiName ? (
                              <Text
                                style={{
                                  fontSize: 11,
                                  color: isDark ? "#94a3b8" : "#64748b",
                                  fontWeight: "500",
                                }}
                                numberOfLines={1}
                              >
                                {crop.hindiName}
                              </Text>
                            ) : null}
                            {subtitle ? (
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: isDark ? "#64748b" : "#94a3b8",
                                }}
                                numberOfLines={1}
                              >
                                {subtitle}
                              </Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

export default OtherCropModal;
