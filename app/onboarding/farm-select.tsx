/**
 * Onboarding Step 5 — Farm Selection (optional).
 *
 * Shows a compact farm selection prompt with a "Draw Farm" CTA and a "Skip"
 * button. Drawing happens on the same FarmSelectScreen (pushed as modal).
 * Once a farm is selected or skipped, marks onboarding complete and navigates
 * to the dashboard.
 */
import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { useFarmContext } from "@/providers/FarmProvider";
import { markOnboarded } from "@/lib/onboarding";
import { Icon } from "@/components/ui/Icon";
import { MapPinIcon } from "@hugeicons/core-free-icons";

export default function OnboardingFarmSelect() {
  const { t } = useTranslation(["fields", "onboarding"]);
  const { selectedFarm } = useFarmContext();
  const [wentToMap, setWentToMap] = useState(false);

  const complete = async () => {
    await markOnboarded();
    router.replace("/");
  };

  // If user returns from farm-select with a farm, auto-complete
  if (wentToMap && selectedFarm) {
    // complete on next render via effect — but simpler: just show the ready state
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={complete}>
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.delay(150).duration(500).springify()}
            className="w-full max-w-sm rounded-3xl overflow-hidden border border-border"
          >
            <View className="p-7 items-center bg-card">
              {/* Icon */}
              <Animated.View
                entering={FadeIn.delay(300).duration(400)}
                className="w-16 h-16 rounded-full bg-emerald-600/20 items-center justify-center mb-5"
              >
                <Icon
                  icon={MapPinIcon}
                  size={32}
                  className="text-emerald-500"
                />
              </Animated.View>

              <Text className="text-xl font-bold text-foreground text-center">
                {t("onboardingTitle")}
              </Text>

              <Text className="mt-3 text-sm leading-5 text-muted-foreground text-center">
                {t("onboardingHint")}
              </Text>

              {/* Primary CTA — Draw Farm */}
              <Pressable
                onPress={async () => {
                  setWentToMap(true);
                  router.push("/farm-select");
                }}
                className="mt-6 w-full rounded-2xl bg-primary items-center justify-center py-4"
              >
                <Text className="text-foreground text-base font-semibold">
                  {t("drawNew")}
                </Text>
              </Pressable>

              {/* Continue / Skip */}
              <Pressable
                onPress={complete}
                className="mt-3 w-full rounded-2xl border border-border bg-card items-center justify-center py-4"
              >
                <Text className="text-muted-foreground text-sm font-medium">
                  {selectedFarm ? t("ready") : t("skip")}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
