import { useQuery } from "@tanstack/react-query";
import { getRiskScore } from "@/lib/api";
import { useLocationContext } from "@/providers/LocationProvider";
import { useWeather } from "./useWeather";
import { useForecast } from "./useForecast";
import { useSoilMoisture } from "./useSoilMoisture";

export function useRiskScore() {
  const { location, isResolving } = useLocationContext();
  const { data: weatherData, isLoading: isWeatherLoading } = useWeather();
  const { forecastRows, isLoading: isForecastLoading } = useForecast();
  const { data: soilMoistureData, isLoading: isSoilLoading } = useSoilMoisture("general");

  const buildPayload = () => {
    const payload: any = {};
    if (forecastRows && forecastRows.length > 0) {
      const next5 = forecastRows.slice(0, 5);
      payload.rain_next5 = next5.map((r: any) => r.pcp_corrected ?? 0);
      payload.rain_dates = next5.map((r: any) => r.date);
      payload.max_daily_rain = Math.max(...payload.rain_next5);
      payload.total_rainfall = payload.rain_next5.reduce((a: number, b: number) => a + b, 0);
      payload.rainy_days = payload.rain_next5.filter((r: number) => r > 1).length; 
      
      const maxTemps = next5.map((r: any) => r.tmax_corrected ?? 0);
      payload.max_temp = Math.max(...maxTemps);
      payload.avg_max_temp = maxTemps.reduce((a: number, b: number) => a + b, 0) / next5.length;

      const minTemps = next5.map((r: any) => r.tmin_corrected ?? 0);
      payload.min_temp = Math.min(...minTemps);
      payload.avg_min_temp = minTemps.reduce((a: number, b: number) => a + b, 0) / next5.length;
    }

    if (weatherData) {
      payload.humidity = weatherData.current?.relative_humidity_2m;
      payload.wind_speed = weatherData.current?.wind_speed_10m;
      payload.wind_gusts = weatherData.current?.wind_gusts_10m;
      
      if (weatherData.hourly) {
        payload.gusts_hourly = weatherData.hourly.wind_gusts_10m?.slice(0, 24);
        payload.times_hourly = weatherData.hourly.time?.slice(0, 24);
      }
      payload.lightning_score = weatherData.current?.lightning_score ?? null; 
    }

    if (soilMoistureData && soilMoistureData.soil_moisture && soilMoistureData.soil_moisture.length > 0) {
      payload.soil_moisture_available = true;
      const latest = soilMoistureData.soil_moisture[soilMoistureData.soil_moisture.length - 1];
      payload.soil_percentile = latest.sm_percentile;
    } else {
      payload.soil_moisture_available = false;
    }

    return payload;
  };

  const payload = buildPayload();
  const hash = JSON.stringify(payload);

  const query = useQuery({
    queryKey: ["riskScore", location?.lat, location?.lng, hash],
    queryFn: () => getRiskScore(payload),
    enabled:
      !isResolving &&
      !isWeatherLoading &&
      !isForecastLoading &&
      !isSoilLoading &&
      !!location?.lat &&
      !!location?.lng,
    staleTime: 60 * 60 * 1000, 
  });

  return {
    data: query.data,
    isLoading: isResolving || !location || isWeatherLoading || isForecastLoading || isSoilLoading || query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
