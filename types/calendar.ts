export interface CalendarEvent {
  crop: string;
  season: string;
  sowingPeriod: string;
  harvestingPeriod: string;
  sowFromMon: number | null;
  sowToMon: number | null;
  harvFromMon: number | null;
  harvToMon: number | null;
}

export interface CalendarAPIResponse {
  success: boolean;
  state: string;
  district: string;
  districtCode: string | null;
  calendar: CalendarEvent[];
}
