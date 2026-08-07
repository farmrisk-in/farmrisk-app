import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icon } from "@/components/ui/Icon";
import { CloudLightningIcon, CloudOffIcon } from "@hugeicons/core-free-icons";
import { WebView } from "react-native-webview";

const getLightningDetails = (category: string | undefined) => {
  switch (category) {
    case "Severe":
      return {
        color: "#FF040E",
        advisory: "Severe risk of lightning.",
        zoom: 11,
      };
    case "High":
      return {
        color: "#FF4116",
        advisory: "High risk of lightning.",
        zoom: 12,
      };
    case "Moderate":
      return {
        color: "#FF9C04",
        advisory: "Moderate risk of lightning.",
        zoom: 13,
      };
    case "Low":
    default:
      return {
        color: "#006045",
        advisory: "Low risk of lightning.",
        zoom: 14,
      };
  }
};

const generateMapHtml = (lat: number, lng: number, zoom: number, color: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; background-color: #f3f4f6; }
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
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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

export function LightningRiskSection() {
  const { data, isLoading, isError } = useWeather();
  const { location, isResolving } = useLocationContext();

  const lightning = data?.lightning;

  if (isResolving || isLoading) {
    return (
      <View className="w-full bg-card border border-border text-foreground rounded-2xl shadow-sm p-5 pb-0 mb-4 overflow-hidden">
        <View className="flex-row items-center gap-2 border-b border-border mb-3 pb-3">
          <Icon icon={CloudLightningIcon} size={18} className="text-foreground" />
          <Text className="text-foreground text-xs font-bold uppercase tracking-wider">
            LIGHTNING RISK
          </Text>
        </View>
        <View className="w-full h-48 items-center justify-center gap-2">
          <ActivityIndicator color="#007a55" />
          <Text className="text-sm font-medium text-muted-foreground">
            Fetching Lightning Risk Data...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !lightning || !location) {
    return (
      <View className="w-full bg-card border border-border text-foreground rounded-2xl shadow-sm p-5 pb-0 mb-4 overflow-hidden">
        <View className="flex-row items-center gap-2 border-b border-border mb-3 pb-3">
          <Icon icon={CloudLightningIcon} size={18} className="text-foreground" />
          <Text className="text-foreground text-xs font-bold uppercase tracking-wider">
            LIGHTNING RISK
          </Text>
        </View>
        <View className="w-full h-48 items-center justify-center gap-2">
          <Icon icon={CloudOffIcon} size={28} className="text-muted-foreground" />
          <Text className="text-sm font-medium text-muted-foreground mt-2">
            Something went wrong
          </Text>
        </View>
      </View>
    );
  }

  const { color, advisory, zoom } = getLightningDetails(lightning.category);

  return (
    <View className="w-full bg-card border border-border text-foreground rounded-2xl shadow-sm p-5 pb-5 mb-4">
      <View className="flex-row items-center gap-2 border-b border-border mb-4 pb-3">
        <Icon icon={CloudLightningIcon} size={18} className="text-foreground" />
        <Text className="text-foreground text-xs font-bold uppercase tracking-wider">
          LIGHTNING RISK
        </Text>
      </View>
      
      <View className="w-full h-64 rounded-xl overflow-hidden border border-border relative bg-muted/20">
        <WebView
          source={{ html: generateMapHtml(location.lat, location.lng, zoom, color) }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          pointerEvents="none"
        />
        
        {/* Bottom Left Badge */}
        <View className="absolute bottom-3 left-3 flex-row pointer-events-none">
          <View
            className="px-3 py-1.5 rounded-md flex-row items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Text className="text-white text-xs font-bold">
              {advisory}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
