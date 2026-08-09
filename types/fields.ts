/** Domain type for a saved field/farm (maps to Supabase `saved_fields` row). */
export interface SavedField {
  /** Primary key (uuid or local-generated id). */
  id: string;
  /** Identifier of the source field (e.g. manual-<ts>-<rand>). */
  fieldId: string;
  /** How the field was obtained: only "manual" in the RN app. */
  source: "detected" | "manual";
  year: string;
  countryCode?: string | null;
  areaM2?: number | null;
  confidence?: number | null;
  geometry: Record<string, unknown>;
  properties: Record<string, unknown>;
  savedAt: string;
  /** User-facing name, e.g. "North Farm". */
  name?: string;
  /** Bounding-box centroid latitude. */
  centerLat?: number | null;
  /** Bounding-box centroid longitude. */
  centerLng?: number | null;
  /** Crop ids (from the crops API). */
  crops?: string[];
  /** Season id: "kharif" | "rabi" | "zaid". */
  season?: string;
  /** Crop stage id: "sowing" | "vegetative" | "flowering" | "maturity". */
  cropStage?: string;
}

/** Payload used to persist a newly drawn farm. */
export interface NewFieldRecord {
  fieldId: string;
  fieldName: string;
  source: "detected" | "manual";
  year: string;
  countryCode?: string | null;
  areaM2?: number | null;
  confidence?: number | null;
  geometry: Record<string, unknown>;
  properties: Record<string, unknown>;
  centerLat?: number | null;
  centerLng?: number | null;
  crops?: string[];
  season?: string;
  cropStage?: string;
}

/** A single hand-drawn vertex in geographic coordinates. */
export interface DrawnVertex {
  lng: number;
  lat: number;
}

/** Info returned by SaveFieldDialog on save. */
export interface FieldInfo {
  name: string;
  crops: string[];
  season: string;
  cropStage: string;
}

/** Minimal farm feature passed to the map for rendering. */
export interface FarmFeature {
  id: string;
  name?: string;
  centerLat?: number | null;
  centerLng?: number | null;
  geometry: Record<string, unknown>;
}
