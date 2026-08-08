import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useTranslation } from "react-i18next";
import { i18n, changeAppLanguage, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { Tick01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet language picker. Calls `changeAppLanguage`, which persists the
 * preference to AsyncStorage and switches the active i18next language —
 * every `useTranslation()` consumer re-renders instantly, no app reload.
 */
export function LanguageSelector({ visible, onClose }: Props) {
  const { t } = useTranslation();

  const select = async (code: (typeof SUPPORTED_LANGUAGES)[number]) => {
    await changeAppLanguage(code);
    onClose();
  };

  const current = i18n.language;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        activeOpacity={1}
        onPressOut={onClose}
      >
        <TouchableWithoutFeedback>
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pb-12">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                {t("chooseLanguage")}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full"
                accessibilityRole="button"
                accessibilityLabel={t("cancel")}
              >
                <Icon
                  icon={Cancel01Icon}
                  size={20}
                  className="text-gray-900 dark:text-white"
                />
              </TouchableOpacity>
            </View>

            {SUPPORTED_LANGUAGES.map((code) => {
              const isActive = current === code;
              return (
                <TouchableOpacity
                  key={code}
                  onPress={() => select(code)}
                  className={`flex-row items-center justify-between px-4 py-4 rounded-2xl mb-2 border ${
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800"
                      : "bg-gray-100 dark:bg-gray-700/40 border-transparent"
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text className="text-lg text-gray-900 dark:text-white font-medium">
                    {LANGUAGE_NAMES[code]}
                  </Text>
                  {isActive && (
                    <Icon
                      icon={Tick01Icon}
                      size={22}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}
