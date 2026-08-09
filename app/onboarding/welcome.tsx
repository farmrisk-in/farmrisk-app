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
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/components/ui/Icon";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Globe02Icon } from "@hugeicons/core-free-icons";

/**
 * Step 2 — Full-screen welcome hero.
 *
 * Background image with dark gradient overlay, floating language picker,
 * and a glassmorphic bottom card with the CTA.
 */
export default function Welcome() {
  const { t } = useTranslation(["onboarding", "common"]);
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
            "rgba(9, 9, 11, 0.2)",
            "rgba(9, 9, 11, 0.5)",
            "rgba(9, 9, 11, 0.85)",
            "#09090b",
          ]}
          locations={[0, 0.35, 0.7, 1]}
          className="flex-1"
        >
          {/* Top bar: logo + language picker */}
          <View
            className="flex-row items-center justify-between px-5"
            style={{ paddingTop: insets.top + 8 }}
          >
            <Animated.View entering={FadeIn.duration(500)}>
              <Text className="text-xl font-bold text-white tracking-tight">
                FarmRisk
              </Text>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(200).duration(500)}>
              <TouchableOpacity
                onPress={() => setLangVisible(true)}
                className="p-2.5 rounded-full bg-white/10 border border-white/20"
                accessibilityRole="button"
                accessibilityLabel={t("common:chooseLanguage")}
              >
                <Icon
                  icon={Globe02Icon}
                  size={22}
                  className="text-white"
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Bottom glassmorphic card */}
          <View
            className="flex-1 justify-end px-5"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
          >
            <Animated.View entering={FadeInDown.delay(300).duration(700)}>
              <BlurView
                intensity={28}
                tint="dark"
                className="rounded-3xl overflow-hidden border border-white/10"
              >
                <View className="p-6 bg-zinc-900/70">
                  <Text className="text-3xl font-bold text-white leading-tight">
                    {t("welcomeTitle")}
                  </Text>

                  <Text className="mt-3 text-base leading-6 text-zinc-300">
                    {t("welcomeSubtitle")}
                  </Text>

                  <Pressable
                    onPress={() => router.replace("/onboarding/auth")}
                    className="mt-7 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center py-4"
                    accessibilityRole="button"
                  >
                    <Text className="text-white text-lg font-semibold">
                      {t("getStarted")}
                    </Text>
                  </Pressable>
                </View>
              </BlurView>
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
