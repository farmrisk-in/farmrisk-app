import React, { useState } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { useColorScheme } from "nativewind";
import { LocationRequired } from "@/components/LocationRequired";
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
