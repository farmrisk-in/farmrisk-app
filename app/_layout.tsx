import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <QueryProvider>
      <PaperProvider>
        <AuthProvider>
          <LanguageProvider>
            <LocationProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="profile"
                    options={{ presentation: "modal", headerShown: false }}
                  />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </PaperProvider>
    </QueryProvider>
  );
}
