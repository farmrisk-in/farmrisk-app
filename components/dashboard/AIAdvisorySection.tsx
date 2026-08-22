import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAI } from "@/hooks/useAI";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { Book02Icon, BotIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { i18n } from "@/i18n";
import { useTranslation } from "react-i18next";

interface Props {
  crop?: string;
}

export function AIAdvisorySection({ crop }: Props) {
  const { t } = useTranslation(["dashboard"]);
  const { data, sources, isLoading, isError } = useAI(crop, i18n.language);
  const [modalVisible, setModalVisible] = useState(false);
  let padMax = 0;
  if (sources && sources.length > 0) {
    sources.forEach((source: any) => {
      padMax = Math.max(padMax, source.page);
    });
  }
  padMax = padMax.toString().length;

  const renderHighlightedText = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");

    return (
      <View className="flex flex-col gap-1">
        {lines.map((line, lineIndex) => {
          if (line.trim() === "")
            return <View key={lineIndex} className="h-2" />;

          const isHeader = line.startsWith("#");
          const isBullet =
            line.trim().startsWith("-") ||
            (line.trim().startsWith("*") && !line.trim().startsWith("**"));

          let cleanLine = line;
          if (isHeader) cleanLine = cleanLine.replace(/^#+\s*/, "");
          if (isBullet) cleanLine = cleanLine.replace(/^[-*]\s*/, "");

          // Split by bold (**text**) AND italic (*text*) simultaneously
          const parts = cleanLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);

          return (
            <View
              key={lineIndex}
              className={`flex-row ${isBullet ? "pl-3" : ""} mb-1`}
            >
              {isBullet && (
                <Text className="text-emerald-500 mr-2 text-sm leading-6">
                  •
                </Text>
              )}
              {/* Ensure the parent Text component wraps the inline spans correctly */}
              <Text
                className={`flex-1 text-foreground ${isHeader ? "text-lg font-bold mb-1" : "text-sm leading-6"}`}
              >
                {parts.map((part, index) => {
                  if (!part) return null; // Skip empty string segments safely

                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <Text
                        key={index}
                        className="font-bold text-orange-700 dark:text-orange-400"
                      >
                        {part.slice(2, -2)}
                      </Text>
                    );
                  }

                  if (
                    part.startsWith("*") &&
                    part.endsWith("*") &&
                    part.length > 2
                  ) {
                    return (
                      <Text
                        key={index}
                        className="font-bold text-orange-600 dark:text-orange-500"
                      >
                        {part.slice(1, -1)}
                      </Text>
                    );
                  }

                  return <Text key={index}>{part}</Text>;
                })}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };
  return (
    <LockedFeature>
      <View className="my-6 p-6 rounded-3xl overflow-hidden border border-emerald-400 dark:border-emerald-900/50 relative  bg-emerald-50 dark:bg-emerald-950/20">
        <SectionHeader
          icon={BotIcon}
          title={t("aiTitle")}
          iconSize={30}
          iconClassName="text-primary dark:text-white"
          containerClassName="flex flex-row gap-2 pb-4 justify-center items-end"
          rightContent={
            sources && (
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
              >
                <View className="flex flex-row rounded-xl gap-1 px-3 py-1.5 items-center bg-emerald-100 dark:bg-emerald-900/50">
                  <Icon icon={Book02Icon} size={15} color="#059669" />
                  <Text className="font-bold text-[11px] uppercase text-emerald-700 dark:text-emerald-300">
                    {t("sources")}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }
        />

        <View>
          {isLoading && (
            <View className="py-6 items-center">
              <ActivityIndicator size="large" color="#059669" />
              <Text className="text-muted-foreground mt-3 text-sm font-medium">
                {t("generatingAdvisory")}
              </Text>
            </View>
          )}
          {isError && (
            <View className="py-4 bg-red-50 dark:bg-red-950/30 rounded-2xl px-4 border border-red-200 dark:border-red-900/50">
              <Text className="text-red-600 dark:text-red-400 font-medium">
                {t("advisoryFailed")}
              </Text>
            </View>
          )}
          {data && !isLoading && !isError && (
            <View>{renderHighlightedText(data)}</View>
          )}
        </View>

        {/* Sources Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/60 justify-center px-4"
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback>
              <View className="bg-card w-full max-h-[80%] rounded-[35px] p-4 border border-border shadow-lg">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-full items-center justify-center bg-emerald-100 dark:bg-emerald-900/50">
                      <Icon icon={Book02Icon} size={24} color="#059669" />
                    </View>
                    <Text className="text-xl font-bold text-foreground">
                      {t("dataSources")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="p-2 bg-muted rounded-full"
                  >
                    <Icon
                      icon={Cancel01Icon}
                      size={20}
                      className="text-foreground"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="mb-1">
                  <View className="mb-2 mt-2">
                    {sources?.map((sourceObj: any, i: number) => {
                      return (
                        <View key={i} className="flex-row p-4 gap-3 items-center">
                          <View className="w-3 h-3 rounded-full bg-emerald-500" />
                          <Text className="text-sm text-foreground leading-6 flex-1 font-medium">
                            {sourceObj.source}
                          </Text>
                          {sourceObj.page && (
                            <Text className="text-xs text-muted-foreground">
                              {t("page")}{" "}
                              {sourceObj.page.toString().padStart(padMax, "0")}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                    {(!sources || sources.length === 0) && (
                      <Text className="text-muted-foreground text-center py-4">
                        {t("noSources")}
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      </View>
    </LockedFeature>
  );
}
