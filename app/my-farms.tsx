/**
 * My Farms — list of saved farms with select, delete, and export.
 * Accessible from the Profile page.
 */
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFields } from "@/hooks/useFields";
import { useFarmContext } from "@/providers/FarmProvider";
import { areaToHectares } from "@/lib/drawField";
import {
  SEASONS,
  CROP_STAGES,
  type Season,
  type CropStage,
} from "@/constants/farm";
import { Icon } from "@/components/ui/Icon";
import {
  MapPinIcon,
  Add01Icon,
  Delete01Icon,
  Share01Icon,
  Tick02Icon,
  WheatIcon,
  ChevronLeft,
} from "@hugeicons/core-free-icons";
import type { SavedField } from "@/types/fields";

export default function MyFarmsScreen() {
  const { t } = useTranslation(["fields", "common", "profile"]);
  const router = useRouter();
  const { fields, deleteField, isDeleting, isLoading } = useFields();
  const { selectedFarm, selectFarm } = useFarmContext();

  const seasonLabel = (s?: string) =>
    s && SEASONS.includes(s as Season) ? t(`seasons.${s as Season}`) : s || "";
  const stageLabel = (s?: string) =>
    s && CROP_STAGES.includes(s as CropStage)
      ? t(`stages.${s as CropStage}`)
      : s || "";
  const isActive = (f: SavedField) => selectedFarm?.id === f.id;

  const handleSelect = async (farm: SavedField) => {
    await selectFarm(farm);
    router.back();
  };

  const handleDelete = (farm: SavedField) => {
    Alert.alert(
      t("deleteConfirm", { name: farm.name || farm.fieldId }) ||
        `Delete "${farm.name || farm.fieldId}"?`,
      t("deleteHint") || "This removes the farm from your account.",
      [
        { text: t("common:cancel") || "Cancel", style: "cancel" },
        {
          text: t("profile:deleteAccount") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteField(farm.id);
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to delete farm.");
            }
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    if (!fields.length) return;
    const fc = {
      type: "FeatureCollection",
      features: fields.map((sf) => ({
        type: "Feature",
        properties: {
          name: sf.name,
          crops: sf.crops,
          season: sf.season,
          cropStage: sf.cropStage,
          year: sf.year,
        },
        geometry: sf.geometry,
      })),
    };
    try {
      await Share.share({ message: JSON.stringify(fc, null, 2) });
    } catch {}
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      {/* ── Top Header Bar ── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("common:cancel") || "Close"}
        >
          <Icon icon={ChevronLeft} size={28} className="text-foreground" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-foreground">
          {t("listTitle") || "My Farms"}
        </Text>
        <View className="w-5"></View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Actions ── */}
        <View className="flex-row gap-3 mb-5">
          {fields.length > 0 && (
            <TouchableOpacity
              onPress={handleExport}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-card border border-border"
              accessibilityRole="button"
            >
              <Icon icon={Share01Icon} size={16} className="text-foreground" />
              <Text className="text-foreground text-xs font-bold">
                {t("exportGeoJson") || "Export GeoJSON"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => router.push("/farm-select")}
            className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-primary"
            accessibilityRole="button"
          >
            <Icon icon={Add01Icon} size={18} color="#ffffff" />
            <Text className="text-white text-xs font-bold">
              {t("drawNew") || "Draw New Farm"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Content ── */}
        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : fields.length === 0 ? (
          <View className="items-center justify-center py-20 px-4">
            <View className="w-16 h-16 rounded-3xl bg-muted border border-border items-center justify-center mb-4">
              <Icon
                icon={MapPinIcon}
                size={32}
                className="text-muted-foreground"
              />
            </View>
            <Text className="text-base font-bold text-foreground text-center mb-1">
              {t("emptyList") || "No farms saved yet"}
            </Text>
            <Text className="text-xs text-muted-foreground text-center mb-6 leading-relaxed max-w-[260px]">
              {t("noFarmsHint") ||
                "Draw your farm boundary on the map to get localized climate and field advisories."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/farm-select")}
              className="flex-row items-center gap-2 bg-emerald-600 active:bg-emerald-700 px-5 py-3.5 rounded-2xl"
              accessibilityRole="button"
            >
              <Icon icon={Add01Icon} size={18} color="#ffffff" />
              <Text className="text-white text-sm font-bold">
                {t("selectOnMap") || "Draw Farm on Map"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-3.5">
            {fields.map((farm) => {
              const active = isActive(farm);
              return (
                <TouchableOpacity
                  key={farm.id}
                  onPress={() => handleSelect(farm)}
                  activeOpacity={0.7}
                  className={`rounded-3xl p-5  bg-card ${
                    active ? "border-2 border-primary" : "border border-border"
                  }`}
                  accessibilityRole="button"
                >
                  {/* Top Row: Name on Left, Area + Active Status on Right */}
                  <View className="flex-row items-start justify-between gap-3 mb-2.5">
                    <View className="flex-1">
                      <Text
                        className="text-base font-bold text-foreground leading-tight"
                        numberOfLines={1}
                      >
                        {farm.name || farm.fieldId}
                      </Text>
                      {farm.savedAt && (
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          {t("addedLabel") || "Season"}
                          {": "}
                          {new Date(farm.savedAt).toDateString()}
                        </Text>
                      )}
                    </View>

                    <View className="items-end shrink-0">
                      {farm.areaM2 != null && (
                        <Text className="text-sm font-bold text-foreground">
                          {areaToHectares(farm.areaM2)}
                        </Text>
                      )}
                      {active ? (
                        <View className="flex-row items-center gap-1 mt-1 px-2.5 py-0.5 rounded-lg bg-emerald-600">
                          <Icon
                            icon={Tick02Icon}
                            size={12}
                            strokeWidth={2}
                            color="#ffffff"
                          />
                          <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                            {t("active") || "Active"}
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                          {t("tapToActivate") || "Tap to select"}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Middle Row: Crops Tags & Season/Stage Info */}
                  <View className="flex-row items-center justify-between flex-wrap gap-2 pt-2 border-t border-border">
                    {/* Left: Crops */}
                    <View className="flex-row flex-wrap items-center gap-1.5 flex-1">
                      {farm.crops && farm.crops.length > 0 ? (
                        farm.crops.map((c) => (
                          <View
                            key={c}
                            className="flex-row items-center gap-1 bg-muted border border-border px-2.5 py-1 rounded-xl"
                          >
                            <Icon
                              icon={WheatIcon}
                              size={12}
                              className="text-emerald-600 dark:text-emerald-400"
                            />
                            <Text className="text-foreground text-[11px] font-medium">
                              {c}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text className="text-[11px] text-muted-foreground italic">
                          {t("noCrops") || "No crops assigned"}
                        </Text>
                      )}
                    </View>

                    {/* Right: Season / Stage chips */}
                    {(farm.season || farm.cropStage) && (
                      <View className="flex-row items-center gap-1.5 shrink-0">
                        {farm.season && (
                          <View className="bg-muted border border-border px-2.5 py-1 rounded-xl">
                            <Text className="text-[11px] font-medium text-foreground">
                              {seasonLabel(farm.season)}
                            </Text>
                          </View>
                        )}
                        {farm.cropStage && (
                          <View className="bg-muted border border-border px-2.5 py-1 rounded-xl">
                            <Text className="text-[11px] font-medium text-foreground">
                              {stageLabel(farm.cropStage)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Bottom Row: Delete action button */}
                  <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-border">
                    <View className="flex-row items-center gap-1">
                      <Icon
                        icon={MapPinIcon}
                        size={13}
                        className="text-muted-foreground"
                      />
                      <Text className="text-[11px] text-muted-foreground">
                        Lat: {farm.centerLat?.toFixed(3) || "Saved Field"}
                      </Text>
                      <Text className="text-[11px] text-muted-foreground">
                        Lng: {farm.centerLng?.toFixed(3) || "Saved Field"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(farm);
                      }}
                      disabled={isDeleting}
                      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-destructive"
                      accessibilityRole="button"
                    >
                      <Icon
                        icon={Delete01Icon}
                        size={14}
                        className="text-destructive"
                      />
                      <Text className="text-destructive text-xs font-bold">
                        {"Delete"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
