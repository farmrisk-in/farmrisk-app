import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/components/ui/Icon";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Globe02Icon } from "@hugeicons/core-free-icons";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Step 2 — Full-screen welcome hero.
 *
 * Background image with dark gradient overlay, top logo + FarmRisk brand lockup & language picker,
 * top left-aligned welcome title, and bottom subtitle + CTA button.
 */
export default function Welcome() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [langVisible, setLangVisible] = useState(false);

  return (
    <View className="flex-1 bg-[#09090b]">
      <ImageBackground
        source={require("../../assets/images/splash.png")}
        resizeMode="cover"
        className="flex-1"
      >
        {/* Dark gradient overlay for text legibility */}
        <LinearGradient
          colors={[
            "rgba(9, 9, 11, 0.0)",
            "rgba(9, 9, 11, 0.0)",
            "rgba(9, 9, 11, 0.7)",
            "#09090b",
          ]}
          locations={[0, 0.65, 0.8, 1]}
          className="flex-1"
        >
          {/* Top bar: Logo + FarmRisk brand lockup & language picker */}
          <View className="flex px-6" style={{ paddingTop: insets.top + 12 }}>
            <View className="flex-row items-center justify-between">
              <Animated.View entering={FadeIn.delay(0).duration(500)}>
                <Logo size={50} />
              </Animated.View>
              <Animated.View entering={FadeIn.delay(100).duration(500)}>
                <TouchableOpacity
                  onPress={() => setLangVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t("common:chooseLanguage")}
                >
                  <Icon
                    icon={Globe02Icon}
                    size={28}
                    strokeWidth={2}
                    className="text-black"
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>
            <View className="flex py-12">
              {language === "en" && (
                <Animated.View entering={FadeIn.delay(200).duration(500)}>
                  <View>
                    <Text className="text-2xl font-bold text-black tracking-tight">
                      {t("welcomeTitle")}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Top Left-Aligned Welcome Title */}
              <Animated.View
                className="flex-row items-center"
                entering={FadeInDown.delay(300).duration(600)}
              >
                <Text className="text-5xl font-extrabold text-black leading-tight tracking-tight">
                  FarmRisk
                </Text>
              </Animated.View>

              {language !== "en" && (
                <Animated.View entering={FadeIn.delay(400).duration(500)}>
                  <View>
                    <Text className="text-2xl font-bold text-black tracking-tight">
                      {t("welcomeTitle")}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
          {/* Bottom Section: Subtitle & Get Started CTA */}
          <View
            className="flex-1 justify-end px-6"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
          >
            <Animated.View entering={FadeInDown.delay(500).duration(600)}>
              <Text className="mb-6 text-sm text-zinc-300/90 leading-6 font-normal">
                {t("welcomeSubtitle")}
              </Text>

              <Pressable
                onPress={() => router.replace("/onboarding/auth")}
                className="rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center py-4 shadow-lg shadow-emerald-950/50"
                accessibilityRole="button"
              >
                <Text className="text-white text-lg font-semibold">
                  {t("getStarted")}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <LanguageSelector
        visible={langVisible}
        onClose={() => setLangVisible(false)}
      />
    </View>
  );
}
