import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, Avatar } from "react-native-paper";
import { Icon } from "@/components/ui/Icon";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { useTranslation } from "react-i18next";

export function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation(["common"]);

  // Time-based greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 17) return t("goodAfternoon");
    if (hour < 21) return t("goodEvening");
    return t("goodNight");
  };

  // Extract user's name if logged in
  const meta = user?.user_metadata || {};
  const userName =
    [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
    meta.name ||
    user?.email?.split("@")[0] ||
    t("defaultUserName");

  return (
    <View className="flex-row items-center justify-between py-1">
      {user ? (
        /* Logged In Header */
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          activeOpacity={0.8}
          className="flex-row items-center gap-3"
        >
          <Avatar.Image
            size={45}
            // label={
            //   userName.split(" ")[0][0].toUpperCase() +
            //   userName.split(" ")[1][0].toUpperCase()
            // }
            source={require("../../assets/pic5.webp")}
            // color="white"
          />
          <View>
            <Text className="text-sm text-muted-foreground font-medium">
              {getGreeting()}
            </Text>
            <Text
              
              className="text-3xl text-foreground font-semibold"
              numberOfLines={1}
            >
              {userName}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        /* Logged Out Header */
        <View className="flex-row items-center gap-2">
          <Logo size={32} />
          <Text
            style={{ fontSize: 26  }}
            className="text-foreground font-semibold"
          >
            FarmRisk
          </Text>
        </View>
      )}

      {/* Header Action Buttons */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          accessibilityRole="button"
          accessibilityLabel={t("profileSettings")}
        >
          <Icon icon={Menu01Icon} size={30} className="text-foreground" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
