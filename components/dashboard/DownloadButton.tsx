import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Icons } from "@/components/iconLoader";
export function DownloadButton(props: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      onPress={() => console.log("download")}
      className={`p-2.5 bg-muted rounded-2xl items-center border border-border justify-center ${props.className || ""}`}
      accessibilityRole="button"
      accessibilityLabel="Download"
      {...props}
    >
      <Icons.Download size={20} className="text-foreground" />
    </TouchableOpacity>
  );
}
