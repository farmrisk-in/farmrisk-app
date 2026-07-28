import React from "react";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";
import { cssInterop } from "nativewind";

const registeredIcons = new Set<any>();

/**
 * Enables NativeWind `className` styling on any Lucide icon component.
 * Maps Tailwind color & opacity utilities (e.g. `text-primary`, `text-emerald-500`, `opacity-80`)
 * directly to the SVG icon props cleanly without breaking layout width/height.
 */
export function iconWithClassName<T extends LucideIcon>(icon: T): T {
  if (!registeredIcons.has(icon)) {
    cssInterop(icon, {
      className: {
        target: "style",
        nativeStyleToProp: {
          color: true,
          opacity: true,
        },
      },
    } as any);
    registeredIcons.add(icon);
  }
  return icon;
}

export interface IconProps extends LucideProps {
  icon: LucideIcon;
  className?: string;
}

/**
 * Universal Icon wrapper component.
 * Usage: `<Icon icon={Search} className="text-emerald-500" size={24} />`
 */
export function Icon({ icon: IconComponent, ...props }: IconProps) {
  iconWithClassName(IconComponent);
  return <IconComponent {...props} />;
}

// Proxy export: automatically applies `iconWithClassName` to ANY Lucide icon accessed via `Icons.IconName`
export const Icons = new Proxy({} as typeof LucideIcons, {
  get(_target, prop: string) {
    const rawIcon = (LucideIcons as any)[prop];
    if (
      typeof rawIcon === "function" ||
      (typeof rawIcon === "object" && rawIcon !== null)
    ) {
      return iconWithClassName(rawIcon);
    }
    return rawIcon;
  },
});
