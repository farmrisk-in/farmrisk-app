import { Platform } from "react-native";

export function getApiUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL || "https://farmrisk.vercel.app";
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

// 6. Search Locations (Backend + Ola Maps + LocationIQ + Nominatim Fallbacks)
export async function searchLocations(q: string): Promise<any[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];

  const baseUrl = getApiUrl();

  // 1. Try Backend API first
  try {
    const res = await fetch(
      `${baseUrl}/api/locations?mode=search&q=${encodeURIComponent(trimmed)}`,
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results;
      }
    }
  } catch (backendErr) {
    console.warn(
      "[searchLocations] Backend search unavailable, attempting client fallbacks:",
      backendErr,
    );
  }

  // 2. Client-side Fallback 1: Ola Maps
  const olaApiKey =
    process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY ||
    process.env.OLA_MAPS_API_KEY ||
    "1IY0haE3s03m7dPztoZhLYshnZy9UFPEtn5sQa4S";

  if (olaApiKey) {
    try {
      const olaRes = await fetch(
        `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(
          trimmed,
        )}&api_key=${encodeURIComponent(olaApiKey)}`,
        {
          headers: {
            "X-Request-Id": "farmrisk-search",
            Accept: "application/json",
          },
        },
      );
      if (olaRes.ok) {
        const olaData = await olaRes.json();
        const predictions = olaData.predictions || [];
        if (predictions.length > 0) {
          const results: any[] = [];
          for (let i = 0; i < predictions.length; i++) {
            const pred = predictions[i];
            const mainText =
              pred.structured_formatting?.main_text ||
              pred.description ||
              trimmed;
            const secondaryText =
              pred.structured_formatting?.secondary_text || "";
            const name = secondaryText
              ? `${mainText}, ${secondaryText}`
              : mainText;
            const displayName = pred.description || name;
            const placeId = pred.place_id || `ola-${i}`;

            const lat = pred.geometry?.location?.lat ?? pred.location?.lat;
            const lng = pred.geometry?.location?.lng ?? pred.location?.lng;

            if (
              typeof lat === "number" &&
              typeof lng === "number" &&
              !isNaN(lat) &&
              !isNaN(lng)
            ) {
              results.push({
                id: placeId,
                name,
                displayName,
                lat,
                lng,
                district: secondaryText.split(",")[0]?.trim() || mainText,
                provider: "ola",
              });
            }
          }
          if (results.length > 0) return results;
        }
      }
    } catch (olaErr) {
      console.warn("[searchLocations] Client Ola Maps search failed:", olaErr);
    }
  }

  // 3. Client-side Fallback 2: LocationIQ
  const locationIqApiKey =
    process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY ||
    process.env.LOCATIONIQ_API_KEY ||
    "pk.697f028b191541778dbab4077852625e";

  if (locationIqApiKey) {
    try {
      const liqRes = await fetch(
        `https://us1.locationiq.com/v1/autocomplete?key=${encodeURIComponent(
          locationIqApiKey,
        )}&q=${encodeURIComponent(
          trimmed,
        )}&format=json&addressdetails=1&limit=8&countrycodes=in`,
      );
      if (liqRes.ok) {
        const data = await liqRes.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => {
            const addr = item.address;
            const main =
              addr?.village ??
              addr?.town ??
              addr?.city ??
              item.display_place;
            const dist =
              addr?.county ?? addr?.state_district ?? addr?.state;
            return {
              id: String(item.place_id),
              name: [main, dist].filter(Boolean).join(", ") || item.display_name,
              displayName: item.display_name,
              lat: Number(item.lat),
              lng: Number(item.lon),
              district: addr?.county ?? addr?.state_district,
              state: addr?.state,
              provider: "locationiq",
            };
          });
        }
      }
    } catch (liqErr) {
      console.warn("[searchLocations] Client LocationIQ search failed:", liqErr);
    }
  }

  // 4. Client-side Fallback 3: Nominatim (OpenStreetMap)
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=in&q=${encodeURIComponent(
        trimmed,
      )}`,
      {
        headers: {
          "User-Agent": "farmrisk-app/1.0",
          Accept: "application/json",
        },
      },
    );
    if (nomRes.ok) {
      const data = await nomRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => {
          const addr = item.address;
          const main = addr?.village ?? addr?.town ?? addr?.city;
          const dist = addr?.county ?? addr?.state_district;
          return {
            id: String(item.place_id),
            name:
              [main, dist, addr?.state].filter(Boolean).join(", ") ||
              item.display_name,
            displayName: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
            district: dist,
            state: addr?.state,
            provider: "nominatim",
          };
        });
      }
    }
  } catch (nomErr) {
    console.warn("[searchLocations] Client Nominatim search failed:", nomErr);
  }

  return [];
}

// 7. Reverse Geocode (Backend + Ola Maps + LocationIQ + Nominatim Fallbacks)
export async function reverseGeocode(lat: number, lng: number): Promise<any> {
  const baseUrl = getApiUrl();

  // 1. Try Backend API first
  try {
    const res = await fetch(
      `${baseUrl}/api/locations?mode=reverse&lat=${lat}&lon=${lng}`,
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (backendErr) {
    console.warn(
      "[reverseGeocode] Backend reverse geocode unavailable, attempting client fallbacks:",
      backendErr,
    );
  }

  // 2. Client-side Fallback 1: Ola Maps
  const olaApiKey =
    process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY ||
    process.env.OLA_MAPS_API_KEY ||
    "1IY0haE3s03m7dPztoZhLYshnZy9UFPEtn5sQa4S";

  if (olaApiKey) {
    try {
      const olaRes = await fetch(
        `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${encodeURIComponent(
          olaApiKey,
        )}`,
        {
          headers: {
            "X-Request-Id": "farmrisk-reverse",
            Accept: "application/json",
          },
        },
      );
      if (olaRes.ok) {
        const olaData = await olaRes.json();
        const results = olaData.results || [];
        if (results.length > 0) {
          const top = results[0];
          const displayName =
            top.formatted_address || top.name || `${lat}, ${lng}`;
          let state: string | undefined;
          let district: string | undefined;
          if (Array.isArray(top.address_components)) {
            for (const comp of top.address_components) {
              const types: string[] = comp.types || [];
              if (types.includes("administrative_area_level_1")) {
                state = comp.long_name;
              } else if (
                types.includes("administrative_area_level_2") ||
                types.includes("locality") ||
                types.includes("district")
              ) {
                if (!district) district = comp.long_name;
              }
            }
          }
          return {
            name: top.name || district || state || displayName.split(",")[0],
            displayName,
            lat,
            lng,
            district,
            state,
            provider: "ola",
          };
        }
      }
    } catch (olaErr) {
      console.warn("[reverseGeocode] Client Ola reverse failed:", olaErr);
    }
  }

  // 3. Client-side Fallback 2: LocationIQ
  const locationIqApiKey =
    process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY ||
    process.env.LOCATIONIQ_API_KEY ||
    "pk.697f028b191541778dbab4077852625e";

  if (locationIqApiKey) {
    try {
      const liqRes = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${encodeURIComponent(
          locationIqApiKey,
        )}&lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      );
      if (liqRes.ok) {
        const item = await liqRes.json();
        const addr = item.address;
        const main = addr?.village ?? addr?.town ?? addr?.city;
        const dist = addr?.county ?? addr?.state_district;
        return {
          name: [main, dist].filter(Boolean).join(", ") || item.display_name,
          displayName: item.display_name,
          lat,
          lng,
          district: dist,
          state: addr?.state,
          provider: "locationiq",
        };
      }
    } catch (liqErr) {
      console.warn("[reverseGeocode] Client LocationIQ reverse failed:", liqErr);
    }
  }

  // 4. Client-side Fallback 3: Nominatim
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "farmrisk-app/1.0",
          Accept: "application/json",
        },
      },
    );
    if (nomRes.ok) {
      const item = await nomRes.json();
      const addr = item.address;
      const main = addr?.village ?? addr?.town ?? addr?.city;
      const dist = addr?.county ?? addr?.state_district;
      return {
        name:
          [main, dist, addr?.state].filter(Boolean).join(", ") ||
          item.display_name,
        displayName: item.display_name,
        lat,
        lng,
        district: dist,
        state: addr?.state,
        provider: "nominatim",
      };
    }
  } catch (nomErr) {
    console.warn("[reverseGeocode] Client Nominatim reverse failed:", nomErr);
  }

  // Final graceful fallback (coordinates)
  return {
    name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    displayName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    lat,
    lng,
    provider: "coordinates",
  };
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
