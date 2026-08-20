import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui/Icon";
import {
  Cancel01Icon,
  Globe02Icon,
  WheatIcon,
  MapPinIcon,
  Logout01Icon,
  ChevronRightIcon,
  User02Icon,
  SmartPhone01Icon,
  Mail01Icon,
  Tick01Icon,
  Sun01Icon,
  Login01Icon,
  UserAdd01Icon,
  Edit02Icon,
  AlertSquareIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useCropContext } from "@/providers/CropProvider";
import { useFarmContext } from "@/providers/FarmProvider";
import { useCrops } from "@/hooks/useCrops";
import DownloadButton from "@/components/dashboard/DownloadButton";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile as useProfileHook } from "@/hooks/useProfile";
import { useTranslation } from "react-i18next";
import { LANGUAGE_NAMES } from "@/i18n";
import { Avatar } from "react-native-paper";

export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const { language } = useLanguage();
  const { t } = useTranslation(["profile", "common", "auth"]);
  const router = useRouter();

  const { selectedCrop, setSelectedCrop } = useCropContext();
  const { selectedFarm } = useFarmContext();
  const { crops } = useCrops();
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearDevData = () => {
    Alert.alert(
      "Developer Option: Clear All Data",
      "Are you sure you want to wipe all local storage (AsyncStorage), authentication sessions, and cached state?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe Data & Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await supabase.auth.signOut();
              Alert.alert("Data Cleared", "All local app storage and sessions have been reset.");
              router.replace("/onboarding/welcome");
            } catch (err: any) {
              Alert.alert("Reset Error", err?.message || "Failed to clear local data.");
            }
          },
        },
      ],
    );
  };

  const startDeleteCountdown = () => {
    setDeleteModalVisible(true);
    setDeleteCountdown(5);
    const interval = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const selectedCropName =
    crops.find((c: any) => (c.id || c.name?.toLowerCase()) === selectedCrop)?.name ||
    t("noneDefault") || "None";

  const displayName =
    profile?.full_name ||
    [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
      .filter(Boolean)
      .join(" ") ||
    t("common:defaultUserName") ||
    "Farmer";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {t("yourProfile") || "Your Profile"}
            </Text>
            <Text className="text-xs font-medium text-muted-foreground mt-0.5">
              {user ? (t("premiumActive") || "Premium Active") : (t("guestUser") || "Guest Farmer")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center shadow-sm"
            accessibilityRole="button"
          >
            <Icon icon={Cancel01Icon} size={20} className="text-foreground" />
          </TouchableOpacity>
        </View>

        {/* ── Hero Card ── */}
        {user ? (
          <View className="bg-card border border-border rounded-3xl p-5 mb-5 shadow-sm">
            {/* Avatar + name row */}
            <View className="flex-row items-center gap-4 mb-5">
              <View className="relative">
                <Avatar.Image size={56} source={require("../assets/pic5.webp")} />
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground leading-tight" numberOfLines={1}>
                  {displayName}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                  {user.email}
                </Text>
                <View className="flex-row flex-wrap gap-x-3 mt-1.5">
                  {(profile?.phone || user.user_metadata?.phone) && (
                    <View className="flex-row items-center gap-1">
                      <Icon icon={SmartPhone01Icon} size={11} className="text-muted-foreground" />
                      <Text className="text-[11px] text-muted-foreground">
                        {profile?.phone || user.user_metadata?.phone}
                      </Text>
                    </View>
                  )}
                  {(profile?.location || user.user_metadata?.location) && (
                    <View className="flex-row items-center gap-1">
                      <Icon icon={MapPinIcon} size={11} className="text-muted-foreground" />
                      <Text className="text-[11px] text-muted-foreground">
                        {profile?.location || user.user_metadata?.location}
                      </Text>
                    </View>
                  )}
                  {(profile?.age || user.user_metadata?.age) && (
                    <View className="flex-row items-center gap-1">
                      <Icon icon={Calendar03Icon} size={11} className="text-muted-foreground" />
                      <Text className="text-[11px] text-muted-foreground">
                        {profile?.age || user.user_metadata?.age} yrs
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Action buttons: Edit Profile + Sign Out */}
            <View className="flex-row gap-2.5 pt-4 border-t border-border">
              <TouchableOpacity
                onPress={() => router.push("/edit-profile")}
                className="flex-1 bg-emerald-600 active:bg-emerald-700 rounded-xl py-2.5 items-center justify-center flex-row gap-1.5"
                accessibilityRole="button"
              >
                <Icon icon={Edit02Icon} size={15} color="#ffffff" />
                <Text className="text-white font-bold text-sm">
                  {t("editProfile") || "Edit Profile"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={signOut}
                className="flex-1 bg-muted active:bg-muted/70 border border-border rounded-xl py-2.5 items-center justify-center flex-row gap-1.5"
                accessibilityRole="button"
              >
                <Icon icon={Logout01Icon} size={15} className="text-foreground" />
                <Text className="text-foreground font-bold text-sm">
                  {t("common:nav.signOut") || "Sign Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Guest card */
          <View className="bg-card border border-border rounded-3xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
                <Icon icon={User02Icon} size={28} className="text-emerald-600 dark:text-emerald-400" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground leading-tight">
                  {t("guestUser") || "Guest Farmer"}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t("signInPrompt") || "Sign in to access personalized advisory, farm saving & export features"}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2.5 pt-4 border-t border-border">
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/onboarding/auth", params: { from: "profile", mode: "login" } })}
                className="flex-1 bg-emerald-600 active:bg-emerald-700 rounded-xl py-2.5 items-center justify-center flex-row gap-1.5 shadow-sm"
                accessibilityRole="button"
              >
                <Icon icon={Login01Icon} size={15} color="#ffffff" />
                <Text className="text-white font-bold text-sm">{t("signIn") || "Sign In"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/onboarding/auth", params: { from: "profile", mode: "register" } })}
                className="flex-1 bg-muted active:bg-muted/80 border border-border rounded-xl py-2.5 items-center justify-center flex-row gap-1.5"
                accessibilityRole="button"
              >
                <Icon icon={UserAdd01Icon} size={15} className="text-foreground" />
                <Text className="text-foreground font-bold text-sm">{t("createAccount") || "Register"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Preferences ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t("preferences") || "Preferences"}
          </Text>
          <View className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Icon icon={Sun01Icon} size={18} className="text-muted-foreground" />
                </View>
                <Text className="text-sm font-semibold text-foreground">{t("theme") || "Theme"}</Text>
              </View>
              <ThemeToggle />
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Icon icon={Globe02Icon} size={18} className="text-muted-foreground" />
                </View>
                <Text className="text-sm font-semibold text-foreground">{t("common:language") || "Language"}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(true)}
                className="bg-muted border border-border px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
                accessibilityRole="button"
              >
                <Text className="text-xs font-bold text-foreground">{LANGUAGE_NAMES[language]}</Text>
                <Icon icon={ChevronRightIcon} size={14} className="text-muted-foreground rotate-90" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center">
                  <Icon icon={WheatIcon} size={18} className="text-emerald-600 dark:text-emerald-400" />
                </View>
                <Text className="text-sm font-semibold text-foreground">{t("activeCrop") || "Active Crop"}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCropModalVisible(true)}
                className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
                accessibilityRole="button"
              >
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedCrop ? selectedCropName : (t("selectCrop") || "Select Crop")}
                </Text>
                <Icon icon={ChevronRightIcon} size={14} className="text-emerald-600 dark:text-emerald-400 rotate-90" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/my-farms")}
              className="flex-row items-center justify-between p-4 active:bg-muted/50"
              accessibilityRole="button"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Icon icon={MapPinIcon} size={18} className="text-muted-foreground" />
                </View>
                <Text className="text-sm font-semibold text-foreground">{t("myFarms") || "My Farms"}</Text>
              </View>
              <Icon icon={ChevronRightIcon} size={18} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Data & Export ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t("dataAndExport") || "Data & Export"}
          </Text>
          <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
            <DownloadButton selectedFarm={selectedFarm} />
          </View>
        </View>

        {/* ── Account Info (logged-in) ── */}
        {user && (
          <View className="mb-5">
            <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {t("account") || "Account"}
            </Text>
            <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2.5">
                  <Icon icon={User02Icon} size={15} className="text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{t("name") || "Name"}</Text>
                </View>
                <Text className="text-sm font-bold text-foreground">{displayName}</Text>
              </View>
              <View className="h-px bg-border/60 my-0.5" />
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2.5">
                  <Icon icon={SmartPhone01Icon} size={15} className="text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{t("phone") || "Phone"}</Text>
                </View>
                <Text className="text-sm font-bold text-foreground">
                  {profile?.phone || user.user_metadata?.phone || user.email?.split("@")[0] || "—"}
                </Text>
              </View>
              <View className="h-px bg-border/60 my-0.5" />
              <View className="flex-row items-center justify-between py-2">
                <View className="flex-row items-center gap-2.5">
                  <Icon icon={Mail01Icon} size={15} className="text-muted-foreground" />
                  <Text className="text-xs font-medium text-muted-foreground">{t("emailLogin") || "Email Login"}</Text>
                </View>
                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{user.email}</Text>
              </View>
              {(profile?.location || user.user_metadata?.location) && (
                <>
                  <View className="h-px bg-border/60 my-0.5" />
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center gap-2.5">
                      <Icon icon={MapPinIcon} size={15} className="text-muted-foreground" />
                      <Text className="text-xs font-medium text-muted-foreground">{t("location") || "Location"}</Text>
                    </View>
                    <Text className="text-sm font-bold text-foreground">
                      {profile?.location || user.user_metadata?.location}
                    </Text>
                  </View>
                </>
              )}
              {(profile?.age || user.user_metadata?.age) && (
                <>
                  <View className="h-px bg-border/60 my-0.5" />
                  <View className="flex-row items-center justify-between py-2">
                    <View className="flex-row items-center gap-2.5">
                      <Icon icon={Calendar03Icon} size={15} className="text-muted-foreground" />
                      <Text className="text-xs font-medium text-muted-foreground">{t("age") || "Age"}</Text>
                    </View>
                    <Text className="text-sm font-bold text-foreground">
                      {profile?.age || user.user_metadata?.age} yrs
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* ── Danger Zone ── */}
        {user && (
          <View className="mb-5">
            <Text className="text-xs font-bold uppercase tracking-wider text-destructive mb-2 px-1">
              {t("dangerZone") || "Danger Zone"}
            </Text>
            <View className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-3xl p-4 shadow-sm gap-3">
              <View className="flex-row items-center gap-2">
                <Icon icon={AlertSquareIcon} size={16} className="text-destructive shrink-0" />
                <Text className="text-xs text-muted-foreground flex-1">
                  {t("dangerZoneDesc") || "Irreversible account operations. Proceed with caution."}
                </Text>
              </View>
              <TouchableOpacity
                onPress={startDeleteCountdown}
                className="border border-destructive/40 bg-destructive/10 active:bg-destructive/20 rounded-2xl py-3 flex-row items-center justify-center"
                accessibilityRole="button"
              >
                <Text className="text-destructive font-bold text-sm">
                  {t("deleteAccount") || "Delete Account"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Dev-Only ── */}
        {__DEV__ && (
          <View className="p-4 border border-dashed border-amber-500/50 bg-amber-500/10 rounded-3xl mt-2">
            <Text className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 text-center">
              🛠️ Developer Mode (__DEV__)
            </Text>
            <TouchableOpacity
              onPress={handleClearDevData}
              className="bg-amber-600 active:bg-amber-700 py-3 px-4 rounded-xl items-center"
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-xs">Clear All Local Data & Storage</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Crop Modal */}
      <Modal visible={cropModalVisible} transparent animationType="slide" onRequestClose={() => setCropModalVisible(false)}>
        <TouchableOpacity className="flex-1 bg-black/60 justify-end" activeOpacity={1} onPressOut={() => setCropModalVisible(false)}>
          <View className="bg-card border-t border-border rounded-t-3xl p-6 pb-12 max-h-[70%]">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-foreground mb-4">{t("cropPickerTitle") || "Select Active Crop"}</Text>
            <ScrollView>
              <TouchableOpacity
                className={`py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center ${!selectedCrop ? "bg-muted border border-border" : ""}`}
                onPress={() => { setSelectedCrop(""); setCropModalVisible(false); }}
              >
                <Text className="text-sm font-semibold text-foreground">{t("noneDefault") || "None / Default"}</Text>
                {!selectedCrop && <Icon icon={Tick01Icon} size={18} className="text-emerald-500" />}
              </TouchableOpacity>
              {crops.map((c: any) => {
                const cid = c.id || c.name?.toLowerCase();
                const isSel = selectedCrop === cid;
                return (
                  <TouchableOpacity
                    key={cid}
                    className={`py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center ${isSel ? "bg-emerald-500/10 border border-emerald-500/20" : ""}`}
                    onPress={() => { setSelectedCrop(cid); setCropModalVisible(false); }}
                  >
                    <Text className="text-sm font-semibold text-foreground">
                      {c.name} <Text className="text-xs text-muted-foreground font-normal">({c.area} ha)</Text>
                    </Text>
                    {isSel && <Icon icon={Tick01Icon} size={18} className="text-emerald-500" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Modal */}
      <LanguageSelector visible={languageModalVisible} onClose={() => setLanguageModalVisible(false)} />

      {/* Delete Confirm Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-card border border-border rounded-3xl p-6 shadow-xl">
            <Text className="text-xl font-bold text-destructive mb-2 text-center">
              {t("deleteAccountTitle") || "Delete Account"}
            </Text>
            <Text className="text-sm font-medium text-foreground text-center mb-5 leading-relaxed">
              {t("deleteAccountDesc") || "This action is irreversible. All your data will be permanently deleted."}
            </Text>
            <View className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl mb-5">
              <Text className="text-sm font-bold text-destructive text-center">
                {t("deleteAgreeLabel") || "I understand and wish to delete my account"}
              </Text>
            </View>
            <View className="gap-3">
              <TouchableOpacity
                onPress={executeDeleteAccount}
                disabled={deleteCountdown > 0 || isDeleting}
                className={`py-3.5 rounded-xl items-center flex-row justify-center gap-2 ${deleteCountdown > 0 || isDeleting ? "bg-destructive/50" : "bg-destructive active:bg-destructive/80"}`}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">
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
