import React, { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import {
  Header,
  SearchSection,
  CurrentWeatherSection,
  WeatherSummarySection,
  AIAdvisorySection,
} from "@/components/dashboard";

export default function HomeScreen() {
  const [selectedCrop] = useState<string>("");
  const { refreshing, onRefresh } = useRefreshDashboard();

  return (
    <SafeAreaView className="flex-1 bg-background mt-4">
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

        {/* 1. Location Search */}
        <SearchSection />

        {/* 2. Current Weather Overview */}
        <CurrentWeatherSection />

        {/* 3. AI Weather Summary */}
        <WeatherSummarySection />

        {/* 4. AI Advisory Recommendations */}
        <AIAdvisorySection crop={selectedCrop} />
      </ScrollView>
    </SafeAreaView>
  );
}
