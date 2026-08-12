import React, { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { LocationRequired } from "@/components/LocationRequired";
import {
  Header,
  SearchSection,
  CurrentWeatherSection,
  AIAdvisorySection,
  RiskSection,
  HourlyWeatherSection,
  CompactHourlySection,
  ForecastSection,
  SoilMoistureSection,
  WhatToDoTodaySection,
} from "@/components/dashboard";

export default function HomeScreen() {
  const [selectedCrop] = useState<string>("");
  const { refreshing, onRefresh } = useRefreshDashboard();
  const { location, isResolving, locationError } = useLocationContext();

  // Show location required screen when GPS failed and no location is available
  if (!location && !isResolving && locationError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LocationRequired />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
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

        <SearchSection />

        <CurrentWeatherSection />

        <WhatToDoTodaySection />

        <CompactHourlySection />
      </ScrollView>
    </SafeAreaView>
  );
}
