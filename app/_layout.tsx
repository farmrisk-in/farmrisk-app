import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { LocationProvider } from "@/providers/LocationProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { PaperProvider } from "react-native-paper";
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded] = useFonts({
    Fraunces: Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <PaperProvider>
        <AuthProvider>
          <LanguageProvider>
            <LocationProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <View
                  className={colorScheme === "dark" ? "dark flex-1" : "flex-1"}
                >
                  <Stack>
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
                    <Stack.Screen name="map" options={{ headerShown: true }} />
                  </Stack>

                  {/*<StatusBar style="auto" />*/}
                </View>
              </ThemeProvider>
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </PaperProvider>
    </QueryProvider>
  );
}
