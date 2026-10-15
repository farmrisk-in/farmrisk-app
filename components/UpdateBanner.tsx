import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/Icon";
import {
  Download01Icon,
  Cancel01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { useForceUpdateCheck } from "@/hooks/useForceUpdateCheck";

export function UpdateBanner() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { needsUpdate, updateInfo } = useForceUpdateCheck();
  const [dismissed, setDismissed] = useState(false);

  // If dismissed or no update needed, do not render
  if (!needsUpdate || dismissed) {
    return null;
  }

  const handleOpenStore = async () => {
    const defaultPlayStoreUrl = "market://details?id=in.farmrisk.app";
    const webFallbackUrl =
      updateInfo?.playStoreWebUrl ||
      "https://play.google.com/store/apps/details?id=in.farmrisk.app";

    const storeUrl = updateInfo?.storeUrl || defaultPlayStoreUrl;

    try {
      const supported = await Linking.canOpenURL(storeUrl);
      if (supported) {
        await Linking.openURL(storeUrl);
      } else {
        await Linking.openURL(webFallbackUrl);
      }
    } catch {
      await Linking.openURL(webFallbackUrl);
    }
  };

  // Positioned directly above the bottom tab bar (toolbar)
  const bottomOffset = 68 + Math.max(insets.bottom, 10);

  return (
    <View
      style={{
        position: "absolute",
        bottom: bottomOffset,
        left: 12,
        right: 12,
        zIndex: 9999,
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.15,
        shadowRadius: 10,
      }}
      className="bg-card border border-border rounded-2xl p-3 flex-row items-center justify-between"
    >
      {/* Left: Icon and Info */}
      <View className="flex-row items-center gap-2.5 flex-1 pr-2">
        <View
          style={{
            backgroundColor: isDark
              ? "rgba(16, 185, 129, 0.2)"
              : "rgba(16, 185, 129, 0.12)",
          }}
          className="w-9 h-9 rounded-xl items-center justify-center"
        >
          <Icon
            icon={SparklesIcon}
            size={18}
            className="text-emerald-600 dark:text-emerald-400"
          />
        </View>

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-xs font-bold text-foreground"
          >
            {updateInfo?.title || "New Update Available"}
          </Text>
          <Text
            numberOfLines={1}
            className="text-[10px] text-muted-foreground mt-0.5"
          >
            v{updateInfo?.latestVersion || "1.0.1"} with latest fixes & rates
          </Text>
        </View>
      </View>

      {/* Right: Update Button & Dismiss X */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenStore}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 flex-row items-center gap-1 shadow-sm"
        >
          <Icon icon={Download01Icon} size={13} color="#ffffff" />
          <Text className="text-xs font-bold text-white">Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setDismissed(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="w-7 h-7 rounded-full bg-muted items-center justify-center"
        >
          <Icon
            icon={Cancel01Icon}
            size={14}
            className="text-muted-foreground"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default UpdateBanner;
