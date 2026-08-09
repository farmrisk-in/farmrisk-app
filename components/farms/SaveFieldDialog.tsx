import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { SEASONS, CROP_STAGES, DEFAULT_CROPS } from "@/constants/farm";
import type { FieldInfo } from "@/types/fields";
import { areaToHectares } from "@/lib/drawField";
import { useCrops } from "@/hooks/useCrops";

interface SaveFieldDialogProps {
  visible: boolean;
  onClose: () => void;
  onSave: (info: FieldInfo) => void;
  areaM2: number;
  saving?: boolean;
}

export function SaveFieldDialog({ visible, onClose, onSave, areaM2, saving }: SaveFieldDialogProps) {
  const { t } = useTranslation(["fields"]);
  const { crops: apiCrops, isLoading: cropsLoading } = useCrops();

  const [name, setName] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [season, setSeason] = useState<string>(SEASONS[0]);
  const [stage, setStage] = useState<string>(CROP_STAGES[0]);
  const [nameError, setNameError] = useState<string | null>(null);
  const [cropsError, setCropsError] = useState<string | null>(null);

  const cropOptions = (apiCrops.length > 0 ? apiCrops : DEFAULT_CROPS);

  const toggleCrop = (id: string) => {
    setSelectedCrops((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
    setCropsError(null);
  };

  const handleSave = () => {
    const ne = name.trim() ? null : t("validation.nameRequired");
    const ce = selectedCrops.length > 0 ? null : t("validation.cropRequired");
    setNameError(ne);
    setCropsError(ce);
    if (ne || ce) return;
    onSave({ name: name.trim(), crops: selectedCrops, season, cropStage: stage });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-zinc-900 rounded-t-3xl pt-5 pb-10 px-5 max-h-[85%]">
          {/* Title */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-white">{t("saveFarm")}</Text>
            <Pressable onPress={onClose} disabled={saving}>
              <Text className="text-zinc-400 text-sm">{t("cancel")}</Text>
            </Pressable>
          </View>

          {/* Area display */}
          <Text className="text-emerald-400 text-sm font-semibold mb-4">
            {t("area", { area: areaToHectares(areaM2) })}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text className="text-zinc-300 text-xs font-medium mb-1.5">{t("farmName")}</Text>
            <TextInput
              value={name}
              onChangeText={(v) => { setName(v); if (nameError) setNameError(null); }}
              placeholder={t("namePlaceholder")}
              placeholderTextColor="#71717b"
              className="bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-base text-white mb-1"
              editable={!saving}
            />
            {nameError && <Text className="text-red-400 text-xs mb-2">{nameError}</Text>}

            {/* Crops */}
            <Text className="text-zinc-300 text-xs font-medium mt-3 mb-1.5">{t("cropsLabel")}</Text>
            {cropsLoading ? (
              <ActivityIndicator size="small" className="text-emerald-500 my-2" />
            ) : (
              <View className="flex-row flex-wrap gap-2 mb-1">
                {cropOptions.map((c: any) => {
                  const id = c.id || c.name?.toLowerCase();
                  const sel = selectedCrops.includes(id);
                  return (
                    <Pressable
                      key={id}
                      onPress={() => toggleCrop(id)}
                      className={`px-3 py-1.5 rounded-full border ${
                        sel ? "bg-emerald-600 border-emerald-500" : "bg-zinc-800 border-white/10"
                      }`}
                      disabled={saving}
                    >
                      <Text className={`text-xs font-medium ${sel ? "text-white" : "text-zinc-300"}`}>
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
            {cropsError && <Text className="text-red-400 text-xs mb-2">{cropsError}</Text>}

            {/* Season */}
            <Text className="text-zinc-300 text-xs font-medium mt-3 mb-1.5">{t("season")}</Text>
            <View className="flex-row gap-2 mb-1">
              {SEASONS.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSeason(s)}
                  className={`flex-1 py-2 rounded-xl border items-center ${
                    season === s ? "bg-emerald-600 border-emerald-500" : "bg-zinc-800 border-white/10"
                  }`}
                  disabled={saving}
                >
                  <Text className={`text-xs font-semibold ${season === s ? "text-white" : "text-zinc-300"}`}>
                    {t(`seasons.${s}`)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Crop Stage */}
            <Text className="text-zinc-300 text-xs font-medium mt-3 mb-1.5">{t("cropStage")}</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {CROP_STAGES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setStage(s)}
                  className={`px-3 py-2 rounded-xl border ${
                    stage === s ? "bg-emerald-600 border-emerald-500" : "bg-zinc-800 border-white/10"
                  }`}
                  disabled={saving}
                >
                  <Text className={`text-xs font-semibold ${stage === s ? "text-white" : "text-zinc-300"}`}>
                    {t(`stages.${s}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={saving}
            className="w-full rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center py-4 disabled:opacity-50"
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-semibold">{t("saveFarm")}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
