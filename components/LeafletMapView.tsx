/**
 * LeafletMapView — A React Native WebView wrapper that renders a Leaflet.js
 * interactive map with OpenStreetMap tiles, crosshair overlay, dark mode
 * support, and bidirectional communication via postMessage.
 *
 * Features:
 *  - No API key required (OSM + CartoDB tiles)
 *  - Pinch zoom, pan, rotate
 *  - Hideable zoom controls
 *  - Dark theme via CartoDB Dark Matter tiles
 *  - Crosshair always centered
 *  - Sends center coordinates on every move
 *  - Supports programmatic flyTo via injectJavaScript
 */
import React, { useRef, useCallback, useMemo } from "react";
import { StyleSheet, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

export interface LeafletMapEvent {
  type: "move" | "ready" | "click" | "polygon_complete";
  lat: number;
  lng: number;
  zoom?: number;
  points?: Array<{ lat: number; lng: number }>;
}

interface LeafletMapViewProps {
  initialCenter: { lat: number; lng: number };
  initialZoom?: number;
  isDark?: boolean;
  showZoomControl?: boolean;
  showCrosshair?: boolean;
  enableDrawing?: boolean;
  onMove?: (event: LeafletMapEvent) => void;
  onReady?: () => void;
  onClick?: (event: LeafletMapEvent) => void;
  onPolygonComplete?: (points: Array<{ lat: number; lng: number }>) => void;
}

function buildMapHTML(options: {
  lat: number;
  lng: number;
  zoom: number;
  isDark: boolean;
  showZoomControl: boolean;
  showCrosshair: boolean;
  enableDrawing: boolean;
}): string {
  const {
    lat,
    lng,
    zoom,
    isDark,
    showZoomControl,
    showCrosshair,
    enableDrawing,
  } = options;

  const lightTile = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const darkTile =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
  const tileUrl = isDark ? darkTile : lightTile;
  const tileAttribution = isDark
    ? '&copy; <a href="https://carto.com/">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

  const crosshairColor = isDark ? "white" : "black";
  const crosshairBg = isDark ? "rgba(9,9,11,0.6)" : "rgba(255,255,255,0.7)";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  ${enableDrawing ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />' : ""}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    body { background: ${isDark ? "#0B0B0B" : "#f4f4f5"}; }
    .leaflet-container { background: ${isDark ? "#0B0B0B" : "#f4f4f5"} !important; }
    .leaflet-tile-pane { background: ${isDark ? "#0B0B0B" : "#f4f4f5"} !important; }

    /* Crosshair Overlay */
    ${
      showCrosshair
        ? `
    .crosshair {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000; pointer-events: none;
    }
    .crosshair-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: ${crosshairColor};
      border: 2px solid ${isDark ? "#022c22" : "#ffffff"};
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    }
    .crosshair-line-v {
      width: 2px; height: 36px;
      background: ${crosshairColor};
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    }
    .crosshair-line-h {
      width: 36px; height: 2px;
      background: ${crosshairColor};
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    }
    `
        : ""
    }

    /* Hide zoom if requested */
    ${!showZoomControl ? ".leaflet-control-zoom { display: none !important; }" : ""}

    /* Dark theme overrides for Leaflet controls */
    ${
      isDark
        ? `
    .leaflet-control-zoom a {
      background: rgba(24,24,27,0.9) !important;
      color: #e4e4e7 !important;
      border-color: rgba(255,255,255,0.15) !important;
    }
    .leaflet-control-zoom a:hover {
      background: rgba(39,39,42,0.95) !important;
    }
    .leaflet-control-attribution {
      background: rgba(9,9,11,0.7) !important;
      color: #71717a !important;
    }
    .leaflet-control-attribution a { color: #a1a1aa !important; }
    .leaflet-draw-toolbar a {
      background-color: rgba(24,24,27,0.9) !important;
      border-color: rgba(255,255,255,0.15) !important;
    }
    `
        : ""
    }
  </style>
</head>
<body>
  ${
    showCrosshair
      ? `
  <div class="crosshair">
    <div class="crosshair-dot"></div>
    <div class="crosshair-line-v"></div>
    <div class="crosshair-line-h"></div>
  </div>
  `
      : ""
  }
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  ${enableDrawing ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>' : ""}
  <script>
    (function() {
      var map = L.map('map', {
        center: [${lat}, ${lng}],
        zoom: ${zoom},
        zoomControl: ${showZoomControl},
        attributionControl: true,
        tap: true,
        touchZoom: 'center',
      });

      L.tileLayer('${tileUrl}', {
        attribution: '${tileAttribution}',
        maxZoom: 19,
        subdomains: ${isDark ? "'abcd'" : "'abc'"},
      }).addTo(map);

      // Send message to React Native
      function sendToRN(data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      }

      // Notify on every map move
      map.on('moveend', function() {
        var c = map.getCenter();
        sendToRN({ type: 'move', lat: c.lat, lng: c.lng, zoom: map.getZoom() });
      });

      // Notify on click/tap
      map.on('click', function(e) {
        sendToRN({ type: 'click', lat: e.latlng.lat, lng: e.latlng.lng });
      });

      ${
        enableDrawing
          ? `
      // Drawing layer
      var drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      var drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false,
            shapeOptions: {
              color: '${crosshairColor}',
              fillColor: '${crosshairColor}',
              fillOpacity: 0.15,
              weight: 2,
            }
          },
          marker: true,
          polyline: { shapeOptions: { color: '${crosshairColor}', weight: 3 } },
          circle: false,
          rectangle: false,
          circlemarker: false,
        },
        edit: { featureGroup: drawnItems, remove: true },
      });
      map.addControl(drawControl);

      map.on(L.Draw.Event.CREATED, function(e) {
        drawnItems.addLayer(e.layer);
        if (e.layerType === 'polygon') {
          var points = e.layer.getLatLngs()[0].map(function(ll) {
            return { lat: ll.lat, lng: ll.lng };
          });
          sendToRN({ type: 'polygon_complete', lat: 0, lng: 0, points: points });
        }
      });
      `
          : ""
      }

      // Listen for commands from React Native
      window.addEventListener('message', function(e) {
        try {
          var cmd = JSON.parse(e.data);
          if (cmd.action === 'flyTo') {
            map.flyTo([cmd.lat, cmd.lng], cmd.zoom || map.getZoom(), { duration: 0.6 });
          } else if (cmd.action === 'setView') {
            map.setView([cmd.lat, cmd.lng], cmd.zoom || map.getZoom());
          }
        } catch(err) {}
      });

      // Also listen for document message (Android compat)
      document.addEventListener('message', function(e) {
        try {
          var cmd = JSON.parse(e.data);
          if (cmd.action === 'flyTo') {
            map.flyTo([cmd.lat, cmd.lng], cmd.zoom || map.getZoom(), { duration: 0.6 });
          } else if (cmd.action === 'setView') {
            map.setView([cmd.lat, cmd.lng], cmd.zoom || map.getZoom());
          }
        } catch(err) {}
      });

      // Signal ready
      sendToRN({ type: 'ready', lat: ${lat}, lng: ${lng}, zoom: ${zoom} });
    })();
  </script>
</body>
</html>
  `;
}

export const LeafletMapView = React.forwardRef<WebView, LeafletMapViewProps>(
  (
    {
      initialCenter,
      initialZoom = 13,
      isDark = false,
      showZoomControl = false,
      showCrosshair = true,
      enableDrawing = false,
      onMove,
      onReady,
      onClick,
      onPolygonComplete,
    },
    ref,
  ) => {
    const webviewRef = useRef<WebView>(null);

    // Forward ref so parent can call injectJavaScript
    React.useImperativeHandle(ref, () => webviewRef.current as WebView);

    const html = useMemo(
      () =>
        buildMapHTML({
          lat: initialCenter.lat,
          lng: initialCenter.lng,
          zoom: initialZoom,
          isDark,
          showZoomControl,
          showCrosshair,
          enableDrawing,
        }),
      [
        initialCenter.lat,
        initialCenter.lng,
        initialZoom,
        isDark,
        showZoomControl,
        showCrosshair,
        enableDrawing,
      ],
    );

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data: LeafletMapEvent = JSON.parse(event.nativeEvent.data);
          switch (data.type) {
            case "move":
              onMove?.(data);
              break;
            case "ready":
              onReady?.();
              break;
            case "click":
              onClick?.(data);
              break;
            case "polygon_complete":
              if (data.points) {
                onPolygonComplete?.(data.points);
              }
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      },
      [onMove, onReady, onClick, onPolygonComplete],
    );

    return (
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Prevent WebView from stealing touch gestures
        nestedScrollEnabled={false}
        // Android: Hardware acceleration for smooth map
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
      />
    );
  },
);

LeafletMapView.displayName = "LeafletMapView";

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
