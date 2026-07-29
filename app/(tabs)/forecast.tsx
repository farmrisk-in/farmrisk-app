import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Header,
  CropsSection,
  HourlyWeatherSection,
  ForecastSection,
  SoilMoistureSection,
  CalendarSection,
} from "@/components/dashboard";

export default function ForecastTabScreen() {
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  return (
    <SafeAreaView className="flex-1 bg-background mt-4">
      <ScrollView className="px-4">
        {/* Shared Header */}
        <Header />

        {/* Crops selector (affects soil moisture & crop calendar) */}
        <CropsSection
          selectedCrop={selectedCrop}
          onSelectCrop={setSelectedCrop}
        />

        {/* Hourly Forecast */}
        <HourlyWeatherSection />

        {/* 16-Day Forecast */}
        <ForecastSection />

        {/* Soil Moisture Assessment */}
        <SoilMoistureSection crop={selectedCrop} />

        {/* Crop Calendar */}
        <CalendarSection crop={selectedCrop} />
      </ScrollView>
    </SafeAreaView>
  );
}
