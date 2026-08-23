import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { supabase } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { Icon } from "@/components/ui/Icon";
import { ChevronLeftIcon } from "@hugeicons/core-free-icons";

type Mode = "login" | "register";

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string; mode?: Mode }>();
  const isFromProfile = params.from === "profile";
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t: tAuth } = useTranslation(["auth"]);
  const { t: tOB } = useTranslation(["onboarding"]);

  const [mode, setMode] = useState<Mode>(
    params.mode === "register" ? "register" : "login",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const colors = isDark
    ? {
        background: "#0a0a0a",
        card: "#1a1a1a",
        muted: "#111111",
        border: "#2a2a2a",
        foreground: "#f4f4f5",
        mutedFg: "#71717a",
        primary: "#10b981",
        primaryFg: "#ffffff",
      }
    : {
        background: "#ffffff",
        card: "#ffffff",
        muted: "#f4f4f5",
        border: "#e4e4e7",
        foreground: "#09090b",
        mutedFg: "#71717a",
        primary: "#10b981",
        primaryFg: "#ffffff",
      };

  const goNext = () => {
    if (isFromProfile) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/profile");
      }
      return;
    }
    try {
      router.push("/onboarding/location-perm");
    } catch {
      router.replace("/onboarding/location-perm");
    }
  };

  const handleBack = () => {
    if (isFromProfile) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/profile");
      }
      return;
    }
    try {
      if (router.canGoBack()) {
        router.back();
        return;
      }
    } catch {
      // fallback
    }
    router.replace("/onboarding/language");
  };

  const handleAuth = async () => {
    setError(null);
    setSuccess(null);

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      setError(tAuth("errorPhoneText"));
      return;
    }
    const email = `${normalizedPhone}@farmrisk.app`;

    if (!password) {
      setError(tAuth("errorPasswordRequired"));
      return;
    }

    if (mode === "register") {
      if (!firstName.trim()) {
        setError(tAuth("errorFirstName"));
        return;
      }
      if (!lastName.trim()) {
        setError(tAuth("errorLastName"));
        return;
      }
      if (password.length < 6) {
        setError(tAuth("errorPasswordLength"));
        return;
      }
      if (password !== confirmPassword) {
        setError(tAuth("errorPasswordMatch"));
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
          setSuccess(tAuth("registrationSuccess"));
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
          setSuccess(tAuth("loginSuccess"));
          goNext();
        }
      }
    } catch (err: any) {
      setError(err?.message || tAuth("errorUnexpected"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[s.flex1, { backgroundColor: colors.background }]}
    >
      {isFromProfile ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              icon={ChevronLeftIcon}
              size={24}
              className="text-foreground"
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            {mode === "login"
              ? tAuth("signInBtn") || "Sign In"
              : tAuth("registerBtn") || "Register"}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      ) : (
        <OnboardingProgress
          currentStep={2}
          totalSteps={4}
          onBack={handleBack}
          stepLabel={tOB("step") ?? "Step"}
          ofLabel={tOB("of") ?? "of"}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.flex1}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text style={[s.heading, { color: colors.foreground }]}>
              {mode === "login"
                ? (tOB("authLoginTitle") ?? "Welcome back")
                : (tOB("authRegisterTitle") ?? "Create your account")}
            </Text>
            <Text style={[s.subheading, { color: colors.mutedFg }]}>
              {mode === "login"
                ? (tOB("authLoginSubtitle") ??
                  "Sign in with your mobile number and password.")
                : (tOB("authRegisterSubtitle") ??
                  "Register to get personalized crop advisories and risk alerts.")}
            </Text>
          </View>

          {/* Segmented tabs — pure style prop, zero dynamic className */}
          <View
            style={[
              s.segmentWrapper,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setSuccess(null);
                setMode("login");
              }}
              activeOpacity={0.8}
              style={[
                s.segmentTab,
                mode === "login"
                  ? {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }
                  : { borderColor: "transparent", borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  s.segmentLabel,
                  {
                    color:
                      mode === "login" ? colors.foreground : colors.mutedFg,
                  },
                ]}
              >
                {tAuth("signInBtn") || "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setError(null);
                setSuccess(null);
                setMode("register");
              }}
              activeOpacity={0.8}
              style={[
                s.segmentTab,
                mode === "register"
                  ? {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderWidth: 1,
                    }
                  : { borderColor: "transparent", borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  s.segmentLabel,
                  {
                    color:
                      mode === "register" ? colors.foreground : colors.mutedFg,
                  },
                ]}
              >
                {tAuth("registerBtn") || "Register"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={s.formArea}>
            {mode === "register" && (
              <>
                <View>
                  <Text style={[s.fieldLabel, { color: colors.foreground }]}>
                    {tAuth("firstName") ?? "First Name"}
                  </Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. Ram"
                    placeholderTextColor={colors.mutedFg}
                    style={[
                      s.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                <View>
                  <Text style={[s.fieldLabel, { color: colors.foreground }]}>
                    {tAuth("lastName") ?? "Last Name"}
                  </Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Kumar"
                    placeholderTextColor={colors.mutedFg}
                    style={[
                      s.input,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        color: colors.foreground,
                      },
                    ]}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </>
            )}

            <View>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>
                {tAuth("mobileLabel") ?? "Mobile Number"}
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 9876543210"
                placeholderTextColor={colors.mutedFg}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
                style={[
                  s.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
              />
            </View>

            <View>
              <Text style={[s.fieldLabel, { color: colors.foreground }]}>
                {tAuth("passwordLabel") ?? "Password"}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedFg}
                secureTextEntry
                returnKeyType={mode === "register" ? "next" : "done"}
                style={[
                  s.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
              />
              <Text style={[s.fieldHint, { color: colors.mutedFg }]}>
                {tAuth("passwordHint") ?? "Min 6 characters"}
              </Text>
            </View>

            {mode === "register" && (
              <View>
                <Text style={[s.fieldLabel, { color: colors.foreground }]}>
                  {tAuth("confirmPasswordLabel") ?? "Confirm Password"}
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedFg}
                  secureTextEntry
                  returnKeyType="done"
                  style={[
                    s.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                />
              </View>
            )}

            {error ? (
              <View
                style={[
                  s.banner,
                  { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
                ]}
              >
                <Text style={[s.bannerText, { color: "#dc2626" }]}>
                  {error}
                </Text>
              </View>
            ) : null}

            {success ? (
              <View
                style={[
                  s.banner,
                  { backgroundColor: "#dcfce7", borderColor: "#86efac" },
                ]}
              >
                <Text style={[s.bannerText, { color: "#16a34a" }]}>
                  {success}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Bottom pinned */}
        <View style={[s.bottomArea, { backgroundColor: colors.background }]}>
          {!isFromProfile && (
            <TouchableOpacity
              onPress={goNext}
              activeOpacity={0.75}
              accessibilityRole="button"
              style={[
                s.guestBtn,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text style={[s.guestBtnText, { color: colors.mutedFg }]}>
                {tAuth("continueAsGuest") || "Continue to Free Dashboard →"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleAuth}
            disabled={submitting}
            activeOpacity={0.85}
            accessibilityRole="button"
            style={[
              s.submitBtn,
              {
                backgroundColor: colors.primary,
                opacity: submitting ? 0.6 : 1,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryFg} />
            ) : (
              <Text style={[s.submitBtnText, { color: colors.primaryFg }]}>
                {mode === "register"
                  ? tAuth("registerBtn") || "Register"
                  : tAuth("signInBtn") || "Sign In"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  flex1: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 20 },
  heading: { fontSize: 30, fontWeight: "700", lineHeight: 36 },
  subheading: { fontSize: 14, marginTop: 8, lineHeight: 22 },
  segmentWrapper: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 6,
    marginTop: 24,
    borderWidth: 1,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  segmentLabel: { fontSize: 16, fontWeight: "700" },
  formArea: { marginTop: 20, gap: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  fieldHint: { fontSize: 12, marginTop: 4, marginLeft: 4 },
  banner: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    gap: 12,
  },
  guestBtn: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
  },
  guestBtnText: { fontSize: 14, fontWeight: "600" },
  submitBtn: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
});
