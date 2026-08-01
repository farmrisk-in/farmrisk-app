import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
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

type Mode = "login" | "register";

export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const router = useRouter();

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
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    const email = `${normalizedPhone}@farmrisk.app`;

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (mode === "register") {
      if (!firstName.trim()) {
        setError("First name is required.");
        return;
      }
      if (!lastName.trim()) {
        setError("Last name is required.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
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
          setSuccess("Registration successful! You are now logged in.");
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
          setSuccess("Logged in successfully!");
          setPassword("");
        }
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const { colorScheme, toggleColorScheme } = useColorScheme();

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
                Your Profile
              </Text>
              <Text
                style={styles.subtitle}
                className="text-gray-600 dark:text-gray-400 text-left"
              >
                Premium Dashboard Active
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
                Theme
              </Text>
              <ThemeToggle />
            </View>
          </View>

          <View
            style={styles.profileCard}
            className="bg-white dark:bg-gray-800"
          >
            <View style={styles.infoRow}>
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                Name
              </Text>
              <Text
                style={styles.infoValue}
                className="text-gray-900 dark:text-white"
              >
                {name || "Farmer"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={styles.infoLabel}
                className="text-gray-500 dark:text-gray-400"
              >
                Phone
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
                Email Login
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
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
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
              {mode === "login" ? "Sign In" : "Register"}
            </Text>
            <Text
              style={styles.subtitle}
              className="text-gray-600 dark:text-gray-400 text-left"
            >
              {mode === "login"
                ? "Access your personalized paid dashboard"
                : "Create an account for remote field sensing & AI advice"}
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
              Theme
            </Text>
            <ThemeToggle />
          </View>
        </View>

        <View style={styles.form} className="dark:bg-gray-800">
          {error && <Text style={styles.errorText}>{error}</Text>}
          {success && <Text style={styles.successText}>{success}</Text>}

          {mode === "register" && (
            <>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter first name"
                value={firstName || ""}
                onChangeText={(t) => setFirstName(t || "")}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter last name"
                value={lastName || ""}
                onChangeText={(t) => setLastName(t || "")}
                autoCapitalize="words"
              />
            </>
          )}

          <Text style={styles.label}>Mobile Number (10-digit)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9876543210"
            keyboardType="phone-pad"
            value={phone || ""}
            onChangeText={(t) => setPhone(t || "")}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            secureTextEntry
            value={password || ""}
            onChangeText={(t) => setPassword(t || "")}
          />

          {mode === "register" && (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                secureTextEntry
                value={confirmPassword || ""}
                onChangeText={(t) => setConfirmPassword(t || "")}
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
                {mode === "login" ? "Sign In" : "Register"}
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
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
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
