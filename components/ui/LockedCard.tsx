import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LockPasswordIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

interface LockedCardProps {
  title?: string;
  description?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
  minHeight?: number;
}

export function LockedCard({
  title,
  description,
  className,
  style,
  minHeight = 140,
}: LockedCardProps) {
  const router = useRouter();
  const { t } = useTranslation(["common"]);

  const displayTitle = title || t("unlockWithAccount") || "Unlock with Account";
  const displayDescription =
    description ||
    t("tapToUnlockDesc") ||
    "Tap to unlock full potential with AI advisory & real-time insights";

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push("/locked-features")}
      style={[{ minHeight }, style]}
      className={`bg-card border border-dashed border-border rounded-3xl p-6 items-center justify-center ${
        className || ""
      }`}
    >
      <Icon icon={LockPasswordIcon} size={32} className="text-destructive" />
      <Text className="mt-3 text-base font-bold text-foreground text-center">
        {displayTitle}
      </Text>
      <Text className="text-xs text-muted-foreground text-center mt-1 max-w-[260px] leading-relaxed">
        {displayDescription}
      </Text>
      <View className="mt-3.5 flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
        <Icon
          icon={SparklesIcon}
          size={12}
          className="text-emerald-600 dark:text-emerald-400"
        />
        <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {t("lockedFeatures") || "Unlock Features"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default LockedCard;
