import React, { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Avatar } from "react-native-paper";
import { Icons } from "@/components/iconLoader";
import { DownloadButton } from "@/components/dashboard/DownloadButton";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

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
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/Logo";

export default function HomeScreen() {
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const router = useRouter();
  const { user } = useAuth();

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning,";
    if (hour < 17) return "Good afternoon,";
    if (hour < 21) return "Good evening,";
    return "Good night,";
  };

  // Extract user's name if logged in
  const meta = user?.user_metadata || {};
  const userName =
    [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
    meta.name ||
    user?.email?.split("@")[0] ||
    "Farmer";

  return (
    <SafeAreaView className="flex-1 bg-background mt-4">
      <ScrollView className="px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-1 mb-2">
          {user ? (
            /* Logged In Header */
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              activeOpacity={0.8}
              className="flex-row items-center gap-3"
            >
              <Avatar.Icon
                size={40}
                icon="account"
                className="bg-primary"
                color="white"
              />
              <View>
                <Text className="text-xs text-muted-foreground font-medium">
                  {getGreeting()}
                </Text>
                <Text
                  style={{ fontFamily: "Fraunces_600SemiBold" }}
                  className="text-3xl text-foreground font-fraunces-semibold"
                  numberOfLines={1}
                >
                  {userName}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* Logged Out Header */
            <View className="flex-row items-center gap-2">
              <Logo size={32} />
              <Text
                style={{ fontFamily: "Fraunces_600SemiBold", fontSize: 26 }}
                className="text-foreground font-fraunces-semibold"
              >
                FarmRisk
              </Text>
            </View>
          )}

          {/* Header Action Buttons */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              accessibilityRole="button"
              accessibilityLabel="Profile & Settings"
            >
              <Icons.Menu size={25} className="text-foreground" />
            </TouchableOpacity>
          </View>
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
