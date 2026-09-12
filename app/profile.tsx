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
import { getAvatarSource } from "@/lib/avatar";
import { useColorScheme } from "nativewind";
import {
  Cancel01Icon,
  Globe02Icon,
  WheatIcon,
  MapPinIcon,
  Logout01Icon,
  ChevronRightIcon,
  User02Icon,
  Tick02Icon,
  Sun01Icon,
  Login01Icon,
  UserAdd01Icon,
  Edit02Icon,
  Calendar03Icon,
  Call02FreeIcons,
  Moon01Icon,
  ChevronLeft,
  Plant01Icon,
} from "@hugeicons/core-free-icons";
import { useRouter } from "expo-router";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useCropContext } from "@/providers/CropProvider";
import { useFarmContext } from "@/providers/FarmProvider";
import { useCrops } from "@/hooks/useCrops";
import DownloadButton from "@/components/dashboard/DownloadButton";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { LANGUAGE_NAMES } from "@/i18n";
import { Avatar } from "react-native-paper";
import { LockedCard } from "@/components/ui/LockedCard";
import { useLocked } from "@/hooks/useLocked";
import { OtherCropModal } from "@/components/crops/OtherCropModal";
import {
  getCleanCropName,
  isCustomCrop,
} from "@/constants/categorizedCrops";

export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();
  const { isLocked } = useLocked();
  const { profile } = useProfile();
  const { language } = useLanguage();
  const { t } = useTranslation(["profile", "common", "auth"]);
  const router = useRouter();

  const { selectedCrop, setSelectedCrop } = useCropContext();
  const { selectedFarm, clearFarm } = useFarmContext();
  const { crops } = useCrops();
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [otherCropModalVisible, setOtherCropModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
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
              Alert.alert(
                "Data Cleared",
                "All local app storage and sessions have been reset.",
              );
              router.replace("/onboarding/welcome");
            } catch (err: any) {
              Alert.alert(
                "Reset Error",
                err?.message || "Failed to clear local data.",
              );
            }
          },
        },
      ],
    );
  };

  const handleSignOut = async () => {
    try {
      if (clearFarm) await clearFarm();
      if (setSelectedCrop) setSelectedCrop("");
      await AsyncStorage.removeItem("farmrisk:local_fields"); // clear local fields just in case
      await signOut();
    } catch (err) {
      console.error("Logout cleanup failed:", err);
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
    crops.find((c: any) => (c.id || c.name?.toLowerCase()) === selectedCrop)
      ?.name ||
    (isCustomCrop(selectedCrop)
      ? getCleanCropName(selectedCrop)
      : undefined) ||
    t("noneDefault") ||
    "None";

  const displayName =
    profile?.full_name ||
    [user?.user_metadata?.first_name, user?.user_metadata?.last_name]
      .filter(Boolean)
      .join(" ") ||
    t("common:defaultUserName") ||
    "Farmer";

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const activeAvatarKey =
    profile?.avatar_url || user?.user_metadata?.avatar_url || "pic5";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View className="flex-row gap-4 items-center mb-5">
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Icon icon={ChevronLeft} size={28} className="text-foreground" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {t("yourProfile") || "Your Profile"}
            </Text>
            <Text className="text-xs font-medium text-muted-foreground mt-0.5">
              {user
                ? t("premiumActive") || "Premium Active"
                : t("guestUser") || "Guest Farmer"}
            </Text>
          </View>
        </View>

        {/* ── Hero Card ── */}
        {user ? (
          <View className="bg-card border border-border rounded-3xl p-5 mb-5">
            {/* Avatar + name row */}
            <View className="flex-row items-center gap-4 mb-5">
              <View className="relative">
                <Avatar.Image
                  size={56}
                  source={getAvatarSource(activeAvatarKey)}
                />
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold text-foreground leading-tight"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Text
                  className="text-xs text-muted-foreground mt-0.5"
                  numberOfLines={1}
                >
                  Joined {joinedDate}
                </Text>
                <View className="flex-row flex-wrap gap-x-3 mt-1.5">
                  {(profile?.phone || user.user_metadata?.phone) && (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        icon={Call02FreeIcons}
                        size={11}
                        className="text-muted-foreground"
                      />
                      <Text className="text-[11px] text-muted-foreground">
                        {profile?.phone || user.user_metadata?.phone}
                      </Text>
                    </View>
                  )}
                  {(profile?.location || user.user_metadata?.location) && (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        icon={MapPinIcon}
                        size={11}
                        className="text-muted-foreground"
                      />
                      <Text className="text-[11px] text-muted-foreground">
                        {profile?.location || user.user_metadata?.location}
                      </Text>
                    </View>
                  )}
                  {(profile?.age || user.user_metadata?.age) && (
                    <View className="flex-row items-center gap-1">
                      <Icon
                        icon={Calendar03Icon}
                        size={11}
                        className="text-muted-foreground"
                      />
                      <Text className="text-[11px] text-muted-foreground">
                        {profile?.age || user.user_metadata?.age} yrs
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Edit Profile + Sign Out */}
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
                onPress={handleSignOut}
                className="flex-1 bg-muted border border-border rounded-xl py-2.5 items-center justify-center flex-row gap-1.5"
                accessibilityRole="button"
              >
                <Icon
                  icon={Logout01Icon}
                  size={15}
                  className="text-foreground"
                />
                <Text className="text-foreground font-bold text-sm">
                  {t("common:nav.signOut") || "Sign Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ── Guest card ── */
          <View className="bg-card border border-border rounded-3xl p-5 mb-5">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 items-center justify-center">
                <Icon
                  icon={User02Icon}
                  size={28}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground leading-tight">
                  {t("guestUser") || "Guest Farmer"}
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t("signInPrompt") ||
                    "Sign in to access personalized advisory, farm saving & export features"}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2.5 pt-4 border-t border-border">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/onboarding/auth",
                    params: { from: "profile", mode: "login" },
                  })
                }
                className="flex-1 bg-emerald-600 active:bg-emerald-700 rounded-xl py-2.5 items-center justify-center flex-row gap-1.5"
                accessibilityRole="button"
              >
                <Icon icon={Login01Icon} size={15} color="#ffffff" />
                <Text className="text-white font-bold text-sm">
                  {t("signIn") || "Sign In"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/onboarding/auth",
                    params: { from: "profile", mode: "register" },
                  })
                }
                className="flex-1 bg-muted border border-border rounded-xl py-2.5 items-center justify-center flex-row gap-1.5"
                accessibilityRole="button"
              >
                <Icon
                  icon={UserAdd01Icon}
                  size={15}
                  className="text-foreground"
                />
                <Text className="text-foreground font-bold text-sm">
                  {t("createAccount") || "Register"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Preferences ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t("preferences") || "Preferences"}
          </Text>
          <View className="bg-card border border-border rounded-3xl overflow-hidden">
            {/* Theme */}
            <View className="flex-row items-center justify-between p-3 px-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                {isDark ? (
                  <Icon
                    icon={Sun01Icon}
                    size={22}
                    className="text-foreground"
                  />
                ) : (
                  <Icon
                    icon={Moon01Icon}
                    size={22}
                    className="text-foreground"
                  />
                )}
                <Text className="text-md font-semibold text-foreground">
                  {t("theme") || "Theme"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={toggleColorScheme}
                accessibilityRole="button"
                accessibilityLabel="Toggle Theme"
                className="bg-muted border border-border px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
              >
                <Text className="text-xs font-bold text-foreground">
                  {isDark ? "Dark" : "Light"}
                </Text>
                <Icon
                  icon={ChevronRightIcon}
                  size={14}
                  className="text-muted-foreground rotate-90"
                />
              </TouchableOpacity>
            </View>

            {/* Language */}
            <View className="flex-row items-center justify-between p-3 px-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <Icon
                  icon={Globe02Icon}
                  size={22}
                  className="text-muted-foreground"
                />
                <Text className="text-md font-semibold text-foreground">
                  {t("common:language") || "Language"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setLanguageModalVisible(true)}
                className="bg-muted border border-border px-3.5 py-1.5 rounded-xl flex-row items-center gap-1.5"
                accessibilityRole="button"
              >
                <Text className="text-xs font-bold text-foreground">
                  {LANGUAGE_NAMES[language]}
                </Text>
                <Icon
                  icon={ChevronRightIcon}
                  size={14}
                  className="text-muted-foreground rotate-90"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Active Crop Box ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t("activeCrop") || "Active Crop"}
          </Text>
          <View className="bg-card border border-border rounded-3xl p-5">
            <View className="flex-row items-center justify-between mb-3.5">
              <View className="flex-row items-center gap-2.5">
                <Icon icon={WheatIcon} size={24} className="text-foreground" />
                <View>
                  <Text className="text-base font-bold text-foreground">
                    {selectedCrop
                      ? selectedCropName
                      : t("common:noCropSelected") || t("noneDefault") || "No Crop Selected"}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {selectedCrop
                      ? t("common:activeCropSelectedDesc") || "Applied to AI advisories & charts"
                      : t("common:activeCropEmptyDesc") || "Select a crop to customize risk analysis"}
                  </Text>
                </View>
              </View>
            </View>

            {isLocked ? (
              <LockedCard
                title={t("common:activeCropLockedTitle") || "Active Crop Locked"}
                description={t("common:activeCropLockedDesc") || "Sign in to select and lock in specific crop profiles for tailored risk models."}
                minHeight={110}
              />
            ) : (
              <TouchableOpacity
                onPress={() => setCropModalVisible(true)}
                className="bg-muted border border-border rounded-2xl p-3.5 flex-row items-center justify-between active:bg-muted/80"
                accessibilityRole="button"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-foreground">
                    {selectedCrop
                      ? selectedCropName
                      : t("common:chooseCrop") || t("selectCrop") || "Choose Crop"}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-primary font-bold">{t("common:change") || "Change"}</Text>
                  <Icon
                    icon={ChevronRightIcon}
                    size={14}
                    className="text-primary"
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── My Farms Box ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t("myFarms") || "My Farms"}
          </Text>
          <View className="bg-card border border-border rounded-3xl p-5">
            <View className="flex-row items-center justify-between mb-3.5">
              <View className="flex-row items-center gap-2.5">
                <Icon icon={MapPinIcon} size={24} className="text-foreground" />
                <View>
                  <Text className="text-base font-bold text-foreground">
                    {selectedFarm
                      ? selectedFarm.name || selectedFarm.fieldId
                      : t("common:noFarmSelected") || "No Farm Selected"}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {selectedFarm?.areaM2
                      ? `${(selectedFarm.areaM2 / 10000).toFixed(2)} ha · ${selectedFarm.season || t("common:activeField") || "Active Field"}`
                      : t("common:myFarmsEmptyDesc") || "Satellite mapped field boundaries"}
                  </Text>
                </View>
              </View>
            </View>

            {isLocked ? (
              <LockedCard
                title={t("common:myFarmsLockedTitle") || "My Farms Locked"}
                description={t("common:myFarmsLockedDesc") || "Sign in or register to draw, save, and export satellite boundary maps for your fields."}
                minHeight={110}
              />
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/my-farms")}
                className="bg-muted border border-border rounded-2xl p-3.5 flex-row items-center justify-between active:bg-muted/80"
                accessibilityRole="button"
              >
                <Text className="text-sm font-semibold text-foreground">
                  {selectedFarm ? t("common:manageAndOpenFarms") || "Manage & View Farms" : t("common:openMyFarms") || "Open My Farms"}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-primary font-bold">{t("common:open") || "Open"}</Text>
                  <Icon
                    icon={ChevronRightIcon}
                    size={14}
                    className="text-primary"
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Data & Export ── */}
        <View className="mb-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t("dataAndExport") || "Data & Export"}
          </Text>
          <View className="bg-card border border-border rounded-3xl p-4">
            {isLocked ? (
              <LockedCard
                title={t("dataAndExport") || "Export Data"}
                description={t("signInPrompt") || "Sign in or register to export data."}
                minHeight={30}
              />
            ) : (
              <DownloadButton selectedFarm={selectedFarm} />
            )}
          </View>
        </View>

        {/* ── Dev-Only ── */}
        {__DEV__ && (
          <View className="p-4 border border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950 rounded-3xl mt-2">
            <Text className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 text-center">
              🛠️ Developer Mode (__DEV__)
            </Text>
            <TouchableOpacity
              onPress={handleClearDevData}
              className="bg-amber-600 active:bg-amber-700 py-3 px-4 rounded-xl items-center"
              accessibilityRole="button"
            >
              <Text className="text-white font-bold text-xs">
                Clear All Local Data & Storage
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ── Crop Modal ── */}
      <Modal
        visible={cropModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCropModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPressOut={() => setCropModalVisible(false)}
        >
          <View className="bg-card border-t border-border rounded-t-3xl p-6 pb-12 max-h-[70%]">
            <View className="w-12 h-1 bg-border rounded-full self-center mb-4" />
            <Text className="text-lg font-bold text-foreground mb-4">
              {t("cropPickerTitle") || "Select Active Crop"}
            </Text>
            <ScrollView>
              <TouchableOpacity
                className={`py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center ${!selectedCrop ? "bg-muted border border-border" : ""}`}
                onPress={() => {
                  setSelectedCrop("");
                  setCropModalVisible(false);
                }}
              >
                <Text className="text-sm font-semibold text-foreground">
                  {t("noneDefault") || "None / Default"}
                </Text>
                {!selectedCrop && (
                  <Icon
                    icon={Tick02Icon}
                    size={18}
                    className="text-emerald-500"
                  />
                )}
              </TouchableOpacity>
              {crops.map((c: any) => {
                const cid = c.id || c.name?.toLowerCase();
                const isSel = selectedCrop === cid;
                return (
                  <TouchableOpacity
                    key={cid}
                    className={`py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center ${isSel ? "bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800" : ""}`}
                    onPress={() => {
                      setSelectedCrop(cid);
                      setCropModalVisible(false);
                    }}
                  >
                    <Text className="text-sm font-semibold text-foreground">
                      {c.name}{" "}
                      <Text className="text-xs text-muted-foreground font-normal">
                        ({c.area} ha)
                      </Text>
                    </Text>
                    {isSel && (
                      <Icon
                        icon={Tick02Icon}
                        size={18}
                        className="text-emerald-500"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Active custom crop if selected */}
              {isCustomCrop(selectedCrop) && (
                <View className="py-3.5 px-3 rounded-2xl mb-1.5 flex-row justify-between items-center bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {getCleanCropName(selectedCrop)}
                    </Text>
                    <View className="px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800">
                      <Text className="text-[10px] font-bold text-emerald-800 dark:text-emerald-200">
                        Other
                      </Text>
                    </View>
                  </View>
                  <Icon
                    icon={Tick02Icon}
                    size={18}
                    className="text-emerald-500"
                  />
                </View>
              )}

              {/* Other crop modal trigger */}
              <TouchableOpacity
                className="py-3.5 px-3 rounded-2xl mt-1.5 mb-1.5 flex-row justify-between items-center bg-muted border border-border"
                onPress={() => {
                  setCropModalVisible(false);
                  setOtherCropModalVisible(true);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon
                    icon={Plant01Icon}
                    size={18}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Other crop...
                  </Text>
                </View>
                <Text className="text-xs text-muted-foreground font-semibold">
                  100+ Crops
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Other Crop Catalog Modal ── */}
      <OtherCropModal
        visible={otherCropModalVisible}
        onClose={() => setOtherCropModalVisible(false)}
        onSelectCrop={(cropId) => {
          setSelectedCrop(cropId);
          setOtherCropModalVisible(false);
        }}
        currentSelectedCropId={selectedCrop}
      />

      {/* ── Language Modal ── */}
      <LanguageSelector
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}
