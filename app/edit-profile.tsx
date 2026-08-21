import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui/Icon";
import { getAvatarSource } from "@/lib/avatar";
import { Avatar } from "react-native-paper";
import {
  ChevronLeftIcon,
  User02Icon,
  SmartPhone01Icon,
  MapPinIcon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  AlertSquareIcon,
  Camera01Icon,
  LockPasswordIcon,
  Tick01Icon,
  Cancel01Icon,
  PlusSignIcon,
  MinusSignIcon,
} from "@hugeicons/core-free-icons";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    updatePassword,
    isUpdatingPassword,
  } = useProfile();
  const { t } = useTranslation(["profile", "common", "auth"]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Gallery Cropping / Zoom Modal
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(300);
  const [imageHeight, setImageHeight] = useState<number>(300);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Delete Account State
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state with fetched profile or auth user metadata
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setAge(profile.age ? String(profile.age) : "");
      setLocation(profile.location || "");
      setAvatarUrl(profile.avatar_url || "");
    } else if (user) {
      setFirstName(user.user_metadata?.first_name || "");
      setLastName(user.user_metadata?.last_name || "");
      setPhone(user.user_metadata?.phone || user.email?.replace("@farmrisk.app", "") || "");
      setAge(user.user_metadata?.age ? String(user.user_metadata.age) : "");
      setLocation(user.user_metadata?.location || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [profile, user]);

  // Directly launch native gallery picker
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permissionDenied") || "Permission Denied",
          t("galleryPermissionNeeded") || "Please grant access to your photo gallery to upload a profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPickedImageUri(asset.uri);
        setImageWidth(asset.width || 300);
        setImageHeight(asset.height || 300);
        setZoomLevel(1);
        setCropModalVisible(true);
      }
    } catch (err: any) {
      console.error("Image pick error:", err);
      Alert.alert("Error", err?.message || "Failed to open gallery.");
    }
  };

  // Crop to square, scale to 300x300, and compress to JPEG Base64
  const handleApplyCropAndCompress = async () => {
    if (!pickedImageUri) return;
    setIsProcessingImage(true);

    try {
      const minDim = Math.min(imageWidth, imageHeight);
      const cropSize = Math.max(minDim / zoomLevel, 50);
      const originX = Math.max(0, Math.min((imageWidth - cropSize) / 2, imageWidth - cropSize));
      const originY = Math.max(0, Math.min((imageHeight - cropSize) / 2, imageHeight - cropSize));

      const manipResult = await ImageManipulator.manipulateAsync(
        pickedImageUri,
        [
          {
            crop: {
              originX: Math.round(originX),
              originY: Math.round(originY),
              width: Math.round(cropSize),
              height: Math.round(cropSize),
            },
          },
          {
            resize: {
              width: 300,
              height: 300,
            },
          },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (manipResult.base64) {
        const dataUrl = `data:image/jpeg;base64,${manipResult.base64}`;
        setAvatarUrl(dataUrl);
      } else {
        setAvatarUrl(manipResult.uri);
      }

      setCropModalVisible(false);
      setPickedImageUri(null);
    } catch (err: any) {
      console.error("Crop error:", err);
      Alert.alert("Error", err?.message || "Failed to process image.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    let ageNum: number | null = null;
    if (age.trim()) {
      const parsed = parseInt(age.trim(), 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 120) {
        setError("Please enter a valid age between 1 and 120.");
        return;
      }
      ageNum = parsed;
    }

    if (phone.trim()) {
      const normalizedPhone = normalizePhoneNumber(phone.trim());
      if (!normalizedPhone) {
        setError(t("auth:errorPhoneText") || "Please enter a valid 10-digit Indian phone number.");
        return;
      }
    }

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        age: ageNum,
        location: location.trim(),
        avatar_url: avatarUrl,
      });

      setSuccess(t("saveChanges") + " ✓" || "Changes saved successfully!");
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/profile");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err?.message || "Failed to save profile changes.");
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError(t("currentPasswordRequired") || "Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(t("passwordTooShort") || "New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch") || "New passwords do not match.");
      return;
    }

    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordSuccess(t("passwordUpdated") || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordModalVisible(false);
        setPasswordSuccess(null);
      }, 1200);
    } catch (err: any) {
      setPasswordError(err?.message || "Failed to update password.");
    }
  };

  const startDeleteCountdown = () => {
    setDeleteModalVisible(true);
    setDeleteCountdown(5);
    const interval = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { error: delError } = await supabase.rpc("delete_user_account");
      if (delError) throw delError;
      await supabase.auth.signOut();
      setDeleteModalVisible(false);
      router.replace("/");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      {/* ── Top Header ── */}
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center"
          accessibilityRole="button"
        >
          <Icon icon={ChevronLeftIcon} size={22} className="text-foreground" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-foreground">
          {t("editProfileTitle") || "Edit Profile"}
        </Text>

        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Platform.OS === "android" ? 140 : 80,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          ) : (
            <View className="gap-5">
              {/* Alert Feedback */}
              {error && (
                <View className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-card border border-destructive">
                  <Icon icon={AlertCircleIcon} size={18} className="text-destructive shrink-0" />
                  <Text className="text-xs font-semibold text-destructive flex-1">{error}</Text>
                </View>
              )}

              {success && (
                <View className="flex-row items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                  <Icon icon={CheckmarkCircle02Icon} size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <Text className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex-1">{success}</Text>
                </View>
              )}

              {/* ── Avatar Section (Direct Gallery Picker) ── */}
              <View className="items-center justify-center py-2">
                <View className="relative">
                  <Avatar.Image size={96} source={getAvatarSource(avatarUrl)} />
                  <TouchableOpacity
                    onPress={handlePickFromGallery}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 border-2 border-background items-center justify-center shadow-sm"
                    accessibilityRole="button"
                    accessibilityLabel={t("changePhoto") || "Change Photo"}
                  >
                    <Icon icon={Camera01Icon} size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  className="mt-2.5"
                  accessibilityRole="button"
                >
                  <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {t("changePhoto") || "Change Photo"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Form Inputs Card ── */}
              <View className="bg-card border border-border rounded-3xl p-5 gap-4">
                {/* First Name */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-2 ml-1">
                    {t("auth:firstName") || "First Name"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-4 py-3 gap-3">
                    <Icon icon={User02Icon} size={18} className="text-muted-foreground shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("auth:firstNamePlaceholder") || "Enter first name"}
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Last Name */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-2 ml-1">
                    {t("auth:lastName") || "Last Name"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-4 py-3 gap-3">
                    <Icon icon={User02Icon} size={18} className="text-muted-foreground shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("auth:lastNamePlaceholder") || "Enter last name"}
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Phone */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-2 ml-1">
                    {t("phone") || "Phone Number"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-4 py-3 gap-3">
                    <Icon icon={SmartPhone01Icon} size={18} className="text-muted-foreground shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("auth:mobilePlaceholder") || "10-digit mobile"}
                      placeholderTextColor="#9ca3af"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                {/* Age */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-2 ml-1">
                    {t("age") || "Age"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-4 py-3 gap-3">
                    <Icon icon={Calendar03Icon} size={18} className="text-muted-foreground shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("agePlaceholder") || "e.g. 35"}
                      placeholderTextColor="#9ca3af"
                      value={age}
                      onChangeText={setAge}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                  </View>
                </View>

                {/* Location / Village */}
                <View>
                  <Text className="text-xs font-bold text-foreground mb-2 ml-1">
                    {t("location") || "Location / Village"}
                  </Text>
                  <View className="flex-row items-center bg-muted border border-border rounded-2xl px-4 py-3 gap-3">
                    <Icon icon={MapPinIcon} size={18} className="text-muted-foreground shrink-0" />
                    <TextInput
                      className="flex-1 text-sm text-foreground p-0"
                      placeholder={t("locationPlaceholder") || "Village, district, or city"}
                      placeholderTextColor="#9ca3af"
                      value={location}
                      onChangeText={setLocation}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              </View>

              {/* ── Action Buttons ── */}
              <View className="gap-3 pt-1">
                {/* Save Profile Button */}
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isUpdating}
                  className="bg-emerald-600 active:bg-emerald-700 rounded-2xl py-4 items-center justify-center"
                  accessibilityRole="button"
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {t("saveChanges") || "Save Changes"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Change Password Button */}
                <TouchableOpacity
                  onPress={() => {
                    setPasswordError(null);
                    setPasswordSuccess(null);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordModalVisible(true);
                  }}
                  className="bg-card border border-border rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
                  accessibilityRole="button"
                >
                  <Icon icon={LockPasswordIcon} size={18} className="text-foreground" />
                  <Text className="text-foreground font-bold text-sm">
                    {t("changePassword") || "Change Password"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Danger Zone ── */}
              {user && (
                <View className="pt-2">
                  <Text className="text-xs font-bold uppercase tracking-wider text-destructive mb-2 px-1">
                    {t("dangerZone") || "Danger Zone"}
                  </Text>
                  <View className="bg-card border border-destructive rounded-3xl p-4 gap-3">
                    <View className="flex-row items-center gap-2">
                      <Icon icon={AlertSquareIcon} size={16} className="text-destructive shrink-0" />
                      <Text className="text-xs text-muted-foreground flex-1">
                        {t("dangerZoneDesc") || "Irreversible account operations. Proceed with caution."}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={startDeleteCountdown}
                      className="border border-destructive rounded-2xl py-3 flex-row items-center justify-center"
                      accessibilityRole="button"
                    >
                      <Text className="text-destructive font-bold text-sm">
                        {t("deleteAccount") || "Delete Account"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Gallery Photo Crop & Zoom Modal ── */}
      <Modal
        visible={cropModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !isProcessingImage && setCropModalVisible(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <View className="bg-card border-t border-border rounded-t-3xl p-6 pb-10">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                {t("adjustPhoto") || "Adjust & Crop Photo"}
              </Text>
              <TouchableOpacity
                onPress={() => setCropModalVisible(false)}
                disabled={isProcessingImage}
                className="w-8 h-8 rounded-full bg-muted border border-border items-center justify-center"
              >
                <Icon icon={Cancel01Icon} size={16} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Circular Image Preview with Zoom */}
            <View className="items-center justify-center my-4">
              <View className="w-56 h-56 rounded-full overflow-hidden border-4 border-emerald-500 bg-muted items-center justify-center shadow-lg">
                {pickedImageUri && (
                  <Image
                    source={{ uri: pickedImageUri }}
                    style={{
                      width: 224 * zoomLevel,
                      height: 224 * zoomLevel,
                    }}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>

            {/* Zoom Controls */}
            <View className="flex-row items-center justify-center gap-6 mb-6">
              <TouchableOpacity
                onPress={() => setZoomLevel((prev) => Math.max(1, +(prev - 0.25).toFixed(2)))}
                disabled={zoomLevel <= 1 || isProcessingImage}
                className={`w-12 h-12 rounded-full border border-border items-center justify-center ${
                  zoomLevel <= 1 ? "bg-muted opacity-40" : "bg-muted"
                }`}
                accessibilityRole="button"
              >
                <Icon icon={MinusSignIcon} size={20} className="text-foreground" />
              </TouchableOpacity>

              <View className="items-center min-w-[70px]">
                <Text className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("zoom") || "Zoom"}
                </Text>
                <Text className="text-base font-bold text-foreground mt-0.5">
                  {Math.round(zoomLevel * 100)}%
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setZoomLevel((prev) => Math.min(3, +(prev + 0.25).toFixed(2)))}
                disabled={zoomLevel >= 3 || isProcessingImage}
                className={`w-12 h-12 rounded-full border border-border items-center justify-center ${
                  zoomLevel >= 3 ? "bg-muted opacity-40" : "bg-muted"
                }`}
                accessibilityRole="button"
              >
                <Icon icon={PlusSignIcon} size={20} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApplyCropAndCompress}
              disabled={isProcessingImage}
              className="bg-emerald-600 active:bg-emerald-700 rounded-2xl py-3.5 items-center justify-center flex-row gap-2"
              accessibilityRole="button"
            >
              {isProcessingImage ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Icon icon={Tick01Icon} size={18} color="#ffffff" />
                  <Text className="text-white font-bold text-sm">
                    {t("cropAndApply") || "Crop & Apply"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Change Password Modal ── */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPressOut={() => setPasswordModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View className="bg-card border-t border-border rounded-t-3xl p-6 pb-10">
              <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-foreground">
                  {t("changePassword") || "Change Password"}
                </Text>
                <TouchableOpacity
                  onPress={() => setPasswordModalVisible(false)}
                  className="w-8 h-8 rounded-full bg-muted border border-border items-center justify-center"
                >
                  <Icon icon={Cancel01Icon} size={16} className="text-foreground" />
                </TouchableOpacity>
              </View>

              {passwordError && (
                <View className="flex-row items-center gap-2 p-3 rounded-xl bg-card border border-destructive mb-3">
                  <Icon icon={AlertCircleIcon} size={16} className="text-destructive shrink-0" />
                  <Text className="text-xs font-medium text-destructive flex-1">{passwordError}</Text>
                </View>
              )}

              {passwordSuccess && (
                <View className="flex-row items-center gap-2 p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 mb-3">
                  <Icon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <Text className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex-1">{passwordSuccess}</Text>
                </View>
              )}

              <View className="gap-3.5 mb-5">
                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("currentPassword") || "Current Password"}
                  </Text>
                  <View className="bg-muted border border-border rounded-2xl px-4 py-3">
                    <TextInput
                      className="text-sm text-foreground p-0"
                      placeholder={t("currentPasswordPlaceholder") || "Enter current password"}
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("newPassword") || "New Password"}
                  </Text>
                  <View className="bg-muted border border-border rounded-2xl px-4 py-3">
                    <TextInput
                      className="text-sm text-foreground p-0"
                      placeholder={t("newPasswordPlaceholder") || "At least 6 characters"}
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-bold text-foreground mb-1.5 ml-1">
                    {t("confirmNewPassword") || "Confirm New Password"}
                  </Text>
                  <View className="bg-muted border border-border rounded-2xl px-4 py-3">
                    <TextInput
                      className="text-sm text-foreground p-0"
                      placeholder={t("confirmNewPasswordPlaceholder") || "Re-enter new password"}
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handlePasswordSubmit}
                disabled={isUpdatingPassword}
                className="bg-emerald-600 active:bg-emerald-700 rounded-2xl py-3.5 items-center justify-center"
                accessibilityRole="button"
              >
                {isUpdatingPassword ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">
                    {t("changePassword") || "Update Password"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View className="flex-1 justify-center px-6" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="bg-card border border-border rounded-3xl p-6">
            <Text className="text-xl font-bold text-destructive mb-2 text-center">
              {t("deleteAccountTitle") || "Delete Account"}
            </Text>
            <Text className="text-sm font-medium text-foreground text-center mb-5 leading-relaxed">
              {t("deleteAccountDesc") || "This action is irreversible. All your data will be permanently deleted."}
            </Text>
            <View className="bg-muted border border-destructive p-4 rounded-2xl mb-5">
              <Text className="text-sm font-bold text-destructive text-center">
                {t("deleteAgreeLabel") || "I understand and wish to delete my account"}
              </Text>
            </View>
            <View className="gap-3">
              <TouchableOpacity
                onPress={executeDeleteAccount}
                disabled={deleteCountdown > 0 || isDeleting}
                className={`py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${deleteCountdown > 0 || isDeleting ? "bg-muted border border-destructive" : "bg-destructive active:bg-destructive"}`}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className={`font-bold text-sm ${deleteCountdown > 0 || isDeleting ? "text-destructive" : "text-white"}`}>
                    {deleteCountdown > 0
                      ? `${t("confirmDelete") || "Delete Forever"} (${deleteCountdown})`
                      : t("confirmDelete") || "Delete Forever"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
                className="py-3.5 rounded-xl items-center border border-border bg-muted"
              >
                <Text className="text-muted-foreground font-bold text-sm">{t("cancel") || "Cancel"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
