import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "nativewind";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { LocationRequired } from "@/components/LocationRequired";
import { Header } from "@/components/dashboard";
import { PreSowingSection } from "@/components/tools/PreSowingSection";
import { PostHarvestSection } from "@/components/tools/PostHarvestSection";
import { Icon } from "@/components/ui/Icon";
import { Plant01Icon, Store01Icon } from "@hugeicons/core-free-icons";

export type ToolSubTab = "pre-sowing" | "post-harvest";

export default function ToolsTabScreen() {
  const { t } = useTranslation(["common"]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { refreshing, onRefresh } = useRefreshDashboard();
  const { location, isResolving, locationError } = useLocationContext();
  const [activeTab, setActiveTab] = useState<ToolSubTab>("pre-sowing");

  if (!location && !isResolving && locationError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LocationRequired />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background mt-4">
      <ScrollView
        className="px-4"
        nestedScrollEnabled={true}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007a55"]}
            tintColor="#007a55"
          />
        }
      >
        {/* Shared Dashboard Header */}
        <Header />

        {/* Sub-tabs below header */}
        <View
          style={{
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.04)",
          }}
          className="mt-4 p-1.5 rounded-2xl flex-row items-center border border-border"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("pre-sowing")}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              },
              activeTab === "pre-sowing"
                ? {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.08)",
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.35 : 0.08,
                    shadowRadius: 4,
                    elevation: 3,
                  }
                : {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: "transparent",
                  },
            ]}
          >
            <Icon
              icon={Plant01Icon}
              size={18}
              className={
                activeTab === "pre-sowing"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            />
            <Text
              className={`text-sm ${
                activeTab === "pre-sowing"
                  ? "text-emerald-700 dark:text-emerald-300 font-bold"
                  : "text-muted-foreground font-semibold"
              }`}
            >
              {t("preSowing")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("post-harvest")}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              },
              activeTab === "post-harvest"
                ? {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.08)",
                    borderWidth: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.35 : 0.08,
                    shadowRadius: 4,
                    elevation: 3,
                  }
                : {
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    borderColor: "transparent",
                  },
            ]}
          >
            <Icon
              icon={Store01Icon}
              size={18}
              className={
                activeTab === "post-harvest"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }
            />
            <Text
              className={`text-sm ${
                activeTab === "post-harvest"
                  ? "text-emerald-700 dark:text-emerald-300 font-bold"
                  : "text-muted-foreground font-semibold"
              }`}
            >
              {t("postHarvest")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-tab Content: View-based switching keeps state persistent */}
        <View style={{ display: activeTab === "pre-sowing" ? "flex" : "none" }}>
          <PreSowingSection />
        </View>

        <View
          style={{ display: activeTab === "post-harvest" ? "flex" : "none" }}
        >
          <PostHarvestSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
