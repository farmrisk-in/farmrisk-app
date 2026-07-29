import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useColorScheme } from "nativewind";
import { Icon } from "@/components/ui/Icon";
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons";

export function ThemeToggle(props: TouchableOpacityProps) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      className={`p-2.5 bg-muted rounded-2xl items-center border border-border justify-center ${props.className || ""}`}
      accessibilityRole="button"
      accessibilityLabel="Toggle Theme"
      {...props}
    >
      {isDark ? (
        <Icon icon={Sun01Icon} size={22} className="text-foreground" />
      ) : (
        <Icon icon={Moon01Icon} size={22} className="text-foreground" />
      )}
    </TouchableOpacity>
  );
}
