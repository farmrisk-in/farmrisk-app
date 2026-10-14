import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import { useColorScheme } from "nativewind";
import { isCustomAvatar } from "@/lib/avatar";

export interface UserAvatarProps {
  size?: number;
  avatarUrl?: string | null;
  style?: StyleProp<ViewStyle>;
  className?: string;
  borderColor?: string;
}

export function UserAvatar({
  size = 45,
  avatarUrl,
  style,
  className,
  borderColor,
}: UserAvatarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const hasCustomPhoto = isCustomAvatar(avatarUrl);

  const iconSize = Math.round(size * 0.62);
  const resolvedBorderColor =
    borderColor || (isDark ? "rgba(255, 255, 255, 0.12)" : "#e4e4e7");
  const backgroundColor = isDark ? "#27272a" : "#f4f4f5";
  const iconFill = isDark ? "#d4d4d8" : "#71717a";

  return (
    <View
      className={`items-center justify-center overflow-hidden rounded-full ${className || ""}`}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: 1,
          borderColor: resolvedBorderColor,
        },
        style,
      ]}
    >
      {hasCustomPhoto ? (
        <Image
          source={{ uri: avatarUrl!.trim() }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <Svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 16 16"
          fill="none"
        >
          <Path
            d="m 8 1 c -1.65625 0 -3 1.34375 -3 3 s 1.34375 3 3 3 s 3 -1.34375 3 -3 s -1.34375 -3 -3 -3 z m -1.5 7 c -2.492188 0 -4.5 2.007812 -4.5 4.5 v 0.5 c 0 1.109375 0.890625 2 2 2 h 8 c 1.109375 0 2 -0.890625 2 -2 v -0.5 c 0 -2.492188 -2.007812 -4.5 -4.5 -4.5 z m 0 0"
            fill={iconFill}
          />
        </Svg>
      )}
    </View>
  );
}

export default UserAvatar;
