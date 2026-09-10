import { Platform } from "react-native";

export function getApiUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL || "https://127.0.0.1:7860";
  // Remove trailing slash if any
  return url.replace(/\/$/, "");
}

// 1. Weather
export async function getWeather(lat: number, lng: number): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/weather?lat=${lat}&lng=${lng}`);

  if (!res.ok) {
    throw new Error(`Weather request failed: ${res.statusText}`);
  }
  return res.json();
}

// 2. Forecast
export async function getForecast(lat: number, lon: number): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/forecast?lat=${lat}&lon=${lon}`);

  if (!res.ok) {
    throw new Error(`Forecast request failed: ${res.statusText}`);
  }
  return res.json();
}

// 3. Soil Moisture
export async function getSoilMoisture(
  lat: number,
  lon: number,
  crop?: string,
  daysbefore?: number,
): Promise<any> {
  const baseUrl = getApiUrl();
  let url = `${baseUrl}/api/soil-moisture?lat=${lat}&lon=${lon}`;
  if (crop && crop !== "general") {
    url += `&crop=${crop}`;
  }
  if (daysbefore !== undefined && daysbefore !== null) {
    url += `&daysbefore=${daysbefore}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Soil moisture request failed: ${res.statusText}`);
  }
  return res.json();
}

// 4. AI Advisory
export async function getAIAdvisory(payload: any): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`AI advisory request failed: ${res.statusText}`);
  }
  return res.json();
}

// 5. Weather Summary
export async function getWeatherSummary(payload: any): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/ai/weather-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Weather summary request failed: ${res.statusText}`);
  }
  return res.json();
}

// 6. Search Locations
export async function searchLocations(q: string): Promise<any[]> {
  const baseUrl = getApiUrl();
  const res = await fetch(
    `${baseUrl}/api/locations?mode=search&q=${encodeURIComponent(q)}`,
  );
  if (!res.ok) {
    throw new Error(`Location search failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.results || [];
}

// 7. Reverse Geocode
export async function reverseGeocode(lat: number, lng: number): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(
    `${baseUrl}/api/locations?mode=reverse&lat=${lat}&lon=${lng}`,
  );
  if (!res.ok) {
    throw new Error(`Reverse geocoding failed: ${res.statusText}`);
  }
  return res.json();
}

// 8. Get Crops
export async function getCrops(lat: number, lng: number): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/crops?lat=${lat}&lng=${lng}`);

  if (!res.ok) {
    throw new Error(`Crops request failed: ${res.statusText}`);
  }
  return res.json();
}

// 9. Crop Calendar
export async function getCalendar(
  crop: string,
  lat: number,
  lng: number,
): Promise<any> {
  const baseUrl = getApiUrl();
  // Note: Next.js API spelling is "/api/calender"
  const res = await fetch(
    `${baseUrl}/api/calender?lat=${lat}&lng=${lng}&crop=${crop}`,
  );

  if (!res.ok) {
    throw new Error(`Calendar request failed: ${res.statusText}`);
  }
  return res.json();
}

// 10. Risk Score
export async function getRiskScore(payload: any): Promise<any> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/risk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Risk score request failed: ${res.statusText}`);
  }
  return res.json();
}

// 11. Pre Sowing Advisory
export async function getPreSowingAdvisory(payload: {
  crop: string;
  state: string;
  soil_type: string;
  season?: string;
  irrigation_type?: string;
  language?: string;
}): Promise<any> {
  const url = `${getApiUrl()}/api/advisory/pre-sowing`;
  console.log(`[getPreSowingAdvisory] POST -> ${url}`, payload);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[getPreSowingAdvisory] Failed ${res.status}:`, errText);
      throw new Error(
        `getPreSowingAdvisory request failed (${res.status}): ${errText || res.statusText}`,
      );
    }
    const data = await res.json();
    console.log(
      `[getPreSowingAdvisory] Success! Received sections:`,
      Object.keys(data?.sections || {}),
    );
    return data;
  } catch (err) {
    console.error(`[getPreSowingAdvisory] Network Error:`, err);
    throw err;
  }
}
