import React from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { LocationRequired } from "@/components/LocationRequired";
import { Header, LightningRiskSection, ClimateReadoutSection, ModelSummarySection } from "@/components/dashboard";
import { Icon } from "@/components/ui/Icon";
import { Alert01Icon } from "@hugeicons/core-free-icons";

export default function AlertsTabScreen() {
  const { t } = useTranslation(["dashboard"]);
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
        <Header />

        <ClimateReadoutSection />

        <ModelSummarySection />

        <LightningRiskSection />
      </ScrollView>
    </SafeAreaView>
  );
}
