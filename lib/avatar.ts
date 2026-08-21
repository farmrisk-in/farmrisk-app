export const DEFAULT_AVATAR = require("@/assets/pic5.webp");

export function getAvatarSource(avatarKey?: string | null): any {
  if (!avatarKey) return DEFAULT_AVATAR;
  
  if (
    avatarKey.startsWith("data:") ||
    avatarKey.startsWith("file:") ||
    avatarKey.startsWith("http://") ||
    avatarKey.startsWith("https://")
  ) {
    return { uri: avatarKey };
  }

  return DEFAULT_AVATAR;
}
