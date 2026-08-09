/**
 * Farm-field constants used by the SaveFieldDialog and field management.
 */

export const SEASONS = ["kharif", "rabi", "zaid"] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_KEYS: Record<Season, string> = {
  kharif: "fields.seasons.kharif",
  rabi: "fields.seasons.rabi",
  zaid: "fields.seasons.zaid",
};

export const CROP_STAGES = [
  "sowing",
  "vegetative",
  "flowering",
  "maturity",
] as const;
export type CropStage = (typeof CROP_STAGES)[number];

export const CROP_STAGE_KEYS: Record<CropStage, string> = {
  sowing: "fields.stages.sowing",
  vegetative: "fields.stages.vegetative",
  flowering: "fields.stages.flowering",
  maturity: "fields.stages.maturity",
};

/** Fallback crop list when the crops API is unavailable. */
export const DEFAULT_CROPS = [
  { id: "rice", name: "Rice" },
  { id: "wheat", name: "Wheat" },
  { id: "cotton", name: "Cotton" },
  { id: "maize", name: "Maize" },
  { id: "sugarcane", name: "Sugarcane" },
  { id: "groundnut", name: "Groundnut" },
  { id: "soybean", name: "Soybean" },
  { id: "mustard", name: "Mustard" },
  { id: "vegetables", name: "Vegetables" },
  { id: "pulses", name: "Pulses" },
  { id: "rapeseed", name: "Rapeseed" },
  { id: "tea", name: "Tea" },
];
