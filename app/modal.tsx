import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { View, Text } from "react-native";

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Modal</Text>
      <View
        className="my-7 h-[1px] w-4/5"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
