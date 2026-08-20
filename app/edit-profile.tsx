import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { Icon } from "@/components/ui/Icon";
import {
  ChevronLeftIcon,
  User02Icon,
  SmartPhone01Icon,
  MapPinIcon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { t } = useTranslation(["profile", "common", "auth"]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sync state with fetched profile or auth user metadata
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setAge(profile.age ? String(profile.age) : "");
      setLocation(profile.location || "");
    } else if (user) {
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
      setPhone(user.user_metadata?.phone || user.email?.replace("@farmrisk.app", "") || "");
      setAge(user.user_metadata?.age ? String(user.user_metadata.age) : "");
      setLocation(user.user_metadata?.location || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    let ageNum: number | null = null;
    if (age.trim()) {
      const parsed = parseInt(age.trim(), 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 120) {
        setError("Please enter a valid age between 1 and 120.");
        return;
      }
      ageNum = parsed;
    }

    if (phone.trim()) {
      const normalizedPhone = normalizePhoneNumber(phone.trim());
      if (!normalizedPhone) {
        setError(t("auth:errorPhoneText") || "Please enter a valid 10-digit Indian phone number.");
        return;
      }
    }

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        age: ageNum,
        location: location.trim(),
      });

      setSuccess(t("saveChanges") + " " + (t("common:retrying") ? "" : "") + "✓" || "Changes saved successfully!");
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/profile");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err?.message || "Failed to save profile changes.");
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      {/* ── Top Header ── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center shadow-sm"
          accessibilityRole="button"
        >
          <Icon icon={ChevronLeftIcon} size={22} className="text-foreground" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-foreground">
          {t("editProfileTitle") || "Edit Profile"}
        </Text>

        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : (
            <View className="space-y-4">
              {/* Alert Feedback */}
              {error && (
                <View className="flex-row items-center gap-2 p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 mb-3">
                  <Icon icon={AlertCircleIcon} size={18} className="text-destructive shrink-0" />
                  <Text className="text-xs font-semibold text-destructive flex-1">{error}</Text>
                </View>
              )}

              {success && (
                <View className="flex-row items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
                  <Icon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex-1">{success}</Text>
                </View>
              )}

              {/* Form Card */}
              <View className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                {/* First Name */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1 flex-row items-center gap-1.5">
                    {t("auth:firstName") || "First Name"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-3.5 py-3">
                    <Icon icon={User02Icon} size={18} className="text-muted-foreground mr-2.5 shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("auth:firstNamePlaceholder") || "Enter first name"}
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Last Name */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("auth:lastName") || "Last Name"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-3.5 py-3">
                    <Icon icon={User02Icon} size={18} className="text-muted-foreground mr-2.5 shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("auth:lastNamePlaceholder") || "Enter last name"}
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Phone */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("phone") || "Phone Number"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-3.5 py-3">
                    <Icon icon={SmartPhone01Icon} size={18} className="text-muted-foreground mr-2.5 shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("auth:mobilePlaceholder") || "10-digit mobile"}
                      placeholderTextColor="#9ca3af"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* Age */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("age") || "Age"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-3.5 py-3">
                    <Icon icon={Calendar03Icon} size={18} className="text-muted-foreground mr-2.5 shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("agePlaceholder") || "e.g. 35"}
                      placeholderTextColor="#9ca3af"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                </View>

                {/* Location / Village */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("location") || "Location / Village"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-3.5 py-3">
                    <Icon icon={MapPinIcon} size={18} className="text-muted-foreground mr-2.5 shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("locationPlaceholder") || "Village, district, or city"}
                      placeholderTextColor="#9ca3af"
                      value={location}
                      onChangeText={setLocation}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="pt-3">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isUpdating}
                  className="bg-emerald-600 active:bg-emerald-700 rounded-2xl py-4 items-center justify-center shadow-md shadow-emerald-950/20"
                  accessibilityRole="button"
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {t("saveChanges") || "Save Changes"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
