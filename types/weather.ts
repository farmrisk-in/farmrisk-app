export type WmoEntry = {
  condition: {
    en: string;
    hi: string;
    mr: string;
    ta: string;
    gu: string;
  };
  icon: {
    day: string;
    night?: string;
  };
};

export type CurrentWeather = {
  time: Date;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  pressure_msl: number;
  surface_pressure: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
  precipitation: number;
  cloud_cover: number;
  icon: string;
  condition: {
    en: string;
    hi: string;
    mr: string;
    ta: string;
    gu: string;
  };
};

export type HourlyWeather = {
  time: Date[];
  temperature_2m: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  weather_code: number[];
  icon: string[];
  rain: number[];
};

export type DailyWeather = {
  time: Date[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
};

export type Lightning = {
  score: number;
  category: string;
};

export type LightningData = {
  score: number;
  category: string;
  color: string;
  advisory: string;
};

export type OpenMeteoResponse = {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string | null;
  timezoneAbbreviation: string | null;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
  lightning: Lightning;
};
