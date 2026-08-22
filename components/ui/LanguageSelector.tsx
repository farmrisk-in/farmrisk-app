import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  changeAppLanguage,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES,
  LanguageCode,
} from "@/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Icon } from "@/components/ui/Icon";
import { Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet language picker.
 */
export function LanguageSelector({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const select = async (code: LanguageCode) => {
    await changeAppLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        activeOpacity={1}
        onPressOut={onClose}
      >
        <TouchableWithoutFeedback>
          <View className="bg-card border-t border-border rounded-t-3xl p-6 pb-12 max-h-[80%]">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-foreground">
                {t("chooseLanguage") || "Choose Language"}
              </Text>

              <TouchableOpacity
                onPress={onClose}
                className="w-9 h-9 bg-muted border border-border rounded-full items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={t("cancel") || "Close"}
              >
                <Icon
                  icon={Cancel01Icon}
                  size={18}
                  className="text-foreground"
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map((code) => {
                const isActive = language === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => select(code)}
                    className={`flex-row items-center justify-between px-4 py-4 rounded-2xl mb-2.5 border ${
                      isActive
                        ? "bg-emerald-100 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
                        : "bg-muted border-border"
                    }`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        isActive
                          ? "text-emerald-700 dark:text-emerald-300 font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {LANGUAGE_NAMES[code]}
                    </Text>
                    {isActive && (
                      <Icon
                        icon={Tick02Icon}
                        size={20}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}
