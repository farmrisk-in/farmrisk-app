import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { ShoppingBasket01Icon } from "@hugeicons/core-free-icons";

export function PostHarvestSection() {
  const { t } = useTranslation(["common"]);

  return (
    <View className="mt-4">
      <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-2xl bg-amber-500/10 items-center justify-center">
            <Icon
              icon={ShoppingBasket01Icon}
              size={22}
              className="text-amber-600 dark:text-amber-400"
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {t("postHarvest")}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              Storage, market trends & crop preservation
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default PostHarvestSection;
