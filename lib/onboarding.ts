import AsyncStorage from "@react-native-async-storage/async-storage";
import { HAS_ONBOARDED_KEY } from "@/constants/onboarding";

/**
 * Read the onboarding flag from AsyncStorage.
 * Safe to call on any platform — returns false if unavailable.
 */
export async function isOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(HAS_ONBOARDED_KEY)) === "true";
  } catch {
    return false;
  }
}

/**
 * Persist the onboarding-complete flag so subsequent launches skip the flow.
 */
export async function markOnboarded(): Promise<void> {
  try {
    await AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true");
  } catch (e) {
    console.warn("Failed to persist onboarding flag:", e);
  }
}
