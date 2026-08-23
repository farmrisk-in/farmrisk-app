import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { CropProvider } from "@/providers/CropProvider";
import { FarmProvider } from "@/providers/FarmProvider";
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
              <CropProvider>
                <FarmProvider>
                <ThemeProvider value={navTheme}>
                <Stack
                  initialRouteName="onboarding"
                  screenOptions={{
                    contentStyle: {
                      backgroundColor: isDark ? "#09090b" : "#ffffff",
                    },
                  }}
                >
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
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
                    name="edit-profile"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="farm-select"
                    options={{
                      presentation: "fullScreenModal",
                      headerShown: false,
                      animation: "slide_from_bottom",
                    }}
                  />
                  <Stack.Screen
                    name="my-farms"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                      animation: "slide_from_bottom",
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
                  <Stack.Screen
                    name="weather-table"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen
                    name="soil-detail"
                    options={{
                      headerShown: false,
                      presentation: "card",
                    }}
                  />
                  <Stack.Screen name="locked-features" options={{ headerShown: false, presentation: "modal" }} />
                </Stack>
                <StatusBar style={isDark ? "light" : "dark"} />
                </ThemeProvider>
                </FarmProvider>
              </CropProvider>
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </PaperProvider>
    </QueryProvider>
  );
}
