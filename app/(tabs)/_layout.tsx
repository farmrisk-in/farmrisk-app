import React from "react";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import {
  Home01Icon,
  SunCloud01Icon,
  Analytics01Icon,
} from "@hugeicons/core-free-icons";
import Plant01Icon from "@hugeicons/core-free-icons/Plant01Icon";

export default function TabLayout() {
  const { t } = useTranslation(["common"]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#4ade80" : "#007a55",
        tabBarInactiveTintColor: isDark ? "#9f9fa9" : "#71717a",
        tabBarStyle: {
          paddingBottom: Math.max(insets.bottom, 12),
          marginBottom: 10,
          backgroundColor: isDark ? "#18181b" : "#ffffff",
          borderTopWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      {/* 1. Today (Home) Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabHome"),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Home01Icon} size={size || 22} color={color} />
          ),
        }}
      />

      {/* 2. Weather Tab */}
      <Tabs.Screen
        name="weather"
        options={{
          title: t("tabWeather"),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={SunCloud01Icon} size={size || 22} color={color} />
          ),
        }}
      />

      {/* 3. farmrisk Tab */}
      <Tabs.Screen
        name="farmrisk"
        options={{
          title: t("tabFarmrisk"),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Plant01Icon} size={size || 22} color={color} />
          ),
        }}
      />

      {/* 4. Insights Tab */}
      <Tabs.Screen
        name="insights"
        options={{
          title: t("tabInsights"),
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Analytics01Icon} size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
