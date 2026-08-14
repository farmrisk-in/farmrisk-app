import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useFarmContext } from "@/providers/FarmProvider";
import { markOnboarded } from "@/lib/onboarding";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { Icon } from "@/components/ui/Icon";
import {
  MapPinIcon,
  Tick01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";

/**
 * Step 4 of 4 — Farm Selection / Drawing screen.
 *
 * Full-screen layout with OnboardingProgress bar.
 * Actions:
 *   - "Draw Farm" → opens /farm-select map screen.
 *   - "Skip / Continue to Dashboard" → marks onboarding complete and navigates to "/".
 */
export default function OnboardingFarmSelect() {
  const router = useRouter();
  const { t: tFields } = useTranslation(["fields"]);
  const { t: tOB } = useTranslation(["onboarding"]);
  const { selectedFarm } = useFarmContext();

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      // fallback
    }
    router.replace("/onboarding/location-perm");
  };

  const complete = async () => {
    await markOnboarded();
    router.replace("/");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Progress bar — Step 4 of 4 */}
      <OnboardingProgress
        currentStep={4}
        totalSteps={4}
        onBack={handleBack}
        stepLabel={tOB("step") ?? "Step"}
        ofLabel={tOB("of") ?? "of"}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 32,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Header & Icon */}
          <View className="items-center my-6">
            <View className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 items-center justify-center mb-6">
              <Icon
                icon={MapPinIcon}
                size={40}
                className="text-primary"
              />
            </View>

            <Text className="text-3xl font-bold text-foreground text-center leading-tight">
              {tFields("onboardingTitle") || "Map Your Field"}
            </Text>

            <Text className="text-base text-muted-foreground text-center mt-3 leading-7 px-2">
              {tFields("onboardingHint") ||
                "Draw your field boundary on the satellite map to receive high-resolution soil moisture analysis and customized crop risk telemetry."}
            </Text>
          </View>

          {/* Selected Farm Card if already drawn */}
          {selectedFarm && (
            <View className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex-row items-center gap-3 my-2">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Icon
                  icon={Tick01Icon}
                  size={18}
                  className="text-primary-foreground"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Farm Boundary Ready
                </Text>
                <Text
                  className="text-sm font-bold text-foreground mt-0.5"
                  numberOfLines={1}
                >
                  {selectedFarm.name || selectedFarm.fieldId}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons pinned towards bottom */}
        <View className="gap-3 mt-8">
          {/* Primary CTA — Draw farm */}
          <TouchableOpacity
            onPress={() => router.push("/farm-select")}
            activeOpacity={0.85}
            className="rounded-2xl bg-primary flex-row items-center justify-center py-4 gap-2"
            accessibilityRole="button"
          >
            <Icon
              icon={PencilEdit02Icon}
              size={18}
              className="text-primary-foreground"
            />
            <Text className="text-primary-foreground text-lg font-bold">
              {selectedFarm
                ? tFields("drawNew") || "Redraw Farm"
                : tFields("drawNew") || "Draw Farm Boundary"}
            </Text>
          </TouchableOpacity>

          {/* Secondary CTA — Skip / Continue to Dashboard */}
          <TouchableOpacity
            onPress={complete}
            activeOpacity={0.75}
            className="rounded-2xl border border-border bg-card items-center justify-center py-4"
            accessibilityRole="button"
          >
            <Text className="text-muted-foreground text-base font-semibold">
              {selectedFarm
                ? tFields("ready") || "Go to Dashboard"
                : tFields("skip") || "Skip for now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

