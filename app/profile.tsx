import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui/Icon";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useCropContext } from "@/providers/CropProvider";
import { useCrops } from "@/hooks/useCrops";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGE_NAMES } from "@/i18n";

type Mode = "login" | "register";

export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<Mode>("login");
  const router = useRouter();
  
  const { colorScheme } = useColorScheme();
  
  // Crop selection hooks
  const { selectedCrop, setSelectedCrop } = useCropContext();
  const { crops } = useCrops();
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async () => {
    setError(null);
    setSuccess(null);

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      setError(t("errorPhoneText"));
      return;
    }

    const email = `${normalizedPhone}@farmrisk.app`;

    if (!password) {
      setError(t("errorPasswordRequired"));
      return;
    }

    if (mode === "register") {
      if (!firstName.trim()) {
        setError(t("errorFirstName"));
        return;
      }
      if (!lastName.trim()) {
        setError(t("errorLastName"));
        return;
      }
      if (password.length < 6) {
        setError(t("errorPasswordLength"));
        return;
      }
      if (password !== confirmPassword) {
        setError(t("errorPasswordMatch"));
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              phone: normalizedPhone,
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess(t("registrationSuccess"));
          // Clear inputs
          setFirstName("");
          setLastName("");
          setPhone("");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          setSuccess(t("loginSuccess"));
          setPassword("");
        }
      }
    } catch (err: any) {
      console.error("Auth error", err);
      setError(err?.message || t("errorUnexpected"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center} className="bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (user) {
    const meta = user.user_metadata || {};
    const name = [meta.first_name, meta.last_name].filter(Boolean).join(" ");
    const phoneNo = meta.phone || user.email?.split("@")[0] || "";

    // Helper to get nice name
    const selectedCropName = crops.find((c: any) => (c.id || c.name?.toLowerCase()) === selectedCrop)?.name || t("noneDefault");

    return (
      <SafeAreaView
        style={styles.safeArea}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text
                style={styles.title}
                className="text-gray-900 dark:text-white"
              >
                {t("yourProfile")}
              </Text>
              <Text
                style={styles.subtitle}
                className="text-gray-600 dark:text-gray-400 text-left"
              >
                {t("premiumActive")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
            >
              <Icon
                icon={Cancel01Icon}
                size={24}
                className="text-gray-900 dark:text-white"
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>

          <View
            style={styles.profileCard}
            className="bg-white dark:bg-gray-800"
          >
            <View style={styles.infoRow} className="items-center">
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                {t("theme")}
              </Text>
              <ThemeToggle />
            </View>

            {/* Language Selector Row */}
            <View style={styles.infoRow} className="items-center">
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                {t("language")}
              </Text>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(true)}
                className="bg-emerald-100 dark:bg-emerald-900/50 px-4 py-2 rounded-xl"
                accessibilityRole="button"
              >
                <Text className="text-emerald-800 dark:text-emerald-400 font-bold">
                  {LANGUAGE_NAMES[language]} ▾
                </Text>
              </TouchableOpacity>
            </View>

            {/* Crop Selector Dropdown */}
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]} className="items-center">
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                {t("activeCrop")}
              </Text>
              <TouchableOpacity
                onPress={() => setCropModalVisible(true)}
                className="bg-emerald-100 dark:bg-emerald-900/50 px-4 py-2 rounded-xl"
              >
                <Text className="text-emerald-800 dark:text-emerald-400 font-bold">
                  {selectedCrop ? selectedCropName : t("selectCrop")} ▾
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Crop Selector Modal */}
          <Modal visible={cropModalVisible} transparent animationType="slide" onRequestClose={() => setCropModalVisible(false)}>
            <TouchableOpacity className="flex-1 bg-black/50 justify-end" activeOpacity={1} onPressOut={() => setCropModalVisible(false)}>
              <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pb-12 max-h-[70%]">
                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t("cropPickerTitle")}</Text>
                <ScrollView>
                  <TouchableOpacity
                    className={`py-4 border-b border-gray-100 dark:border-gray-700 flex-row justify-between items-center ${!selectedCrop ? 'bg-gray-50 dark:bg-gray-700/30' : ''}`}
                    onPress={() => {
                      setSelectedCrop("");
                      setCropModalVisible(false);
                    }}
                  >
                    <Text className="text-base text-gray-900 dark:text-white font-medium">None / Default</Text>
                    {!selectedCrop && <Text className="text-emerald-600">✓</Text>}
                  </TouchableOpacity>
                  {crops.map((c: any) => {
                    const cid = c.id || c.name?.toLowerCase();
                    const isSel = selectedCrop === cid;
                    return (
                      <TouchableOpacity
                        key={cid}
                        className={`py-4 border-b border-gray-100 dark:border-gray-700 flex-row justify-between items-center px-2 ${isSel ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}
                        onPress={() => {
                          setSelectedCrop(cid);
                          setCropModalVisible(false);
                        }}
                      >
                        <Text className="text-base text-gray-900 dark:text-white font-medium">
                          {c.name} <Text className="text-xs text-gray-500">({c.area} ha)</Text>
                        </Text>
                        {isSel && <Text className="text-emerald-600 font-bold">✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          <View
            style={styles.profileCard}
            className="bg-white dark:bg-gray-800"
          >
            <View style={styles.infoRow}>
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                {t("name")}
              </Text>
              <Text
                style={styles.infoValue}
                className="text-gray-900 dark:text-white"
              >
                {name || t("defaultUserName")}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                {t("phone")}
              </Text>
              <Text
                style={styles.infoValue}
                className="text-gray-900 dark:text-white"
              >
                {phoneNo}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                {t("emailLogin")}
              </Text>
              <Text
                style={styles.infoValue}
                className="text-gray-900 dark:text-white"
              >
                {user.email}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.buttonLogout} onPress={signOut}>
            <Text style={styles.buttonText}>{t("nav.signOut")}</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Language Selector Modal */}
        <LanguageSelector
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      className="bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-1 mr-4">
            <Text
              style={styles.title}
              className="text-gray-900 dark:text-white"
            >
              {mode === "login" ? t("signInTitle") : t("registerTitle")}
            </Text>
            <Text
              style={styles.subtitle}
              className="text-gray-600 dark:text-gray-400 text-left"
            >
              {mode === "login"
                ? t("authSubLogin")
                : t("authSubRegister")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full"
          >
            <Icon
              icon={Cancel01Icon}
              size={24}
              className="text-gray-900 dark:text-white"
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.profileCard} className="bg-white dark:bg-gray-800">
          <View style={styles.infoRow} className="items-center">
            <Text
              style={styles.infoLabel}
              className="text-gray-500 dark:text-gray-400"
            >
              {t("theme")}
            </Text>
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.form} className="dark:bg-gray-800">
          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && <Text style={styles.successText}>{success}</Text>}

          {mode === "register" && (
            <>
              <Text style={styles.label}>{t("firstName")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("firstNamePlaceholder")}
                value={firstName || ""}
                onChangeText={(text) => setFirstName(text || "")}
                autoCapitalize="words"
              />

              <Text style={styles.label}>{t("lastName")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("lastNamePlaceholder")}
                value={lastName || ""}
                onChangeText={(text) => setLastName(text || "")}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>{t("mobileLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("mobilePlaceholder")}
            keyboardType="phone-pad"
            value={phone || ""}
            onChangeText={(text) => setPhone(text || "")}
          />

          <Text style={styles.label}>{t("passwordLabel")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("passwordHint")}
            secureTextEntry
            value={password || ""}
            onChangeText={(text) => setPassword(text || "")}
          />

          {mode === "register" && (
            <>
              <Text style={styles.label}>{t("confirmPasswordLabel")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("confirmPlaceholder")}
                secureTextEntry
                value={confirmPassword || ""}
                onChangeText={(text) => setConfirmPassword(text || "")}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.buttonSubmit}
            onPress={handleAuth}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "login" ? t("signInBtn") : t("registerBtn")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
              setSuccess(null);
            }}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? t("switchToRegister")
                : t("haveAccount")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    padding: 24,
    paddingTop: 48,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonSubmit: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonLogout: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    color: "#059669",
    fontSize: 14,
    fontWeight: "500",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
});
