/**
 * app/onboarding/welcome.tsx
 * Redesigned welcome screen — Carousel + bilingual CTA.
 *
 * Layout:
 *  1. Top bar — Logo · "FarmRisk" · Globe (language picker)
 *  2. Swipeable carousel — 3 image preview cards
 *  3. Dot indicators — active dot is wider (pill shape)
 *  4. Heading + Subheading — updates per slide
 *  5. Get Started — shows English + selected / default-Hindi
 */
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Icon } from "@/components/ui/Icon";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/hooks/useLanguage";
import { Globe02Icon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { getStoredLanguage } from "@/i18n";
import { Image } from "expo-image";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// "Get Started" in every supported language
const GET_STARTED_NATIVE: Record<string, string> = {
  en: "Get Started",
  hi: "शुरू करें",
  mr: "सुरू करा",
  ta: "தொடங்குங்கள்",
  gu: "શરૂ કરો",
};

const ONBOARDING_IMAGES = {
  light: [
    require("@/assets/images/onboarding/weather_light.png"),
    require("@/assets/images/onboarding/risk_light.png"),
    require("@/assets/images/onboarding/ai_light.png"),
  ],
  dark: [
    require("@/assets/images/onboarding/weather_dark.png"),
    require("@/assets/images/onboarding/risk_dark.png"),
    require("@/assets/images/onboarding/ai_dark.png"),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Welcome Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation(["onboarding"]);
  const { language } = useLanguage();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [langVisible, setLangVisible] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const slides = [
    {
      title: t("carouselTitle1"),
      subtitle: t("carouselSub1"),
    },
    {
      title: t("carouselTitle2"),
      subtitle: t("carouselSub2"),
    },
    {
      title: t("carouselTitle3"),
      subtitle: t("carouselSub3"),
    },
  ];

  // Native language of the Get Started button
  // If language is English → show Hindi as second
  // Otherwise show the selected language as second
  const nativeLang = language === "en" ? "hi" : language;
  const nativeGetStarted =
    GET_STARTED_NATIVE[nativeLang] ?? GET_STARTED_NATIVE["hi"];

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slide = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setActiveSlide(slide);
    },
    [],
  );

  const handleGetStarted = () => {
    try {
      router.push("/onboarding/language");
    } catch {
      router.replace("/onboarding/language");
    }
  };

  const imageSources = isDark
    ? ONBOARDING_IMAGES.dark
    : ONBOARDING_IMAGES.light;
  const cards = imageSources.map((source, idx) => (
    <Image
      key={idx}
      source={source}
      style={{
        width: "100%",
        height: 400,
      }}
      contentFit="contain"
      transition={200}
    />
  ));

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* ── 1. Top bar ───────────────────────────────────────────────── */}
      <Animated.View
        entering={FadeIn.duration(500)}
        className="flex-row items-center px-5 pb-4"
      >
        <Logo size={45} />
        <Text className="text-4xl font-bold text-foreground flex-1">
          FarmRisk
        </Text>
        <TouchableOpacity
          onPress={() => setLangVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Choose Language"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon icon={Globe02Icon} size={28} className="text-foreground" />
        </TouchableOpacity>
      </Animated.View>

      {/* ── 2. Carousel ──────────────────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 0 }}
        >
          {cards.map((card, idx) => (
            <View
              key={idx}
              style={{
                width: SCREEN_WIDTH,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {card}
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* ── 3. Dot indicators ────────────────────────────────────────── */}
      <Animated.View
        entering={FadeIn.delay(200).duration(500)}
        className="flex-row justify-center items-center gap-1.5 mt-4"
      >
        {slides.map((_, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => {
              scrollRef.current?.scrollTo({
                x: i * SCREEN_WIDTH,
                animated: true,
              });
              setActiveSlide(i);
            }}
          >
            <View
              style={{
                height: 6,
                width: i === activeSlide ? 24 : 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeSlide
                    ? "#10b981"
                    : isDark
                      ? "rgba(161,161,170,0.4)"
                      : "rgba(113,113,122,0.3)",
              }}
            />
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* ── 4. Heading + Subheading ──────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        className="items-center px-6 mt-5"
      >
        <Text
          className="text-3xl font-bold text-foreground text-center leading-tight"
          numberOfLines={2}
        >
          {slides[activeSlide].title}
        </Text>
        <Text
          className="text-md text-muted-foreground text-center mt-2 leading-6"
          numberOfLines={3}
        >
          {slides[activeSlide].subtitle}
        </Text>
      </Animated.View>

      {/* ── 5. Get Started button ─────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.delay(450).duration(600)}
        className="px-5 mt-auto mb-0"
        style={{ paddingBottom: Math.max(insets.bottom, 16) + 12 }}
      >
        <TouchableOpacity
          onPress={handleGetStarted}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="rounded-3xl bg-primary flex-row items-center justify-between py-4 px-6"
        >
          {/* Bilingual label */}
          <View className="flex-1 flex-row items-center justify-center pr-2">
            <Text
              className="text-primary-foreground text-base font-bold shrink"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {nativeGetStarted}
            </Text>
            <View className="w-[1px] h-4 bg-primary-foreground mx-2.5 shrink-0" />
            <Text
              className="text-primary-foreground text-base font-bold shrink"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              Get Started
            </Text>
          </View>
          <Icon
            icon={ChevronRightIcon}
            size={22}
            strokeWidth={2}

            className="text-primary-foreground shrink-0"
          />
        </TouchableOpacity>
      </Animated.View>

      <LanguageSelector
        visible={langVisible}
        onClose={() => setLangVisible(false)}
      />
    </View>
  );
}
