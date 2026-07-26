import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

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
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>FarmRisk Dashboard</Text>
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

        {/* 7. Crops (selecting a crop updates selectedCrop) */}
        <CropsSection
          selectedCrop={selectedCrop}
          onSelectCrop={setSelectedCrop}
        />

        {/* 8. Soil Moisture (reacts to selected crop) */}
        <SoilMoistureSection crop={selectedCrop} />

        {/* 9. Crop Calendar (reacts to selected crop) */}
        <CalendarSection crop={selectedCrop} />

        {/* 10. AI Advisory (reacts to selected crop) */}
        <AIAdvisorySection crop={selectedCrop} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f5f5" },
  scroll: { padding: 16 },
  header: { marginBottom: 16 },
  headerTitle: { fontWeight: "800", color: "#1a1a1a" },
});
