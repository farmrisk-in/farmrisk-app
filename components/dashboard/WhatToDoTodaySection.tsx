import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TractorIcon } from "@hugeicons/core-free-icons";

export function WhatToDoTodaySection() {
  const { t: tDash } = useTranslation(["dashboard"]);
  const title = tDash("whatToDoToday");

  return (
    <View className="my-6 px-3">
      <SectionHeader icon={TractorIcon} title={title} />
      <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-6 shadow-sm min-h-[150px] justify-center items-center">
        {/* Placeholder for empty state */}
        <Text className="text-muted-foreground font-medium text-sm text-center">
          {/* Will add items here in the future */}
          No tasks scheduled for today.
        </Text>
      </View>
    </View>
  );
}
