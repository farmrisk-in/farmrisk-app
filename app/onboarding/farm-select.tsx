import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { useFarmContext } from "@/providers/FarmProvider";
import { useFields } from "@/hooks/useFields";
import { markOnboarded } from "@/lib/onboarding";
import { areaToHectares } from "@/lib/drawField";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { Icon } from "@/components/ui/Icon";
import {
  MapPinIcon,
  Tick01Icon,
  PencilEdit02Icon,
  ArrowRight01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import type { SavedField } from "@/types/fields";

/**
 * Step 4 of 4 — Farm Selection / Drawing screen.
 *
 * Full-screen layout with OnboardingProgress bar.
 * Actions:
 *   - Tap a saved farm → selects farm, marks onboarding complete, opens Dashboard.
 *   - "Draw Farm" / "Draw New Farm" → opens /farm-select map screen.
 *   - "Skip / Continue to Dashboard" → marks onboarding complete and navigates to "/".
 */
export default function OnboardingFarmSelect() {
  const router = useRouter();
  const { t: tFields } = useTranslation(["fields"]);
  const { t: tOB } = useTranslation(["onboarding"]);
  const { selectedFarm, selectFarm } = useFarmContext();
  const { fields, isLoading } = useFields();

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

  const handleSelectFarm = async (farm: SavedField) => {
    await selectFarm(farm);
    await markOnboarded();
    router.replace("/");
  };

  const hasFarms = fields && fields.length > 0;

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
            <View className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 items-center justify-center mb-5">
              <Icon
                icon={MapPinIcon}
                size={40}
                className="text-primary"
              />
            </View>

            <Text className="text-3xl font-bold text-foreground text-center leading-tight">
              {hasFarms
                ? tFields("selectFarm") || "Select Your Farm"
                : tFields("onboardingTitle") || "Map Your Field"}
            </Text>

            <Text className="text-base text-muted-foreground text-center mt-3 leading-6 px-2">
              {hasFarms
                ? "Choose one of your saved fields to open the dashboard, or draw a new boundary."
                : tFields("onboardingHint") ||
                  "Draw your field boundary on the satellite map to receive high-resolution soil moisture analysis and customized crop risk telemetry."}
            </Text>
          </View>

          {/* Loading state for farms */}
          {isLoading && (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="small" color="#10b981" />
            </View>
          )}

          {/* Saved Farms List */}
          {!isLoading && hasFarms && (
            <View className="my-2 gap-3">
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                {tFields("myFarms") || "Saved Farms"} ({fields.length})
              </Text>

              {fields.map((farm) => {
                const isSelected = selectedFarm?.id === farm.id;
                return (
                  <TouchableOpacity
                    key={farm.id}
                    onPress={() => handleSelectFarm(farm)}
                    activeOpacity={0.8}
                    className={`rounded-2xl p-4 border flex-row items-center justify-between transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-card border-border hover:border-primary/40"
                    }`}
                  >
                    <View className="flex-row items-center gap-3.5 flex-1 mr-2">
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center ${
                          isSelected ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <Icon
                          icon={isSelected ? Tick01Icon : MapPinIcon}
                          size={20}
                          className={
                            isSelected
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-base font-bold text-foreground"
                          numberOfLines={1}
                        >
                          {farm.name || farm.fieldId}
                        </Text>
                        <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                          {farm.areaM2 != null && (
                            <Text className="text-xs text-muted-foreground">
                              {areaToHectares(farm.areaM2)}
                            </Text>
                          )}
                          {farm.season && (
                            <Text className="text-xs text-muted-foreground">
                              • {farm.season}
                            </Text>
                          )}
                          {farm.crops && farm.crops.length > 0 && (
                            <Text
                              className="text-xs text-primary font-medium"
                              numberOfLines={1}
                            >
                              • {farm.crops.join(", ")}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <Text className="text-xs font-semibold text-primary mr-1">
                        Open
                      </Text>
                      <Icon
                        icon={ArrowRight01Icon}
                        size={16}
                        className="text-primary"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mt-6">
          {/* Primary CTA — Draw new farm */}
          <TouchableOpacity
            onPress={() => router.push("/farm-select")}
            activeOpacity={0.85}
            className={`rounded-2xl flex-row items-center justify-center py-4 gap-2 ${
              hasFarms
                ? "bg-secondary border border-border"
                : "bg-primary"
            }`}
            accessibilityRole="button"
          >
            <Icon
              icon={hasFarms ? Add01Icon : PencilEdit02Icon}
              size={18}
              className={
                hasFarms
                  ? "text-foreground"
                  : "text-primary-foreground"
              }
            />
            <Text
              className={`text-lg font-bold ${
                hasFarms
                  ? "text-foreground"
                  : "text-primary-foreground"
              }`}
            >
              {hasFarms
                ? tFields("drawNew") || "Draw New Farm"
                : tFields("drawNew") || "Draw Farm Boundary"}
            </Text>
          </TouchableOpacity>

          {/* Secondary CTA — Skip / Continue to Dashboard */}
          <TouchableOpacity
            onPress={complete}
            activeOpacity={0.75}
            className={`rounded-2xl border border-border items-center justify-center py-4 ${
              hasFarms ? "bg-primary" : "bg-card"
            }`}
            accessibilityRole="button"
          >
            <Text
              className={`text-base font-semibold ${
                hasFarms ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {hasFarms
                ? tFields("ready") || "Continue to Dashboard"
                : tFields("skip") || "Skip for now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
