import React from "react";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { Icons } from "@/components/iconLoader";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#4ade80" : "#007a55",
        tabBarInactiveTintColor: isDark ? "#9f9fa9" : "#71717a",
        tabBarStyle: {
          backgroundColor: isDark ? "#18181b" : "#ffffff",
          borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icons.Home size={size || 22} color={color} />
          ),
        }}
      />

      {/* 2. Forecast Tab */}
      <Tabs.Screen
        name="forecast"
        options={{
          title: "Forecast",
          tabBarIcon: ({ color, size }) => (
            <Icons.CloudSun size={size || 22} color={color} />
          ),
        }}
      />

      {/* 3. Tools Tab */}
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color, size }) => (
            <Icons.Wrench size={size || 22} color={color} />
          ),
        }}
      />

      {/* 4. Alerts Tab */}
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Icons.Bell size={size || 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
