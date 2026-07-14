import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in environment variables."
  );
}

// Custom storage wrapper to handle SSR / server-side execution without window crashes
const customStorage = {
  getItem: async (key: string) => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error("Storage getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Storage setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Storage removeItem error:", e);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
