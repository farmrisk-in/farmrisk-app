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
import { Icon } from "@/components/ui/Icon";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
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
        const { error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });

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
    "bg-zinc-800 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white placeholder:text-zinc-500";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#09090b]"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-5 pt-12 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back to welcome */}
        <Pressable
          onPress={() => router.replace("/onboarding/welcome")}
          className="mb-6 w-10 h-10 rounded-full bg-zinc-800 items-center justify-center border border-white/10"
          accessibilityRole="button"
          accessibilityLabel={t("common:cancel")}
        >
          <Icon icon={ArrowLeft02Icon} size={20} className="text-white" />
        </Pressable>

        <Animated.View entering={FadeInDown.duration(600)}>
          <Text className="text-2xl font-bold text-white">
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
            <Text className="text-red-400 text-sm text-center mt-1">
              {error}
            </Text>
          )}

          {/* Success */}
          {success && (
            <Text className="text-emerald-400 text-sm text-center mt-1">
              {success}
            </Text>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleAuth}
            disabled={submitting}
            className="mt-2 rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center py-4 disabled:opacity-50"
            accessibilityRole="button"
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {mode === "register" ? t("registerBtn") : t("signInBtn")}
              </Text>
            )}
          </Pressable>

          {/* Toggle mode */}
          <Pressable onPress={toggleMode} className="items-center py-3">
            <Text className="text-zinc-400 text-sm">
              {mode === "register" ? t("haveAccount") : t("noAccount")}
            </Text>
          </Pressable>

          {/* Guest CTA */}
          <View className="items-center border-t border-white/10 pt-5 mt-2">
            <Pressable
              onPress={continueAsGuest}
              className="rounded-2xl bg-zinc-800 border border-white/10 items-center justify-center py-4 w-full"
              accessibilityRole="button"
            >
              <Text className="text-zinc-200 text-base font-medium">
                {t("continueAsGuest")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
