import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Download01Icon } from "@hugeicons/core-free-icons";

export function DownloadButton(props: TouchableOpacityProps) {
  const { t } = useTranslation(["common"]);
  return (
    <TouchableOpacity
      onPress={() => console.log("download")}
      className={`p-2.5 bg-muted rounded-2xl items-center border border-border justify-center ${props.className || ""}`}
      accessibilityRole="button"
      accessibilityLabel={t("download")}
      {...props}
    >
      <Icon icon={Download01Icon} size={20} className="text-foreground" />
    </TouchableOpacity>
  );
}
