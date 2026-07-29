import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Header,
  SearchSection,
  CurrentWeatherSection,
  WeatherSummarySection,
  AIAdvisorySection,
} from "@/components/dashboard";

export default function HomeScreen() {
  const [selectedCrop] = useState<string>("");

  return (
    <SafeAreaView className="flex-1 bg-background mt-4">
      <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 110 }}>
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
