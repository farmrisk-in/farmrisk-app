import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icon } from "@/components/ui/Icon";
import {
  CloudOffIcon,
  Lightning,
} from "@hugeicons/core-free-icons";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";

type LightningAdvisoryKey =
  | "lowRisk"
  | "moderateRisk"
  | "highRisk"
  | "severeRisk";

const getLightningDetails = (category: string | undefined) => {
  switch (category) {
    case "Severe":
      return {
        color: "#FF040E",
        advisory: "severeRisk" as LightningAdvisoryKey,
        zoom: 11,
      };
    case "High":
      return {
        color: "#FF4116",
        advisory: "highRisk" as LightningAdvisoryKey,
        zoom: 12,
      };
    case "Moderate":
      return {
        color: "#FF9C04",
        advisory: "moderateRisk" as LightningAdvisoryKey,
        zoom: 13,
      };
    case "Low":
    default:
      return {
        color: "#006045",
        advisory: "lowRisk" as LightningAdvisoryKey,
        zoom: 10.5,
      };
  }
};

const generateMapHtml = (
  lat: number,
  lng: number,
  zoom: number,
  color: string,
  isDark: boolean,
) => {
  const lightTile =
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const darkTile =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const tileUrl = isDark ? darkTile : lightTile;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; background-color: ${isDark ? "#09090b" : "#ffffff"}; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-control-attribution { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([${lat}, ${lng}], ${zoom});

    L.tileLayer('${tileUrl}', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const radius = ${zoom} === 11 ? 25000 : ${zoom} === 12 ? 15000 : ${zoom} === 13 ? 8000 : 4000;

    L.circle([${lat}, ${lng}], {
      color: '${color}',
      fillColor: '${color}',
      fillOpacity: 0.3,
      weight: 2,
      radius: radius
    }).addTo(map);
  </script>
</body>
</html>
`;
};

export function LightningRiskSection() {
  const { t } = useTranslation(["weather"]);
  const { data, isLoading, isError } = useWeather();
  const { location, isResolving } = useLocationContext();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const lightning = data?.lightning;

  if (isResolving || isLoading) {
    return (
      <View className="my-6 px-3">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={Lightning}
            className="text-foreground"
            strokeWidth={2}
            size={26}
          />
          <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {t("lightningRisk")}
          </Text>
        </View>
        <View
          className="w-full h-64 rounded-3xl overflow-hidden flex justify-center items-center
          border border-border relative"
        >
          <ActivityIndicator color="#007a55" />
          <Text className="text-sm font-medium mt-4 text-muted-foreground">
            {t("fetchingLightningRisk")}
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !lightning || !location) {
    return (
      <View className="my-6 px-3">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={Lightning}
            className="text-foreground"
            strokeWidth={2}
            size={26}
          />
          <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            {t("lightningRisk")}
          </Text>
        </View>

        <View
          className="w-full h-64 rounded-3xl overflow-hidden flex justify-center items-center
        border border-border relative"
        >
          <Icon icon={CloudOffIcon} className="text-destructive" size={32} />
          <Text className="text-sm font-medium mt-4 text-muted-foreground">
            {t("lightningLoadError")}
          </Text>
        </View>
      </View>
    );
  }

  const { color, advisory, zoom } = getLightningDetails(lightning.category);

  return (
    <View className="my-6 px-3">
      <View className="flex pb-4 flex-row gap-2 items-center">
        <Icon
          icon={Lightning}
          className="text-foreground"
          strokeWidth={2}
          size={26}
        />
        <Text className="flex-1 shrink text-xl text-foreground font-semibold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {t("lightningRisk")}
        </Text>
        <View className="flex-row flex gap-1 items-center">
          <View className="px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50">
            <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              {t(advisory)}
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full h-64 rounded-3xl overflow-hidden border border-border relative bg-muted">
        <WebView
          source={{
            html: generateMapHtml(
              location.lat,
              location.lng,
              zoom,
              color,
              isDark,
            ),
          }}
          style={{ flex: 1, backgroundColor: "transparent" }}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}
