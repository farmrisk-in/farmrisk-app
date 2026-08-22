import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
import { cssInterop } from "nativewind";

export interface LogoProps extends SvgProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, ...props }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <Path
        d="M16 4C9 4 5 9 5 16c0 6 4 11 11 12 0-9 3-14 10-17-3-4-7-7-10-7Z"
        fill="#3FA372"
      />
      <Path
        d="M16 28C11 20 12 12 16 6"
        stroke="#0F4C3A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

cssInterop(Logo, {
  className: {
    target: "style",
  },
});
