/**
 * Geometry utilities for hand-drawn farm polygons.
 *
 * Ported from the web app's `lib/drawField.ts`, adapted for RN
 * with no external runtime dependencies beyond @turf/* (pure JS).
 */
import { area } from "@turf/area";
import { kinks } from "@turf/kinks";
import { polygon } from "@turf/helpers";
import type { DrawnVertex } from "@/types/fields";

export interface DrawnFieldPayload {
  /** Closed GeoJSON Polygon ring ([lng, lat] pairs, first === last). */
  geometry: Record<string, unknown>;
  areaM2: number;
  centerLat: number;
  centerLng: number;
}

export type DrawValidationReason = "points" | "self-intersection" | "area";

export type DrawValidationResult =
  | { ok: true; areaM2: number; centerLat: number; centerLng: number }
  | { ok: false; reason: DrawValidationReason };

/**
 * Builds a closed GeoJSON Polygon from the drawn vertices.
 * Returns `{ type: "Polygon", coordinates: [[[lng,lat], …, [lng,lat]]] }`
 * with the ring closed (first === last).
 */
export function drawnPolygonGeometry(
  verts: DrawnVertex[],
): Record<string, unknown> {
  const ring = [
    ...verts.map((v) => [v.lng, v.lat]),
    [verts[0].lng, verts[0].lat],
  ];
  return { type: "Polygon", coordinates: [ring] };
}

/**
 * Validates a drawn polygon: ≥3 distinct vertices, no self-intersections,
 * and a non-zero area. Returns the area (m²) and bounding-box centre.
 */
export function validateDrawnPolygon(
  verts: DrawnVertex[],
): DrawValidationResult {
  if (verts.length < 3) return { ok: false, reason: "points" };

  // Deduplicate at ~decimeter precision
  const seen = new Set<string>();
  for (const v of verts) {
    seen.add(`${Math.round(v.lng * 1e6)},${Math.round(v.lat * 1e6)}`);
  }
  if (seen.size < 3) return { ok: false, reason: "points" };

  const geometry = drawnPolygonGeometry(verts);
  const ring = (geometry.coordinates as number[][][])[0];
  const feature = polygon([ring]);

  try {
    if (kinks(feature).features.length > 0) {
      return { ok: false, reason: "self-intersection" };
    }
    const areaM2 = area(feature);
    if (!(areaM2 > 0)) return { ok: false, reason: "area" };
    const center = fieldCenter(geometry);
    if (!center) return { ok: false, reason: "area" };
    return {
      ok: true,
      areaM2,
      centerLat: center.lat,
      centerLng: center.lng,
    };
  } catch {
    return { ok: false, reason: "area" };
  }
}

/**
 * Bounding-box centroid of a GeoJSON Polygon.
 * Returns `{ lat, lng }` or `null` for degenerate geometries.
 */
export function fieldCenter(
  geometry: Record<string, unknown>,
): { lat: number; lng: number } | null {
  try {
    const coords = geometry.coordinates as number[][][];
    if (!coords || !coords[0] || coords[0].length < 2) return null;
    const ring = coords[0];
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    for (const pt of ring) {
      const [lng, lat] = pt as [number, number];
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
    return {
      lat: (minLat + maxLat) / 2,
      lng: (minLng + maxLng) / 2,
    };
  } catch {
    return null;
  }
}

/** Convert m² → hectares with sensible rounding. */
export function areaToHectares(areaM2: number): string {
  const ha = areaM2 / 10000;
  return ha >= 1 ? ha.toFixed(2) : `${Math.round(areaM2)} m²`;
}

/** Generate a unique ID for a manual field record. */
export function generateFieldId(): string {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
