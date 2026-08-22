import React from "react";
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

interface LockedFeatureProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  isPremium?: boolean; // If true, only unlocked for premium users. If false, unlocked for logged-in users.
}

export function LockedFeature({ children, style, className }: LockedFeatureProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation(["common"]);

  if (user) {
    return <View style={style} className={className}>{children}</View>;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push("/locked-features")}
      style={style}
      className={`relative overflow-hidden ${className || ""}`}
    >
      <View className="opacity-30" pointerEvents="none">
        {children}
      </View>
      <View className="absolute inset-0 items-center justify-center bg-background/40">
        <View className="bg-card border border-border p-4 rounded-3xl items-center shadow-sm">
          <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 items-center justify-center mb-2">
            <Icon icon={LockPasswordIcon} size={24} className="text-emerald-600 dark:text-emerald-400" />
          </View>
          <Text className="text-foreground font-bold text-sm">
            {t("loginToUnlock" as any) || "Login to Unlock"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
