import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import {
  Home01Icon,
  SunCloud01Icon,
  Wrench01Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons";

export default function TabLayout() {
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
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Home01Icon} size={size || 22} color={color} />
          ),
        }}
      />

      {/* 2. Forecast Tab */}
      <Tabs.Screen
        name="forecast"
        options={{
          title: "Forecast",
          tabBarIcon: ({ color, size }) => (
            <Icon icon={SunCloud01Icon} size={size || 22} color={color} />
          ),
        }}
      />

      {/* 3. Tools Tab */}
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Wrench01Icon} size={size || 22} color={color} />
          ),
        }}
      />

      {/* 4. Alerts Tab */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Notification01Icon} size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
