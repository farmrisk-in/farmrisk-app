import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { isOnboarded } from "@/lib/onboarding";

export default function RootIndex() {
  const [checking, setChecking] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const onboarded = await isOnboarded();
      if (mounted) {
        setHasOnboarded(onboarded);
        setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#007a55" />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
