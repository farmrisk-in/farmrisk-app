import { SelectedLocation } from "@/providers/LocationProvider";
import { CalendarAPIResponse } from "@/types/calendar";
import { OpenMeteoResponse } from "@/types/weather";
import { VillageReportAPIResponse } from "@/types/forecast";

export interface AIAdvisoryRequestPayload {
  location: SelectedLocation;
  cropId: string;
  calendarData: CalendarAPIResponse;
  weatherData: OpenMeteoResponse;
  forecastData?: VillageReportAPIResponse;
  language: string;
}

export interface AIAPIResponse {
  success?: boolean;
  advisory_summary: string;
}
