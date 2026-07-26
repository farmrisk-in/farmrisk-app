/**
 * app/(tabs)/index.tsx
 * Main Dashboard screen.
 * Assembles all section components from components/dashboard/.
 * Each section manages its own data fetching via TanStack Query hooks.
 * selectedCrop state is lifted here so CropsSection, SoilMoistureSection
 * and CalendarSection all stay in sync.
 */
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  SearchSection,
  CurrentWeatherSection,
  HourlyWeatherSection,
  LightningRiskSection,
  ForecastSection,
  WeatherSummarySection,
  AIAdvisorySection,
  SoilMoistureSection,
  CropsSection,
  CalendarSection,
} from "@/components/dashboard";

export default function HomeScreen() {
  // Shared selected crop state — driven by CropsSection, consumed by Soil & Calendar
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FarmRisk Dashboard</Text>
        </View>

        {/* 1. Location Search */}
        <SearchSection />

        {/* 2. Current Weather */}
        <CurrentWeatherSection />

        {/* 3. Hourly Weather */}
        <HourlyWeatherSection />

        {/* 4. Lightning Risk */}
        <LightningRiskSection />

        {/* 5. AI Weather Summary */}
        <WeatherSummarySection />

        {/* 6. 16-Day Forecast */}
        <ForecastSection />

        {/* 7. Crops (tapping a crop updates selectedCrop) */}
        <CropsSection
          selectedCrop={selectedCrop}
          onSelectCrop={setSelectedCrop}
        />

        {/* 8. Soil Moisture (filtered by selected crop) */}
        <SoilMoistureSection crop={selectedCrop} />

        {/* 9. Crop Calendar (requires selected crop) */}
        <CalendarSection crop={selectedCrop} />

        {/* 10. AI Advisory */}
        <AIAdvisorySection />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { padding: 16 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
});
