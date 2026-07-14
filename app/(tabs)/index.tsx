import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePro } from "@/hooks/usePro";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocationContext } from "@/providers/LocationProvider";
import {
  getWeather,
  getForecast,
  getSoilMoisture,
  getAIAdvisory,
  getWeatherSummary,
  searchLocations,
  getCrops,
  getCalendar,
} from "@/lib/api";

export default function HomeScreen() {
  const { location, setLocation } = useLocationContext();
  const { isPro, fullName } = usePro();
  const { language, setLanguage, t } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState<any>({
    id: "general",
    name: "General (All Crops)",
    area: 0,
  });

  const [weatherData, setWeatherData] = useState<any>(null);
  const [cropsList, setCropsList] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [soilMoistureData, setSoilMoistureData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [aiAdvisory, setAiAdvisory] = useState<string | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Load saved crop preference on mount
  useEffect(() => {
    const loadSavedCrop = async () => {
      try {
        const saved = await AsyncStorage.getItem("farmrisk-selected-crop");
        if (saved) {
          setSelectedCrop(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load crop pref:", e);
      }
    };
    loadSavedCrop();
  }, []);

  const handleSelectCrop = async (crop: any) => {
    setSelectedCrop(crop);
    try {
      await AsyncStorage.setItem("farmrisk-selected-crop", JSON.stringify(crop));
    } catch (e) {
      console.error("Failed to save crop pref:", e);
    }
  };

  // Main data fetching effect
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch public/base data
        const weather = await getWeather(location.lat, location.lng);
        if (!active) return;
        setWeatherData(weather);

        const forecast = await getForecast(location.lat, location.lng);
        if (!active) return;
        setForecastData(forecast || []);

        const cropsRes = await getCrops(location.lat, location.lng);
        if (!active) return;

        const cropGeneralLabel = t?.dashboard?.cropGeneral || "General (All Crops)";
        const loadedCrops =
          cropsRes?.crops && cropsRes.crops.length > 0
            ? [
                { id: "general", name: cropGeneralLabel, area: 0 },
                ...cropsRes.crops,
              ]
            : [{ id: "general", name: cropGeneralLabel, area: 0 }];
        setCropsList(loadedCrops);

        const calendar = await getCalendar(selectedCrop.id, location.lat, location.lng);
        if (!active) return;
        setCalendarData(calendar);

        // 2. Fetch Pro/Paid Dashboard Data
        if (isPro) {
          const moisture = await getSoilMoisture(
            location.lat,
            location.lng,
            selectedCrop.id
          );
          if (!active) return;
          setSoilMoistureData(moisture);

          // Build village report payload matching Next.js RAG API requirements
          const mockForecastRows = forecast
            ? forecast.map((row: any) => ({
                date: row.date,
                tmax_raw: row.tmax,
                tmax_corrected: row.tmax !== undefined ? row.tmax : row.tmax_corrected,
                tmin_raw: row.tmin,
                tmin_corrected: row.tmin !== undefined ? row.tmin : row.tmin_corrected,
                pcp_raw: row.pcp,
                pcp_corrected: row.pcp !== undefined ? row.pcp : row.pcp_corrected,
              }))
            : [];

          const villageReport = {
            requested_lat: location.lat,
            requested_lon: location.lng,
            village_id: 12345,
            forecast: {
              success: true,
              location: {
                lat: location.lat,
                lon: location.lng,
                elevation_m: weather?.elevation || 0,
              },
              grids_used: [],
              forecast_source: "bias-corrected",
              forecast: mockForecastRows,
              runtime_seconds: 0,
            },
            soil_moisture: {
              success: true,
              location: {
                lat: location.lat,
                lon: location.lng,
              },
              cold_start: false,
              days_computed: moisture?.soil_moisture?.length || 0,
              checkpoint_last_date: "",
              soil_moisture: moisture?.soil_moisture || [],
              runtime_seconds: 0,
            },
            cache_hit: false,
            total_runtime_seconds: 0,
            cache_key: null,
          };

          const aiPayload = {
            location,
            cropId: selectedCrop.id,
            calendarData: calendar,
            weatherData: weather,
            forecastData: villageReport,
            language,
          };

          const [advisoryRes, summaryRes] = await Promise.all([
            getAIAdvisory(aiPayload).catch((e) => {
              console.warn("Advisory engine request failed:", e);
              return null;
            }),
            getWeatherSummary(aiPayload).catch((e) => {
              console.warn("Weather summary request failed:", e);
              return null;
            }),
          ]);

          if (!active) return;
          setAiAdvisory(advisoryRes?.advisory_summary || null);
          setWeatherSummary(summaryRes?.weather_summary || null);
        } else {
          setSoilMoistureData(null);
          setAiAdvisory(null);
          setWeatherSummary(null);
        }
      } catch (err: any) {
        console.error("Fetch dashboard error:", err);
        if (active) {
          setError(
            "Connection failed. Please ensure the Next.js backend application is running at " +
              (process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000")
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [location, selectedCrop.id, isPro, language, t]);

  // Search Locations handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results || []);
    } catch (e: any) {
      console.error(e);
      setError("Search request failed.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (loc: any) => {
    setLocation({
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      displayName: loc.displayName || loc.name,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  // Helper to translate crop IDs to localized string
  const translateCropName = (crop: any) => {
    const id = crop?.id?.toLowerCase();
    switch (id) {
      case "general":
        return t?.dashboard?.cropGeneral || "General (All Crops)";
      case "cotton":
        return t?.dashboard?.cropCotton || "Cotton";
      case "wheat":
        return t?.dashboard?.cropWheat || "Wheat";
      case "rice":
        return t?.dashboard?.cropRice || "Rice";
      case "fodder":
        return t?.dashboard?.cropFodder || "Fodder";
      case "pearlmillet":
        return t?.dashboard?.cropPearlmillet || "Pearl Millet";
      case "oilseeds":
        return t?.dashboard?.cropOilseeds || "Oilseeds";
      case "castor":
        return t?.dashboard?.cropCastor || "Castor";
      case "sorghum":
        return t?.dashboard?.cropSorghum || "Sorghum";
      case "kharifsorghum":
        return t?.dashboard?.cropKharifsorghum || "Kharif Sorghum";
      case "chickpea":
        return t?.dashboard?.cropChickpea || "Chickpea";
      default:
        return crop.name;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const currentClimate = weatherData?.current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Language selector bar */}
        <View style={styles.langBar}>
          {["en", "hi", "mr", "ta", "gu"].map((lngCode) => (
            <TouchableOpacity
              key={lngCode}
              style={[
                styles.langBtn,
                language === lngCode && styles.langBtnActive,
              ]}
              onPress={() => setLanguage(lngCode as any)}
            >
              <Text
                style={[
                  styles.langBtnText,
                  language === lngCode && styles.langBtnTextActive,
                ]}
              >
                {lngCode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder={t?.landing?.ctaPlaceholder || "Enter village name..."}
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              {searching ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.searchBtnText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Search results list */}
          {searchResults.length > 0 && (
            <View style={styles.resultsList}>
              {searchResults.map((item) => (
                <TouchableOpacity
                  key={item.id || `${item.lat}-${item.lng}`}
                  style={styles.resultItem}
                  onPress={() => handleSelectLocation(item)}
                >
                  <Text style={styles.resultText}>{item.displayName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Error notification */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Dashboard Mode Indicator & Greeting */}
        <View style={styles.header}>
          {isPro ? (
            <View style={styles.greetingBox}>
              <Text style={styles.greetingText}>
                {getGreeting()}, {fullName || "Farmer"}!
              </Text>
              <Text style={styles.dashboardBadgePro}>Paid Dashboard</Text>
            </View>
          ) : (
            <View style={styles.greetingBox}>
              <Text style={styles.greetingText}>Hello, Guest!</Text>
              <Text style={styles.dashboardBadgeFree}>Free Dashboard</Text>
            </View>
          )}
          <Text style={styles.villageLabel}>
            📍 {location.name} ({location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E)
          </Text>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Fetching Climate Data...</Text>
          </View>
        )}

        {/* 1. Weather Summary (If loaded) */}
        {isPro && weatherSummary && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>24-Hour Weather Summary</Text>
            <Text style={styles.cardContentText}>{weatherSummary}</Text>
          </View>
        )}

        {/* 2. Current Climate Module */}
        {currentClimate && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t?.dashboard?.currentClimate || "Current Climate"}
            </Text>
            <View style={styles.tempRow}>
              <Text style={styles.temperatureText}>
                {currentClimate.temperature_2m}°C
              </Text>
              <View>
                <Text style={styles.conditionText}>
                  {currentClimate.condition?.[language] ||
                    currentClimate.condition?.en ||
                    "Clear Sky"}
                </Text>
                <Text style={styles.feelsLikeText}>
                  Feels like {currentClimate.apparent_temperature}°C
                </Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>
                  {t?.dashboard?.rainfall || "Rainfall"}
                </Text>
                <Text style={styles.metricValue}>
                  {currentClimate.precipitation} mm
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>
                  {t?.dashboard?.wind || "Wind"}
                </Text>
                <Text style={styles.metricValue}>
                  {currentClimate.wind_speed_10m} km/h
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>
                  {t?.dashboard?.clouds || "Clouds"}
                </Text>
                <Text style={styles.metricValue}>
                  {currentClimate.cloud_cover}%
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>
                  {t?.dashboard?.humidity || "Humidity"}
                </Text>
                <Text style={styles.metricValue}>
                  {currentClimate.relative_humidity_2m}%
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 7-Day Weather Forecast */}
        {forecastData && forecastData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t?.dashboard?.forecast16Day || "Weather Forecast"}
            </Text>
            <View style={styles.moistureList}>
              {forecastData.slice(0, 7).map((row: any, i: number) => (
                <View key={i} style={styles.moistureRow}>
                  <Text style={styles.moistureDate}>{row.date}</Text>
                  <Text style={styles.moisturePercentile}>
                    Max: {(row.tmax !== undefined ? row.tmax : row.tmax_corrected)?.toFixed(1)}°C
                  </Text>
                  <Text style={styles.moistureValue}>
                    Min: {(row.tmin !== undefined ? row.tmin : row.tmin_corrected)?.toFixed(1)}°C
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3. Free Tier Lock Banner */}
        {!isPro && (
          <View style={styles.lockCard}>
            <Text style={styles.lockTitle}>🔒 Premium Features Locked</Text>
            <Text style={styles.lockDesc}>
              Log in or register on the Profile tab to unlock:{"\n"}
              • Soil moisture prediction charts{"\n"}
              • Real-time localized AI Advisory recommendations{"\n"}
              • Personalized calendar schedules for custom crops
            </Text>
          </View>
        )}

        {/* 4. Pro Features Container */}
        {isPro && (
          <View style={styles.proSection}>
            {/* Crop Selector tag buttons */}
            <Text style={styles.sectionTitle}>
              {t?.dashboard?.chooseCrop || "Choose a Crop"}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.cropsRow}
            >
              {cropsList.map((crop) => {
                const isSelected = crop.id === selectedCrop.id;
                return (
                  <TouchableOpacity
                    key={crop.id}
                    style={[
                      styles.cropTab,
                      isSelected && styles.cropTabActive,
                    ]}
                    onPress={() => handleSelectCrop(crop)}
                  >
                    <Text
                      style={[
                        styles.cropTabText,
                        isSelected && styles.cropTabTextActive,
                      ]}
                    >
                      {translateCropName(crop)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* AI Crop Advisory */}
            {aiAdvisory && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>AI Crop Advisory</Text>
                <Text style={styles.cardContentText}>{aiAdvisory}</Text>
              </View>
            )}

            {/* Crop Calendar Stages */}
            {calendarData?.calendar && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Crop Calendar Stages</Text>
                <View style={styles.stagesContainer}>
                  {calendarData.calendar.stages?.map((stage: any, index: number) => (
                    <View key={index} style={styles.stageItem}>
                      <Text style={styles.stageName}>
                        Stage {index + 1}: {stage.stage_name}
                      </Text>
                      <Text style={styles.stageDesc}>{stage.description}</Text>
                      {stage.recommendation && (
                        <Text style={styles.stageRec}>
                          💡 Recommendation: {stage.recommendation}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Soil Moisture Forecast */}
            {soilMoistureData?.soil_moisture && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Soil Moisture Forecast</Text>
                <View style={styles.moistureList}>
                  {soilMoistureData.soil_moisture.slice(0, 10).map((row: any, i: number) => (
                    <View key={i} style={styles.moistureRow}>
                      <Text style={styles.moistureDate}>{row.date}</Text>
                      <Text style={styles.moisturePercentile}>
                        Percentile: {row.sm_percentile?.toFixed(1) || 0}%
                      </Text>
                      <Text style={styles.moistureValue}>
                        w_frac: {row.w_frac?.toFixed(3) || 0}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingTop: 36,
  },
  langBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  langBtn: {
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  langBtnActive: {
    backgroundColor: "#10b981",
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4b5563",
  },
  langBtnTextActive: {
    color: "#ffffff",
  },
  searchSection: {
    marginBottom: 20,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  searchBtn: {
    backgroundColor: "#0284c7",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  resultsList: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 4,
    padding: 4,
  },
  resultItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultText: {
    color: "#374151",
    fontSize: 14,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
  },
  header: {
    marginBottom: 16,
    alignItems: "center",
  },
  greetingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  dashboardBadgePro: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    fontSize: 11,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  dashboardBadgeFree: {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  villageLabel: {
    fontSize: 14,
    color: "#4b5563",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  loadingText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
    marginBottom: 12,
  },
  cardContentText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  temperatureText: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#111827",
  },
  conditionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  feelsLikeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 8,
    padding: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  lockCard: {
    backgroundColor: "#fee2e2",
    borderColor: "#fca5a5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 6,
  },
  lockDesc: {
    fontSize: 13,
    color: "#7f1d1d",
    lineHeight: 18,
  },
  proSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4b5563",
    marginBottom: 8,
    marginLeft: 4,
  },
  cropsRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  cropTab: {
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cropTabActive: {
    backgroundColor: "#059669",
  },
  cropTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  cropTabTextActive: {
    color: "#ffffff",
  },
  stagesContainer: {
    gap: 12,
  },
  stageItem: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
  },
  stageName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  stageDesc: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 16,
    marginBottom: 4,
  },
  stageRec: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "600",
  },
  moistureList: {
    gap: 8,
  },
  moistureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 10,
  },
  moistureDate: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
  },
  moisturePercentile: {
    fontSize: 12,
    color: "#0284c7",
  },
  moistureValue: {
    fontSize: 12,
    color: "#4b5563",
    fontFamily: "Courier",
  },
});
