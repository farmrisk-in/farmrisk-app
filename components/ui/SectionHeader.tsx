import React, { ReactNode } from "react";
import { View, Text, ViewProps, TextProps } from "react-native";
import { Icon } from "@/components/ui/Icon";

export interface SectionHeaderProps extends ViewProps {
  icon: any; // HugeIcon component
  title: string;
  iconSize?: number;
  iconClassName?: string;
  iconColor?: string;
  iconStrokeWidth?: number;
  titleClassName?: string;
  titleProps?: Omit<TextProps, "children" | "className">;
  rightContent?: ReactNode;
  containerClassName?: string;
}

export function SectionHeader({
  icon,
  title,
  iconSize = 26,
  iconClassName = "text-foreground",
  iconColor,
  iconStrokeWidth = 2,
  titleClassName = "flex-1 shrink text-lg text-foreground font-semibold",
  titleProps,
  rightContent,
  containerClassName = "flex pb-4 flex-row gap-2 items-center",
  style,
  ...props
}: SectionHeaderProps) {
  return (
    <View className={containerClassName} style={style} {...props}>
      <Icon
        icon={icon}
        size={iconSize}
        className={iconClassName}
        color={iconColor}
        strokeWidth={iconStrokeWidth}
      />
      <Text
        className={titleClassName}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        {...titleProps}
      >
        {title}
      </Text>
      {rightContent && (
        <View className="flex-row items-center gap-1">{rightContent}</View>
      )}
    </View>
  );
}
