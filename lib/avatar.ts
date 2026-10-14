export const DEFAULT_AVATAR = require("@/assets/avatar-default-svgrepo-com.svg");

export function isCustomAvatar(avatarKey?: string | null): boolean {
  if (!avatarKey) return false;
  const trimmed = avatarKey.trim();
  if (!trimmed || trimmed === "pic5" || trimmed === "default") return false;
  return (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("file:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
}

export function getAvatarSource(avatarKey?: string | null): any {
  if (isCustomAvatar(avatarKey)) {
    return { uri: avatarKey!.trim() };
  }

  return DEFAULT_AVATAR;
}
