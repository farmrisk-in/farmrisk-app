import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { Icon } from "@/components/ui/Icon";
import {
  Comment01Icon,
  SentIcon,
  Tick02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";

const FEEDBACK_TOPICS = [
  "General",
  "Bug Report",
  "Feature Request",
  "Data Accuracy",
  "Other",
];

export function FeedbackSection() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t } = useTranslation(["profile", "common"]);

  const [selectedTopic, setSelectedTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const appVersion = Constants.expoConfig?.version || "1.0.1";

  const handleEmailFallback = (customMessage?: string, customTopic?: string) => {
    const topicToUse = customTopic || selectedTopic;
    const bodyText = customMessage || message;
    const subject = encodeURIComponent(`[FarmRisk Feedback] ${topicToUse}`);
    const body = encodeURIComponent(
      `${bodyText.trim()}\n\n────────────────\nApp Version: ${appVersion}\nPlatform: ${Platform.OS} (v${Platform.Version})\nUser: ${user?.email || profile?.phone || "Guest"}`
    );
    Linking.openURL(`mailto:support@farmrisk.in?subject=${subject}&body=${body}`).catch(
      () => {
        Alert.alert(
          "Error",
          "Could not open email client. Please email us manually at support@farmrisk.in"
        );
      }
    );
  };

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert(
        "Message Required",
        "Please enter your feedback before submitting."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Primary: Direct submission to Supabase
      const { error } = await supabase.from("feedbacks").insert({
        topic: selectedTopic,
        message: trimmed,
        user_id: user?.id || null,
        email: user?.email || null,
        phone: profile?.phone || (user?.user_metadata?.phone as string) || null,
        metadata: {
          app_version: appVersion,
          platform: Platform.OS,
          os_version: String(Platform.Version),
          user_name: profile?.full_name || null,
        },
      });

      if (error) {
        console.warn("Supabase feedback insert error:", error);
        // Prompt email fallback if table or network error
        Alert.alert(
          "Submission Issue",
          "Unable to store feedback directly right now. Would you like to send it to our support team via email?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Send via Email",
              onPress: () => handleEmailFallback(trimmed, selectedTopic),
            },
          ]
        );
      } else {
        setSubmitted(true);
        setMessage("");
      }
    } catch (err: any) {
      console.warn("Feedback submission exception:", err);
      Alert.alert(
        "Network Issue",
        "Could not send feedback. Would you like to send it via email?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send via Email",
            onPress: () => handleEmailFallback(trimmed, selectedTopic),
          },
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="mb-5">
      <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
        {(t as any)("feedback") || "Feedback & Support"}
      </Text>

      <View className="bg-card border border-border rounded-3xl p-5">
        {/* Title row */}
        <View className="flex-row items-center gap-3 mb-4">
          <View className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 items-center justify-center">
            <Icon
              icon={Comment01Icon}
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {(t as any)("sendFeedback") || "Share Your Feedback"}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              Help us improve FarmRisk for your crops and region
            </Text>
          </View>
        </View>

        {submitted ? (
          <View className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 items-center">
            <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center mb-2">
              <Icon icon={Tick02Icon} size={22} color="#ffffff" />
            </View>
            <Text className="text-base font-bold text-emerald-800 dark:text-emerald-200 text-center">
              Thank You!
            </Text>
            <Text className="text-xs text-emerald-700 dark:text-emerald-300 text-center mt-1 leading-relaxed">
              Your feedback has been received. Our team reviews every suggestion
              to make the app better for farmers.
            </Text>
            <TouchableOpacity
              onPress={() => setSubmitted(false)}
              className="mt-3.5 bg-emerald-600 active:bg-emerald-700 px-4 py-2 rounded-xl"
              accessibilityRole="button"
            >
              <Text className="text-white text-xs font-bold">
                Send Another Note
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Topic Chips */}
            <Text className="text-xs font-semibold text-foreground mb-2">
              Topic
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-3.5">
              {FEEDBACK_TOPICS.map((topic) => {
                const isSelected = selectedTopic === topic;
                return (
                  <TouchableOpacity
                    key={topic}
                    onPress={() => setSelectedTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl border ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-muted border-border"
                    }`}
                    accessibilityRole="button"
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? "text-white" : "text-foreground"
                      }`}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Text Input */}
            <Text className="text-xs font-semibold text-foreground mb-1.5">
              Message
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="What's working well, what's broken, or what features would you like to see?"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-muted border border-border rounded-2xl p-3.5 text-foreground text-sm min-h-[96px] mb-4"
            />

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Icon icon={SentIcon} size={16} color="#ffffff" />
                  <Text className="text-white font-bold text-sm">
                    Submit Feedback
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Direct Email fallback link */}
            <TouchableOpacity
              onPress={() => handleEmailFallback()}
              className="mt-3 flex-row items-center justify-center gap-1.5 py-1"
              accessibilityRole="button"
            >
              <Icon
                icon={Mail01Icon}
                size={13}
                className="text-muted-foreground"
              />
              <Text className="text-[11px] text-muted-foreground text-center">
                Or email support directly at{" "}
                <Text className="text-emerald-600 dark:text-emerald-400 font-medium underline">
                  support@farmrisk.in
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
