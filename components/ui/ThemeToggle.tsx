import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useColorScheme } from "nativewind";
import { Sun, Moon } from "lucide-react-native";

export function ThemeToggle(props: TouchableOpacityProps) {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      onPress={toggleColorScheme}
      className={`p-2 bg-muted rounded-full items-center justify-center ${props.className || ""}`}
      accessibilityRole="button"
      accessibilityLabel="Toggle Theme"
      {...props}
    >
      {isDark ? (
        <Sun size={22} color="#fafafa" />
      ) : (
        <Moon size={22} color="#09090b" />
      )}
    </TouchableOpacity>
  );
}
