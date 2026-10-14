import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import { MapPinIcon, Search01Icon } from "@hugeicons/core-free-icons";
import { useTranslation } from "react-i18next";

export interface NoLocationCardProps {
  title?: string;
  message?: string;
  compact?: boolean;
  className?: string;
  showButton?: boolean;
}

export function NoLocationCard({
  title,
  message,
  compact = false,
  className,
  showButton = true,
}: NoLocationCardProps) {
  const router = useRouter();
  const { t } = useTranslation(["common"]);

  const displayTitle = title || t("locationRequired") || "Select a Location";
  const displayMessage =
    message ||
    t("locationRequiredDesc") ||
    "Select or search a location to view data for your area.";

  if (compact) {
    return (
      <View
        className={`bg-card dark:bg-muted/20 border border-border rounded-3xl p-4 flex-row items-center justify-between gap-3 shadow-sm ${className || ""}`}
      >
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 items-center justify-center border border-amber-500/20 dark:border-amber-400/20">
            <Icon
              icon={MapPinIcon}
              size={20}
              className="text-amber-500 dark:text-amber-400"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
              {displayMessage}
            </Text>
          </View>
        </View>

        {showButton && (
          <TouchableOpacity
            onPress={() => router.push("/search")}
            activeOpacity={0.8}
            className="flex-row items-center gap-1.5 bg-primary px-3 py-2 rounded-xl"
          >
            <Icon icon={Search01Icon} size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold">
              {t("searchLocation") || "Select"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View
      className={`bg-card dark:bg-muted/20 border border-border rounded-3xl p-6 items-center justify-center text-center shadow-sm ${className || ""}`}
    >
      <View className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 items-center justify-center mb-3 border border-amber-500/20 dark:border-amber-400/20">
        <Icon
          icon={MapPinIcon}
          size={28}
          className="text-amber-500 dark:text-amber-400"
        />
      </View>

      <Text className="text-base font-bold text-foreground text-center mb-1">
        {displayTitle}
      </Text>

      <Text className="text-xs text-muted-foreground text-center leading-relaxed max-w-[280px] mb-4">
        {displayMessage}
      </Text>

      {showButton && (
        <TouchableOpacity
          onPress={() => router.push("/search")}
          activeOpacity={0.8}
          className="flex-row items-center gap-2 bg-primary px-4 py-2.5 rounded-xl shadow-sm active:opacity-90"
        >
          <Icon icon={Search01Icon} size={16} color="#ffffff" />
          <Text className="text-white text-xs font-bold">
            {t("searchLocation") || "Select Location"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default NoLocationCard;
