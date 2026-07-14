export interface Crop {
  id: string;
  name: string;
  area: number;
}

export interface CropsAPIResponse {
  success: boolean;
  district: string;
  state: string;
  distanceKm: number;
  crops: Crop[];
}

export const GENERAL_CROP: Crop = {
  id: "general",
  name: "General (All Crops)",
  area: 0,
};
