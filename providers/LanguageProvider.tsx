import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { content, LanguageCode, TranslationType } from "@/constants/content";

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationType;
}

export const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const stored = await AsyncStorage.getItem("farmrisk-language");
        if (stored && content[stored as LanguageCode]) {
          setLanguageState(stored as LanguageCode);
        }
      } catch (e) {
        console.error("Failed to read AsyncStorage language", e);
      } finally {
        setLoading(false);
      }
    };
    loadStoredLanguage();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    if (content[lang]) {
      setLanguageState(lang);
      try {
        await AsyncStorage.setItem("farmrisk-language", lang);
      } catch (e) {
        console.error("Failed to write AsyncStorage language", e);
      }
    }
  };

  const t = (content[language] || content.en) as TranslationType;

  if (loading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
