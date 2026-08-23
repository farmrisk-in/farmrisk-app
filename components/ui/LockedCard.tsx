import React from "react";
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LockPasswordIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";

interface LockedCardProps {
  title?: string;
  description?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  minHeight?: number;
}

export function LockedCard({
  title = "Unlock with Account",
  description = "Tap to unlock full potential with AI advisory & real-time insights",
  className,
  style,
  minHeight = 140,
}: LockedCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push("/locked-features")}
      style={[{ minHeight }, style]}
      className={`bg-card border border-dashed border-border rounded-3xl p-6 items-center justify-center ${
        className || ""
      }`}
    >
      <View className="w-12 h-12 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 items-center justify-center mb-3">
        <Icon
          icon={LockPasswordIcon}
          size={24}
          className="text-emerald-600 dark:text-emerald-400"
        />
      </View>
      <Text className="text-base font-bold text-foreground text-center">
        {title}
      </Text>
      <Text className="text-xs text-muted-foreground text-center mt-1 max-w-[260px] leading-relaxed">
        {description}
      </Text>
      <View className="mt-3.5 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-500/20">
        <Icon icon={SparklesIcon} size={12} className="text-emerald-600 dark:text-emerald-400" />
        <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          Unlock Features
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default LockedCard;
