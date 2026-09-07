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
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { LocationRequired } from "@/components/LocationRequired";
import { Header } from "@/components/dashboard";
import { PreSowingSection } from "@/components/tools/PreSowingSection";
import { PostHarvestSection } from "@/components/tools/PostHarvestSection";

export type ToolSubTab = "pre-sowing" | "post-harvest";

export default function ToolsTabScreen() {
  const { t } = useTranslation(["common"]);
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
        <View className="mt-4 bg-muted p-1.5 rounded-2xl flex-row items-center border border-border">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("pre-sowing")}
            style={[
              {
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              },
              activeTab === "pre-sowing"
                ? {
                    backgroundColor: "#ffffff40",
                  }
                : { backgroundColor: "transparent" },
            ]}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "pre-sowing"
                  ? "text-foreground font-bold"
                  : "text-muted-foreground"
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
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              },
              activeTab === "post-harvest"
                ? {
                    backgroundColor: "#ffffff40",
                  }
                : { backgroundColor: "transparent" },
            ]}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "post-harvest"
                  ? "text-foreground font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {t("postHarvest")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-tab Content */}
        {activeTab === "pre-sowing" ? (
          <PreSowingSection />
        ) : (
          <PostHarvestSection />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
