import React, { useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Avatar } from "react-native-paper";
import { Leaf } from "lucide-react-native";
import { useRouter } from "expo-router";

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
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Leaf color="#006045" size={32} strokeWidth={2.5} />
            <Text
              variant="headlineLarge"
              style={{ fontWeight: "600" }}
              className="text-foreground"
            >
              FarmRisk
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Avatar.Icon
              size={40}
              icon="account"
              className="bg-primary"
              color="white"
            />
          </TouchableOpacity>
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
