import React, { createContext, useEffect, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  initI18n,
  changeAppLanguage,
  i18n,
  LanguageCode,
} from "@/i18n";

/**
 * Every namespace, in priority order. i18next resolves unprefixed `t("key")`
 * against this array in order, and the strict typing accepts keys from any of
 * them — so `useLanguage().t` can access the whole resource tree.
 */
export const ALL_NAMESPACES = [
  "common",
  "dashboard",
  "weather",
  "search",
  "profile",
  "auth",
  "calendar",
  "landing",
  "onboarding",
  "fields",
] as const;

/** `t` typed against every namespace (unprefixed keys accepted from any). */
export type AppTFunction = TFunction<(typeof ALL_NAMESPACES)[number][]>;

interface LanguageContextProps {
  language: LanguageCode;
  /** Persists the choice + switches the active language instantly. */
  setLanguage: (lang: LanguageCode) => Promise<void>;
  /** Bound i18next `t` function (compatibility with the old hook API). */
  t: AppTFunction;
  ready: boolean;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  // Subscribes to language changes so the context value stays fresh
  // (useTranslation re-renders this provider on every language switch).
  const { t } = useTranslation([
    "common",
    "dashboard",
    "weather",
    "search",
    "profile",
    "auth",
    "calendar",
    "landing",
    "onboarding",
    "fields",
  ]);

  useEffect(() => {
    let mounted = true;
    initI18n().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Gate the whole tree until the initial language is resolved so the app
  // never flashes the wrong language on cold start.
  if (!ready) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language: i18n.language as LanguageCode,
        setLanguage: changeAppLanguage,
        t,
        ready,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
