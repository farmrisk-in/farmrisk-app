/**
 * DownloadButton — triggers export of the dashboard as a JPEG image.
 *
 * Renders the ExportTemplate off-screen, captures it with react-native-view-shot,
 * and saves to the device gallery via expo-media-library.
 */
import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Download01Icon } from "@hugeicons/core-free-icons";
import ExportTemplate from "./ExportTemplate";
import { useWeather } from "@/hooks/useWeather";
import { useForecast } from "@/hooks/useForecast";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useCalendar } from "@/hooks/useCalendar";
import { useAI } from "@/hooks/useAI";
import { useCropContext } from "@/providers/CropProvider";
import type { SavedField } from "@/types/fields";

interface Props {
  selectedFarm?: SavedField | null;
}

export default function DownloadButton({ selectedFarm }: Props) {
  const { t, i18n } = useTranslation(["profile"]);
  const viewShotRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  const { selectedCrop } = useCropContext();
  const { isLoading: isLoadingWeather } = useWeather();
  const { isLoading: isLoadingForecast } = useForecast();
  const { isLoading: isLoadingSoil } = useSoilMoisture();
  const { isLoading: isLoadingRisk } = useRiskScore();
  const { isLoading: isLoadingCal } = useCalendar(selectedCrop || "general");
  const { isLoading: isLoadingAI } = useAI(selectedCrop || "general", i18n.language);

  const isDataLoading = 
    isLoadingWeather || 
    isLoadingForecast || 
    isLoadingSoil || 
    isLoadingRisk || 
    isLoadingCal || 
    isLoadingAI;

  const handleExport = useCallback(async () => {
    if (isCapturing || isDataLoading) return;
    setIsCapturing(true);

    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("downloadPermissionTitle") || "Permission Required",
          t("downloadPermissionMsg") ||
            "Storage permission is needed to save the image to your gallery.",
        );
        return;
      }

      // Capture the off-screen template
      const uri = await captureRef(viewShotRef, {
        format: "jpg",
        quality: 0.95,
        result: "tmpfile",
      });

      // Save to gallery
      const asset = await MediaLibrary.createAssetAsync(uri);
      // Try to add to an album
      try {
        const albums = await MediaLibrary.getAlbumsAsync();
        const farmRiskAlbum = albums.find((a) => a.title === "FarmRisk");
        if (farmRiskAlbum) {
          await MediaLibrary.addAssetsToAlbumAsync(
            [asset],
            farmRiskAlbum,
            false,
          );
        } else {
          await MediaLibrary.createAlbumAsync("FarmRisk", asset, false);
        }
      } catch {
        // Album creation may fail on some devices; asset is still saved to camera roll
      }

      Alert.alert(
        t("downloadSuccessTitle") || "Saved!",
        t("downloadSuccessMsg") ||
          "Dashboard report saved to your gallery in the FarmRisk album.",
      );
    } catch (err) {
      console.error("Export failed:", err);
      Alert.alert(
        t("downloadErrorTitle") || "Export Failed",
        t("downloadErrorMsg") || "Could not save the image. Please try again.",
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isDataLoading, t]);

  return (
    <View>
      {/* Off-screen render of the template — captured silently */}
      <View
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          width: 794,
          opacity: 0.99, // Must be > 0 for capture
        }}
        pointerEvents="none"
      >
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.95 }}>
          <ExportTemplate selectedFarm={selectedFarm} />
        </ViewShot>
      </View>

      {/* The visible button */}
      <TouchableOpacity
        onPress={handleExport}
        disabled={isCapturing || isDataLoading}
        activeOpacity={0.7}
        className="flex-row items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 active:bg-emerald-700 disabled:opacity-50"
        accessibilityRole="button"
        accessibilityLabel={t("downloadImage") || "Export dashboard image"}
      >
        {isCapturing || isDataLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Icon icon={Download01Icon} size={18} color="#ffffff" />
        )}
        <Text className="text-white text-sm font-semibold">
          {isCapturing
            ? t("downloadGenerating") || "Generating..."
            : isDataLoading 
              ? t("downloadLoading") || "Loading Data..." 
              : t("downloadImage") || "Export Dashboard Image"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
