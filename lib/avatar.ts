import { ImageSourcePropType } from "react-native";

export const AVATAR_PRESETS = [
  { id: "pic1", label: "Avatar 1", source: require("@/assets/pic1.webp") },
  { id: "pic2", label: "Avatar 2", source: require("@/assets/pic2.webp") },
  { id: "pic3", label: "Avatar 3", source: require("@/assets/pic3.webp") },
  { id: "pic4", label: "Avatar 4", source: require("@/assets/pic4.webp") },
  { id: "pic5", label: "Avatar 5", source: require("@/assets/pic5.webp") },
] as const;

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]["id"];

export const DEFAULT_AVATAR_ID: AvatarPresetId = "pic5";

export function getAvatarSource(avatarKey?: string | null): any {
  if (!avatarKey) return require("@/assets/pic5.webp");
  
  if (avatarKey.startsWith("data:") || avatarKey.startsWith("file:") || avatarKey.startsWith("http")) {
    return { uri: avatarKey };
  }

  const match = AVATAR_PRESETS.find((p) => p.id === avatarKey);
  return match ? match.source : require("@/assets/pic5.webp");
}
