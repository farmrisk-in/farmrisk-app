/**
 * FarmMapView — WebView-based Leaflet map for farm selection.
 *
 * Satellite imagery (ArcGIS World Imagery) + tap-to-draw polygon with
 * undo, saved farm rendering, and farm selection tap events.
 */
import React, { useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { StyleSheet, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import type { FarmFeature } from "@/types/fields";

export interface FarmMapHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  renderFarms: (farms: FarmFeature[]) => void;
  setDrawMode: (enabled: boolean) => void;
  clearDrawing: () => void;
  undoPoint: () => void;
  finishDrawing: () => void;
}

export interface FarmMapEvent {
  type: "ready" | "point_added" | "point_removed" | "polygon_complete" | "farm_selected" | "move";
  lat?: number;
  lng?: number;
  zoom?: number;
  points?: Array<{ lat: number; lng: number }>;
  count?: number;
  fieldId?: string;
}

interface FarmMapViewProps {
  initialCenter: { lat: number; lng: number };
  initialZoom?: number;
  onEvent?: (event: FarmMapEvent) => void;
}

function buildFarmMapHTML(initialLat: number, initialLng: number, initialZoom: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; background: #09090b; }
    .leaflet-container { background: #09090b !important; }
    .leaflet-control-zoom { display: none !important; }
    .leaflet-control-attribution {
      background: rgba(9,9,11,0.7) !important;
      color: #71717a !important;
      font-size: 9px !important;
    }
    .leaflet-control-attribution a { color: #a1a1aa !important; }
    .farm-pin { width: 18px; height: 18px; position: relative; }
    .farm-pin-inner {
      width: 10px; height: 10px; border-radius: 50%;
      background: #3b82f6; border: 2px solid white;
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
  (function() {
    var map = L.map('map', {
      center: [${initialLat}, ${initialLng}],
      zoom: ${initialZoom},
      zoomControl: false,
      attributionControl: true,
      tap: true,
      touchZoom: 'center',
    });

    // Satellite base layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri &mdash; Esri, Maxar, Earthstar Geographics',
    }).addTo(map);

    // Labels overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 0.7,
    }).addTo(map);

    function sendToRN(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    // ── Drawing state ──────────────────────────────────────────
    var drawMode = false;
    var points = [];
    var vertexMarkers = [];
    var sketchLine = null;

    // Clear only the visual drawing layers (markers + sketch line)
    // Does NOT reset the points array so undo/finish still work.
    function clearVisualLayers() {
      vertexMarkers.forEach(function(m) { map.removeLayer(m); });
      vertexMarkers = [];
      if (sketchLine) { map.removeLayer(sketchLine); sketchLine = null; }
    }

    // Full reset — wipes points AND visuals.
    function clearDrawingLayers() {
      clearVisualLayers();
      points = [];
    }

    function rebuildSketch() {
      if (sketchLine) map.removeLayer(sketchLine);
      if (points.length < 1) return;
      sketchLine = L.polyline(points.map(function(p) { return [p.lat, p.lng]; }), {
        color: '#10b981', weight: 2.5, dashArray: '6 4', opacity: 0.9
      }).addTo(map);
    }

    function addVertex(latlng) {
      if (points.length > 0) {
        var last = points[points.length - 1];
        var d = map.latLngToContainerPoint(latlng).distanceTo(map.latLngToContainerPoint(L.latLng(last.lat, last.lng)));
        if (d < 4) return;
      }
      var pt = { lat: latlng.lat, lng: latlng.lng };
      points.push(pt);
      var marker = L.circleMarker(latlng, {
        radius: 6, color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 1, interactive: false
      }).addTo(map);
      vertexMarkers.push(marker);
      rebuildSketch();
      sendToRN({ type: 'point_added', points: points.slice(), count: points.length });

      if (points.length >= 3) {
        var first = points[0];
        var d0 = map.latLngToContainerPoint(latlng).distanceTo(map.latLngToContainerPoint(L.latLng(first.lat, first.lng)));
        if (d0 < 8) {
          doFinishDrawing();
        }
      }
    }

    function undoLastPoint() {
      if (points.length === 0) return;
      points.pop();
      var m = vertexMarkers.pop();
      if (m) map.removeLayer(m);
      rebuildSketch();
      sendToRN({ type: 'point_removed', points: points.slice(), count: points.length });
    }

    function doFinishDrawing() {
      if (points.length < 3) { sendToRN({ type: 'draw_error', reason: 'points' }); return; }
      // Snapshot points BEFORE clearing any layers
      var pts = points.slice();
      // Remove duplicate closing point if user tapped near first point
      if (pts.length > 1) {
        var first = pts[0], last = pts[pts.length - 1];
        try {
          if (Math.abs(map.latLngToContainerPoint([last.lat, last.lng]).x - map.latLngToContainerPoint([first.lat, first.lng]).x) < 20 &&
              Math.abs(map.latLngToContainerPoint([last.lat, last.lng]).y - map.latLngToContainerPoint([first.lat, first.lng]).y) < 20) {
            pts.pop();
          }
        } catch(e) {}
      }
      if (pts.length < 3) { sendToRN({ type: 'draw_error', reason: 'points' }); return; }
      // Clear visuals (markers + sketch line) but keep pts snapshot safe
      clearDrawingLayers();
      drawMode = false;
      // Draw the completed filled polygon
      L.polygon(pts.map(function(p) { return [p.lat, p.lng]; }), {
        color: '#10b981', weight: 2.5, fillColor: '#10b981', fillOpacity: 0.25
      }).addTo(map);
      // Fire event WITH the captured point snapshot
      sendToRN({ type: 'polygon_complete', points: pts });
    }

    // ── Farm layer ─────────────────────────────────────────────
    var farmLayer = L.featureGroup();
    map.addLayer(farmLayer);

    function renderFarmsOnMap(farms) {
      farmLayer.clearLayers();
      (farms || []).forEach(function(farm) {
        if (farm.geometry && farm.geometry.type === 'Polygon' && farm.geometry.coordinates && farm.geometry.coordinates[0]) {
          var ring = farm.geometry.coordinates[0].map(function(c) { return [c[1], c[0]]; });
          var poly = L.polygon(ring, {
            color: '#3b82f6', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.15
          });
          poly.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            if (!drawMode) sendToRN({ type: 'farm_selected', fieldId: farm.id });
          });
          farmLayer.addLayer(poly);
        }
        if (farm.centerLat != null && farm.centerLng != null) {
          var icon = L.divIcon({
            className: 'farm-pin',
            html: '<div class="farm-pin-inner"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          var marker = L.marker([farm.centerLat, farm.centerLng], { icon: icon });
          marker.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            if (!drawMode) sendToRN({ type: 'farm_selected', fieldId: farm.id });
          });
          farmLayer.addLayer(marker);
        }
      });
    }

    function fitFarmCmd(cmd) {
      var lat = cmd.lat, lng = cmd.lng;
      var area = cmd.areaM2 || 10000;
      var side = Math.sqrt(area);
      var halfSide = side / 2;
      var dLat = halfSide / 111320;
      var dLng = halfSide / (111320 * Math.cos(lat * Math.PI / 180));
      map.fitBounds([
        [lat - dLat, lng - dLng],
        [lat + dLat, lng + dLng]
      ], { padding: [40, 40], maxZoom: 17 });
    }

    // ── Map events ─────────────────────────────────────────────
    map.on('click', function(e) {
      if (!drawMode) return;
      addVertex(e.latlng);
    });

    map.on('moveend', function() {
      var c = map.getCenter();
      sendToRN({ type: 'move', lat: c.lat, lng: c.lng, zoom: map.getZoom() });
    });

    // ── Commands from RN ───────────────────────────────────────
    function handleCommand(raw) {
      try {
        var cmd = JSON.parse(raw);
        switch (cmd.action) {
          case 'setDrawMode':
            drawMode = !!cmd.enabled;
            // Only do a full wipe when explicitly disabling; entering draw mode
            // just flips the flag so existing points survive a re-enable.
            if (!drawMode) clearDrawingLayers();
            break;
          case 'undoPoint': undoLastPoint(); break;
          case 'clearDrawing': clearDrawingLayers(); break;
          case 'finishDrawing': doFinishDrawing(); break;
          case 'renderFarms': renderFarmsOnMap(cmd.farms); break;
          case 'flyTo': map.flyTo([cmd.lat, cmd.lng], cmd.zoom || 16, { duration: 0.6 }); break;
          case 'setView': map.setView([cmd.lat, cmd.lng], cmd.zoom || map.getZoom()); break;
          case 'fitFarm': fitFarmCmd(cmd); break;
        }
      } catch(e) {}
    }

    window.addEventListener('message', function(e) { handleCommand(e.data); });
    document.addEventListener('message', function(e) { handleCommand(e.data); });

    sendToRN({ type: 'ready' });
  })();
  </script>
</body>
</html>`;
}

export const FarmMapView = forwardRef<FarmMapHandle, FarmMapViewProps>(
  ({ initialCenter, initialZoom = 15, onEvent }, ref) => {
    const webviewRef = useRef<WebView>(null);

    useImperativeHandle(ref, () => ({
      flyTo: (lat, lng, zoom) => {
        webviewRef.current?.injectJavaScript(
          `try{document.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify({ action: "flyTo", lat, lng, zoom }))}}));}catch(e){}true;`
        );
      },
      renderFarms: (farms) => {
        webviewRef.current?.injectJavaScript(
          `try{document.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify({ action: "renderFarms", farms }))}}));}catch(e){}true;`
        );
      },
      setDrawMode: (enabled) => {
        webviewRef.current?.injectJavaScript(
          `try{document.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify({ action: "setDrawMode", enabled }))}}));}catch(e){}true;`
        );
      },
      clearDrawing: () => {
        webviewRef.current?.injectJavaScript(
          `try{document.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify({ action: "clearDrawing" }))}}));}catch(e){}true;`
        );
      },
      undoPoint: () => {
        webviewRef.current?.injectJavaScript(
          `try{document.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify({ action: "undoPoint" }))}}));}catch(e){}true;`
        );
      },
      finishDrawing: () => {
        webviewRef.current?.injectJavaScript(
          `try{document.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify({ action: "finishDrawing" }))}}));}catch(e){}true;`
        );
      },
    }), []);

    const html = useMemo(
      () => buildFarmMapHTML(initialCenter.lat, initialCenter.lng, initialZoom),
      [initialCenter.lat, initialCenter.lng, initialZoom],
    );

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data: FarmMapEvent = JSON.parse(event.nativeEvent.data);
          onEvent?.(data);
        } catch {}
      },
      [onEvent],
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
        nestedScrollEnabled={false}
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
      />
    );
  },
);
FarmMapView.displayName = "FarmMapView";

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: "#09090b" },
});
