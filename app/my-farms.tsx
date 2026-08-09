/**
 * My Farms — list of saved farms with select, delete, and export.
 * Entry point from profile page.
 */
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Share, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useFields } from "@/hooks/useFields";
import { useFarmContext } from "@/providers/FarmProvider";
import { areaToHectares } from "@/lib/drawField";
import { SEASONS, CROP_STAGES, type Season, type CropStage } from "@/constants/farm";
import { Icon } from "@/components/ui/Icon";
import { Cancel01Icon, MapPinIcon, Add01Icon, Delete01Icon, ArrowUpRightIcon } from "@hugeicons/core-free-icons";
import type { SavedField } from "@/types/fields";

export default function MyFarmsScreen() {
  const { t } = useTranslation(["fields"]);
  const { t: tProfile } = useTranslation(["profile"]);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { fields, deleteField, isDeleting, isLoading } = useFields();
  const { selectedFarm, selectFarm } = useFarmContext();

  const seasonLabel = (s?: string) =>
    s && SEASONS.includes(s as Season) ? t(`seasons.${s as Season}`) : "";
  const stageLabel = (s?: string) =>
    s && CROP_STAGES.includes(s as CropStage) ? t(`stages.${s as CropStage}`) : "";
  const isActive = (f: SavedField) => selectedFarm?.id === f.id;

  const handleSelect = async (farm: SavedField) => {
    await selectFarm(farm);
    router.back();
  };

  const handleDelete = (farm: SavedField) => {
    Alert.alert(t("deleteConfirm", { name: farm.name || farm.fieldId }), t("deleteHint"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("deleteConfirm", { name: "" }).replace('" ', "").replace('"', ""),
        style: "destructive",
        onPress: async () => {
          try { await deleteField(farm.id); } catch {}
        },
      },
    ]);
  };

  const handleExport = async () => {
    if (!fields.length) return;
    const fc = {
      type: "FeatureCollection",
      features: fields.map((sf) => ({
        type: "Feature",
        properties: { name: sf.name, crops: sf.crops, season: sf.season, cropStage: sf.cropStage, year: sf.year },
        geometry: sf.geometry,
      })),
    };
    try {
      await Share.share({ message: JSON.stringify(fc, null, 2) });
    } catch {}
  };

  const cardBg = isDark ? "bg-zinc-900" : "bg-white";
  const borderCls = isDark ? "border-white/8" : "border-zinc-200";
  const textPrimary = isDark ? "text-white" : "text-zinc-900";
  const textSecondary = isDark ? "text-zinc-400" : "text-zinc-500";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#fafafa" }} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }]}>
          <Icon icon={Cancel01Icon} size={20} color={isDark ? "#fff" : "#09090b"} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${textPrimary}`}>{t("listTitle")}</Text>
        <TouchableOpacity
          onPress={() => router.push("/farm-select")}
          style={[styles.headerBtn, { backgroundColor: "rgba(16,185,129,0.15)" }]}
        >
          <Icon icon={Add01Icon} size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Actions */}
        {fields.length > 0 && (
          <View className="flex-row gap-2 mb-4 mt-2">
            <TouchableOpacity
              onPress={handleExport}
              className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-800 border border-white/10"
            >
              <Text className="text-zinc-300 text-xs font-semibold">{t("exportGeoJson")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/farm-select")}
              className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600"
            >
              <Icon icon={ArrowUpRightIcon} size={14} color="#fff" />
              <Text className="text-white text-xs font-semibold">{t("selectOnMap")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : fields.length === 0 ? (
          <View className="items-center py-20">
            <Icon icon={MapPinIcon} size={48} className="text-zinc-600 mb-3" />
            <Text className={`text-sm font-medium ${textPrimary}`}>{t("emptyList")}</Text>
            <Text className={`text-xs ${textSecondary} mt-1 mb-4`}>{t("noFarmsHint")}</Text>
            <TouchableOpacity
              onPress={() => router.push("/farm-select")}
              className="flex-row items-center gap-2 bg-emerald-600 px-5 py-3 rounded-xl"
            >
              <Icon icon={ArrowUpRightIcon} size={16} color="#fff" />
              <Text className="text-white text-sm font-semibold">{t("selectOnMap")}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          fields.map((farm) => (
            <TouchableOpacity
              key={farm.id}
              onPress={() => handleSelect(farm)}
              activeOpacity={0.7}
              className={`${cardBg} rounded-2xl border ${borderCls} p-4 mb-3 ${isActive(farm) ? "border-emerald-500/50 bg-emerald-950/20" : ""}`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-2">
                  <Text className={`text-sm font-bold ${textPrimary}`} numberOfLines={1}>
                    {farm.name || farm.fieldId}
                  </Text>
                  {farm.areaM2 != null && (
                    <Text className={`text-xs ${textSecondary} mt-0.5`}>
                      {t("areaLabel")}: {areaToHectares(farm.areaM2)}
                    </Text>
                  )}
                </View>
                {isActive(farm) && (
                  <View className="bg-emerald-600/20 px-2 py-1 rounded-full">
                    <Text className="text-emerald-400 text-[10px] font-bold">{t("active")}</Text>
                  </View>
                )}
              </View>

              {/* Crops */}
              {farm.crops && farm.crops.length > 0 && (
                <View className="flex-row flex-wrap gap-1 mt-2">
                  {farm.crops.map((c) => (
                    <View key={c} className="bg-zinc-800 px-2 py-0.5 rounded-full">
                      <Text className="text-zinc-300 text-[10px]">{c}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Season / Stage */}
              <View className="flex-row gap-3 mt-2">
                {farm.season && (
                  <Text className={`text-[11px] ${textSecondary}`}>{seasonLabel(farm.season)}</Text>
                )}
                {farm.cropStage && (
                  <Text className={`text-[11px] ${textSecondary}`}>{stageLabel(farm.cropStage)}</Text>
                )}
              </View>

              {/* Actions */}
              <View className="flex-row gap-2 mt-3 pt-3 border-t border-white/5">
                <TouchableOpacity
                  onPress={() => handleDelete(farm)}
                  disabled={isDeleting}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/20"
                >
                  <Icon icon={Delete01Icon} size={13} color="#ef4444" />
                  <Text className="text-red-400 text-xs font-medium">{t("cancel")}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
});
