import React from "react";
import { HugeiconsIcon, HugeiconsProps } from "@hugeicons/react-native";
import { cssInterop } from "nativewind";

cssInterop(HugeiconsIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      opacity: true,
    },
  },
});

export interface IconProps extends Omit<HugeiconsProps, "icon"> {
  icon: any;
  className?: string;
}

export function Icon({ icon, size = 24, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      {...(props as any)}
    />
  );
}
