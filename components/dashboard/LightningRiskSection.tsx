import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { CloudOffIcon, Lightning } from "@hugeicons/core-free-icons";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";
import { useTranslation } from "react-i18next";
import { lightningRisk } from "@/lib/services/lightningRisk";

type LightningAdvisoryKey =
  | "lowRisk"
  | "moderateRisk"
  | "highRisk"
  | "severeRisk"
  | "hazardBandNoRisk";

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
      return {
        color: "#006045",
        advisory: "lowRisk" as LightningAdvisoryKey,
        zoom: 14,
      };
    case "No Risk":
    default:
      return {
        color: "#718096",
        advisory: "hazardBandNoRisk" as LightningAdvisoryKey,
        zoom: 14,
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
  const lightTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTile =
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
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
      maxZoom: 19,
      maxNativeZoom: ${isDark ? 16 : 19},
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    let radius = 2000;
    if ('${color}' === '#006045' || '${color}' === 'green') radius = 2000;
    else if ('${color}' === '#FF9C04' || '${color}' === 'yellow') radius = 5000;
    else if ('${color}' === '#FF4116' || '${color}' === 'orange') radius = 8000;
    else if ('${color}' === '#FF040E' || '${color}' === 'red') radius = 12000;
    else if ('${color}' === '#718096') radius = 1000;

    L.circle([${lat}, ${lng}], {
      color: '${color}',
      fillColor: '${color}',
      fillOpacity: 0.3,
      weight: 2,
      radius: radius
    }).addTo(map);

    // Center point marker
    L.circleMarker([${lat}, ${lng}], {
      color: '${isDark ? "#ffffff" : "#000000"}',
      fillColor: '${color}',
      fillOpacity: 1,
      weight: 1.5,
      radius: 4
    }).addTo(map);
  </script>
</body>
</html>
`;
};

export function LightningRiskSection() {
  const { t } = useTranslation(["weather", "dashboard"]);
  const { data, isLoading, isError } = useWeather();
  const { location, isResolving } = useLocationContext();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const current = data?.current;
  const fallbackLightning = current
    ? lightningRisk({
        code: current.weather_code ?? 0,
        cloudCover: current.cloud_cover ?? 0,
        precipitation: current.precipitation ?? 0,
        humidity: current.relative_humidity_2m ?? 0,
        windGusts: current.wind_gusts_10m ?? 0,
      })
    : undefined;

  const lightning = data?.lightning ?? fallbackLightning;

  if (!location && !isResolving) {
    return (
      <View className="my-6 px-3">
        <View className="flex pb-4 flex-row gap-2 items-center">
          <Icon
            icon={Lightning}
            className="text-foreground"
            strokeWidth={2}
            size={26}
          />
          <Text
            className="flex-1 shrink text-lg text-foreground font-semibold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("lightningRisk")}
          </Text>
        </View>
        <NoLocationCard message="Select a location to monitor real-time convective storm and lightning alerts." />
      </View>
    );
  }

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
          <Text
            className="flex-1 shrink text-lg text-foreground font-semibold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
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
          <Text
            className="flex-1 shrink text-lg text-foreground font-semibold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
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
      <SectionHeader
        icon={Lightning}
        title={t("lightningRisk")}
        titleClassName="flex-1 shrink text-lg text-foreground font-bold"
        rightContent={
          <View
            className="px-3 py-1 rounded-xl border"
            style={{
              backgroundColor: `${color}18`,
              borderColor: `${color}35`,
            }}
          >
            <Text
              style={{ color }}
              className="text-[10px] uppercase font-bold"
            >
              {lightning.category || t(advisory)}
            </Text>
          </View>
        }
      />

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

export default LightningRiskSection;
