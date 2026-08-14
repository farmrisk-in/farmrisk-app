/**
 * app/onboarding/language.tsx
 * Step 1 — Language selection.
 *
 * Features:
 * - Translated heading with forced English subtitle header
 * - Separated individual language box cards
 * - Left glyph badge (Aa, हि, म, த, ગુ)
 * - Native name + English name
 * - Right radio selection indicator
 * - Instant language change as soon as a card is tapped
 */
import React, { useEffect, useState } from "react";
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
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import {
  getStoredLanguage,
  type LanguageCode,
} from "@/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Tick01Icon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/ui/Icon";

interface LanguageMeta {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  glyph: string;
}

const LANGUAGE_DETAILS: LanguageMeta[] = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    glyph: "Aa",
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    glyph: "हि",
  },
  {
    code: "mr",
    nativeName: "मराठी",
    englishName: "Marathi",
    glyph: "म",
  },
  {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    glyph: "த",
  },
  {
    code: "gu",
    nativeName: "ગુજરાતી",
    englishName: "Gujarati",
    glyph: "ગુ",
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation(["onboarding"]);
  const { language, setLanguage } = useLanguage();
  const [selected, setSelected] = useState<LanguageCode>(language);

  const handleSelectLanguage = async (code: LanguageCode) => {
    setSelected(code);
    await setLanguage(code);
  };

  const handleContinue = async () => {
    await setLanguage(selected);
    try {
      router.push("/onboarding/auth");
    } catch {
      router.replace("/onboarding/auth");
    }
  };

  const handleBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      // fallback
    }
    router.replace("/onboarding/welcome");
  };

  // Get the "Continue" label in the currently selected language
  const continueLabels: Record<LanguageCode, string> = {
    en: "Continue",
    hi: "जारी रखें",
    mr: "पुढे चला",
    ta: "தொடர்க",
    gu: "આગળ વધો",
  };
  const continueLabel =
    t("langContinue") || continueLabels[selected] || "Continue";

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-background">
      {/* Progress bar — Step 1 of 4 */}
      <OnboardingProgress
        currentStep={1}
        totalSteps={4}
        onBack={handleBack}
        stepLabel={t("step") ?? "Step"}
        ofLabel={t("of") ?? "of"}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Heading */}
        <View>
          <Text className="text-3xl font-bold text-foreground mt-2 leading-tight">
            {t("langSelectTitle") ?? "Choose your language"}
          </Text>
          {/* Forced English subtitle in slightly dull color */}
          <Text className="text-xl text-muted-foreground mt-4">
            {selected === "en" ? "अपनी भाषा चुनें" : "Choose your language"}
          </Text>
        </View>

        {/* Subheading */}
        <View>
          <Text className="text-md text-muted-foreground mt-3 leading-6">
            {t("langSelectSubtitle") ??
              "You'll see all advisories and analysis in your selected language. This can be changed in Settings anytime."}
          </Text>
        </View>

        {/* Separated Language Box Cards */}
        <View className="mt-6 gap-3">
          {LANGUAGE_DETAILS.map((item) => {
            const isSelected = item.code === selected;
            return (
              <TouchableOpacity
                key={item.code}
                onPress={() => handleSelectLanguage(item.code)}
                activeOpacity={0.75}
                className={`flex-row items-center p-4 rounded-3xl border ${
                  isSelected
                    ? "bg-emerald-200/50 dark:bg-emerald-800/30 border-primary"
                    : "bg-card border-border"
                }`}
              >
                {/* Left Glyph Badge */}
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    isSelected ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <Text
                    className={`text-xl font-bold ${
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {item.glyph}
                  </Text>
                </View>

                {/* Language Names in Script + English */}
                <View className="flex-1 ml-3.5 justify-center">
                  <Text className="text-lg font-bold leading-snug text-foreground">
                    {item.nativeName}
                  </Text>
                  <Text className="text-sm font-medium text-muted-foreground mt-0.5">
                    {item.englishName}
                  </Text>
                </View>

                {/* Right Radio Indicator */}
                <View
                  style={{
                    borderRadius: "100%",
                    borderWidth: isSelected ? 6 : 2,
                  }}
                  className={`w-7 h-7 mr-2 rounded-full ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue button pinned to bottom */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.85}
          className="rounded-3xl bg-primary flex-row items-center justify-center py-4"
          accessibilityRole="button"
        >
          <Text
            className="text-primary-foreground text-xl font-bold shrink"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {continueLabel}
          </Text>
          <Icon
            icon={ChevronRightIcon}
            size={22}
            strokeWidth={2}
            className="text-primary-foreground shrink-0 ml-1"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
