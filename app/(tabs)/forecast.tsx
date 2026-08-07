import React from "react";
import { ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { useColorScheme } from "nativewind";
import { LocationRequired } from "@/components/LocationRequired";
import { useCropContext } from "@/providers/CropProvider";
import {
  Header,
  HourlyWeatherSection,
  ForecastSection,
  SoilMoistureSection,
  CalendarSection,
  CropCalendarSection,
} from "@/components/dashboard";

export default function ForecastTabScreen() {
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

        {/* Hourly Forecast */}
        <HourlyWeatherSection />

        {/* 16-Day Forecast */}
        <ForecastSection />

        {/* Soil Moisture Assessment */}
        <SoilMoistureSection crop={selectedCrop} />

        {/* Crop Calendar */}
        <CropCalendarSection crop={selectedCrop} />
      </ScrollView>
    </SafeAreaView>
  );
}
