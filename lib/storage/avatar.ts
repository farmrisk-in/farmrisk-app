import { SupabaseClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";

const AVATAR_BUCKET = "avatars";

/**
 * Uploads a base64 string to the Supabase Storage bucket and returns the public CDN URL.
 * File path: avatars/{userId}/avatar.jpg
 */
export async function uploadAvatarBase64(
  supabase: SupabaseClient<any>,
  userId: string,
  base64String: string
): Promise<string> {
  const filePath = `${userId}/avatar.jpg`;
  
  // Clean header if base64 data URL prefix exists
  const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");
  const arrayBuffer = decode(cleanBase64);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw new Error(`Failed to upload avatar: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);

  // Append timestamp cache-buster so newly updated avatars display immediately
  return `${publicUrl}?t=${Date.now()}`;
}

/**
 * Deletes user avatar image from Supabase Storage.
 */
export async function deleteAvatarImage(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<void> {
  const filePath = `${userId}/avatar.jpg`;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);
  if (error) {
    console.warn("[deleteAvatarImage] Warning removing avatar:", error.message);
  }
}
