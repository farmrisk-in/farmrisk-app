import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { PaperProvider } from "react-native-paper";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { LogBox } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

LogBox.ignoreLogs(["Require cycle: node_modules/victory"]);

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === "dark";
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <QueryProvider>
      <PaperProvider>
        <AuthProvider>
          <LanguageProvider>
            <LocationProvider>
              <ThemeProvider value={navTheme}>
                <Stack
                  screenOptions={{
                    contentStyle: {
                      backgroundColor: isDark ? "#09090b" : "#ffffff",
                    },
                  }}
                >
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="search"
                    options={{
                      presentation: "modal",
                      animation: "fade_from_bottom",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile"
                    options={{
                      presentation: "transparentModal",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="map"
                    options={{
                      presentation: "fullScreenModal",
                      headerShown: false,
                      title: "Map",
                      animation: "slide_from_bottom",
                    }}
                  />
                </Stack>
                <StatusBar style={isDark ? "light" : "dark"} />
              </ThemeProvider>
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </PaperProvider>
    </QueryProvider>
  );
}
