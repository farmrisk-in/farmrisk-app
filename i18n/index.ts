/**
 * i18n engine — i18next + react-i18next + expo-localization + AsyncStorage.
 *
 * Resolution order on first launch:
 *   1. AsyncStorage override (key: `farmrisk-language`) → if supported
 *   2. Device language via expo-localization (`getLocales()[0].languageCode`)
 *      → if supported
 *   3. Fallback: `en`
 *
 * The LanguageProvider (providers/LanguageProvider.tsx) calls `initI18n()`
 * once and gates rendering until ready, so the app never flashes the wrong
 * language.
 */
import i18n, { changeLanguage, use } from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { resources } from "./resources";

export const SUPPORTED_LANGUAGES = ["en", "hi", "mr", "ta", "gu"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

/** Display names in each language's own script (used by the LanguageSelector). */
export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
  ta: "தமிழ்",
  gu: "ગુજરાતી",
};

export const LANGUAGE_STORAGE_KEY = "farmrisk-language";

export const isSupportedLanguage = (code: string | undefined | null): code is LanguageCode =>
  !!code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code);

/** Device language detection (used only when no stored override exists). */
export const getDeviceLanguage = (): LanguageCode => {
  try {
    const code = Localization.getLocales()[0]?.languageCode;
    if (isSupportedLanguage(code)) return code;
  } catch (e) {
    console.error("Failed to read device language", e);
  }
  return "en";
};

/** Stored override, if any (guarded — AsyncStorage can throw on native). */
export const getStoredLanguage = async (): Promise<LanguageCode | null> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(stored)) return stored;
  } catch (e) {
    console.error("Failed to read stored language", e);
  }
  return null;
};

let initPromise: Promise<LanguageCode> | null = null;

/**
 * Initializes i18next exactly once and returns the resolved language.
 * Safe to call multiple times (returns the same in-flight promise).
 */
export const initI18n = (): Promise<LanguageCode> => {
  if (!initPromise) {
    initPromise = (async (): Promise<LanguageCode> => {
      const stored = await getStoredLanguage();
      const resolved = stored ?? getDeviceLanguage();

      await use(initReactI18next).init({
        resources,
        lng: resolved,
        fallbackLng: "en",
        defaultNS: "common",
        ns: ["common", "dashboard", "weather", "search", "profile", "auth", "calendar", "landing", "onboarding", "fields"],
        fallbackNS: ["common", "dashboard", "weather", "search", "profile", "auth", "calendar", "landing", "onboarding", "fields"],
        interpolation: {
          // React Native renders text already; no HTML to escape.
          escapeValue: false,
        },
        returnNull: false,
        react: {
          // No suspense — we gate on the provider's `ready` flag instead.
          useSuspense: false,
        },
      });

      return resolved as LanguageCode;
    })();
  }
  return initPromise as Promise<LanguageCode>;
};

/**
 * Persist the user's choice and switch the active language.
 * Components using `useTranslation()` re-render instantly; no reload needed.
 */
export const changeAppLanguage = async (lang: LanguageCode): Promise<void> => {
  if (!isSupportedLanguage(lang)) return;
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.error("Failed to persist language preference", e);
  }
  await changeLanguage(lang);
};

export { i18n };
