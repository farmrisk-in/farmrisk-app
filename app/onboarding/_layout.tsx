import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#09090b" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="welcome" options={{ animation: "fade" }} />
      <Stack.Screen
        name="language"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="auth"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="location-perm"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="farm-select"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}

