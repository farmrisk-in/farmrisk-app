import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Download } from "lucide-react-native";
import { useColorScheme } from "nativewind";
export function DownloadButton(props: TouchableOpacityProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <TouchableOpacity
      onPress={() => console.log("download")}
      className={`p-2.5 bg-muted rounded-2xl items-center border border-border justify-center ${props.className || ""}`}
      accessibilityRole="button"
      accessibilityLabel="Download"
      {...props}
    >
      {isDark ? (
        <Download size={20} color="white" />
      ) : (
        <Download size={20} color="black" />
      )}
    </TouchableOpacity>
  );
}
