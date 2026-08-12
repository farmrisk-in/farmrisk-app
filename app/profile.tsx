import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui/Icon";
import {
  Cancel01Icon,
  Globe02Icon,
  WheatIcon,
  MapPinIcon,
  Logout01Icon,
  ChevronRightIcon,
  User02Icon,
  SmartPhone01Icon,
  Mail01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useCropContext } from "@/providers/CropProvider";
import { useFarmContext } from "@/providers/FarmProvider";
import { useCrops } from "@/hooks/useCrops";
import DownloadButton from "@/components/dashboard/DownloadButton";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGE_NAMES } from "@/i18n";
import { Avatar } from "react-native-paper";

type Mode = "login" | "register";

export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<Mode>("login");
  const router = useRouter();

  // Crop selection hooks
  const { selectedCrop, setSelectedCrop } = useCropContext();
  const { selectedFarm } = useFarmContext();
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

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Delete Account State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Dev-only Wipe All Data ──
  const handleClearDevData = () => {
    Alert.alert(
      "Developer Option: Clear All Data",
      "Are you sure you want to wipe all local storage (AsyncStorage), authentication sessions, and cached state?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Data & Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await supabase.auth.signOut();
              Alert.alert(
                "Data Cleared",
                "All local app storage and sessions have been reset.",
              );
              router.replace("/onboarding/welcome");
            } catch (err: any) {
              console.error("Error resetting data:", err);
              Alert.alert(
                "Reset Error",
                err?.message || "Failed to clear local data.",
              );
            }
          },
        },
      ],
    );
  };

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

  const handleSaveProfile = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const normalizedPhone = normalizePhoneNumber(editPhone);
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          first_name: editFirstName,
          last_name: editLastName,
          phone: normalizedPhone || user.user_metadata?.phone,
        },
      });
      if (updateError) throw updateError;
      setSuccess(t("changesSaved" as any) || "Changes saved successfully");
      setIsEditingProfile(false);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const startDeleteCountdown = () => {
    setDeleteModalVisible(true);
    setDeleteCountdown(5);
    const interval = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error: delError } = await supabase.rpc('delete_user_account');
      if (delError) throw delError;
      await supabase.auth.signOut();
      setDeleteModalVisible(false);
      router.replace("/");
    } catch (err: any) {
      console.error("Delete account error:", err);
      Alert.alert("Error", err?.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Helper for active crop name
  const selectedCropName =
    crops.find((c: any) => (c.id || c.name?.toLowerCase()) === selectedCrop)
      ?.name || t("noneDefault");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Screen Top Header Bar ── */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {user
                ? t("yourProfile")
                : mode === "login"
                  ? t("signInTitle")
                  : t("registerTitle")}
            </Text>
            <Text className="text-xs font-medium text-muted-foreground mt-0.5">
              {user
                ? t("premiumActive")
                : mode === "login"
                  ? t("authSubLogin")
                  : t("authSubRegister")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center shadow-sm"
            accessibilityRole="button"
            accessibilityLabel={t("cancel")}
          >
            <Icon icon={Cancel01Icon} size={20} className="text-foreground" />
          </TouchableOpacity>
        </View>

        {/* ── Logged-in User Hero Header Card ── */}
        {user && (
          <View className="bg-card border border-border rounded-3xl p-5 mb-5 shadow-sm flex-row items-center gap-4">
            <View className="relative">
              <Avatar.Image size={58} source={require("../assets/pic5.webp")} />
              <View className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
            </View>

            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground leading-tight">
                {[user.user_metadata?.first_name, user.user_metadata?.last_name]
                  .filter(Boolean)
                  .join(" ") || t("defaultUserName")}
              </Text>
              <Text
                className="text-xs text-muted-foreground mt-0.5"
                numberOfLines={1}
              >
                {user.email}
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    PRO MEMBER
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Export Dashboard Image (Logged-in) ── */}
        {user && (
          <View className="mb-5">
            <DownloadButton selectedFarm={selectedFarm} />
          </View>
        )}

        {/* ── Section: Preferences ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Preferences
          </Text>

          <View className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            {/* Theme Toggle */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Icon
                    icon={User02Icon}
                    size={18}
                    className="text-muted-foreground"
                  />
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {t("theme")}
                </Text>
              </View>
              <ThemeToggle />
            </View>

            {/* Language Selector */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Icon
                    icon={Globe02Icon}
                    size={18}
                    className="text-muted-foreground"
                  />
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {t("language")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(true)}
                className="bg-muted border border-border px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
                accessibilityRole="button"
              >
                <Text className="text-xs font-bold text-foreground">
                  {LANGUAGE_NAMES[language]}
                </Text>
                <Icon
                  icon={ChevronRightIcon}
                  size={14}
                  className="text-muted-foreground rotate-90"
                />
              </TouchableOpacity>
            </View>

            {/* Crop Selector */}
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <Icon
                    icon={WheatIcon}
                    size={18}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {t("activeCrop")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCropModalVisible(true)}
                className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
                accessibilityRole="button"
              >
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedCrop ? selectedCropName : t("selectCrop")}
                </Text>
                <Icon
                  icon={ChevronRightIcon}
                  size={14}
                  className="text-emerald-600 dark:text-emerald-400 rotate-90"
                />
              </TouchableOpacity>
            </View>

            {/* My Farms Link */}
            <TouchableOpacity
              onPress={() => router.push("/my-farms")}
              className="flex-row items-center justify-between p-4 active:bg-muted/50"
              accessibilityRole="button"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Icon
                    icon={MapPinIcon}
                    size={18}
                    className="text-muted-foreground"
                  />
                </View>
                <Text className="text-sm font-semibold text-foreground">
                  {t("myFarms")}
                </Text>
              </View>
              <Icon
                icon={ChevronRightIcon}
                size={18}
                className="text-muted-foreground"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section: Account Details (Logged-in) ── */}
        {user && (
          <View className="mb-5">
            <View className="flex-row items-center justify-between px-1 mb-2">
              <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Details
              </Text>
              {!isEditingProfile && (
                <TouchableOpacity onPress={() => {
                  setEditFirstName(user.user_metadata?.first_name || "");
                  setEditLastName(user.user_metadata?.last_name || "");
                  setEditPhone(user.user_metadata?.phone || "");
                  setIsEditingProfile(true);
                }}>
                  <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {t("editProfile") || "Edit"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="bg-card border border-border rounded-3xl p-4 shadow-sm gap-3.5">
              <View className={`flex-row justify-between border-b border-border pb-3 ${isEditingProfile ? "flex-col gap-2 items-start" : "items-center py-1"}`}>
                <View className="flex-row items-center gap-2.5">
                  <Icon icon={User02Icon} size={16} className="text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{t("name")}</Text>
                </View>
                {isEditingProfile ? (
                  <View className="flex-row w-full gap-2 mt-1">
                    <TextInput
                      className="flex-1 bg-muted border border-border rounded-xl p-2.5 text-sm text-foreground"
                      placeholder={t("firstNamePlaceholder")}
                      value={editFirstName}
                      onChangeText={setEditFirstName}
                    />
                    <TextInput
                      className="flex-1 bg-muted border border-border rounded-xl p-2.5 text-sm text-foreground"
                      placeholder={t("lastNamePlaceholder")}
                      value={editLastName}
                      onChangeText={setEditLastName}
                    />
                  </View>
                ) : (
                  <Text className="text-sm font-bold text-foreground">
                    {[user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") || t("defaultUserName")}
                  </Text>
                )}
              </View>

              <View className={`flex-row justify-between border-b border-border pb-3 ${isEditingProfile ? "flex-col gap-2 items-start" : "items-center py-1"}`}>
                <View className="flex-row items-center gap-2.5">
                  <Icon icon={SmartPhone01Icon} size={16} className="text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{t("phone")}</Text>
                </View>
                {isEditingProfile ? (
                  <TextInput
                    className="w-full bg-muted border border-border rounded-xl p-2.5 text-sm text-foreground mt-1"
                    placeholder={t("mobilePlaceholder")}
                    value={editPhone}
                    onChangeText={setEditPhone}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text className="text-sm font-bold text-foreground">
                    {user.user_metadata?.phone || user.email?.split("@")[0] || "—"}
                  </Text>
                )}
              </View>

              <View className="flex-row items-center justify-between py-1">
                <View className="flex-row items-center gap-2.5">
                  <Icon icon={Mail01Icon} size={16} className="text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{t("emailLogin")}</Text>
                </View>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{user.email}</Text>
              </View>

              {isEditingProfile && (
                <View className="flex-row gap-2 mt-2 pt-2 border-t border-border">
                  <TouchableOpacity
                    onPress={() => setIsEditingProfile(false)}
                    className="flex-1 bg-muted py-3 rounded-xl items-center border border-border"
                  >
                    <Text className="text-sm font-bold text-muted-foreground">{t("cancel") || "Cancel"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 py-3 rounded-xl items-center"
                  >
                    {submitting ? <ActivityIndicator color="#fff" size="small" /> : (
                      <Text className="text-sm font-bold text-white">{t("saveChanges") || "Save"}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Section: Auth Form (Logged-out) ── */}
        {!user && (
          <View className="mb-5">
            <View className="bg-card border border-border rounded-3xl p-5 shadow-sm">
              {error && (
                <View className="p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <Text className="text-xs font-semibold text-destructive text-center">
                    {error}
                  </Text>
                </View>
              )}
              {success && (
                <View className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-center">
                    {success}
                  </Text>
                </View>
              )}

              {mode === "register" && (
                <>
                  <Text className="text-xs font-semibold text-foreground mb-1 mt-1">
                    {t("firstName")}
                  </Text>
                  <TextInput
                    className="bg-muted border border-border rounded-xl p-3.5 text-sm text-foreground mb-3"
                    placeholder={t("firstNamePlaceholder")}
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />

                  <Text className="text-xs font-semibold text-foreground mb-1">
                    {t("lastName")}
                  </Text>
                  <TextInput
                    className="bg-muted border border-border rounded-xl p-3.5 text-sm text-foreground mb-3"
                    placeholder={t("lastNamePlaceholder")}
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </>
              )}

              <Text className="text-xs font-semibold text-foreground mb-1">
                {t("mobileLabel")}
              </Text>
              <TextInput
                className="bg-muted border border-border rounded-xl p-3.5 text-sm text-foreground mb-3"
                placeholder={t("mobilePlaceholder")}
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text className="text-xs font-semibold text-foreground mb-1">
                {t("passwordLabel")}
              </Text>
              <TextInput
                className="bg-muted border border-border rounded-xl p-3.5 text-sm text-foreground mb-3"
                placeholder={t("passwordHint")}
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {mode === "register" && (
                <>
                  <Text className="text-xs font-semibold text-foreground mb-1">
                    {t("confirmPasswordLabel")}
                  </Text>
                  <TextInput
                    className="bg-muted border border-border rounded-xl p-3.5 text-sm text-foreground mb-3"
                    placeholder={t("confirmPlaceholder")}
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </>
              )}

              <TouchableOpacity
                onPress={handleAuth}
                disabled={submitting}
                className="bg-emerald-600 active:bg-emerald-700 rounded-xl py-3.5 items-center justify-center mt-3 shadow-md shadow-emerald-950/20"
                accessibilityRole="button"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    {mode === "login" ? t("signInBtn") : t("registerBtn")}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError(null);
                  setSuccess(null);
                }}
                className="mt-4 py-1 items-center"
              >
                <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {mode === "login" ? t("switchToRegister") : t("haveAccount")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Sign Out Action Button ── */}
        {user && (
          <View className="gap-3 mb-4">
            <TouchableOpacity
              onPress={signOut}
              className="bg-card border border-border active:bg-muted/50 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
              accessibilityRole="button"
            >
              <Icon icon={Logout01Icon} size={18} className="text-foreground" />
              <Text className="text-foreground font-bold text-sm">
                {t("nav.signOut")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={startDeleteCountdown}
              className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 active:bg-destructive/20 rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
              accessibilityRole="button"
            >
              <Text className="text-destructive font-bold text-sm">
                {t("deleteAccount") || "Delete Account"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Dev-Only Clear Data Option ── */}
        {__DEV__ && (
          <View className="p-4 border border-dashed border-amber-500/50 bg-amber-500/10 rounded-3xl mt-2">
            <Text className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 text-center">
              🛠️ Developer Mode (__DEV__)
            </Text>
            <TouchableOpacity
              onPress={handleClearDevData}
              className="bg-amber-600 active:bg-amber-700 py-3 px-4 rounded-xl items-center"
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-xs">
                Clear All Local Data & Storage
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Crop Selector Modal ── */}
      <Modal
        visible={cropModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCropModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPressOut={() => setCropModalVisible(false)}
        >
          <View className="bg-card border-t border-border rounded-t-3xl p-6 pb-12 max-h-[70%]">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-foreground mb-4">
              {t("cropPickerTitle")}
            </Text>
            <ScrollView>
              <TouchableOpacity
                className={`py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center ${
                  !selectedCrop ? "bg-muted border border-border" : ""
                }`}
                onPress={() => {
                  setSelectedCrop("");
                  setCropModalVisible(false);
                }}
              >
                <Text className="text-sm font-semibold text-foreground">
                  None / Default
                </Text>
                {!selectedCrop && (
                  <Icon
                    icon={Tick01Icon}
                    size={18}
                    className="text-emerald-500"
                  />
                )}
              </TouchableOpacity>

              {crops.map((c: any) => {
                const cid = c.id || c.name?.toLowerCase();
                const isSel = selectedCrop === cid;
                return (
                  <TouchableOpacity
                    key={cid}
                    className={`py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center ${
                      isSel
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : ""
                    }`}
                    onPress={() => {
                      setSelectedCrop(cid);
                      setCropModalVisible(false);
                    }}
                  >
                    <Text className="text-sm font-semibold text-foreground">
                      {c.name}{" "}
                      <Text className="text-xs text-muted-foreground font-normal">
                        ({c.area} ha)
                      </Text>
                    </Text>
                    {isSel && (
                      <Icon
                        icon={Tick01Icon}
                        size={18}
                        className="text-emerald-500"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Language Selector Modal ── */}
      <LanguageSelector
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

      {/* ── Delete Account Modal ── */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-card border border-border rounded-3xl p-6 shadow-xl">
            <Text className="text-xl font-bold text-destructive mb-2 text-center">
              {t("deleteAccountTitle") || "Delete Account"}
            </Text>
            <Text className="text-sm font-medium text-foreground text-center mb-6 leading-relaxed">
              {t("deleteAccountDesc") || "This action is irreversible. All your data will be permanently deleted."}
            </Text>

            <View className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-6">
              <Text className="text-sm font-bold text-destructive text-center">
                {t("deleteAgreeLabel") || "I understand and wish to delete my account"}
              </Text>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                onPress={executeDeleteAccount}
                disabled={deleteCountdown > 0 || isDeleting}
                className={`py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${
                  deleteCountdown > 0 || isDeleting
                    ? "bg-destructive/50"
                    : "bg-destructive active:bg-destructive/80"
                }`}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    {deleteCountdown > 0
                      ? `${t("confirmDelete") || "Delete Forever"} (${deleteCountdown})`
                      : t("confirmDelete") || "Delete Forever"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
                className="py-3.5 rounded-xl items-center border border-border bg-muted"
              >
                <Text className="text-muted-foreground font-bold text-sm">
                  {t("cancel") || "Cancel"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
