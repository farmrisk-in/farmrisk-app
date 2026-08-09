import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Logo } from "@/components/Logo";
import { isOnboarded } from "@/lib/onboarding";
import { SPLASH_DURATION_MS } from "@/constants/onboarding";

/**
 * Step 1 — Splash screen.
 *
 * On mount, checks AsyncStorage for `has_onboarded`. If `true`, navigates to
 * the dashboard immediately. Otherwise, auto-advances to Step 2 (welcome)
 * after 1.8 seconds.
 */
export default function Splash() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    (async () => {
      const onboarded = await isOnboarded();
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, SPLASH_DURATION_MS - elapsed);

      setTimeout(() => {
        if (cancelled) return;
        if (onboarded) {
          router.replace("/");
        } else {
          router.replace("/onboarding/welcome");
        }
      }, remaining);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View
      className="flex-1 bg-background items-center justify-center"
      style={{ paddingTop: insets.top }}
    >
      <Animated.View entering={ZoomIn.duration(700).springify()}>
        <Logo size={96} />
      </Animated.View>

      <Animated.Text
        entering={FadeIn.delay(250).duration(600)}
        className="mt-6 text-4xl font-bold tracking-tight text-foreground"
      >
        FarmRisk
      </Animated.Text>
    </View>
  );
}
