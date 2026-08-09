import React from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { LocationRequired } from "@/components/LocationRequired";
import { useCropContext } from "@/providers/CropProvider";
import { Header, AIAdvisorySection } from "@/components/dashboard";
import { Icon } from "@/components/ui/Icon";
import {
  Wrench01Icon,
  DropletIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";

export default function ToolsTabScreen() {
  const { t } = useTranslation(["dashboard"]);
  const { selectedCrop } = useCropContext();
  const { refreshing, onRefresh } = useRefreshDashboard();
  const { location, isResolving, locationError } = useLocationContext();

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
        {/* Shared Header */}
        <Header />

        {/* AI Advisory RAG Tool */}
        <AIAdvisorySection crop={selectedCrop} />

        {/* Additional Farm Tools Overview */}
        <View className="bg-card rounded-2xl border border-border p-4 my-2 mb-6">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
              <Icon icon={Wrench01Icon} size={20} className="text-primary" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {t("smartUtilities")}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {t("smartUtilitiesDesc")}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-muted/50 p-3 rounded-xl border border-border/50">
              <Icon
                icon={DropletIcon}
                size={20}
                className="text-primary mb-1.5"
              />
              <Text className="text-sm font-semibold text-foreground">
                {t("irrigationTool")}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {t("irrigationToolDesc")}
              </Text>
            </View>

            <View className="flex-1 bg-muted/50 p-3 rounded-xl border border-border/50">
              <Icon
                icon={Calendar01Icon}
                size={20}
                className="text-primary mb-1.5"
              />
              <Text className="text-sm font-semibold text-foreground">
                {t("sowingPlanner")}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                {t("sowingPlannerDesc")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
