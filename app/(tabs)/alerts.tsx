import React from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRefreshDashboard } from "@/hooks/useRefreshDashboard";
import { useLocationContext } from "@/providers/LocationProvider";
import { LocationRequired } from "@/components/LocationRequired";
import { Header, LightningRiskSection } from "@/components/dashboard";
import { Icon } from "@/components/ui/Icon";
import { Alert01Icon } from "@hugeicons/core-free-icons";

export default function AlertsTabScreen() {
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

        {/* Section Title */}
        <View className="my-3">
          <Text className="text-xl font-bold text-foreground">
            Risk & Weather Alerts
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Real-time severe weather warnings and lightning risk models
          </Text>
        </View>

        {/* Lightning Risk Assessment */}
        <LightningRiskSection />

        {/* Severe Hazard Status Overview Card */}
        <View className="bg-card rounded-2xl border border-border p-4 my-2">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center">
              <Icon icon={Alert01Icon} size={20} className="text-amber-500" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                Active Weather Hazards
              </Text>
              <Text className="text-xs text-muted-foreground">
                Monitored via Open-Meteo & ML Early Warning System
              </Text>
            </View>
          </View>

          <View className="bg-muted/50 rounded-xl p-3 border border-border/50 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-medium text-foreground">
                Heavy Rainfall Risk
              </Text>
              <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Normal
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-1 border-t border-border/40">
              <Text className="text-sm font-medium text-foreground">
                Heatwave Warning
              </Text>
              <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Low Risk
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-1 border-t border-border/40">
              <Text className="text-sm font-medium text-foreground">
                Frost & Freeze Alert
              </Text>
              <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                None
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
