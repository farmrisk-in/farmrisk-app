import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useWeather } from "@/hooks/useWeather";
import { useLocationContext } from "@/providers/LocationProvider";

export function CurrentWeatherSection() {
  const { location } = useLocationContext();
  const { data, isLoading, isError } = useWeather();

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError) return <Text style={styles.error}>Failed to load weather</Text>;

  const current = data?.current;
  if (!current) return null;

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          🌤 Current Weather
        </Text>
        <Text variant="bodySmall" style={styles.location}>
          {location.displayName}
        </Text>
        <Text variant="displayMedium" style={styles.temp}>
          {current.temperature_2m}°C
        </Text>
        <Text variant="titleSmall" style={styles.condition}>
          {current.condition?.en ?? "—"}
        </Text>
        <Text variant="bodyMedium" style={styles.detail}>
          💧 Humidity: {current.relative_humidity_2m}%
        </Text>
        {current.wind_speed_10m !== undefined && (
          <Text variant="bodyMedium" style={styles.detail}>
            💨 Wind: {current.wind_speed_10m} km/h
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#e8f4fd", borderRadius: 12, marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 2, color: "#1a1a1a" },
  location: { color: "#555", marginBottom: 8 },
  temp: { fontWeight: "bold", color: "#1a73e8", marginVertical: 4 },
  condition: { marginBottom: 8, color: "#222" },
  detail: { color: "#444", marginBottom: 2 },
  error: { color: "red", marginVertical: 8 },
});
