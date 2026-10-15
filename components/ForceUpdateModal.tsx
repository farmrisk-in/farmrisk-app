import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "nativewind";
import { Icon } from "@/components/ui/Icon";
import {
  AlertSquareIcon,
  Download01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { useForceUpdateCheck } from "@/hooks/useForceUpdateCheck";

export function ForceUpdateModal() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { needsUpdate, isChecking, updateInfo, recheckUpdate } =
    useForceUpdateCheck();

  useEffect(() => {
    if (!needsUpdate) return;

    // Trap Android back button while force update is required
    const backAction = () => {
      return true; // prevent back navigation
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [needsUpdate]);

  if (!needsUpdate) {
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

  return (
    <Modal
      visible={needsUpdate}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-background px-6 justify-center items-center">
        {/* Card Box */}
        <View className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 items-center shadow-lg">
          {/* Icon Badge */}
          <View
            style={{
              backgroundColor: isDark
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(16, 185, 129, 0.12)",
            }}
            className="w-16 h-16 rounded-3xl items-center justify-center mb-4"
          >
            <Icon
              icon={AlertSquareIcon}
              size={32}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-foreground text-center mb-2">
            {updateInfo?.title || "Update Required"}
          </Text>

          {/* Message */}
          <Text className="text-xs text-muted-foreground text-center leading-relaxed mb-6">
            {updateInfo?.message ||
              "A critical update is required to continue using FarmRisk. Please update the app from Google Play Store to access the latest features and data."}
          </Text>

          {/* Action Button: Update on Play Store */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenStore}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 flex-row items-center justify-center gap-2 shadow-sm mb-3"
          >
            <Icon icon={Download01Icon} size={18} color="#ffffff" />
            <Text className="text-sm font-bold text-white">
              Update on Google Play
            </Text>
          </TouchableOpacity>

          {/* Secondary Action: Recheck */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={recheckUpdate}
            disabled={isChecking}
            className="w-full py-2.5 px-4 rounded-xl items-center justify-center flex-row gap-2"
          >
            {isChecking ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <>
                <Icon
                  icon={RefreshIcon}
                  size={15}
                  className="text-muted-foreground"
                />
                <Text className="text-xs font-semibold text-muted-foreground">
                  Check Again
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default ForceUpdateModal;
