import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Icon } from "@/components/ui/Icon";
import { LockPasswordIcon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLocked } from "@/hooks/useLocked";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

interface LockedFeatureProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  isPremium?: boolean; // If true, only unlocked for premium users. If false, unlocked for logged-in users.
}

export function LockedFeature({
  children,
  style,
  className,
}: LockedFeatureProps) {
  const { isLocked } = useLocked();
  const router = useRouter();
  const { t } = useTranslation(["common"]);

  if (!isLocked) {
    return (
      <View style={style} className={className}>
        {children}
      </View>
    );
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
      <View className="absolute inset-0 items-center justify-center">
        {/* Radial Gradient Background Overlay */}
        <Svg height="100%" width="100%" className="absolute inset-0">
          <Defs>
            <RadialGradient
              id="fadeGradient"
              cx="50%"
              cy="50%"
              rx="70%" /* Adjust this to control how far out the solid center stretches */
              ry="70%"
              fx="50%"
              fy="50%"
            >
              {/* Opaque center (100% opacity) */}
              <Stop offset="0%" stopColor="#000000" stopOpacity="1" />
              {/* Fades to 40% opacity at the edges */}
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#fadeGradient)"
          />
        </Svg>

        {/* Just the Icon and Text (No Box) */}
        <View className="items-center z-10">
          <Icon icon={LockPasswordIcon} />
          {/* Add your Tailwind text color class below, e.g., text-foreground */}
          <Text className="text-white mt-3 text-lg font-medium">Locked</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
