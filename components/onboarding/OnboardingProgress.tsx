import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import { ChevronLeftIcon } from "@hugeicons/core-free-icons";

interface OnboardingProgressProps {
  currentStep: number; // 1-indexed
  totalSteps: number;
  onBack: () => void;
  stepLabel?: string;
  ofLabel?: string;
}

/**
 * Onboarding progress bar shown at the top of every onboarding screen
 * except the splash and welcome screens.
 *
 * Shows N horizontal bars (filled up to currentStep), a "Step N of M"
 * label, and a back chevron.
 */
export function OnboardingProgress({
  currentStep,
  totalSteps,
  onBack,
  stepLabel = "Step",
  ofLabel = "of",
}: OnboardingProgressProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center gap-3 px-5 pb-5"
      style={{ paddingTop: insets.top + 10 }}
    >
      {/* Back button */}
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon icon={ChevronLeftIcon} size={32} className="text-foreground" />
      </TouchableOpacity>

      {/* Progress bars — one per step */}
      <View className="flex-1 flex-row gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className={`h-1.5 max-w-10 rounded-full flex-1 ${
              i < currentStep ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </View>

      {/* Step counter */}
      <Text className="text-lg font-semibold text-muted-foreground">
        {stepLabel} {currentStep} {ofLabel} {totalSteps}
      </Text>
    </View>
  );
}
