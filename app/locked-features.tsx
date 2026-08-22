import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import {
  Cancel01Icon,
  User02Icon,
  CheckmarkBadge01Icon,
  Plant01Icon,
  Bug01Icon,
  RobotIcon,
  Location01Icon,
  RainDropIcon,
} from "@hugeicons/core-free-icons";

export default function LockedFeaturesScreen() {
  const router = useRouter();
  const { t } = useTranslation(["common", "auth"]);

  const features = [
    {
      icon: RobotIcon,
      title: "AI Crop Advisory",
      desc: "Get personalized actionable insights for your specific farm based on weather and soil data.",
    },
    {
      icon: Bug01Icon,
      title: "Pest & Disease Risk",
      desc: "Early warnings for local pest and disease threats using predictive models.",
    },
    {
      icon: RainDropIcon,
      title: "Soil Moisture Tracking",
      desc: "Detailed soil moisture profiles across 4 depth levels to optimize irrigation.",
    },
    {
      icon: Location01Icon,
      title: "Save Multiple Farms",
      desc: "Draw and save your field boundaries for pinpoint accurate hyper-local forecasting.",
    },
  ];

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted border border-border items-center justify-center"
        >
          <Icon icon={Cancel01Icon} size={20} className="text-foreground" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 items-center justify-center mb-4">
            <Icon icon={User02Icon} size={36} className="text-emerald-600 dark:text-emerald-400" />
          </View>
          <Text className="text-2xl font-bold text-foreground text-center mb-2">
            Unlock Full Potential
          </Text>
          <Text className="text-base text-muted-foreground text-center px-4 leading-relaxed">
            Create a free account or sign in to access advanced farm intelligence and personalized insights.
          </Text>
        </View>

        <View className="bg-card border border-border rounded-3xl p-5 mb-8">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
            Included in your free account
          </Text>
          <View className="gap-5">
            {features.map((feature, i) => (
              <View key={i} className="flex-row items-start gap-4">
                <View className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 items-center justify-center border border-emerald-100 dark:border-emerald-900 shrink-0 mt-0.5">
                  <Icon icon={feature.icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-[13px] text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pt-4 pb-6 border-t border-border bg-background">
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="bg-emerald-600 active:bg-emerald-700 rounded-2xl py-4 items-center justify-center"
        >
          <Text className="text-white font-bold text-base">
            {t("auth:signInBtn" as any) || "Log In or Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
