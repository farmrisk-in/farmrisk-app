/**
 * Farm selection screen — full-screen map for drawing and selecting farms.
 *
 * Modes:
 *  - Browse: tap existing farm polygons to select them
 *  - Draw: tap to place vertices, undo, finish to complete polygon → save dialog
 *
 * Entry points: profile "My Farms", onboarding farm step.
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { FarmMapView, FarmMapHandle, FarmMapEvent } from "@/components/farms/FarmMapView";
import { SaveFieldDialog } from "@/components/farms/SaveFieldDialog";
import { useFields } from "@/hooks/useFields";
import { useFarmContext } from "@/providers/FarmProvider";
import { useLocationContext } from "@/providers/LocationProvider";
import { areaToHectares } from "@/lib/drawField";
import { generateFieldId } from "@/lib/drawField";
import { Icon } from "@/components/ui/Icon";
import { Cancel01Icon, Location01Icon } from "@hugeicons/core-free-icons";
import type { FieldInfo, SavedField } from "@/types/fields";

export default function FarmSelectScreen() {
  const { t } = useTranslation(["fields"]);
  const { t: tSearch } = useTranslation(["search"]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { location } = useLocationContext();
  const { selectFarm } = useFarmContext();
  const { fields, saveField, isSaving, refetch } = useFields();

  const mapRef = useRef<FarmMapHandle>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [points, setPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [polygonArea, setPolygonArea] = useState<number>(0);
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [completedGeometry, setCompletedGeometry] = useState<Record<string, unknown> | null>(null);
  const [completedCenterLat, setCompletedCenterLat] = useState<number | null>(null);
  const [completedCenterLng, setCompletedCenterLng] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);

  const initialLat = location?.lat ?? 23.0225;
  const initialLng = location?.lng ?? 72.5714;

  // Render farms on map once ready
  useEffect(() => {
    if (mapReady) {
      mapRef.current?.renderFarms(fields);
    }
  }, [mapReady, fields]);

  const handleMapEvent = useCallback((evt: FarmMapEvent) => {
    switch (evt.type) {
      case "ready":
        setMapReady(true);
        break;
      case "point_added":
        if (evt.points) {
          setPoints(evt.points);
          // Compute area from points
          import("@turf/area").then(({ area }) => {
            import("@turf/helpers").then(({ polygon }) => {
              try {
                const ring = [...evt.points!.map((p) => [p.lng, p.lat]), [evt.points![0].lng, evt.points![0].lat]];
                const feat = polygon([ring]);
                setPolygonArea(area(feat));
              } catch { setPolygonArea(0); }
            });
          });
        }
        break;
      case "point_removed":
        if (evt.points) {
          setPoints(evt.points);
          if (evt.points.length < 3) setPolygonArea(0);
          else {
            import("@turf/area").then(({ area }) => {
              import("@turf/helpers").then(({ polygon }) => {
                try {
                  const ring = [...evt.points!.map((p) => [p.lng, p.lat]), [evt.points![0].lng, evt.points![0].lat]];
                  setPolygonArea(area(polygon([ring])));
                } catch { setPolygonArea(0); }
              });
            });
          }
        }
        break;
      case "polygon_complete":
        // evt.points already contains the final captured snapshot from the JS side
        if (evt.points && evt.points.length >= 3) {
          const pts = evt.points;
          // Compute center
          let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
          for (const p of pts) {
            if (p.lat < minLat) minLat = p.lat;
            if (p.lat > maxLat) maxLat = p.lat;
            if (p.lng < minLng) minLng = p.lng;
            if (p.lng > maxLng) maxLng = p.lng;
          }
          const centerLat = (minLat + maxLat) / 2;
          const centerLng = (minLng + maxLng) / 2;
          const ring = [...pts.map((p) => [p.lng, p.lat]), [pts[0].lng, pts[0].lat]];
          setCompletedGeometry({ type: "Polygon", coordinates: [ring] });
          setCompletedCenterLat(centerLat);
          setCompletedCenterLng(centerLng);
          setPoints(pts);
          // Compute final area from pts
          import("@turf/area").then(({ area }) => {
            import("@turf/helpers").then(({ polygon }) => {
              try {
                setPolygonArea(area(polygon([ring])));
              } catch { setPolygonArea(0); }
            });
          });
          setSaveDialogVisible(true);
        }
        break;
      case "farm_selected":
        if (evt.fieldId) {
          const farm = fields.find((f) => f.id === evt.fieldId || f.fieldId === evt.fieldId);
          if (farm) {
            selectFarm(farm);
            router.back();
          }
        }
        break;
    }
  }, [fields, selectFarm, router]);

  const toggleDrawMode = () => {
    if (drawMode) {
      // Cancel drawing
      mapRef.current?.clearDrawing();
      mapRef.current?.setDrawMode(false);
      setDrawMode(false);
      setPoints([]);
      setPolygonArea(0);
    } else {
      // Enter draw mode
      mapRef.current?.clearDrawing();
      mapRef.current?.setDrawMode(true);
      setDrawMode(true);
      setPoints([]);
      setPolygonArea(0);
    }
  };

  const handleUndo = () => {
    mapRef.current?.undoPoint();
  };

  const handleSave = async (info: FieldInfo) => {
    try {
      const fieldId = generateFieldId();
      const geometry = completedGeometry!;
      const saved = await saveField({
        fieldId,
        fieldName: info.name,
        source: "manual",
        year: new Date().getFullYear().toString(),
        areaM2: polygonArea,
        geometry,
        properties: { "manual:source": "manual", "metrics:area": polygonArea },
        centerLat: completedCenterLat,
        centerLng: completedCenterLng,
        crops: info.crops,
        season: info.season,
        cropStage: info.cropStage,
      });
      // Close dialog and reset all drawing state
      setSaveDialogVisible(false);
      setDrawMode(false);
      setPoints([]);
      setPolygonArea(0);
      setCompletedGeometry(null);
      mapRef.current?.setDrawMode(false);
      // Refresh the farm list from storage and re-render on map
      const updated = await refetch();
      if (updated.data) {
        mapRef.current?.renderFarms(updated.data);
      }
    } catch (err: any) {
      console.warn("Failed to save farm:", err);
    }
  };

  const goToCurrentLocation = async () => {
    setIsGeolocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      mapRef.current?.flyTo(pos.coords.latitude, pos.coords.longitude, 16);
    } catch {} finally {
      setIsGeolocating(false);
    }
  };

  return (
    <View className="flex-1 bg-[#09090b]">
      <FarmMapView
        ref={mapRef}
        initialCenter={{ lat: initialLat, lng: initialLng }}
        initialZoom={15}
        onEvent={handleMapEvent}
      />

      {/* Top bar */}
      <View
        style={[styles.topBar, { paddingTop: insets.top + 8, backgroundColor: isDark ? "rgba(9,9,11,0.85)" : "rgba(255,255,255,0.88)" }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.topBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }]}
        >
          <Icon icon={Cancel01Icon} size={20} color={isDark ? "#fff" : "#09090b"} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-foreground">{t(drawMode ? "drawNew" : "title")}</Text>
        <TouchableOpacity
          onPress={goToCurrentLocation}
          disabled={isGeolocating}
          style={[styles.topBtn, { backgroundColor: isDark ? "rgba(52,211,153,0.2)" : "rgba(5,150,105,0.1)" }]}
        >
          {isGeolocating ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <Icon icon={Location01Icon} size={20} color="#10b981" />
          )}
        </TouchableOpacity>
      </View>

      {/* Drawing toolbar */}
      {drawMode && (
        <View
          style={[styles.drawBar, { top: insets.top + 68, backgroundColor: isDark ? "rgba(9,9,11,0.92)" : "rgba(255,255,255,0.94)" }]}
        >
          <View className="flex-row items-center gap-3">
            <Text className="text-zinc-300 text-xs">
              {t("pointsCount", { count: points.length })}
              {polygonArea > 0 ? ` · ${areaToHectares(polygonArea)}` : ""}
            </Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleUndo}
              disabled={points.length === 0}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-white/10 disabled:opacity-40"
            >
              <Text className="text-zinc-300 text-xs font-semibold">{t("undo")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => mapRef.current?.finishDrawing()}
              disabled={points.length < 3}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 disabled:opacity-40"
            >
              <Text className="text-white text-xs font-semibold">{t("finish")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleDrawMode} className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-white/10">
              <Text className="text-zinc-300 text-xs font-semibold">{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom action bar */}
      {!drawMode && (
        <View
          style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24), backgroundColor: isDark ? "rgba(9,9,11,0.92)" : "rgba(255,255,255,0.94)" }]}
        >
          <Text className="text-zinc-400 text-xs mb-2">{t("drawHint")}</Text>
          <TouchableOpacity onPress={toggleDrawMode} className="w-full rounded-2xl bg-emerald-600 active:bg-emerald-700 items-center justify-center py-4">
            <Text className="text-white text-base font-semibold">{t("drawNew")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Save dialog */}
      <SaveFieldDialog
        visible={saveDialogVisible}
        onClose={() => {
          setSaveDialogVisible(false);
          setDrawMode(false);
          setPoints([]);
          setPolygonArea(0);
          mapRef.current?.clearDrawing();
          mapRef.current?.setDrawMode(false);
        }}
        onSave={handleSave}
        areaM2={polygonArea}
        saving={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  topBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  drawBar: {
    position: "absolute", left: 16, right: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 16,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
});
