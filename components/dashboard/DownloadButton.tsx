import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { Download01Icon } from "@hugeicons/core-free-icons";

export function DownloadButton(props: TouchableOpacityProps) {
  return (
    <TouchableOpacity
      onPress={() => console.log("download")}
      className={`p-2.5 bg-muted rounded-2xl items-center border border-border justify-center ${props.className || ""}`}
      accessibilityRole="button"
      accessibilityLabel="Download"
      {...props}
    >
      <Icon icon={Download01Icon} size={20} className="text-foreground" />
    </TouchableOpacity>
  );
}
