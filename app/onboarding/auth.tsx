import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Icon } from "@/components/ui/Icon";
import { ChevronLeftIcon, Globe02Icon } from "@hugeicons/core-free-icons";
import { supabase } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/auth/phone";

type Mode = "login" | "register";

/**
 * Step 3 — Auth screen (login / register / guest).
 *
 * Integrates with the existing Supabase phone auth. A prominent "Continue as
 * Guest" link allows skipping auth entirely and proceeding to Step 4.
 */
export default function Auth() {
  const { t } = useTranslation(["auth", "common"]);

  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [langVisible, setLangVisible] = useState(false);
  const goNext = () => router.replace("/onboarding/location-perm");

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
          goNext();
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
          goNext();
        }
      }
    } catch (err: any) {
      console.error("Auth error", err);
      setError(err?.message || t("errorUnexpected"));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setSuccess(null);
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const continueAsGuest = () => {
    setError(null);
    goNext();
  };

  const inputClass =
    "bg-card border border-border rounded-2xl px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-5 pt-12 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between mb-6">
          {/* Back to welcome */}
          <Pressable
            onPress={() => router.replace("/onboarding/welcome")}
            accessibilityRole="button"
            accessibilityLabel={t("common:cancel")}
          >
            <Icon
              icon={ChevronLeftIcon}
              size={32}
              className="text-foreground"
            />
          </Pressable>

          <Pressable
            onPress={() => setLangVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t("common:chooseLanguage")}
          >
            <Icon
              icon={Globe02Icon}
              size={28}
              strokeWidth={1}
              className="text-foreground"
            />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(600)}>
          <Text className="text-2xl font-bold text-foreground">
            {mode === "register" ? t("registerTitle") : t("signInTitle")}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(600)}
          className="mt-6 gap-4"
        >
          {mode === "register" && (
            <>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t("firstNamePlaceholder")}
                placeholderTextColor="#71717b"
                className={inputClass}
                autoCapitalize="words"
              />
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder={t("lastNamePlaceholder")}
                placeholderTextColor="#71717b"
                className={inputClass}
                autoCapitalize="words"
              />
            </>
          )}

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder={t("mobilePlaceholder")}
            placeholderTextColor="#71717b"
            keyboardType="phone-pad"
            maxLength={10}
            className={inputClass}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("passwordPlaceholder")}
            placeholderTextColor="#71717b"
            secureTextEntry
            className={inputClass}
          />

          {mode === "register" && (
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("confirmPlaceholder")}
              placeholderTextColor="#71717b"
              secureTextEntry
              className={inputClass}
            />
          )}

          {/* Error */}
          {error && (
            <Text className="text-destructive-foreground text-sm text-center mt-1">
              {error}
            </Text>
          )}

          {/* Success */}
          {success && (
            <Text className="text-primary-foreground text-sm text-center mt-1">
              {success}
            </Text>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleAuth}
            disabled={submitting}
            className="mt-2 rounded-2xl bg-primary items-center justify-center py-4 disabled:opacity-50"
            accessibilityRole="button"
          >
            {submitting ? (
              <ActivityIndicator className="text-foreground" />
            ) : (
              <Text className="text-foreground text-lg font-semibold w-full text-center">
                {mode === "register" ? t("registerBtn") : t("signInBtn")}
              </Text>
            )}
          </Pressable>

          {/* Toggle mode */}
          <Pressable onPress={toggleMode} className="items-center py-3">
            <Text className="text-muted-foreground text-sm w-full text-center">
              {mode === "register" ? t("haveAccount") : t("noAccount")}
            </Text>
          </Pressable>

          {/* Guest CTA */}
          <View className="items-center border-t border-white/10 pt-5 mt-2">
            <Pressable
              onPress={continueAsGuest}
              className="rounded-2xl bg-card border border-border items-center justify-center py-4 w-full"
              accessibilityRole="button"
            >
              <Text className="text-muted-foreground text-base font-medium">
                {t("continueAsGuest")}
              </Text>
            </Pressable>
          </View>
          <LanguageSelector
            visible={langVisible}
            onClose={() => setLangVisible(false)}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
